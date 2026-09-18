export interface FactionDef {
  id: string;
  name: string;
  tag: string;
  color: string;
  desc: string;
  node: string; // host id where you find + join them
}

const registry = new Map<string, FactionDef>();

export function registerFaction(f: FactionDef) {
  registry.set(f.id, f);
}

export function getFaction(id: string): FactionDef | undefined {
  return registry.get(id);
}

export function allFactions(): FactionDef[] {
  return [...registry.values()];
}
