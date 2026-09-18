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
  connections: ['192.168.1.10'],
  faction: 'kronos',
  notes: 'KRONOS Systems — Infrastructure Solutions. Authorized access only.',
  fs: dir('/', {
    home: dir('home', {
      admin: dir('admin', {
        'vessel_project.enc': file('vessel_project.enc',
          'PROJECT VESSEL — STATUS REPORT\nFragment assembly: 4/7 shards recovered.',
          { locked: true, encrypted: true, password: 'AxI0M_7734' }),
      }),
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
  connections: ['192.168.1.10'],
  notes: 'Open market — no login required. Type `shop` to browse.',
  fs: dir('/', {
    home: dir('home', {
      'catalog.txt': file('catalog.txt', 'Open market. All runners welcome.\nType: shop'),
    }),
  }),
  ports: [],
};

export const ALL_HOSTS: HostNode[] = [LOCALHOST, SANDBOX, KRONOS, MARKET];
