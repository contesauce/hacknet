// Runtime process table — RAM/CPU accounting for both open apps and
// in-flight exploit tools. Deliberately NOT part of GameState: processes
// don't survive a reload, same as a real machine losing power.

export type ProcessKind = 'tool' | 'app';

export interface ProcessInfo {
  pid: number;
  kind: ProcessKind;
  name: string;
  ram: number;   // GB
  cpu: number;   // % of a single core, roughly
  target?: string; // host id, for 'tool' processes
  appId?: string;  // app id, for 'app' processes
}

export class ProcessManager {
  private procs: ProcessInfo[] = [];
  private nextPid = 1;
  onChange: () => void = () => {};

  list(): ProcessInfo[] {
    return this.procs;
  }

  ramUsed(): number {
    return this.procs.reduce((s, p) => s + p.ram, 0);
  }

  cpuUsed(): number {
    return this.procs.reduce((s, p) => s + p.cpu, 0);
  }

  spawn(info: Omit<ProcessInfo, 'pid'>): ProcessInfo {
    const p: ProcessInfo = { ...info, pid: this.nextPid++ };
    this.procs.push(p);
    this.onChange();
    return p;
  }

  kill(pid: number): boolean {
    const before = this.procs.length;
    this.procs = this.procs.filter(p => p.pid !== pid);
    if (this.procs.length !== before) { this.onChange(); return true; }
    return false;
  }

  findApp(appId: string): ProcessInfo | undefined {
    return this.procs.find(p => p.kind === 'app' && p.appId === appId);
  }
}
