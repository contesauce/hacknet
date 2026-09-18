import type { DirNode } from './fs';
import { VirtualFs } from './fs';

export type PortType = 'ssh' | 'ftp' | 'http' | 'smtp' | 'sql';

export interface Port {
  type: PortType;
  port: number;
  open: boolean; // cracked by the player
}

export interface HostNode {
  id: string;            // ip, used as the map key
  hostname: string;
  x: number; y: number;  // map position, 0..1
  kind: 'server' | 'corp';
  fs: DirNode;
  ports: Port[];
  firewall: number;        // layers remaining; 0 = open
  traceSpeed: number;      // seconds for a full trace once triggered
  connections: string[];   // adjacent host ids (what `nmap` from here reveals)
  hidden?: boolean;        // not revealed by neighbor nmap, needs a direct lead
  admin?: boolean;         // player has root
  faction?: string;
  notes?: string;          // flavor text shown on `ssh` banner
  store?: string;          // id of a StoreDef (see core/store.ts) sold here
}

export const PORT_DEFAULT: Record<PortType, number> = {
  ssh: 22, ftp: 21, http: 80, smtp: 25, sql: 1433,
};

export function makePort(type: PortType, open = false): Port {
  return { type, port: PORT_DEFAULT[type], open };
}

export class NetworkGraph {
  hosts = new Map<string, HostNode>();
  fsByHost = new Map<string, VirtualFs>();

  add(h: HostNode) {
    this.hosts.set(h.id, h);
    this.fsByHost.set(h.id, new VirtualFs(h.fs));
  }

  get(id: string): HostNode | undefined {
    return this.hosts.get(id);
  }

  fs(id: string): VirtualFs | undefined {
    return this.fsByHost.get(id);
  }

  crackedPorts(id: string): number {
    return this.get(id)?.ports.filter(p => p.open).length ?? 0;
  }

  portsNeededForRoot(id: string): number {
    const h = this.get(id);
    if (!h) return Infinity;
    return Math.max(1, Math.ceil(h.ports.length / 2));
  }
}
