import type { AppDef } from '../core/apps';
import { escapeHtml } from '../core/util';

export const notesApp: AppDef = {
  id: 'notes', name: 'Notes', ram: 0.2, cpu: 2,
  render(container, shell) {
    container.classList.add('app-notes');
    container.innerHTML = `
      <div class="notes-list" id="notes-list"></div>
      <div class="notes-editor">
        <textarea id="notes-input" placeholder="in-game scratchpad..."></textarea>
        <button class="ubtn" id="notes-add">Save note</button>
      </div>
    `;
    const listEl = container.querySelector<HTMLElement>('#notes-list')!;
    const input = container.querySelector<HTMLTextAreaElement>('#notes-input')!;
    const addBtn = container.querySelector<HTMLButtonElement>('#notes-add')!;

    function renderList() {
      listEl.innerHTML = shell.state.notes.map((n, i) => `
        <div class="note-item">
          <span class="note-text">${escapeHtml(n)}</span>
          <button class="ubtn d" data-i="${i}">x</button>
        </div>`).join('') || '<div class="dim" style="padding:8px">(no saved notes)</div>';
      listEl.querySelectorAll<HTMLButtonElement>('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = Number(btn.dataset.i);
          shell.state.notes.splice(i, 1);
          shell.persist();
          renderList();
        });
      });
    }
    addBtn.addEventListener('click', () => {
      const val = input.value.trim();
      if (!val) return;
      shell.state.notes.push(val);
      input.value = '';
      shell.persist();
      renderList();
    });
    renderList();
  },
};
