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
      revealHosts: ['10.77.0.1'],
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

  registerQuest({
    id: 'q4_shard3', name: 'Fragment Three', act: 3, main: false, after: 'q2_shard1',
    desc: 'Bastion Fortress has been holding a shard for AXIOM.',
    reward: { credits: 75 },
    complete: (shell) => shell.state.vesselShards.includes('shard3'),
  });

  registerQuest({
    id: 'q4_shard4', name: 'Fragment Four', act: 3, main: false, after: 'q2_shard1',
    desc: 'Wraith Den has been holding a shard for AXIOM.',
    reward: { credits: 75 },
    complete: (shell) => shell.state.vesselShards.includes('shard4'),
  });

  registerQuest({
    id: 'q4_shadow_reveal', name: 'Watchers in the Dark', act: 4, main: true, after: 'q3_axiom',
    desc: 'You\'ve dug deep enough that PHANTOM CIRCUIT and ARCHON DIVISION have both noticed you.',
    reward: {
      revealHosts: ['10.33.0.1', '10.55.0.1'],
      mail: {
        from: 'unknown@relay.net', subj: 'you are being watched',
        body: 'Two groups know your name now. One calls itself PHANTOM CIRCUIT. One calls itself ARCHON DIVISION.\n\nBoth of them want what you\'re carrying. Both of them will tell you the other is the enemy.\n\nFind them: 10.33.0.1 and 10.55.0.1. Decrypt what they leave you. Then decide — or don\'t. `align phantom`, `align archon`, or `align neither`.\n\nYou\'ll need a shard from both of them regardless of who you side with.',
      },
    },
    complete: (shell) => shell.state.vesselShards.length >= 2,
  });

  registerQuest({
    id: 'q4_shard5', name: 'Fragment Five', act: 4, main: false, after: 'q4_shadow_reveal',
    desc: 'PHANTOM CIRCUIT is holding a shard. Root their node to get it.',
    reward: { credits: 100 },
    complete: (shell) => shell.state.vesselShards.includes('shard5'),
  });

  registerQuest({
    id: 'q4_shard6', name: 'Fragment Six', act: 4, main: false, after: 'q4_shadow_reveal',
    desc: 'ARCHON DIVISION is holding a shard. Root their node to get it.',
    reward: { credits: 100 },
    complete: (shell) => shell.state.vesselShards.includes('shard6'),
  });

  registerQuest({
    id: 'q4_align', name: 'The Alignment', act: 4, main: true, after: 'q4_shadow_reveal',
    desc: 'Choose your allegiance — align phantom, align archon, or align neither.',
    reward: { credits: 150 },
    complete: (shell) => shell.state.shadowChoice !== null,
  });

  registerQuest({
    id: 'q5_gather', name: 'The Final Fragments', act: 4, main: true, after: 'q4_align',
    desc: 'Collect all 6 other shards. AXIOM is watching to see if you can.',
    reward: {
      revealHosts: ['10.00.0.1'],
      mail: {
        from: 'axiom@void.net', subj: 'one left',
        body: 'You have six. I have the seventh.\n\nCome find me: 10.00.0.1\n\nI\'m not hiding from you anymore.\n\n— AX',
      },
    },
    complete: (shell) => shell.state.vesselShards.length >= 6,
  });

  registerQuest({
    id: 'q5_final', name: 'End of the Line', act: 4, main: true, after: 'q5_gather',
    desc: 'Find AXIOM at 10.00.0.1, collect the last shard, and run: vessel <action>.',
    reward: { credits: 1000 },
    complete: (shell) => !!shell.state.questFlags.vessel_assembled,
  });
}
