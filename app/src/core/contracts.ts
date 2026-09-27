import type { Shell } from '../terminal/shell';

export interface ContractReward {
  credits?: number;
  rep?: { faction: string; amount: number };
}

export type ContractRisk = 'low' | 'medium' | 'high';

export interface ContractDef {
  id: string;
  client: string;   // flavor: who's posting it
  title: string;
  briefing: string; // shown once accepted, and via `contracts <id>`
  risk: ContractRisk;
  reward: ContractReward;
  requiresFaction?: string;    // only offered to members of this faction
  excludesFactions?: string[]; // hidden from members of these rival factions
  /** Gate on discovery/quest progress — determines whether this shows up at all. */
  available(shell: Shell): boolean;
  /** Gate on completion, checked only while active. */
  complete(shell: Shell): boolean;
}

const registry = new Map<string, ContractDef>();

export function registerContract(c: ContractDef) {
  registry.set(c.id, c);
}

export function getContract(id: string): ContractDef | undefined {
  return registry.get(id);
}

export function allContracts(): ContractDef[] {
  return [...registry.values()];
}

/** Contracts visible to the player right now: gated open, not already active/done, faction-eligible. */
export function offeredContracts(shell: Shell): ContractDef[] {
  return allContracts().filter(c => {
    if (shell.state.activeContracts.includes(c.id)) return false;
    if (shell.state.completedContracts.includes(c.id)) return false;
    if (c.requiresFaction && shell.state.faction !== c.requiresFaction) return false;
    if (c.excludesFactions?.includes(shell.state.faction ?? '')) return false;
    return c.available(shell);
  });
}
