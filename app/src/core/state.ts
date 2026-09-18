// Player/session state. Persists to localStorage for now; swap `save`/`load`
// for a fetch() to the Worker API once auth + D1 are wired up.
//
// Running processes (apps, in-flight exploit tools) are NOT here — see
// core/process.ts. They're runtime-only and don't survive a reload.

export interface MailMessage {
  id: string;
  from: string;
  subj: string;
  body: string;
  read: boolean;
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
  ram: { total: number };        // used is derived live from the process table
  history: string[];
  questFlags: Record<string, boolean>;
  mail: MailMessage[];
  notes: string[];
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
    ram: { total: 8 },
    history: [],
    questFlags: {},
    mail: [
      {
        id: 'boot', from: 'sys@async.os', subj: 'System boot',
        body: 'ASYNC_OS initialized.\n\nType `apps` to see what you can run, and remember — every open app holds RAM until you close it.',
        read: false,
      },
    ],
    notes: [],
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
