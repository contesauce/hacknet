// Player/session state. Persists to localStorage for now; swap `save`/`load`
// for a fetch() to the Worker API once auth + D1 are wired up.

export interface ProcessInfo {
  pid: number;
  name: string;
  ram: number;
  target: string;
  startedAt: number;
  durationMs: number;
  onComplete: () => void;
}

export interface GameState {
  host: string;                 // current connection: 'localhost' or an ip
  cwd: string[];                 // cwd on the currently connected host
  path: string[];                // chain of hosts hopped through, for `exit` to unwind
  discovered: Set<string>;
  rootedHosts: Set<string>;
  toolsInstalled: Set<string>;   // 'hydra' | 'scp' | 'decrypt' | ...
  credits: number;
  trace: number;                 // 0..100, current host
  traceActive: boolean;
  ram: { total: number; used: number };
  history: string[];
  questFlags: Record<string, boolean>;
}

export function newGameState(): GameState {
  return {
    host: 'localhost',
    cwd: ['home', 'player'],
    path: [],
    discovered: new Set(['localhost']),
    rootedHosts: new Set(['localhost']),
    toolsInstalled: new Set(['nmap', 'ssh', 'hydra', 'decrypt', 'scp']),
    credits: 500,
    trace: 0,
    traceActive: false,
    ram: { total: 8, used: 0 },
    history: [],
    questFlags: {},
  };
}

const SAVE_KEY = 'async_os_save_v1';

export function saveLocal(state: GameState) {
  const serializable = {
    ...state,
    discovered: [...state.discovered],
    rootedHosts: [...state.rootedHosts],
    toolsInstalled: [...state.toolsInstalled],
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(serializable));
}

export function loadLocal(): GameState | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      discovered: new Set(parsed.discovered),
      rootedHosts: new Set(parsed.rootedHosts),
      toolsInstalled: new Set(parsed.toolsInstalled),
    };
  } catch {
    return null;
  }
}
