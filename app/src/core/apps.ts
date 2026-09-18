import type { Shell } from '../terminal/shell';

export interface AppDef {
  id: string;
  name: string;
  ram: number; // GB, held for as long as the app stays open
  cpu: number; // %, held for as long as the app stays open
  /** Called once when the app's tab is mounted. The app owns `container` until closed. */
  render(container: HTMLElement, shell: Shell): void;
}

const registry = new Map<string, AppDef>();

export function registerApp(def: AppDef) {
  registry.set(def.id, def);
}

export function getApp(id: string): AppDef | undefined {
  return registry.get(id);
}

export function listApps(): AppDef[] {
  return [...registry.values()];
}
