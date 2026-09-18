import { isDir, VirtualFs } from '../../core/fs';
import type { Command, Shell } from '../shell';

export const pwd: Command = {
  name: 'pwd', usage: 'pwd', help: 'print current working directory',
  run(shell) {
    shell.print(VirtualFs.pathStr(shell.state.cwd) || '/');
  },
};

export const cd: Command = {
  name: 'cd', usage: 'cd [dir]', help: 'change directory',
  run(shell, p) {
    const target = p.args[0] ?? '/home/player';
    const fs = shell.currentFs();
    const resolved = fs.resolvePath(shell.state.cwd, target);
    const node = fs.get(resolved);
    if (!node) { shell.print(`cd: no such directory: ${target}`, 'err'); return; }
    if (!isDir(node)) { shell.print(`cd: not a directory: ${target}`, 'err'); return; }
    shell.state.cwd = resolved;
  },
};

export const ls: Command = {
  name: 'ls', usage: 'ls [-l] [dir]', help: 'list directory contents',
  run(shell, p) {
    const fs = shell.currentFs();
    const target = p.args[0] ?? '.';
    const resolved = fs.resolvePath(shell.state.cwd, target);
    const entries = fs.list(resolved);
    if (!entries) { shell.print(`ls: no such directory: ${target}`, 'err'); return; }
    if (entries.length === 0) { shell.print('(empty)', 'dim'); return; }
    const host = shell.net.get(shell.state.host);
    const isAdmin = !!host?.admin;
    for (const e of entries) {
      if (isDir(e)) { shell.print(`${e.name}/`, 'dir'); continue; }
      const badges: string[] = [];
      if (e.locked && !isAdmin) badges.push('LOCK');
      if (e.encrypted) badges.push('ENC');
      if (e.tag) badges.push(e.tag);
      const suffix = badges.length && p.flags.has('l') ? `  [${badges.join(',')}]` : '';
      shell.print(`${e.name}${suffix}`, badges.includes('LOCK') ? 'dim' : 'out');
    }
  },
};

export const cat: Command = {
  name: 'cat', usage: 'cat <file>', help: 'print file contents',
  run(shell, p) {
    if (!p.args[0]) { shell.print('usage: cat <file>', 'warn'); return; }
    const fs = shell.currentFs();
    const resolved = fs.resolvePath(shell.state.cwd, p.args[0]);
    const f = fs.getFile(resolved);
    if (!f) { shell.print(`cat: no such file: ${p.args[0]}`, 'err'); return; }
    const host = shell.net.get(shell.state.host);
    if (f.locked && !host?.admin) { shell.print(`cat: permission denied: ${p.args[0]} (need root)`, 'err'); return; }
    if (f.encrypted) { shell.print(`cat: ${p.args[0]} is encrypted — use: decrypt ${p.args[0]} <password>`, 'warn'); return; }
    shell.print(f.content, 'out');
    if (f.onRead) shell.state.questFlags[f.onRead] = true;
  },
};

export const rm: Command = {
  name: 'rm', usage: 'rm <file>', help: 'delete a file (remote hosts only)',
  run(shell, p) {
    if (!p.args[0]) { shell.print('usage: rm <file>', 'warn'); return; }
    if (shell.state.host === 'localhost') { shell.print('rm: refusing to delete local files', 'err'); return; }
    const fs = shell.currentFs();
    const resolved = fs.resolvePath(shell.state.cwd, p.args[0]);
    const f = fs.getFile(resolved);
    if (!f) { shell.print(`rm: no such file: ${p.args[0]}`, 'err'); return; }
    const host = shell.net.get(shell.state.host);
    if (f.locked && !host?.admin) { shell.print(`rm: permission denied: ${p.args[0]}`, 'err'); return; }
    fs.remove(resolved);
    shell.print(`removed ${p.args[0]}`, 'ok');
  },
};

/** Fallback icon-free tab-complete helper shared by the terminal input handler. */
export function fsCompletions(shell: Shell, partial: string): string[] {
  const fs = shell.currentFs();
  const entries = fs.list(shell.state.cwd) ?? [];
  return entries.map(e => e.name).filter(n => n.startsWith(partial));
}
