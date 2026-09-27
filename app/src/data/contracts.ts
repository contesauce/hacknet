import { registerContract } from '../core/contracts';

// Freelance side work — independent of the main VESSEL storyline. Anyone can
// take the open ones; faction-gated ones only show up once you've joined.
// More factions (federal/intel, anarchist) are planned — their contracts
// slot in here the same way once those factions exist.
export function registerAllContracts() {
  registerContract({
    id: 'c_proving_ground', client: 'unknown (encrypted comms)', title: 'Proving Ground',
    risk: 'low',
    briefing: 'Somebody\'s vetting talent. Get root on anything besides your own box and they\'ll know you\'re for real.',
    reward: { credits: 75 },
    available: () => true,
    complete: (shell) => shell.state.rootedHosts.size >= 2,
  });

  registerContract({
    id: 'c_market_run', client: 'Shadow Market fixer', title: 'Market Run',
    risk: 'low',
    briefing: 'The Market\'s got a backend nobody\'s supposed to see. Get root on it and I\'ll make it worth your time.',
    reward: { credits: 150 },
    available: (shell) => shell.state.discovered.has('172.20.0.1'),
    complete: (shell) => shell.state.rootedHosts.has('172.20.0.1'),
  });

  registerContract({
    id: 'c_kronos_leak', client: 'anonymous whistleblower', title: 'The KRONOS Leak',
    risk: 'high',
    briefing: 'KRONOS is sitting on something they shouldn\'t have. Root their gateway, however you get there — I\'m not picky about your methods, just the result.',
    reward: { credits: 250 },
    available: (shell) => shell.state.discovered.has('10.0.0.5'),
    complete: (shell) => shell.state.rootedHosts.has('10.0.0.5'),
  });

  registerContract({
    id: 'c_wraith_contract', client: 'Wraith Collective', title: 'Off the Grid',
    risk: 'medium',
    briefing: 'Three boxes, in and out, nothing left behind. Show us you move the way we move.',
    reward: { credits: 200, rep: { faction: 'wraith', amount: 20 } },
    requiresFaction: 'wraith',
    available: () => true,
    complete: (shell) => shell.state.rootedHosts.size >= 3,
  });

  registerContract({
    id: 'c_bastion_contract', client: 'Bastion Order', title: 'Hold the Line',
    risk: 'medium',
    briefing: 'Anyone can smash a door in. We want proof you can hold ground once you\'re through it — crack the encryption, keep the root.',
    reward: { credits: 200, rep: { faction: 'bastion', amount: 20 } },
    requiresFaction: 'bastion',
    available: () => true,
    complete: (shell) => shell.state.toolsInstalled.has('decrypt') && shell.state.rootedHosts.size >= 3,
  });

  registerContract({
    id: 'c_broker_contract', client: 'Broker Syndicate', title: 'Flip the Ledger',
    risk: 'low',
    briefing: 'Money\'s the only intel that matters. Show me a balance worth talking about.',
    reward: { credits: 150, rep: { faction: 'broker', amount: 20 } },
    requiresFaction: 'broker',
    available: () => true,
    complete: (shell) => shell.state.credits >= 1000,
  });
}
