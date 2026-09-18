import type { GameState } from '../core/state';
import { saveLocal } from '../core/state';
import { NetworkGraph } from '../core/network';
import { VirtualFs } from '../core/fs';
import { ProcessManager } from '../core/process';
import { getQuest, allQuests } from '../core/quests';
import type { ParsedCommand } from './parser';
import { parse } from './parser';

export type Line = { text: string; cls: string };

export interface Command {
  name: string;
  usage: string;
  help: string;
  run(shell: Shell, p: ParsedCommand): void | Promise<void>;
}

export class Shell {
  registry = new Map<string, Command>();
  onPrint: (line: Line) => void = () => {};
  onStateChange: () => void = () => {};
  busy = false; // true while a timed command (nmap/hydra) is running

  procs = new ProcessManager();
  /** Set by a command that opens an app; the UI consumes it once to switch tabs. */
  pendingFocusApp: string | null = null;

  state: GameState;
  net: NetworkGraph;
  constructor(state: GameState, net: NetworkGraph) {
    this.state = state;
    this.net = net;
    this.procs.onChange = () => this.onStateChange();
  }

  ramFree(): number {
    return Math.max(0, this.state.ram.total - this.procs.ramUsed());
  }

  register(cmd: Command) {
    this.registry.set(cmd.name, cmd);
  }

  print(text: string, cls: string = 'out') {
    this.onPrint({ text, cls });
  }

  currentFs(): VirtualFs {
    return this.net.fs(this.state.host)!;
  }

  hostname(): string {
    return this.net.get(this.state.host)?.hostname ?? this.state.host;
  }

  promptString(): string {
    const path = VirtualFs.pathStr(this.state.cwd) || '/';
    const who = this.state.host === 'localhost' ? 'player' : 'root';
    return `${who}@${this.hostname()}:${path}$ `;
  }

  persist() {
    saveLocal(this.state);
    this.onStateChange();
  }

  async execute(line: string) {
    const trimmed = line.trim();
    if (!trimmed) return;
    this.state.history.unshift(trimmed);
    if (this.state.history.length > 200) this.state.history.pop();
    this.print(`${this.promptString()}${trimmed}`, 'echo');

    if (this.busy) {
      this.print('a process is already running — try again in a moment', 'err');
      return;
    }

    const p = parse(trimmed);
    if (!p) return;
    const cmd = this.registry.get(p.cmd);
    if (!cmd) {
      this.print(`command not found: ${p.cmd} (try 'help')`, 'err');
      return;
    }
    try {
      await cmd.run(this, p);
    } catch (e) {
      this.print(`internal error: ${(e as Error).message}`, 'err');
    }
    this.checkQuests();
    this.persist();
  }

  /** Evaluate active quests' completion predicates, grant rewards, and unlock follow-ups. */
  checkQuests() {
    for (const id of [...this.state.activeQuests]) {
      const q = getQuest(id);
      if (!q) continue;
      if (!q.complete(this)) continue;

      this.state.activeQuests = this.state.activeQuests.filter(x => x !== id);
      this.state.completedQuests.push(id);
      this.print(`[QUEST COMPLETE] ${q.name}`, 'ok');

      if (q.reward.credits) {
        this.state.credits += q.reward.credits;
        this.print(`  +${q.reward.credits}cr`, 'dim');
      }
      if (q.reward.revealHost && !this.state.discovered.has(q.reward.revealHost)) {
        this.state.discovered.add(q.reward.revealHost);
        const h = this.net.get(q.reward.revealHost);
        this.print(`  [LEAD] new host discovered: ${q.reward.revealHost}${h ? ' — ' + h.hostname : ''}`, 'warn');
      }
      if (q.reward.mail) {
        this.state.mail.push({ id: `q_${id}`, ...q.reward.mail, read: false });
        this.print(`  [NEW MAIL] ${q.reward.mail.from} — ${q.reward.mail.subj}`, 'warn');
      }

      for (const next of allQuests()) {
        if (next.after === id && !this.state.activeQuests.includes(next.id) && !this.state.completedQuests.includes(next.id)) {
          this.state.activeQuests.push(next.id);
        }
      }
    }
  }

  /** Run a fake-latency operation with a busy lock, so the UI can't be spammed mid-crack. */
  async timed(ms: number, tick?: (elapsedMs: number) => void): Promise<void> {
    this.busy = true;
    const start = performance.now();
    return new Promise(resolve => {
      const step = () => {
        const elapsed = performance.now() - start;
        tick?.(elapsed);
        if (elapsed >= ms) { this.busy = false; resolve(); }
        else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
}
