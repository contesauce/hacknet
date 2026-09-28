// Cloud saves for signed-in players, backed by the Worker's /api/save (D1).
// Guests, and anyone the fetch fails for, fall back to core/state.ts's
// localStorage path — this module never throws.

import type { GameState } from './state';
import { serializeState, hydrateState } from './state';

export interface SessionInfo {
  loggedIn: boolean;
  email?: string;
  name?: string;
}

export async function fetchSession(): Promise<SessionInfo> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
    if (!res.ok) return { loggedIn: false };
    return await res.json();
  } catch {
    return { loggedIn: false };
  }
}

export async function loadRemote(): Promise<GameState | null> {
  try {
    const res = await fetch('/api/save', { credentials: 'same-origin' });
    if (!res.ok) return null;
    const { state } = await res.json();
    return state ? hydrateState(state) : null;
  } catch {
    return null;
  }
}

export async function saveRemote(state: GameState): Promise<void> {
  try {
    await fetch('/api/save', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serializeState(state)),
    });
  } catch {
    // best-effort — localStorage already has the latest state
  }
}
