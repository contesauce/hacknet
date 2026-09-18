import { registerApp } from '../core/apps';
import { mailApp } from './mail';
import { notesApp } from './notes';
import { missionsApp } from './missions';
import { factionsApp } from './factions';

export function registerAllApps() {
  registerApp(mailApp);
  registerApp(notesApp);
  registerApp(missionsApp);
  registerApp(factionsApp);
}
