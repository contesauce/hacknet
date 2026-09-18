import './style.css';
import { newGameState, loadLocal } from './core/state';
import { NetworkGraph } from './core/network';
import { ALL_HOSTS } from './data/world';
import { Shell } from './terminal/shell';
import { registerAllCommands } from './terminal/commands/index';
import { TerminalUI } from './terminal/terminal-ui';

const net = new NetworkGraph();
ALL_HOSTS.forEach(h => net.add(h));

const state = loadLocal() ?? newGameState();
const shell = new Shell(state, net);
registerAllCommands(shell);

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <div id="sidebar">
    <div class="panel" id="hud">
      <div class="panel-header">Session</div>
      <div class="hud-row"><span class="hud-label">Host</span><span id="hud-host"></span></div>
      <div>
        <div class="hud-row"><span class="hud-label">RAM</span><span id="hud-ram-val"></span></div>
        <div class="hud-bar"><div class="hud-bar-fill" id="hud-ram"></div></div>
      </div>
      <div>
        <div class="hud-row"><span class="hud-label">Trace</span><span id="hud-trace-val"></span></div>
        <div class="hud-bar"><div class="hud-bar-fill" id="hud-trace"></div></div>
      </div>
      <div class="hud-row"><span class="hud-label">Credits</span><span id="hud-credits"></span></div>
    </div>
    <div class="panel" style="flex:1;min-height:0">
      <div class="panel-header">Known Hosts</div>
      <div id="hosts-list"></div>
    </div>
  </div>
  <div class="panel" id="main"></div>
`;

const termUI = new TerminalUI(shell, document.getElementById('main')!);

function renderHosts() {
  const el = document.getElementById('hosts-list')!;
  el.innerHTML = '';
  for (const id of state.discovered) {
    const h = net.get(id);
    if (!h) continue;
    const div = document.createElement('div');
    div.className = 'host-item' + (id === state.host ? ' current' : '');
    div.innerHTML = `<div class="name">${h.hostname}</div><div class="ip">${id}${h.admin ? ' · root' : ''}</div>`;
    el.appendChild(div);
  }
}

function renderHud() {
  document.getElementById('hud-host')!.textContent = shell.hostname();
  document.getElementById('hud-ram-val')!.textContent = `${state.ram.used.toFixed(1)}G / ${state.ram.total.toFixed(1)}G`;
  const ramPct = Math.min(100, (state.ram.used / state.ram.total) * 100);
  const ramFill = document.getElementById('hud-ram')!;
  ramFill.style.width = ramPct + '%';
  ramFill.className = 'hud-bar-fill' + (ramPct > 90 ? ' err' : ramPct > 70 ? ' warn' : '');

  document.getElementById('hud-trace-val')!.textContent = `${Math.round(state.trace)}%`;
  const traceFill = document.getElementById('hud-trace')!;
  traceFill.style.width = state.trace + '%';
  traceFill.className = 'hud-bar-fill' + (state.trace > 70 ? ' err' : state.trace > 40 ? ' warn' : '');

  document.getElementById('hud-credits')!.textContent = `${state.credits}cr`;
}

shell.onStateChange = () => { renderHosts(); renderHud(); };
renderHosts();
renderHud();

// Trace decays slowly while not actively cracking something.
setInterval(() => {
  if (state.host === 'localhost' || shell.busy) return;
  if (state.trace > 0) state.trace = Math.max(0, state.trace - 1.2);
  if (state.trace >= 100) {
    shell.print('╔══════════════════════════════════════╗', 'err');
    shell.print('║  TRACE COMPLETE — CONNECTION SEVERED  ║', 'err');
    shell.print('╚══════════════════════════════════════╝', 'err');
    state.host = 'localhost';
    state.path = [];
    state.cwd = ['home', 'player'];
    state.trace = 0;
    state.traceActive = false;
    termUI.refreshPrompt();
  }
  renderHud();
}, 1000);

shell.print('ASYNC_OS — type `help` to get started. Try: nmap, then ssh <host>.', 'ok');
