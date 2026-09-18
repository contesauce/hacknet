# ASYNC_OS — Cloudflare rewrite

This is the ground-up rewrite of the game, replacing the single `index.html`
file at the repo root. Vite + TypeScript, built to deploy on Cloudflare
Pages. The old file stays at the repo root for reference until this
replaces it feature-for-feature.

## Why a rewrite

The original was one 2700-line HTML file with everything (markup, CSS, game
logic) inlined, produced by iterating with Google AI Studio. It worked but
had accumulated dead code and at least one game-breaking softlock (fixed
separately). Growing it further — real auth, persistent saves, a bigger
world, actually good UI — needed real module boundaries, which a single
`<script>` tag can't give you.

## Structure

```
src/
  core/
    fs.ts        virtual filesystem — real cd/ls/cat/pwd semantics, not flat paths
    network.ts   host/node model: ports, firewall layers, connections
    state.ts     player/session state, local save (swap for a Worker API later)
  data/
    world.ts     the actual hosts/lore — small on purpose, expand freely
  terminal/
    parser.ts    tokenizes a command line (quotes, flags)
    shell.ts     executes a parsed command against game state
    terminal-ui.ts   DOM rendering, history, tab completion
    commands/    one file per command family (fs, net, exploit, sys)
  main.ts        wires it together, renders the HUD + host list
```

## Command design

Commands are named after real Linux/security tools, not invented verbs —
the goal is that anyone who's touched a terminal recognizes them immediately,
without a tutorial:

| command | does |
|---|---|
| `pwd`, `cd`, `ls`, `cat`, `rm` | behave exactly like the real thing |
| `whoami`, `hostname`, `ifconfig` | flavor / identity |
| `nmap` | scan for adjacent hosts, or port-scan a specific host |
| `ssh <host>` | connect to a discovered host |
| `hydra <host> <port\|service>` | brute-force a port open (takes time, raises trace) |
| `decrypt <file> <password>` | decrypt an `.enc` file |
| `scp <file>` | pull a remote file back to your own machine |
| `exit` | disconnect back through the hop chain |
| `top` | RAM + trace meter |
| `help`, `man <cmd>`, `history`, `clear` | the usual |

Root on a host is earned automatically once enough ports are cracked
(`nmap <host>` tells you how many), mirroring how Hacknet's PortHack works —
no separate "porthack" verb needed once the ports are open.

## Running locally

```
npm install
npm run dev
```

## What's next (needs decisions/credentials only you can provide)

1. **Cloudflare Pages** — connect this repo, root directory `app`, build
   command `npm run build`, output directory `dist`. That's it for static
   hosting; no code changes needed on our end.
2. **Google auth** — needs a Google Cloud OAuth client (client ID + secret)
   from your Google Cloud Console, plus a Cloudflare Worker (Pages
   Functions) to handle the OAuth callback and issue a session cookie. I
   can write that Worker, but I can't create the OAuth client myself.
3. **Persistent saves** — once auth exists, swap `saveLocal`/`loadLocal` in
   `core/state.ts` for calls to a Worker API backed by D1 (or KV if the
   save shape stays simple key-value). Needs a Cloudflare D1 database
   created in your account.
4. **World content** — only 3 hosts are ported over so far, to prove the
   engine. The rest of the original story (KRONOS, AXIOM, VESSEL, the
   factions) can be ported into `data/world.ts` once the shell/UI feel is
   locked in.
