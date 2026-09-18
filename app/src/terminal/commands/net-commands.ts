import type { Command } from '../shell';

export const whoami: Command = {
  name: 'whoami', usage: 'whoami', help: 'print effective user',
  run(shell) {
    const host = shell.net.get(shell.state.host);
    shell.print(host?.admin || shell.state.host === 'localhost' ? 'root' : 'guest');
  },
};

export const hostnameCmd: Command = {
  name: 'hostname', usage: 'hostname', help: 'print current hostname',
  run(shell) { shell.print(shell.hostname()); },
};

export const ifconfig: Command = {
  name: 'ifconfig', usage: 'ifconfig', help: 'show this host\'s network identity',
  run(shell) {
    shell.print(`eth0: ${shell.state.host}  hops: ${shell.state.path.length}`, 'out');
  },
};

export const nmap: Command = {
  name: 'nmap', usage: 'nmap [host]', help: 'scan for adjacent hosts, or port-scan a specific host',
  async run(shell, p) {
    if (!p.args[0]) {
      const host = shell.net.get(shell.state.host);
      shell.print(`nmap: scanning from ${shell.state.host}...`, 'dim');
      await shell.timed(600);
      let found = 0;
      for (const id of host?.connections ?? []) {
        const target = shell.net.get(id);
        if (!target || target.hidden) continue;
        if (!shell.state.discovered.has(id)) { shell.state.discovered.add(id); found++; }
        shell.print(`  ${id.padEnd(16)} ${target.hostname}`, shell.state.discovered.has(id) ? 'ok' : 'out');
      }
      shell.print(found ? `${found} new host(s) discovered.` : 'no new hosts found.', 'dim');
      return;
    }
    const id = p.args[0];
    const target = shell.net.get(id);
    if (!target || !shell.state.discovered.has(id)) { shell.print(`nmap: host unreachable: ${id}`, 'err'); return; }
    shell.print(`Nmap scan report for ${target.hostname} (${id})`, 'out');
    shell.print(target.firewall > 0 ? `Firewall: ${target.firewall} layer(s) active` : 'Firewall: none', target.firewall > 0 ? 'warn' : 'ok');
    for (const port of target.ports) {
      shell.print(`  ${String(port.port).padEnd(6)} ${port.type.toUpperCase().padEnd(5)} ${port.open ? 'open' : 'closed'}`, port.open ? 'ok' : 'dim');
    }
    const needed = shell.net.portsNeededForRoot(id);
    shell.print(`root requires ${needed} open port(s) — currently ${shell.net.crackedPorts(id)}/${target.ports.length}`, 'dim');
  },
};

export const ssh: Command = {
  name: 'ssh', usage: 'ssh <host>', help: 'connect to a discovered host',
  run(shell, p) {
    const id = p.args[0];
    if (!id) { shell.print('usage: ssh <host>', 'warn'); return; }
    if (!shell.state.discovered.has(id)) { shell.print(`ssh: could not resolve host: ${id}`, 'err'); return; }
    const target = shell.net.get(id);
    if (!target) { shell.print(`ssh: could not resolve host: ${id}`, 'err'); return; }
    shell.state.path.push(shell.state.host);
    shell.state.host = id;
    shell.state.cwd = [];
    shell.print(`Connected to ${target.hostname} (${id}).`, 'ok');
    if (target.notes) shell.print(target.notes, 'dim');
    if (target.firewall > 0 && !target.admin) {
      shell.print(`Warning: firewall active (${target.firewall} layers) — locked files unreadable until root. Try: hydra ${id} <port>`, 'warn');
    }
  },
};

export const exitCmd: Command = {
  name: 'exit', usage: 'exit', help: 'disconnect back to the previous host',
  run(shell) {
    if (shell.state.host === 'localhost') { shell.print('exit: already at localhost', 'dim'); return; }
    const prev = shell.state.path.pop() ?? 'localhost';
    shell.print(`Disconnected from ${shell.state.host}.`, 'warn');
    shell.state.host = prev;
    shell.state.cwd = prev === 'localhost' ? ['home', 'player'] : [];
    shell.state.trace = 0;
    shell.state.traceActive = false;
  },
};
