import type { Command, Shell } from '../shell';
import { getStore } from '../../core/store';
import type { StoreDef, StoreItem } from '../../core/store';
import { getFaction } from '../../core/factions';

function priceFor(shell: Shell, item: StoreItem): number {
  // Broker Syndicate members shop everywhere at a discount.
  const discount = shell.state.faction === 'broker' ? 0.9 : 1;
  return Math.round(item.cost * discount);
}

function accessibleStore(shell: Shell): StoreDef | undefined {
  const host = shell.net.get(shell.state.host);
  const store = host?.store ? getStore(host.store) : undefined;
  if (!store) return undefined;
  if (store.requiresFaction && shell.state.faction !== store.requiresFaction) return undefined;
  return store;
}

export const shop: Command = {
  name: 'shop', usage: 'shop', help: 'browse the store on the current host, if it sells one',
  run(shell) {
    const host = shell.net.get(shell.state.host);
    const rawStore = host?.store ? getStore(host.store) : undefined;
    if (!rawStore) { shell.print('shop: no store here', 'err'); return; }
    if (rawStore.requiresFaction && shell.state.faction !== rawStore.requiresFaction) {
      shell.print(`shop: members only (${getFaction(rawStore.requiresFaction)?.name ?? rawStore.requiresFaction})`, 'err');
      return;
    }
    shell.print(`--- ${rawStore.name} ---`, 'ok');
    for (const item of rawStore.items) {
      const price = priceFor(shell, item);
      shell.print(`  ${item.id.padEnd(12)} ${String(price + 'cr').padEnd(8)} ${item.name.padEnd(22)} ${item.desc}`, 'out');
    }
    shell.print(`Wallet: ${shell.state.credits}cr — buy with: buy <id>`, 'dim');
  },
};

export const buy: Command = {
  name: 'buy', usage: 'buy <id>', help: 'purchase an item from the current host\'s store',
  run(shell, p) {
    const id = p.args[0];
    if (!id) { shell.print('usage: buy <id>', 'warn'); return; }
    const store = accessibleStore(shell);
    if (!store) { shell.print('buy: no store here (or members only)', 'err'); return; }
    const item = store.items.find(i => i.id === id);
    if (!item) { shell.print(`buy: no such item: ${id}`, 'err'); return; }
    const price = priceFor(shell, item);
    if (shell.state.credits < price) { shell.print(`buy: need ${price}cr, have ${shell.state.credits}cr`, 'err'); return; }
    shell.state.credits -= price;
    item.effect(shell);
    shell.print(`purchased ${item.name} (-${price}cr)`, 'ok');
  },
};
