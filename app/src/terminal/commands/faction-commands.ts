import type { Command, Shell } from '../shell';
import { getFaction, allFactions } from '../../core/factions';

export function joinFaction(shell: Shell, id: string) {
  const f = getFaction(id);
  if (!f) { shell.print(`join: unknown faction: ${id}`, 'err'); return; }
  if (shell.state.faction) { shell.print(`already aligned with ${getFaction(shell.state.faction)?.name ?? shell.state.faction}`, 'err'); return; }
  if (!shell.state.discovered.has(f.node)) { shell.print(`join: find their node first`, 'err'); return; }
  shell.state.faction = id;
  shell.state.factionRep[id] = (shell.state.factionRep[id] ?? 0) + 50;
  shell.print(`[FACTION] Joined: ${f.name}`, 'ok');
  shell.print(`[FACTION] ${f.tag}`, 'dim');
}

export const join: Command = {
  name: 'join', usage: 'join <faction>', help: 'join a faction (find their node first)',
  run(shell, p) {
    const id = p.args[0]?.toLowerCase();
    if (!id) {
      shell.print('Usage: join <faction>. Known factions:', 'warn');
      for (const f of allFactions()) shell.print(`  ${f.id.padEnd(10)} ${f.name}`, 'dim');
      return;
    }
    joinFaction(shell, id);
  },
};
