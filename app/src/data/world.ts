import { dir, file } from '../core/fs';
import type { HostNode } from '../core/network';
import { makePort } from '../core/network';

// A slice of the original ASYNC_OS lore, rebuilt on the new engine.
// This is intentionally small — enough to prove the engine end to end.
// Expand freely once the terminal feel is locked in.

export const LOCALHOST: HostNode = {
  id: 'localhost',
  hostname: 'localhost',
  x: 0.1, y: 0.45,
  kind: 'server',
  admin: true,
  firewall: 0,
  traceSpeed: 0,
  connections: ['192.168.1.10'],
  fs: dir('/', {
    home: dir('home', {
      player: dir('player', {
        'readme.txt': file('readme.txt',
          'ASYNC_OS — welcome back, runner.\n' +
          'Type `help` for commands. Type `nmap` to see who is reachable from here.\n' +
          'Everything here behaves like a real shell: cd, ls, cat, pwd all work as you\'d expect.'),
        'who_was_bit.txt': file('who_was_bit.txt',
          'They said he died in a car crash.\nHe didn\'t.\nFind VESSEL.\n\n—V',
          { onRead: 'act1_start' }),
        loot: dir('loot', {}),
      }),
    }),
    var: dir('var', { log: dir('log', {
      'sys.log': file('sys.log', '[boot] clean start\n[info] cooling nominal', { tag: 'LOG' }),
    })}),
  }),
  ports: [],
};

export const SANDBOX: HostNode = {
  id: '192.168.1.10',
  hostname: 'sandbox.local',
  x: 0.32, y: 0.2,
  kind: 'server',
  firewall: 1,
  traceSpeed: 60,
  connections: ['localhost', '10.0.0.5', '172.20.0.1'],
  notes: 'Test box. Low security. Good place to learn the ropes.',
  fs: dir('/', {
    home: dir('home', {
      'notes.txt': file('notes.txt', 'Test box. Safe.\nVault password: AxI0M_7734'),
      'access.key': file('access.key', '-----BEGIN RSA KEY-----\nAAAB3Nz...truncated', { locked: true }),
    }),
    var: dir('var', { log: dir('log', {
      'auth.log': file('auth.log', '[warn] multiple failed logins from unknown host', { tag: 'LOG' }),
    })}),
  }),
  ports: [makePort('ssh'), makePort('ftp')],
};

export const KRONOS: HostNode = {
  id: '10.0.0.5',
  hostname: 'gateway.kronos.sys',
  x: 0.6, y: 0.15,
  kind: 'corp',
  firewall: 3,
  traceSpeed: 35,
  connections: ['192.168.1.10', '10.11.0.99', '10.44.0.1'],
  faction: 'kronos',
  notes: 'KRONOS Systems — Infrastructure Solutions. Authorized access only.',
  fs: dir('/', {
    home: dir('home', {
      admin: dir('admin', {
        'vessel_project.enc': file('vessel_project.enc',
          'PROJECT VESSEL — STATUS REPORT\nFragment assembly: 4/7 shards recovered.\nRemaining shards distributed across dark-net relay nodes.\nWarning: AXIOM\'s failsafe detected — unauthorized assembly triggers self-destruct.',
          { locked: true, encrypted: true, password: 'AxI0M_7734', onRead: 'kronos_vessel_doc' }),
      }),
    }),
    archive: dir('archive', {
      'shard_1.dat': file('shard_1.dat',
        '[VESSEL SHARD #1 — FRAGMENT DATA]\n01001010 10110101 00110011...\nKRONOS has been holding this.',
        { locked: true, vesselShard: 'shard1' }),
    }),
    etc: dir('etc', {
      shadow: file('shadow', 'root:$6$AXVM...:18923:0:99999:7:::', { locked: true }),
    }),
    var: dir('var', { log: dir('log', {
      'access.log': file('access.log', '[auth] admin session from unlisted host', { tag: 'LOG' }),
    })}),
  }),
  ports: [makePort('ssh'), makePort('ftp'), makePort('http'), makePort('smtp')],
};

export const MARKET: HostNode = {
  id: '172.20.0.1',
  hostname: 'market.shadow.net',
  x: 0.45, y: 0.65,
  kind: 'server',
  firewall: 0,
  traceSpeed: 90,
  store: 'market',
  connections: ['192.168.1.10', '10.99.0.1'],
  notes: 'Open market — no login required. Type `shop` to browse.',
  fs: dir('/', {
    home: dir('home', {
      'catalog.txt': file('catalog.txt', 'Open market. All runners welcome.\nType: shop'),
    }),
  }),
  ports: [],
};

