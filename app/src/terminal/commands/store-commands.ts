import type { Command } from '../shell';
import { getStore } from '../../core/store';

export const shop: Command = {
  name: 'shop', usage: 'shop', help: 'browse the store on the current host, if it sells one',
  run(shell) {
    const host = shell.net.get(shell.state.host);
    if (!host?.store) { shell.print('shop: no store here', 'err'); return; }
    const store = getStore(host.store);
    if (!store) { shell.print('shop: no store here', 'err'); return; }
    shell.print(`--- ${store.name} ---`, 'ok');
    for (const item of store.items) {
      shell.print(`  ${item.id.padEnd(12)} ${String(item.cost + 'cr').padEnd(8)} ${item.name.padEnd(22)} ${item.desc}`, 'out');
    }
    shell.print(`Wallet: ${shell.state.credits}cr — buy with: buy <id>`, 'dim');
  },
};

export const buy: Command = {
  name: 'buy', usage: 'buy <id>', help: 'purchase an item from the current host\'s store',
  run(shell, p) {
    const id = p.args[0];
    if (!id) { shell.print('usage: buy <id>', 'warn'); return; }
    const host = shell.net.get(shell.state.host);
    const store = host?.store ? getStore(host.store) : undefined;
    if (!store) { shell.print('buy: no store here', 'err'); return; }
    const item = store.items.find(i => i.id === id);
    if (!item) { shell.print(`buy: no such item: ${id}`, 'err'); return; }
    if (shell.state.credits < item.cost) { shell.print(`buy: need ${item.cost}cr, have ${shell.state.credits}cr`, 'err'); return; }
    shell.state.credits -= item.cost;
    item.effect(shell);
    shell.print(`purchased ${item.name} (-${item.cost}cr)`, 'ok');
  },
};
