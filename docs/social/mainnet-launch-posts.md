# X posts: Vestra on BOT Chain Mainnet

Every post fits an unverified account's 280-character limit (counted the way X counts: links count 23, some symbols count 2). Claims are limited to what is deployed, tested and verified.

## Mainnet announcement (PR)

Attach `web/public/brand/social/vestra-x-launch.png`.

**273/280**

```
Officially launched on BOT Chain Mainnet.

Vestra gives real-world equipment a verifiable passport: registration, service records, status and custodian handovers in one append-only registry.

App: https://vestra-ashy.vercel.app
Contract: 0x560Ec94e3c74F41F05352e535a75E2d16dFB7CdE
```

## Technical thread (5 posts)

Attach `web/public/brand/social/vestra-x-technical.png` to post 1/5. Post 2/5 to 5/5 as replies to the previous post.

**1. 206/280**

```
How Vestra works on BOT Chain Mainnet, a technical thread.

One contract, VestraRegistry, holds every asset, record, status and handover in contract storage. Source-verified on the BOT Chain explorer. (1/5)
```

**2. 259/280**

```
Roles are enforced on-chain with OpenZeppelin AccessControlDefaultAdminRules.

Registrars register assets. Service providers add inspections and maintenance. Stewards log incidents and status. The admin can grant or revoke roles but never edit a record. (2/5)
```

**3. 262/280**

```
Records are append-only. Nothing is edited or deleted: a correction supersedes the original and both stay visible.

Status follows an on-chain state machine (Registered, Active, Under maintenance, Reported damaged, Reported lost), with Retired as terminal. (3/5)
```

**4. 274/280**

```
Custodian handover takes two parties. The steward proposes a recipient with an expiry of up to 30 days; only that wallet can accept, before it expires.

Acceptance updates the steward and writes a Handover record in one transaction. Stale or replayed proposals revert. (4/5)
```

**5. 262/280**

```
The public mainnet RPC disables eth_getLogs, so every piece of state is readable through paginated view functions, not events.

Scan an asset's QR tag and its history is read straight from BOT Chain. No wallet needed.

MIT licensed: https://github.com/Dotman-Bei/Vestra (5/5)
```

## Standalone posts

Attach `web/public/brand/social/vestra-x-technical.png`, or post text-only to vary the feed.

**1. 257/280**

```
Private serial numbers never leave the registrar's browser.

Vestra stores only keccak256(salt, serial) on BOT Chain, so a serial can be proven later without ever being published. Evidence files are hashed client-side (SHA-256); only the hash goes on-chain.
```

**2. 274/280**

```
What a Vestra record proves: which wallet submitted what, when, and that the history wasn't altered.

What it doesn't prove: legal ownership, physical condition, or that a repair actually happened.

The app labels every field as on-chain, participant claim, or unverifiable.
```

**3. 240/280**

```
Every asset registered on Vestra gets a printable QR tag.

Scan it and the verify page reads the asset's current status, steward and latest records directly from BOT Chain Mainnet. No account, no wallet, no install.

https://vestra-ashy.vercel.app
```

**4. 272/280**

```
Before mainnet, VestraRegistry passed 33 unit tests and 4 invariant suites that fire random sequences of registrations, records and handovers. 100% line coverage.

We also broke key checks on purpose to confirm the tests catch it. Not yet audited.

https://github.com/Dotman-Bei/Vestra
```

**5. 258/280**

```
Vestra's first cohort: commercial solar and backup-power equipment. Inverters, battery storage, charge controllers, generators.

If you install, service or operate this equipment and want to pilot a verifiable service history on BOT Chain Mainnet, reach out.
```

