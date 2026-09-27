import type { AppDef } from '../core/apps';
import { getContract, offeredContracts } from '../core/contracts';
import { acceptContract } from '../terminal/commands/contract-commands';
import { escapeHtml } from '../core/util';
import type { Shell } from '../terminal/shell';

function draw(container: HTMLElement, shell: Shell) {
  const offered = offeredContracts(shell);
  const active = shell.state.activeContracts.map(id => getContract(id)).filter(c => !!c);
  const done = shell.state.completedContracts.map(id => getContract(id)).filter(c => !!c);

  const card = (c: NonNullable<ReturnType<typeof getContract>>, action: string) => `
    <div class="quest-card">
      <div class="quest-name">${escapeHtml(c.title)} <span class="quest-tag">${c.risk.toUpperCase()}</span></div>
      <div class="dim" style="font-size:10px">${escapeHtml(c.client)}</div>
      <div class="quest-desc">${escapeHtml(c.briefing)}</div>
      <div class="quest-reward">
        ${c.reward.credits ? `${c.reward.credits}cr` : ''}${c.reward.rep ? ` · +${c.reward.rep.amount} rep (${escapeHtml(c.reward.rep.faction)})` : ''}
      </div>
      ${action}
    </div>`;

  const offeredHtml = offered.map(c => card(c, `<button class="ubtn" data-accept="${c.id}">Accept</button>`)).join('')
    || '<div class="dim" style="padding:8px">No open contracts right now.</div>';
  const activeHtml = active.map(c => card(c, '<span class="pill pg">IN PROGRESS</span>')).join('');
  const doneHtml = done.length
    ? `<div class="quest-section-label">Completed (${done.length})</div>` +
      done.map(c => `<div class="quest-done">✓ ${escapeHtml(c.title)}</div>`).join('')
    : '';

  container.innerHTML = `
    ${active.length ? `<div class="quest-section-label">Active</div>${activeHtml}` : ''}
    <div class="quest-section-label">Open</div>
    ${offeredHtml}
    ${doneHtml}
  `;

  container.querySelectorAll<HTMLButtonElement>('[data-accept]').forEach(btn => {
    btn.addEventListener('click', () => {
      acceptContract(shell, btn.dataset.accept!);
      shell.persist();
      draw(container, shell);
    });
  });
}

export const contractsApp: AppDef = {
  id: 'contracts', name: 'Contracts', ram: 0.1, cpu: 1,
  render(container, shell) {
    container.classList.add('app-missions');
    draw(container, shell);
  },
  update(container, shell) {
    draw(container, shell);
  },
};
