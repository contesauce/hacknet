import type { AppDef } from '../core/apps';
import { applyFx } from '../core/fx';
import type { GameState } from '../core/state';

const TOGGLES: { key: keyof GameState['fx']; label: string; desc: string }[] = [
  { key: 'scanlines', label: 'Scanlines', desc: 'Faint horizontal CRT scan lines over everything.' },
  { key: 'crtGlow', label: 'CRT Glow', desc: 'Vignette + a slow phosphor flicker.' },
  { key: 'rgbSplit', label: 'RGB Split', desc: 'Chromatic-aberration edge on terminal text. Heaviest of the three.' },
];

export const settingsApp: AppDef = {
  id: 'settings', name: 'Settings', ram: 0.1, cpu: 1,
  render(container, shell) {
    container.classList.add('app-settings');
    container.innerHTML = TOGGLES.map(t => `
      <div class="fx-row">
        <div>
          <div class="fx-label">${t.label}</div>
          <div class="dim" style="font-size:10px">${t.desc}</div>
        </div>
        <button class="ubtn fx-toggle" data-key="${t.key}">${shell.state.fx[t.key] ? 'ON' : 'OFF'}</button>
      </div>`).join('');

    container.querySelectorAll<HTMLButtonElement>('.fx-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key as keyof GameState['fx'];
        shell.state.fx[key] = !shell.state.fx[key];
        btn.textContent = shell.state.fx[key] ? 'ON' : 'OFF';
        applyFx(shell.state.fx);
        shell.persist();
      });
    });
  },
};
