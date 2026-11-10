# Design roadmap — factions, contracts, gear, realism modes

Living notes on where the game is headed past the core engine (fs, network,
process/RAM scarcity, quests, one auth-gated save). Inspirations: Hacknet,
Bitburner, NITE Team 4, Arclight City, Battle Night: Cyberpunk RPG. Not
exhaustive — expect this to keep growing.

## Command realism

Two command surfaces over the same engine, picked per save, not two games:

- **Standard** (current): short, close-to-real commands (`nmap`, `hydra`,
  `decrypt`) — Hacknet's approach. In-fiction docs (`man`, READMEs pulled off
  servers/forums) teach syntax instead of a tutorial.
- **Realism/Training mode** (planned): same engine, real tool names and flag
  syntax (`nmap -sV`, `hydra -l user -P wordlist.txt`, Metasploit-style
  `use`/`set`/`exploit`). Useful as cert-prep flavor (OSCP-adjacent) without
  forking the game logic — only the command *surface* changes.

## Factions — trade-offs and rivalry shipped

Wraith Collective and Bastion Order are now genuine opposites, not
palette-swapped upside (`core/factions.ts`'s `FactionDef.mods`, applied on
join via `applyFactionMods`, reversed on defection):

- **Wraith** (speed/shadows): -25% hydra crack time, half the trace gained
  while cracking — but -3G RAM ceiling. Fast and lean, not sturdy.
- **Bastion** (fortress/patience): 2.5x faster trace decay once connected
  — but +30% hydra crack time and +15% CPU cost on everything. Hardened,
  but every cycle not spent defending is a cycle you don't have.
- **Broker** stays the neutral, no-stat-edge, universal-discount option.

Wraith and Bastion are mutual rivals (`FactionDef.rival`). Their territory
is actively dangerous to the other's members and to anyone who's
permanently burned that bridge (`state.hostileFactions`, see the defection
arc below) — trace *grows* while connected to hostile-tagged territory
instead of decaying (`main.ts`'s passive-trace interval,
`isHostileTerritory()`), and their store locks you out even if you're
nominally still a "member" (the caught-defection edge case).

Still planned: a **federal/intelligence** faction (recruit-or-turn framing)
and an **anarchist/anti-surveillance** faction ("reset the tech, not
civilization"), plus **rogue/freelance** (no faction) as a real third path
with worse prices everywhere but nobody hunting you either.

### The defection arc — shipped

A one-shot, mostly-permanent choice once you're deep enough into a rivalrous
faction (`q_defection_offer`: rep 50+ with a faction that has a rival — mail
arrives, `handler accept|report`):

- **`accept`** (defect): betray your current faction for the rival. Same
  two mission beats either way — exfiltrate your own faction's
  `ops_ledger.dat` via `scp`, then `inject <host>` a payload — but on
  `accept` the payload lands on your *own* (soon former) faction's node.
  Clean result: you join the rival (mods swap — old reversed, new applied),
  your old faction goes permanently hostile, +400cr.
- **`report`** (double agent): stay loyal, play along, and the payload
  targets the *rival* instead. Clean result: rep jumps hard with your own
  faction, the rival goes permanently hostile, a small permanent
  `crackSpeedMult` bonus (insider tradecraft), +400cr.
- **Caught**: `inject` carries a much bigger trace spike than `hydra` (60
  vs. 18 per the same formula, still faction-trace-gain-modified) — go in
  with a hot meter and you blow past 100 mid-deploy. Both factions end up
  hostile, no reward, no faction swap. This is the real cost of greed —
  verified in testing by just... playing it too fast and getting caught for
  real, no scripting required.

## Contracts (freelance jobs) — shipped, v1

`core/contracts.ts` + `data/contracts.ts` + `apps/contracts.ts` +
`terminal/commands/contract-commands.ts`. Independent of the main VESSEL
storyline — short jobs with a client, briefing, risk tier, and reward
(credits, optionally faction rep), gated by discovery/faction membership,
auto-completing via a predicate (mirrors how quests work). `contracts` opens
the job-board app (like `mail`/`notes`); `contracts accept <id>` works
headlessly from the terminal too.

Next for this system: deadlines/expiry, failure states (not just silent
availability), and contracts tied to the planned federal/anarchist
factions once those exist.

## Gear / equipment rarity (planned, biggest lift)

Inspired by Arclight City and Battle Night: Cyberpunk RPG — both use
loot-and-craft equipment with rarity tiers (common → legendary) and stat
rolls, rather than flat store purchases. For us:

- Tools (`hydra`, etc.) get rarity variants with rolled stats (crack speed
  vs. RAM cost tradeoffs) instead of one fixed version each.
- Dropped from contracts/story nodes as loot, not just bought.
- Crafting/upgrading via components — generalizes the VESSEL shard-collection
  pattern we already have (`core/vessel.ts`) rather than inventing a new one.
- Touches the store model (`core/store.ts`) and needs an inventory concept
  that doesn't exist yet — sequence this after contracts and faction
  downsides are in.

## NITE Team 4-style mission structure (planned)

Briefing → recon → execution → debrief, instead of "here's a quest." Our
`nmap`/`probe` commands are already the recon step; the gap is a
dossier/intel layer (read intel — a file, a mail, an IRC tip — before a
contract/mission becomes acceptable) so recon has payoff beyond flavor text.

## Stretch / post-campaign

Procedural post-story contracts, open-world PvE (PvP is a much bigger lift —
servers, leaderboards — and not scoped yet).

## Persistent saves — shipped

Tied to Google login via a Cloudflare D1 database (`hacknet-saves`). On boot,
signed-in players load from `GET /api/save`; everyone else (and anyone the
fetch fails for) falls back to `localStorage`. Gameplay debounce-syncs back
to `PUT /api/save` ~2s after each command via a new `shell.onPersist` hook,
so it doesn't hammer the Worker mid-session. One row per Google account
(`sub`), full `GameState` stored as JSON in `worker/migrations/0001_create_saves.sql`.
A guest who signs in later keeps playing on their local save until they next
save — there's no merge/import step yet if they already had a different
remote save under that account.
