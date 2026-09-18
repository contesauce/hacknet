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
  name: 'top', usage: 'top', help: 'show RAM usage',
  run(shell) {
    const { used, total } = shell.state.ram;
    shell.print(`RAM  ${used.toFixed(1)}G / ${total.toFixed(1)}G`, 'out');
    shell.print(`TRACE ${Math.round(shell.state.trace)}%${shell.state.traceActive ? ' [ACTIVE]' : ''}`, shell.state.trace > 60 ? 'warn' : 'out');
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
