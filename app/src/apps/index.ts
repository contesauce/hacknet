import { registerApp } from '../core/apps';
import { mailApp } from './mail';
import { notesApp } from './notes';
import { missionsApp } from './missions';
import { factionsApp } from './factions';
import { settingsApp } from './settings';

export function registerAllApps() {
  registerApp(mailApp);
  registerApp(notesApp);
  registerApp(missionsApp);
  registerApp(factionsApp);
  registerApp(settingsApp);
}
