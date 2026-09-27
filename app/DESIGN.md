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

## Factions

Currently: Wraith Collective (speed/stealth), Bastion Order
(fortress/patience), Broker Syndicate (intel/profit, store discount) —
upside-only, no real cost to joining.

Planned additions and changes:

- **Federal/intelligence** faction(s) — recruit-or-turn framing; legit
  contracts, better gear, but they can compel missions and going rogue later
  burns the bridge hard.
- **Anarchist/anti-surveillance** faction — "reset the tech, not
  civilization" ideology; disruption/take-down missions, better
  anonymity/trace-evasion gear, but heat from every government-aligned actor
  rises faster.
- **Rogue/freelance** (no faction) as a real third path — worse prices
  everywhere, nobody's hunting you either.
- Every faction should have a genuine **downside**, not just a perk: locked
  out of rival stores, a standing rival that raises trace/heat on their turf,
  a rival showing up as a hostile actor in `nmap` results. Distinct *mission
  types* per faction, not palette-swapped quests.

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

## Persistent saves

Tied to Google login via a Cloudflare D1 database — in progress, blocked on
the `database_id` from `wrangler d1 create`. Once wired, `core/state.ts`'s
`saveLocal`/`loadLocal` swap to Worker API calls when signed in, falling back
to `localStorage` when not.