export const AXIOM_NODE: HostNode = {
  id: '10.77.0.1',
  hostname: 'unknown.encrypted',
  x: 0.5, y: 0.42,
  kind: 'server',
  firewall: 4,
  traceSpeed: 25,
  hidden: true, // not revealed by nmap — only via the q2_kronos quest reward
  connections: ['10.0.0.5'],
  fs: dir('/', {
    home: dir('home', {
      'identity.enc': file('identity.enc',
        'This node belongs to AXIOM.\nHe is alive. He has been watching.\nHe seeded the remaining VESSEL shards across the net — some with allies, some with enemies.\n\nIf you\'ve come this far, you are who he thought you were.',
        { locked: true, encrypted: true, password: 'GH0ST_PR0T0C0L', onRead: 'axiom_identity' }),
    }),
    data: dir('data', {
      'shard_2.dat': file('shard_2.dat',
        '[VESSEL SHARD #2 — FRAGMENT DATA]\n11010010 00101101 10011100...',
        { vesselShard: 'shard2' }),
    }),
  }),
  ports: [makePort('ssh'), makePort('ftp'), makePort('http'), makePort('smtp'), makePort('sql')],
};

export const WRAITH_DEN: HostNode = {
  id: '10.11.0.99',
  hostname: 'den.wraith.net',
  x: 0.82, y: 0.3,
  kind: 'server',
  firewall: 2,
  traceSpeed: 45,
  faction: 'wraith',
  connections: ['10.0.0.5'],
  fs: dir('/', {
    home: dir('home', {
      'welcome.txt': file('welcome.txt',
        'You found us. Not many do.\n\nType: join wraith — if you\'re serious. We don\'t take passengers.\n\n— WRAITH COLLECTIVE'),
      'shard_4.dat': file('shard_4.dat',
        '[VESSEL SHARD #4 — FRAGMENT DATA]\n00111011 11000101 01011010...\nWraith has been sitting on this for AXIOM.',
        { locked: true, vesselShard: 'shard4' }),
    }),
  }),
  ports: [makePort('ssh'), makePort('sql')],
};

export const BASTION_FORTRESS: HostNode = {
  id: '10.44.0.1',
  hostname: 'fortress.bastion.net',
  x: 0.88, y: 0.2,
  kind: 'server',
  firewall: 3,
  traceSpeed: 80,
  faction: 'bastion',
  connections: ['10.0.0.5'],
  fs: dir('/', {
    home: dir('home', {
      'welcome.txt': file('welcome.txt',
        'BASTION ORDER.\nDefend. Endure. Prevail.\n\nYou found us through patience, not speed. That\'s our kind of runner.\n\nType: join bastion'),
      'shard_3.dat': file('shard_3.dat',
        '[VESSEL SHARD #3 — FRAGMENT DATA]\n10100110 01011001 11100010...\nBastion has been guarding this. For AXIOM.',
        { locked: true, vesselShard: 'shard3' }),
    }),
  }),
  ports: [makePort('ssh'), makePort('sql')],
};

export const BROKER_EXCHANGE: HostNode = {
  id: '10.99.0.1',
  hostname: 'exchange.broker.net',
  x: 0.7, y: 0.78,
  kind: 'corp',
  firewall: 2,
  traceSpeed: 55,
  faction: 'broker',
  connections: ['172.20.0.1'],
  fs: dir('/', {
    home: dir('home', {
      'welcome.txt': file('welcome.txt',
        'You found us without being invited.\nThat\'s either impressive or a red flag.\n\nType: join broker\n\nWe\'ll be watching either way.\n\n— THE SYNDICATE'),
    }),
  }),
  ports: [makePort('ssh'), makePort('http'), makePort('smtp')],
};

