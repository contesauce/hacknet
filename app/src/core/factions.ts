export interface FactionMods {
  /** All multiplicative; applied to the matching GameState field when you join, reversed if you ever leave. */
  crackSpeedMult?: number;
  cpuMult?: number;
  traceGainMult?: number;
  traceDecayMult?: number;
  ramDelta?: number; // flat
}

export interface FactionDef {
  id: string;
  name: string;
  tag: string;
  color: string;
  desc: string;
  node: string; // host id where you find + join them
  rival?: string;     // opposing faction id — their territory is dangerous, and only one of you gets the player
  mods?: FactionMods;
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

/** Apply (sign=1, on join) or reverse (sign=-1, on leaving/defecting) a faction's stat profile. */
export function applyFactionMods(state: { crackSpeedMult: number; cpuMult: number; traceGainMult: number; traceDecayMult: number; ram: { total: number } }, factionId: string, sign: 1 | -1) {
  const mods = getFaction(factionId)?.mods;
  if (!mods) return;
  if (mods.crackSpeedMult) state.crackSpeedMult *= sign === 1 ? mods.crackSpeedMult : 1 / mods.crackSpeedMult;
  if (mods.cpuMult) state.cpuMult *= sign === 1 ? mods.cpuMult : 1 / mods.cpuMult;
  if (mods.traceGainMult) state.traceGainMult *= sign === 1 ? mods.traceGainMult : 1 / mods.traceGainMult;
  if (mods.traceDecayMult) state.traceDecayMult *= sign === 1 ? mods.traceDecayMult : 1 / mods.traceDecayMult;
  if (mods.ramDelta) state.ram.total += sign * mods.ramDelta;
}

/** True if a host tagged with this faction id is dangerous territory for the player right now. */
export function isHostileTerritory(hostileFactions: string[], myFaction: string | null, hostFactionId: string | undefined): boolean {
  if (!hostFactionId) return false;
  if (hostileFactions.includes(hostFactionId)) return true;
  const mine = myFaction ? getFaction(myFaction) : undefined;
  return mine?.rival === hostFactionId;
}
