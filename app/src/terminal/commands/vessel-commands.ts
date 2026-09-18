import type { Command } from '../shell';

export const align: Command = {
  name: 'align', usage: 'align <phantom|archon|neither>', help: 'choose your VESSEL-endgame allegiance (one time, permanent)',
  run(shell, p) {
    const choice = p.args[0]?.toLowerCase();
    if (choice !== 'phantom' && choice !== 'archon' && choice !== 'neither') {
      shell.print('usage: align <phantom|archon|neither>', 'warn');
      return;
    }
    if (shell.state.shadowChoice) { shell.print(`you already chose: ${shell.state.shadowChoice}`, 'err'); return; }
    shell.state.shadowChoice = choice;
    if (choice === 'phantom') shell.print('[PHANTOM] Alignment confirmed. There\'s no clean way out of this now.', 'err');
    else if (choice === 'archon') shell.print('[ARCHON] Alignment confirmed. Welcome to the program.', 'ok');
    else shell.print('[NEITHER] You chose no one. Both sides will remember that.', 'warn');
  },
};

export const vessel: Command = {
  name: 'vessel', usage: 'vessel <release|destroy|give phantom|give archon>', help: 'assemble and dispose of VESSEL (requires all 7 shards, at AXIOM\'s final node)',
  run(shell, p) {
    const action = p.args.join(' ');
    if (shell.state.vesselShards.length < 7) { shell.print(`vessel: need all 7 shards, have ${shell.state.vesselShards.length}`, 'err'); return; }
    if (shell.state.host !== '10.00.0.1') { shell.print('vessel: must be connected to AXIOM\'s final node', 'err'); return; }
    if (shell.state.questFlags.vessel_assembled) { shell.print('vessel: already resolved. Nothing left to do here.', 'dim'); return; }

    switch (action) {
      case 'release':
        shell.print('VESSEL compiles and deploys across every reachable network.', 'ok');
        shell.print('KRONOS, PHANTOM, and ARCHON all lose their leverage in the same instant.', 'ok');
        shell.print('Nobody owns it. Nobody can stop it. A few grids flicker during the cascade.', 'warn');
        shell.print('ENDING: THE OPEN NET — VESSEL released. Free forever.', 'ok');
        break;
      case 'destroy':
        shell.print('All 7 shards corrupted. VESSEL data purged.', 'warn');
        shell.print('KRONOS loses years of investment. PHANTOM and ARCHON lose their asset at the same time.', 'warn');
        shell.print('The net is no safer. But the weapon doesn\'t exist anymore.', 'warn');
        shell.print('ENDING: THE SCORCHED EARTH — VESSEL destroyed. Nobody wins.', 'warn');
        break;
      case 'give phantom':
        shell.print('VESSEL uploads to PHANTOM CIRCUIT\'s network.', 'err');
        shell.print('72 hours later, infrastructure starts going dark in three cities.', 'err');
        shell.print('ENDING: THE CHAOS RUN — VESSEL weaponized. You gave it to them.', 'err');
        break;
      case 'give archon':
        shell.print('VESSEL uploads to ARCHON\'s classified mainframe.', 'ok');
        shell.print('KRONOS is destroyed. PHANTOM is neutralized. Public zero-days go unpatched —', 'warn');
        shell.print('ARCHON only patches what they choose to.', 'warn');
        shell.print('ENDING: THE CONTROLLED BURN — VESSEL contained. At a cost.', 'ok');
        break;
      default:
        shell.print('usage: vessel <release|destroy|give phantom|give archon>', 'warn');
        return;
    }
    shell.state.questFlags.vessel_assembled = true;
  },
};
