import type { AppDef } from '../core/apps';
import { escapeHtml } from '../core/util';

export const mailApp: AppDef = {
  id: 'mail', name: 'Mail', ram: 0.3, cpu: 4,
  render(container, shell) {
    container.classList.add('app-mail');
    container.innerHTML = `
      <div class="mail-list" id="mail-list"></div>
      <div class="mail-body" id="mail-body">Select a message.</div>
    `;
    const listEl = container.querySelector<HTMLElement>('#mail-list')!;
    const bodyEl = container.querySelector<HTMLElement>('#mail-body')!;

    function renderList() {
      listEl.innerHTML = shell.state.mail.map((m, i) => `
        <div class="mail-item ${m.read ? '' : 'unread'}" data-i="${i}">
          <div class="mail-from">${escapeHtml(m.from)}</div>
          <div class="mail-subj">${escapeHtml(m.subj)}</div>
        </div>`).join('') || '<div class="dim" style="padding:8px">(empty inbox)</div>';
      listEl.querySelectorAll<HTMLElement>('.mail-item').forEach(el => {
        el.addEventListener('click', () => {
          const i = Number(el.dataset.i);
          const m = shell.state.mail[i];
          m.read = true;
          bodyEl.textContent = m.body;
          shell.persist();
          renderList();
        });
      });
    }
    renderList();
  },
};
