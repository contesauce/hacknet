import type { Command } from '../shell';

export const clear: Command = {
  name: 'clear', usage: 'clear', help: 'clear the terminal',
  run(shell) { shell.onPrint({ text: '__CLEAR__', cls: '' }); },
};

export const history: Command = {
  name: 'history', usage: 'history', help: 'show recent command history',
  run(shell) {
    shell.state.history.slice(0, 20).reverse().forEach((h, i) => shell.print(`  ${i + 1}  ${h}`, 'dim'));
  },
};

export const top: Command = {
  name: 'top', usage: 'top', help: 'show RAM/CPU usage and running processes',
  run(shell) {
    const used = shell.procs.ramUsed();
    const total = shell.state.ram.total;
    shell.print(`RAM  ${used.toFixed(1)}G / ${total.toFixed(1)}G`, 'out');
    shell.print(`CPU  ${Math.round(shell.procs.cpuUsed())}%`, 'out');
    shell.print(`TRACE ${Math.round(shell.state.trace)}%${shell.state.traceActive ? ' [ACTIVE]' : ''}`, shell.state.trace > 60 ? 'warn' : 'out');
    if (shell.procs.list().length) {
      shell.print('', 'dim');
      ps.run(shell, { cmd: 'ps', args: [], flags: new Set() });
    }
  },
};

export const ps: Command = {
  name: 'ps', usage: 'ps', help: 'list running processes (apps + tools)',
  run(shell) {
    const procs = shell.procs.list();
    if (!procs.length) { shell.print('no running processes', 'dim'); return; }
    shell.print('PID   NAME        RAM    CPU   TARGET', 'ok');
    for (const p of procs) {
      const target = p.target ?? p.appId ?? '-';
      shell.print(`${String(p.pid).padEnd(6)}${p.name.padEnd(12)}${(p.ram.toFixed(1) + 'G').padEnd(7)}${(p.cpu + '%').padEnd(6)}${target}`, 'out');
    }
  },
};

export const killCmd: Command = {
  name: 'kill', usage: 'kill <pid>', help: 'terminate a running process, freeing its RAM/CPU',
  run(shell, p) {
    const pid = Number(p.args[0]);
    if (!pid) { shell.print('usage: kill <pid>', 'warn'); return; }
    if (!shell.procs.kill(pid)) { shell.print(`kill: no such process: ${pid}`, 'err'); return; }
    shell.print(`process ${pid} terminated.`, 'ok');
  },
};

export const help: Command = {
  name: 'help', usage: 'help [command]', help: 'list commands, or show detail for one',
  run(shell, p) {
    if (p.args[0]) {
      const c = shell.registry.get(p.args[0]);
      if (!c) { shell.print(`no such command: ${p.args[0]}`, 'err'); return; }
      shell.print(`${c.usage}`, 'ok');
      shell.print(`  ${c.help}`, 'dim');
      return;
    }
    const names = [...shell.registry.keys()].sort();
    shell.print('Available commands:', 'ok');
    for (const n of names) {
      const c = shell.registry.get(n)!;
      shell.print(`  ${n.padEnd(10)} ${c.help}`, 'dim');
    }
    shell.print("Type 'man <command>' or 'help <command>' for usage.", 'dim');
  },
};

export const man: Command = {
  name: 'man', usage: 'man <command>', help: 'alias for help <command>',
  run(shell, p) { help.run(shell, p); },
};
