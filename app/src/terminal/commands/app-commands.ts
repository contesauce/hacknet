import type { Command } from '../shell';
import { listApps } from '../../core/apps';
import type { AppDef } from '../../core/apps';

export const appsCmd: Command = {
  name: 'apps', usage: 'apps', help: 'list launchable applications and their resource cost',
  run(shell) {
    shell.print('Available apps:', 'ok');
    for (const a of listApps()) {
      const open = shell.procs.findApp(a.id);
      shell.print(`  ${a.id.padEnd(10)} ${a.ram.toFixed(1)}G  ${String(a.cpu).padStart(3)}%cpu  ${open ? '[running, pid ' + open.pid + ']' : ''}`, open ? 'ok' : 'dim');
    }
  },
};

/** One launcher command per registered app, e.g. `mail`, `notes`. */
export function appLauncherCommands(): Command[] {
  return listApps().map((def: AppDef): Command => ({
    name: def.id,
    usage: def.id,
    help: `open the ${def.name} app (${def.ram}G RAM, ${def.cpu}% cpu while open)`,
    run(shell) {
      const existing = shell.procs.findApp(def.id);
      if (existing) {
        shell.pendingFocusApp = def.id;
        shell.print(`${def.name} already open — switching to it.`, 'dim');
        return;
      }
      if (def.ram > shell.ramFree()) {
        shell.print(`${def.id}: not enough RAM (${def.ram}G needed, ${shell.ramFree().toFixed(1)}G free)`, 'err');
        return;
      }
      const proc = shell.procs.spawn({ kind: 'app', name: def.name, ram: def.ram, cpu: def.cpu, appId: def.id });
      shell.pendingFocusApp = def.id;
      shell.print(`${def.name} launched (pid ${proc.pid}).`, 'ok');
    },
  }));
}
