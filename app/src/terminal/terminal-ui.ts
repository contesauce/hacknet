import { Shell } from './shell';
import { fsCompletions } from './commands/fs-commands';

export class TerminalUI {
  private shell: Shell;
  private outEl: HTMLElement;
  private inputEl: HTMLInputElement;
  private promptEl: HTMLElement;
  private histIdx = -1;

  constructor(shell: Shell, root: HTMLElement) {
    this.shell = shell;
    root.innerHTML = `
      <div class="term-out" id="term-out"></div>
      <div class="term-row">
        <span class="term-prompt" id="term-prompt"></span>
        <input class="term-input" id="term-input" autocomplete="off" spellcheck="false" autofocus />
      </div>
    `;
    this.outEl = root.querySelector('#term-out')!;
    this.inputEl = root.querySelector('#term-input')!;
    this.promptEl = root.querySelector('#term-prompt')!;

    this.shell.onPrint = (line) => {
      if (line.text === '__CLEAR__') { this.outEl.innerHTML = ''; return; }
      this.printLine(line.text, line.cls);
    };

    this.inputEl.addEventListener('keydown', (e) => this.onKeydown(e));
    root.addEventListener('click', () => this.inputEl.focus());
    this.refreshPrompt();
  }

  refreshPrompt() {
    this.promptEl.textContent = this.shell.promptString();
  }

  printLine(text: string, cls: string) {
    const div = document.createElement('div');
    div.className = `line ${cls}`;
    div.textContent = text;
    this.outEl.appendChild(div);
    this.outEl.scrollTop = this.outEl.scrollHeight;
  }

  private async onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      const val = this.inputEl.value;
      this.inputEl.value = '';
      this.histIdx = -1;
      await this.shell.execute(val);
      this.refreshPrompt();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.histIdx < this.shell.state.history.length - 1) {
        this.histIdx++;
        this.inputEl.value = this.shell.state.history[this.histIdx];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.histIdx > 0) { this.histIdx--; this.inputEl.value = this.shell.state.history[this.histIdx]; }
      else { this.histIdx = -1; this.inputEl.value = ''; }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this.tabComplete();
    }
  }

  private tabComplete() {
    const val = this.inputEl.value;
    const parts = val.split(/\s+/);
    if (parts.length <= 1) {
      const matches = [...this.shell.registry.keys()].filter(k => k.startsWith(parts[0] ?? ''));
      if (matches.length === 1) this.inputEl.value = matches[0] + ' ';
      else if (matches.length > 1) this.printLine('  ' + matches.join('  '), 'dim');
      return;
    }
    const partial = parts[parts.length - 1];
    const matches = fsCompletions(this.shell, partial);
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      this.inputEl.value = parts.join(' ');
    } else if (matches.length > 1) {
      this.printLine('  ' + matches.join('  '), 'dim');
    }
  }
}
