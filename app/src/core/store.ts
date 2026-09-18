import type { Shell } from '../terminal/shell';

export interface StoreItem {
  id: string;
  name: string;
  cost: number;
  desc: string;
  /** Mechanical effect. Purchase already deducted credits by the time this runs. */
  effect(shell: Shell): void;
}

export interface StoreDef {
  id: string;
  name: string;
  items: StoreItem[];
}

const registry = new Map<string, StoreDef>();

export function registerStore(def: StoreDef) {
  registry.set(def.id, def);
}

export function getStore(id: string): StoreDef | undefined {
  return registry.get(id);
}
