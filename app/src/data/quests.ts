import { registerQuest } from '../core/quests';

export function registerAllQuests() {
  registerQuest({
    id: 'q1_boot', name: 'Ghost in the Machine', act: 1, main: true,
    desc: 'Read /home/player/who_was_bit.txt.',
    reward: { mail: {
      from: 'V@n0de.net', subj: 'Re: the file you found',
      body: 'I see you found the file.\n\nGood.\n\nMy name doesn\'t matter. I go by V. I was close to AXIOM before he died — or didn\'t die. Nobody\'s sure anymore.\n\nWhat I know: AXIOM was building something called VESSEL. KRONOS Systems found out and wanted it. AXIOM disappeared three days before his presentation.\n\nStart with the Sandbox — ssh 192.168.1.10. There\'s a password in there you\'ll need later. The Shadow Market is nearby too, once you can reach it — gear up before you go further.\n\n— V',
    } },
    complete: (shell) => !!shell.state.questFlags.act1_start,
  });

  registerQuest({
    id: 'q1_sandbox', name: 'Into the Sandbox', act: 1, main: true,
    desc: 'Gain root on the Sandbox (192.168.1.10).',
    reward: { credits: 100 },
    complete: (shell) => shell.state.rootedHosts.has('192.168.1.10'),
  });

  registerQuest({
    id: 'q1_market', name: 'Supply Run', act: 1, main: false,
    desc: 'Find the Shadow Market and see what it sells.',
    reward: { credits: 50 },
    complete: (shell) => shell.state.discovered.has('172.20.0.1'),
  });

  registerQuest({
    id: 'q2_kronos', name: 'Rattling KRONOS', act: 2, main: true, after: 'q1_market',
    desc: 'Gain root on the KRONOS Gateway (10.0.0.5) and decrypt the VESSEL project doc.',
    reward: {
      credits: 200,
      revealHost: '10.77.0.1',
      mail: {
        from: 'axiom@void.net', subj: 'I know you\'re looking',
        body: 'I see you found my trail through KRONOS.\n\nGood. That means you\'re close.\n\nFind me: 10.77.0.1\n\nBring a password. You\'ll know it when you see it.\n\n— AX',
      },
    },
    complete: (shell) => shell.state.rootedHosts.has('10.0.0.5') && !!shell.state.questFlags.kronos_vessel_doc,
  });

  registerQuest({
    id: 'q2_shard1', name: 'Fragment One', act: 2, main: false, after: 'q2_kronos',
    desc: 'Collect a VESSEL shard from KRONOS\'s archive.',
    reward: { credits: 75 },
    complete: (shell) => shell.state.vesselShards.includes('shard1'),
  });

  registerQuest({
    id: 'q3_axiom', name: 'Ghost Protocol', act: 3, main: true, after: 'q2_kronos',
    desc: 'Find AXIOM\'s hidden node (10.77.0.1) and decrypt identity.enc.',
    reward: { credits: 300 },
    complete: (shell) => !!shell.state.questFlags.axiom_identity,
  });
}
