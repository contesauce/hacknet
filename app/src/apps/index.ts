import { registerApp } from '../core/apps';
import { mailApp } from './mail';
import { notesApp } from './notes';

export function registerAllApps() {
  registerApp(mailApp);
  registerApp(notesApp);
}
