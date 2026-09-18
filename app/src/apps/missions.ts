import type { AppDef } from '../core/apps';
import { getQuest } from '../core/quests';
import { escapeHtml } from '../core/util';

function draw(container: HTMLElement, shell: import('../terminal/shell').Shell) {
  const active = shell.state.activeQuests.map(id => getQuest(id)).filter(q => !!q);
  const done = shell.state.completedQuests.map(id => getQuest(id)).filter(q => !!q);

  const activeHtml = active.map(q => `
    <div class="quest-card">
      <div class="quest-name">${escapeHtml(q.name)} <span class="quest-tag">${q.main ? 'MAIN' : 'SIDE'} · ACT ${q.act}</span></div>
      <div class="quest-desc">${escapeHtml(q.desc)}</div>
      ${q.reward.credits ? `<div class="quest-reward">Reward: ${q.reward.credits}cr</div>` : ''}
    </div>`).join('') || '<div class="dim" style="padding:8px">No active missions.</div>';

  const doneHtml = done.length
    ? `<div class="quest-section-label">Completed (${done.length})</div>` +
      done.map(q => `<div class="quest-done">✓ ${escapeHtml(q.name)}</div>`).join('')
    : '';

  container.innerHTML = `
    <div class="quest-section-label">Active</div>
    ${activeHtml}
    ${doneHtml}
  `;
}

export const missionsApp: AppDef = {
  id: 'missions', name: 'Missions', ram: 0.1, cpu: 1,
  render(container, shell) {
    container.classList.add('app-missions');
    draw(container, shell);
  },
  // Quests complete from terminal commands, not clicks inside this panel,
  // so the side panel calls this on every state change to keep it live.
  update(container, shell) {
    draw(container, shell);
  },
};
