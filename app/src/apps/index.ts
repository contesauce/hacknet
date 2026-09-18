import { registerApp } from '../core/apps';
import { mailApp } from './mail';
import { notesApp } from './notes';
import { missionsApp } from './missions';

export function registerAllApps() {
  registerApp(mailApp);
  registerApp(notesApp);
  registerApp(missionsApp);
}
