import type { Shell } from '../terminal/shell';

export interface QuestReward {
  credits?: number;
  revealHosts?: string[];                                // reveal one or more hidden host ids
  mail?: { from: string; subj: string; body: string };   // deliver a mail message
}

export interface Quest {
  id: string;
  name: string;
  desc: string;
  act: number;
  main: boolean;      // main-line vs side quest
  after?: string;      // prerequisite quest id; undefined = available from the start
  reward: QuestReward;
  complete(shell: Shell): boolean;
}

const registry = new Map<string, Quest>();

export function registerQuest(q: Quest) {
  registry.set(q.id, q);
}

export function getQuest(id: string): Quest | undefined {
  return registry.get(id);
}

export function allQuests(): Quest[] {
  return [...registry.values()];
}
