import type { Command, Shell } from '../shell';
import { getFaction, applyFactionMods } from '../../core/factions';

/** The host you need to plant the payload on — depends on which path you committed to. */
export function defectionInjectTarget(shell: Shell): string | null {
  if (!shell.state.defectionBranch) return null;
  const factionId = shell.state.defectionBranch === 'accept'
    ? shell.state.defectionOldFaction
    : shell.state.defectionRival;
  return factionId ? getFaction(factionId)?.node ?? null : null;
}

export const handler: Command = {
  name: 'handler', usage: 'handler <accept|report>', help: 'respond to a rival faction\'s handler (one-time, permanent)',
  run(shell, p) {
    const choice = p.args[0]?.toLowerCase();
    if (choice !== 'accept' && choice !== 'report') { shell.print('usage: handler <accept|report>', 'warn'); return; }
    if (shell.state.defectionBranch) { shell.print(`handler: already committed (${shell.state.defectionBranch})`, 'err'); return; }
    if (!shell.state.completedQuests.includes('q_defection_offer')) { shell.print('handler: no one has approached you', 'err'); return; }

    const myFaction = shell.state.faction;
    const rival = myFaction ? getFaction(myFaction)?.rival ?? null : null;
    if (!myFaction || !rival) { shell.print('handler: no one has approached you', 'err'); return; }

    shell.state.defectionBranch = choice;
    shell.state.defectionOldFaction = myFaction;
    shell.state.defectionRival = rival;

    const mine = getFaction(myFaction)!;
    const them = getFaction(rival)!;
    if (choice === 'accept') {
      shell.print(`[HANDLER] ${them.name}: "Good. Prove it. Get us what we need, then burn the bridge yourself."`, 'warn');
    } else {
      shell.print(`[HANDLER] ${mine.name}: "Smart. Play along. Feed them what we give you — then we burn them instead."`, 'warn');
    }
    shell.print('Objective: scp the ops_ledger.dat off your faction\'s node, then `inject <host>` the payload.', 'dim');
    shell.print('inject carries a heavy trace spike — go in hot and you will get caught.', 'err');
  },
};

const INJECT_RAM = 0.6;
const INJECT_CPU = 25;

export const inject: Command = {
  name: 'inject', usage: 'inject <host>', help: 'plant a payload on a rooted host — high trace risk',
  async run(shell, p) {
    if (shell.state.questFlags.defection_caught) { shell.print('inject: that bridge is already burned', 'dim'); return; }
    if (shell.state.questFlags.defection_injected) { shell.print('inject: already done', 'dim'); return; }
    if (!shell.state.questFlags.defection_exfiltrated) { shell.print('inject: exfiltrate the ops ledger first', 'err'); return; }

    const target = defectionInjectTarget(shell);
    if (!target) { shell.print('inject: no payload staged — talk to a handler first', 'err'); return; }
    const id = p.args[0] ?? (shell.state.host !== 'localhost' ? shell.state.host : undefined);
    if (id !== target) { shell.print(`inject: no payload staged for this host`, 'err'); return; }

    const host = shell.net.get(id);
    if (!host?.admin) { shell.print('inject: need root first', 'err'); return; }
    if (INJECT_RAM > shell.ramFree()) { shell.print(`inject: not enough RAM (${INJECT_RAM}G needed, ${shell.ramFree().toFixed(1)}G free)`, 'err'); return; }

    shell.print(`inject: deploying payload to ${host.hostname}...`, 'warn');
    shell.state.traceActive = true;
    const proc = shell.procs.spawn({ kind: 'tool', name: 'inject', ram: INJECT_RAM, cpu: INJECT_CPU * shell.state.cpuMult, target: id });
    const traceAtStart = shell.state.trace;
    const duration = 2200;
    await shell.timed(duration, elapsed => {
      shell.state.trace = Math.min(100, traceAtStart + (elapsed / duration) * 60 * shell.state.traceGainMult);
    });
    shell.procs.kill(proc.pid);

    if (shell.state.trace >= 100) {
      shell.print('[!] PAYLOAD FLAGGED MID-DEPLOY — YOU WERE CAUGHT.', 'err');
      shell.state.questFlags.defection_caught = true;
      if (shell.state.defectionOldFaction) shell.state.hostileFactions.push(shell.state.defectionOldFaction);
      if (shell.state.defectionRival) shell.state.hostileFactions.push(shell.state.defectionRival);
      shell.print('Both sides know your name now. Nowhere is safe.', 'err');
      return;
    }

    shell.state.questFlags.defection_injected = true;
    const oldId = shell.state.defectionOldFaction!;
    const rivalId = shell.state.defectionRival!;

    if (shell.state.defectionBranch === 'accept') {
      applyFactionMods(shell.state, oldId, -1);
      shell.state.hostileFactions.push(oldId);
      shell.state.faction = rivalId;
      shell.state.factionRep[rivalId] = (shell.state.factionRep[rivalId] ?? 0) + 50;
      applyFactionMods(shell.state, rivalId, 1);
      shell.state.credits += 400;
      shell.print(`[DEFECTED] Welcome to ${getFaction(rivalId)!.name}. There's no going back — ${getFaction(oldId)!.name} will be hunting you.`, 'ok');
    } else {
      shell.state.hostileFactions.push(rivalId);
      shell.state.factionRep[oldId] = (shell.state.factionRep[oldId] ?? 0) + 75;
      shell.state.crackSpeedMult *= 0.9;
      shell.state.credits += 400;
      shell.print(`[LOYALTY PROVEN] ${getFaction(oldId)!.name} won't forget this. ${getFaction(rivalId)!.name} just became a permanent target.`, 'ok');
    }
  },
};
