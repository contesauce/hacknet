import type { Shell } from '../terminal/shell';
import type { NetworkGraph } from '../core/network';
import { getApp } from '../core/apps';

const HOSTS_TAB = '__hosts__';

export class SidePanel {
  private tabBar: HTMLElement;
  private content: HTMLElement;
  private active = HOSTS_TAB;
  private mountedApps = new Set<string>(); // appIds currently mounted into their own content div
  private appContainers = new Map<string, HTMLElement>();

  private shell: Shell;
  private net: NetworkGraph;

  constructor(root: HTMLElement, shell: Shell, net: NetworkGraph) {
    this.shell = shell;
    this.net = net;
    root.innerHTML = `
      <div class="panel-header" id="sp-tabs"></div>
      <div id="sp-content" style="flex:1;min-height:0;display:flex;flex-direction:column"></div>
    `;
    this.tabBar = root.querySelector('#sp-tabs')!;
    this.content = root.querySelector('#sp-content')!;
    this.sync();
  }

  /** Reconcile open tabs against the live process table. Call after every state change. */
  sync() {
    const openAppIds = this.shell.procs.list().filter(p => p.kind === 'app').map(p => p.appId!);

    // Drop containers for apps that closed.
    for (const id of [...this.mountedApps]) {
      if (!openAppIds.includes(id)) {
        this.mountedApps.delete(id);
        this.appContainers.delete(id);
        if (this.active === id) this.active = HOSTS_TAB;
      }
    }
    // Mount containers for newly opened apps.
    for (const id of openAppIds) {
      if (!this.mountedApps.has(id)) {
        this.mountedApps.add(id);
        const def = getApp(id);
        const div = document.createElement('div');
        div.className = 'app-window';
        def?.render(div, this.shell);
        this.appContainers.set(id, div);
      }
    }

    if (this.shell.pendingFocusApp && openAppIds.includes(this.shell.pendingFocusApp)) {
      this.active = this.shell.pendingFocusApp;
    }
    this.shell.pendingFocusApp = null;

    // Let mounted apps react to state changes from outside themselves
    // (e.g. quests completing from a terminal command).
    for (const id of openAppIds) {
      const container = this.appContainers.get(id);
      if (container) getApp(id)?.update?.(container, this.shell);
    }

    this.renderTabs(openAppIds);
    this.renderContent();
  }

  private renderTabs(openAppIds: string[]) {
    const tabs = [{ id: HOSTS_TAB, label: 'Hosts' }, ...openAppIds.map(id => ({ id, label: getApp(id)?.name ?? id }))];
    this.tabBar.innerHTML = '';
    this.tabBar.style.cssText = 'display:flex;gap:4px;padding:6px;border-bottom:1px solid var(--border);flex-wrap:wrap';
    for (const t of tabs) {
      const btn = document.createElement('button');
      btn.className = 'sp-tab' + (t.id === this.active ? ' on' : '');
      btn.textContent = t.label;
      btn.onclick = () => { this.active = t.id; this.renderContent(); this.renderTabs(openAppIds); };
      this.tabBar.appendChild(btn);
      if (t.id !== HOSTS_TAB) {
        const proc = this.shell.procs.list().find(p => p.appId === t.id);
        if (proc) {
          const x = document.createElement('span');
          x.className = 'sp-tab-close';
          x.textContent = '×';
          x.onclick = (e) => { e.stopPropagation(); this.shell.procs.kill(proc.pid); this.shell.persist(); };
          btn.appendChild(x);
        }
      }
    }
  }

  private renderContent() {
    this.content.innerHTML = '';
    if (this.active === HOSTS_TAB) {
      this.content.appendChild(this.renderHosts());
    } else {
      const div = this.appContainers.get(this.active);
      if (div) this.content.appendChild(div);
    }
  }

  private renderHosts(): HTMLElement {
    const el = document.createElement('div');
    el.id = 'hosts-list';
    for (const id of this.shell.state.discovered) {
      const h = this.net.get(id);
      if (!h) continue;
      const div = document.createElement('div');
      div.className = 'host-item' + (id === this.shell.state.host ? ' current' : '');
      div.innerHTML = `<div class="name">${h.hostname}</div><div class="ip">${id}${h.admin ? ' · root' : ''}</div>`;
      el.appendChild(div);
    }
    return el;
  }
}
