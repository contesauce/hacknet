import { Shell } from '../shell';
import { pwd, cd, ls, cat, rm } from './fs-commands';
import { whoami, hostnameCmd, ifconfig, nmap, ssh, exitCmd } from './net-commands';
import { hydra, decrypt, scp } from './exploit-commands';
import { clear, history, top, help, man } from './sys-commands';

export function registerAllCommands(shell: Shell) {
  [
    pwd, cd, ls, cat, rm,
    whoami, hostnameCmd, ifconfig, nmap, ssh, exitCmd,
    hydra, decrypt, scp,
    clear, history, top, help, man,
  ].forEach(c => shell.register(c));
}
