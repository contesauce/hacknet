import type { Command, Shell } from '../shell';
import { getContract, offeredContracts } from '../../core/contracts';
import { getApp } from '../../core/apps';
import { launchApp } from './app-commands';

export function acceptContract(shell: Shell, id: string) {
  const c = getContract(id);
  if (!c) { shell.print(`contracts: unknown contract: ${id}`, 'err'); return; }
  if (shell.state.activeContracts.includes(id)) { shell.print(`contracts: already active: ${c.title}`, 'err'); return; }
  if (shell.state.completedContracts.includes(id)) { shell.print(`contracts: already completed: ${c.title}`, 'err'); return; }
  if (!offeredContracts(shell).some(o => o.id === id)) { shell.print(`contracts: not available: ${id}`, 'err'); return; }

  shell.state.activeContracts.push(id);
  shell.print(`[CONTRACT ACCEPTED] ${c.title} — ${c.client}`, 'ok');
  shell.print(`  ${c.briefing}`, 'dim');
}

export const contracts: Command = {
  name: 'contracts', usage: 'contracts [list|accept <id>]', help: 'open the contract board, list contracts, or accept one',
  run(shell, p) {
    const sub = p.args[0]?.toLowerCase();

    if (sub === 'accept') {
      const id = p.args[1];
      if (!id) { shell.print('Usage: contracts accept <id>', 'warn'); return; }
      acceptContract(shell, id);
      return;
    }

    if (sub === 'list') {
      const offered = offeredContracts(shell);
      const active = shell.state.activeContracts.map(id => getContract(id)).filter(c => !!c);

      if (active.length) {
        shell.print('Active contracts:', 'ok');
        for (const c of active) shell.print(`  ${c.id.padEnd(20)} ${c.title} — ${c.client}`, 'dim');
      }
      if (offered.length) {
        shell.print('Open contracts (contracts accept <id>):', 'ok');
        for (const c of offered) shell.print(`  ${c.id.padEnd(20)} [${c.risk}] ${c.title} — ${c.client}`, 'dim');
      }
      if (!active.length && !offered.length) shell.print('No contracts available right now.', 'dim');
      return;
    }

    const def = getApp('contracts');
    if (def) launchApp(shell, def);
  },
};
