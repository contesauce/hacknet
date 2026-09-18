import { registerStore } from '../core/store';

export function registerAllStores() {
  registerStore({
    id: 'market', name: 'Shadow Market',
    items: [
      {
        id: 'ram-4g', name: 'RAM Stick (4G)', cost: 150,
        desc: '+4G RAM ceiling',
        effect(shell) { shell.state.ram.total += 4; },
      },
      {
        id: 'ram-8g', name: 'RAM Stick (8G)', cost: 280,
        desc: '+8G RAM ceiling',
        effect(shell) { shell.state.ram.total += 8; },
      },
      {
        id: 'overclock', name: 'Overclock Kit', cost: 220,
        desc: '-15% CPU cost on everything you run (stacks)',
        effect(shell) { shell.state.cpuMult *= 0.85; },
      },
      {
        id: 'fast-crack', name: 'Rapid Crack Firmware', cost: 260,
        desc: '-20% hydra crack time (stacks)',
        effect(shell) { shell.state.crackSpeedMult *= 0.8; },
      },
    ],
  });

  registerStore({
    id: 'wraith', name: 'Wraith Gear', requiresFaction: 'wraith',
    items: [
      {
        id: 'ghost-trace', name: 'Ghost Trace', cost: 200,
        desc: 'Instantly clears your current trace meter',
        effect(shell) { shell.state.trace = 0; },
      },
      {
        id: 'burst-crack', name: 'Burst Firmware', cost: 350,
        desc: '-35% hydra crack time (stacks — Wraith exclusive)',
        effect(shell) { shell.state.crackSpeedMult *= 0.65; },
      },
    ],
  });

  registerStore({
    id: 'bastion', name: 'Bastion Armory', requiresFaction: 'bastion',
    items: [
      {
        id: 'fortress-ram', name: 'Fortress RAM', cost: 400,
        desc: '+12G RAM ceiling — slow to earn, built to last',
        effect(shell) { shell.state.ram.total += 12; },
      },
    ],
  });

  // The Broker Syndicate's actual perk is the universal 10% store discount
  // (see priceFor() in store-commands.ts) — they don't need their own catalog
  // to be worth joining.
}
