// Minimal virtual filesystem: real paths, real cd/ls/cat semantics.

export interface FileNode {
  type: 'file';
  name: string;
  content: string;
  locked?: boolean;      // requires root/admin access on the host to read
  encrypted?: boolean;    // requires `decrypt` with a password
  password?: string;
  tag?: string;           // short badge shown in `ls -l` (e.g. LOG, SHARD)
  onRead?: string;        // quest-flag id to set when this file is cat'd
  vesselShard?: string;   // collected into state.vesselShards when read
}

export interface DirNode {
  type: 'dir';
  name: string;
  children: Record<string, FsNode>;
}

export type FsNode = FileNode | DirNode;

export function dir(name: string, children: Record<string, FsNode> = {}): DirNode {
  return { type: 'dir', name, children };
}

export function file(name: string, content: string, opts: Partial<FileNode> = {}): FileNode {
  return { type: 'file', name, content, ...opts };
}

export function isDir(n: FsNode | null | undefined): n is DirNode {
  return !!n && n.type === 'dir';
}
export function isFile(n: FsNode | null | undefined): n is FileNode {
  return !!n && n.type === 'file';
}

/** Split "/a/b/c" -> ["a","b","c"]. Ignores empty segments. */
function segments(p: string): string[] {
  return p.split('/').filter(Boolean);
}

export class VirtualFs {
  root: DirNode;
  constructor(root: DirNode) { this.root = root; }

  /** Resolve `pathStr` (absolute or relative to `cwd`) into absolute segments. Handles . and .. */
  resolvePath(cwd: string[], pathStr: string): string[] {
    const base = pathStr.startsWith('/') ? [] : [...cwd];
    for (const seg of segments(pathStr)) {
      if (seg === '.') continue;
      else if (seg === '..') base.pop();
      else base.push(seg);
    }
    return base;
  }

  /** Get the node at an absolute segment path, or null. [] means root. */
  get(path: string[]): FsNode | null {
    let node: FsNode = this.root;
    for (const seg of path) {
      if (!isDir(node)) return null;
      const next: FsNode | undefined = node.children[seg];
      if (!next) return null;
      node = next;
    }
    return node;
  }

  getDir(path: string[]): DirNode | null {
    const n = this.get(path);
    return isDir(n) ? n : null;
  }

  getFile(path: string[]): FileNode | null {
    const n = this.get(path);
    return isFile(n) ? n : null;
  }

  list(path: string[]): FsNode[] | null {
    const d = this.getDir(path);
    if (!d) return null;
    return Object.values(d.children).sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  /** Create (or overwrite) a file at an absolute path. */
  writeFile(path: string[], f: FileNode): boolean {
    if (path.length === 0) return false;
    const parent = this.getDir(path.slice(0, -1));
    if (!parent) return false;
    parent.children[path[path.length - 1]] = f;
    return true;
  }

  remove(path: string[]): boolean {
    if (path.length === 0) return false;
    const parent = this.getDir(path.slice(0, -1));
    const name = path[path.length - 1];
    if (!parent || !parent.children[name]) return false;
    delete parent.children[name];
    return true;
  }

  /** All files in this tree matching a predicate, with their absolute paths. */
  walk(pred: (f: FileNode, path: string[]) => boolean, from: string[] = [], node: FsNode = this.root): { file: FileNode; path: string[] }[] {
    const out: { file: FileNode; path: string[] }[] = [];
    const visit = (n: FsNode, path: string[]) => {
      if (isFile(n)) {
        if (pred(n, path)) out.push({ file: n, path });
      } else {
        for (const [name, child] of Object.entries(n.children)) visit(child, [...path, name]);
      }
    };
    visit(node, from);
    return out;
  }

  static pathStr(path: string[]): string {
    return '/' + path.join('/');
  }
}