// PHANTOM CIRCUIT and ARCHON DIVISION — the two shadow groups. Hidden from
// nmap entirely; revealed together once you've dug up enough of the VESSEL
// story (see q4_shadow_reveal in data/quests.ts). Pick a side with `align`,
// or neither — but you'll need a shard from both regardless.
export const PHANTOM_CIRCUIT: HostNode = {
  id: '10.33.0.1',
  hostname: 'circuit.phantom.net',
  x: 0.2, y: 0.35,
  kind: 'server',
  firewall: 5,
  traceSpeed: 20,
  hidden: true,
  connections: ['10.77.0.1'],
  fs: dir('/', {
    home: dir('home', {
      'welcome.enc': file('welcome.enc',
        'Runner.\nWe\'ve been watching since your name started showing up near AXIOM\'s trail.\n\nPHANTOM CIRCUIT answers to no law and no government. We are the thing they\'re afraid of.\nARCHON will tell you we\'re terrorists. Ask them about their detention facilities sometime.\n\nThe choice is yours. Type: align phantom — or don\'t.\n\n— PHANTOM',
        { locked: true, encrypted: true, password: 'WE_FOUND_YOU', onRead: 'phantom_invite' }),
    }),
    data: dir('data', {
      'shard_5.dat': file('shard_5.dat',
        '[VESSEL SHARD #5 — FRAGMENT DATA]\n01110100 10001011 00110101...',
        { locked: true, vesselShard: 'shard5' }),
    }),
  }),
  ports: [makePort('ssh'), makePort('ftp'), makePort('http'), makePort('smtp'), makePort('sql')],
};

export const ARCHON_DIVISION: HostNode = {
  id: '10.55.0.1',
  hostname: 'division.archon.gov',
  x: 0.8, y: 0.65,
  kind: 'corp',
  firewall: 5,
  traceSpeed: 22,
  hidden: true,
  connections: ['10.77.0.1'],
  fs: dir('/', {
    home: dir('home', {
      'recruitment.enc': file('recruitment.enc',
        'CANDIDATE IDENTIFIED — CLEARANCE PENDING\n\nWe are not the enemy. We are the people who stop enemies.\nPHANTOM CIRCUIT\'s last operation took down a water treatment grid. People died.\n\nWe offer protection, resources, and a paycheck. We do not have detention facilities — that\'s PHANTOM propaganda.\n\nType: align archon — if you want to do this the right way.\n\n— ARCHON DIVISION, Handler K',
        { locked: true, encrypted: true, password: 'CLEARANCE_GAMMA', onRead: 'archon_invite' }),
    }),
    data: dir('data', {
      'shard_6.dat': file('shard_6.dat',
        '[VESSEL SHARD #6 — FRAGMENT DATA]\n11001000 01110011 10100110...',
        { locked: true, vesselShard: 'shard6' }),
    }),
  }),
  ports: [makePort('ssh'), makePort('ftp'), makePort('http'), makePort('smtp'), makePort('sql')],
};

// AXIOM's final node. Hidden until all 6 other shards are in hand — see
// q5_gather in data/quests.ts. Holds the 7th shard and the `vessel` command's
// endgame: assemble, and choose what happens to it.
export const AXIOM_FINAL: HostNode = {
  id: '10.00.0.1',
  hostname: 'axiom.final',
  x: 0.5, y: 0.25,
  kind: 'server',
  firewall: 0, // AXIOM isn't hiding from you anymore, not at this point
  traceSpeed: 999,
  hidden: true,
  connections: ['10.77.0.1'],
  fs: dir('/', {
    home: dir('home', {
      'axiom.txt': file('axiom.txt',
        'You made it. All 7 shards.\n\nVESSEL is not a weapon. It\'s an AI that maps and patches zero-days — autonomously, permanently, for everyone. Free. Open. Unkillable.\n\nKRONOS wants to sell it. Whoever you sided with wants to point it at someone.\n\nThe choice is yours now.\n\nType: vessel [release|destroy|give phantom|give archon]\n\n— AXIOM',
        { onRead: 'act4_final' }),
    }),
    data: dir('data', {
      'shard_7.dat': file('shard_7.dat',
        '[VESSEL SHARD #7 — FINAL FRAGMENT]\nAXIOM\'s own piece. He kept it closest.',
        { vesselShard: 'shard7' }),
    }),
  }),
  ports: [],
};

export const ALL_HOSTS: HostNode[] = [
  LOCALHOST, SANDBOX, KRONOS, MARKET, AXIOM_NODE,
  WRAITH_DEN, BASTION_FORTRESS, BROKER_EXCHANGE,
  PHANTOM_CIRCUIT, ARCHON_DIVISION, AXIOM_FINAL,
];
