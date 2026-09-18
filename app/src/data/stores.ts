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
}
