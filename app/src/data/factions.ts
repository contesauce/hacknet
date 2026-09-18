import { registerFaction } from '../core/factions';

export function registerAllFactions() {
  registerFaction({
    id: 'wraith', name: 'WRAITH COLLECTIVE', tag: 'Speed & Shadows', color: '#cc88ff',
    desc: 'Fastest tools, minimal footprint. Traces barely touch you once you\'re in.',
    node: '10.11.0.99',
  });
  registerFaction({
    id: 'bastion', name: 'BASTION ORDER', tag: 'Fortress & Patience', color: '#66ffaa',
    desc: 'Hardened, methodical, nearly impossible to trace once dug in.',
    node: '10.44.0.1',
  });
  registerFaction({
    id: 'broker', name: 'THE BROKER SYNDICATE', tag: 'Intel & Profit', color: '#ffdd44',
    desc: 'No combat edge — but a permanent 10% discount at every store, everywhere.',
    node: '10.99.0.1',
  });
}
