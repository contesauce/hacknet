import type { AppDef } from '../core/apps';
import { allFactions } from '../core/factions';
import { joinFaction } from '../terminal/commands/faction-commands';
import { escapeHtml } from '../core/util';
import type { Shell } from '../terminal/shell';

function draw(container: HTMLElement, shell: Shell) {
  container.innerHTML = allFactions().map(f => {
    const joined = shell.state.faction === f.id;
    const known = shell.state.discovered.has(f.node);
    const rep = shell.state.factionRep[f.id] ?? 0;
    return `
      <div class="faction-card ${joined ? 'joined' : ''}" style="${joined ? `border-color:${f.color}` : ''}">
        <div style="color:${f.color};font-weight:600">${escapeHtml(f.name)}</div>
        <div class="dim" style="font-size:10px">${escapeHtml(f.tag)}</div>
        <div style="font-size:11px;margin:4px 0">${escapeHtml(f.desc)}</div>
        ${joined
          ? `<span class="pill pg">JOINED · rep ${rep}</span>`
          : known
            ? `<button class="ubtn" data-join="${f.id}">Join</button>`
            : `<span class="dim" style="font-size:10px">Not yet found.</span>`}
      </div>`;
  }).join('');

  container.querySelectorAll<HTMLButtonElement>('[data-join]').forEach(btn => {
    btn.addEventListener('click', () => {
      joinFaction(shell, btn.dataset.join!);
      shell.persist();
      draw(container, shell);
    });
  });
}

export const factionsApp: AppDef = {
  id: 'factions', name: 'Factions', ram: 0.1, cpu: 1,
  render(container, shell) {
    container.classList.add('app-factions');
    draw(container, shell);
  },
  update(container, shell) {
    draw(container, shell);
  },
};
