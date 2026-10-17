# Vestra

**A verifiable digital passport and lifecycle record for real-world equipment, built on BOT Chain.**

**Live app:** [vestra-ashy.vercel.app](https://vestra-ashy.vercel.app) (BOT Mainnet)

Vestra gives each piece of equipment a passport: who registered it, every inspection, repair and incident, and every change of the wallet responsible for it, in one append-only record anyone can check by scanning a QR tag.

> **Status:** MVP. Live and source-verified on **BOT Mainnet** at [`0x560E…7CdE`](https://scan.botchain.ai/address/0x560Ec94e3c74F41F05352e535a75E2d16dFB7CdE), with a development deployment on Bohr Testnet ([details](docs/DEPLOYMENTS.md)). **Not audited.** No pilot assets have been registered yet. The app's demo mode shows clearly labeled example data.

## The problem

An asset's history is usually split across paper receipts, spreadsheets and different companies' systems. When equipment is repaired, inspected, moved or handed to a new operator, the next party rarely gets a complete, trustworthy history.

Vestra provides a stable asset reference and an append-only record of lifecycle events, written by authorized wallets. It makes it easy to check who registered an asset, who added each record and when, and whether a record was later corrected.

## What a Vestra record proves, and what it doesn't

| Recorded on BOT Chain (verifiable) | Claimed by a participant (attributed, not verified) | Outside what Vestra can know |
|---|---|---|
| Which wallet registered the asset, who submitted each record and when, the current recorded status, the registered steward, every handover, evidence hashes | An inspector's statement that work was done; a registrar's description of the asset | Legal ownership, current location, current condition, market value |

The **registered steward** is the wallet Vestra records as responsible. It is an operational role, **not legal title**. A handover changes the registered steward; it does not transfer ownership.

## The loop

**Register** (approved registrar) → **Record** (service providers, stewards) → **Hand over** (steward proposes, recipient accepts) → **Verify** (anyone, via QR, no wallet needed).

Pilot cohort: commercial solar and backup-power equipment (inverters, battery storage, charge controllers, generators). See [ADR-001](docs/ADR-001-registry-contract.md).

## Repository

```
contracts/   Foundry project: VestraRegistry.sol, tests, deploy and local seed scripts
web/         Next.js app: Home, Registry, Passport, Verify, Register, Dashboard
docs/        ADR-001 (contract approach, network, data boundaries), FRONTEND.md (design spec)
```

## Architecture

```
            ┌──────────────────────────── web (Next.js 16) ─────────────────────────────┐
 browser ──►│ pages (server components) ──► lib/data ──┬─► fixtures (demo, labeled)      │
            │                                          └─► lib/data/chain (viem) ─────┐  │
            │ forms ──► useWrite ──┬─► server actions (demo)                         │  │
            │                      └─► wallet (wagmi): simulate → sign → receipt ─┐   │  │
            └───────────────────────────────────────────────────────────────────┼───┼──┘
                                                                                 ▼   ▼
                                                              VestraRegistry on BOT Chain
```

- **The chain is the source of truth.** Assets, records, statuses, stewards and pending handovers live in contract storage. The web app is a read and aggregation layer.
- **Reads don't depend on event logs.** `eth_getLogs` is disabled on the public BOT Chain mainnet RPC, so all state is readable through paginated view functions. Logs are used only to attach transaction hashes where the RPC serves them; otherwise the UI links the block.
- **Writes** are simulated first, so contract rejections appear as plain sentences before the wallet opens. Then they're signed, and the receipt is parsed for the new record number or asset ID.
- **One data layer, two sources.** `NEXT_PUBLIC_DATA_SOURCE=fixtures` serves labeled example data with a "Demo data" banner and a "Viewing as" role switcher. `NEXT_PUBLIC_DATA_SOURCE=chain` reads the deployed contract and uses the connected wallet's on-chain roles. No page code differs between the two.
- **Not an RWA Core integration.** BOT Chain's published RWA material documents an ERC-3643 token suite and names an Asset Registry capability without a public interface. Vestra is a token-free lifecycle registry, so it deploys its own contract. The full reasoning is in ADR-001.

## Data model

| Asset field | Stored | Notes |
|---|---|---|
| ID | On-chain | Sequential from 1, shown as `VST-0001`. ID 0 is never assigned. |
| Name, category, type, manufacturer, model | On-chain, public | So the verify page works even if metadata is offline |
| Serial | On-chain if published; otherwise only `keccak256(salt, serial)` | The raw private serial never leaves the registrar's browser |
| Registrar, steward, status, registered time and block | On-chain | |
| Metadata link and hash, registration evidence hashes (≤ 10) | On-chain | Documents themselves are never uploaded by Vestra |

Each **record** stores its type (Inspection, Maintenance, Warranty, Installation, Incident, Status change, Handover, Retirement, Correction), submitter, block time and number, a summary (≤ 280 bytes), an optional evidence hash (SHA-256 computed in the browser), document link and provider reference, plus correction links. Records are never edited or deleted; a Correction supersedes an earlier record and both stay visible.

**Status machine** (enforced on-chain): Registered → Active; Active ↔ Under maintenance / Reported damaged; Active → Reported lost → Active; Reported damaged → Under maintenance; any → Retired (terminal, via a Retirement record).

## Role model

| Role | Can | Can't |
|---|---|---|
| **Admin** (deployer, then a multisig) | Grant and revoke registrar and service-provider roles. Admin transfer is two-step with a 2-day delay. | Register assets, write or edit records, change status, move stewardship |
| **Registrar** | Register assets; on its own assets add Warranty, Installation and Status change records | Write to other registrars' assets |
| **Service provider** | Add Inspection, Maintenance, Installation and Incident records to any non-retired asset | Change status, retire, hand over |
| **Steward** (per asset) | Add Incident, Status change and Retirement records; propose and cancel handovers | Accept its own handover |
| **Anyone** | Read and verify everything, with no wallet | |

Revoking a role stops future actions immediately and never alters records already written. A wallet can correct its own record only while it still holds a role that lets it write to that asset.

## Getting started

Requirements: Node 22+, [Foundry](https://book.getfoundry.sh/getting-started/installation), Git.

```bash
git clone --recurse-submodules https://github.com/Dotman-Bei/Vestra.git && cd Vestra
```

### Demo mode (no chain needed)

```bash
cd web
npm install
npm run dev            # http://localhost:3000
```

Everything works against labeled example data. Use **Viewing as** in the banner to act as a registrar, steward or service provider. Restarting the server resets the data.

### Against a local chain

```bash
# terminal 1
anvil

# terminal 2: deploy and seed LOCAL TEST DATA (refuses any chain but 31337)
cd contracts && npm install && forge build
forge script script/SeedLocal.s.sol --rpc-url local --broadcast
# prints the registry address, 0x5FbDB2315678afecb367f032d93F642f64180aa3 on a fresh anvil

# terminal 3
cd web
NEXT_PUBLIC_DATA_SOURCE=chain \
NEXT_PUBLIC_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3 \
npm run dev
```

Connect a browser wallet to `http://127.0.0.1:8545` (chain 31337) and import an Anvil development key to act as a role. The seed script's header lists which account has which role.

## Testing

```bash
cd contracts
forge test            # 33 unit tests + 4 invariant tests
forge coverage --report summary --ir-minimum
```

Coverage at the time of writing: 100% of lines and functions, 93% of branches in `VestraRegistry.sol`. The suites were also mutation-checked: removing the supersede marker or the recipient check makes tests fail.

The web app was tested end to end in a real browser, in both modes:

- **Demo mode:** every page and role flow.
- **Chain mode, against Anvil:**
  - A service provider records an inspection.
  - The incoming steward accepts a handover from the dashboard.
  - A registrar registers an asset.
  - A stale second browser tab is told "A handover for this asset is already waiting to be accepted" before the wallet opens.

```bash
cd web && npx tsc --noEmit && npx eslint . && npx next build
```

## Deployment

Network values were verified on 2026-10-13 against the official BOT Chain docs and each RPC (see ADR-001):

| | Bohr Testnet | BOT Mainnet |
|---|---|---|
| Chain ID | 968 | 677 |
| RPC | `https://rpc.bohr.life` | `https://rpc.botchain.ai` |
| Explorer | `https://scan.bohr.life` | `https://scan.botchain.ai` |
| Gas token | tBOT ([faucet](https://faucet.botchain.ai/basic)) | BOT |

```bash
cd contracts
cp .env.example .env    # set PRIVATE_KEY (funded with tBOT), ADMIN_ADDRESS, optional initial roles
source .env
forge script script/Deploy.s.sol --rpc-url bohr --broadcast \
  --verify --verifier blockscout --verifier-url https://scan.bohr.life/api/
```

If `ADMIN_ADDRESS` differs from the deployer, the script starts a two-step admin transfer; the admin accepts after 2 days with `acceptDefaultAdminTransfer()`. Then set the web env (`web/.env.example` lists every variable), with `NEXT_PUBLIC_DATA_SOURCE=chain`, and deploy the app.

**Testnet to mainnet:** deploy and verify on Bohr; run the pilot flow on testnet with real participants; review the threat model and data/legal assumptions; move admin to a multisig; deploy and verify on mainnet with the same script.

## Threat model

| Threat | Mitigation | Residual risk |
|---|---|---|
| **Fake asset registration** | Only approved registrar wallets can register; the registrar is permanently recorded on the passport | A rogue approved registrar can register false assets. Revocation stops it but doesn't erase what it registered; the passport shows who did it. |
| **False maintenance or inspection claims** | Only approved service providers can write those types; every record shows its submitting wallet, evidence hash and "Participant claim" label | Vestra cannot verify physical work. Records are attributable, not independently verified. |
| **Unauthorized record changes** | All checks are in the contract; records are append-only; corrections are visible links, never overwrites | None known. |
| **Handover hijacking** | Only the nominated recipient can accept, before expiry, and only while the proposer is still steward; one live proposal per asset; acceptance clears the proposal so it can't be replayed | A steward whose key is stolen can be handed away. Key custody is the participant's responsibility. |
| **Compromised admin** | The admin can only grant and revoke roles, never edit records or move assets; admin transfer is two-step with a 2-day delay; a multisig is recommended for production | A compromised admin can grant registrar roles to an attacker, who can then register false assets. Those are attributable and can't alter existing assets. |
| **Privacy leaks** | No personal data is collected; forms warn against names and addresses in public fields; private serials are salted hashes; documents are hashed in the browser and never uploaded | Registrars can still type personal data into public fields. On-chain data is permanent. |
| **Metadata tampering or loss** | Metadata and documents are linked by hash; the UI flags "doesn't match the recorded hash" and "couldn't load" separately from on-chain facts | A missing document can't be restored from its hash. |
| **False ownership implication** | "Registered steward" everywhere, with "Not legal title" beside it; handovers say they don't transfer legal ownership | People may still assume otherwise; the copy works against this but can't prevent it. |
| **Stale indexed data** | There is no indexer; the app reads contract state on each request; transaction hashes come from logs only and never override state | Past a few hundred assets, the dashboard and registry need an indexer (ADR-001). |
| **Contract bug** | 37 tests including invariants; no external calls, no Ether handling, no upgrade path | **Not audited.** A serious bug means deploying a new registry; existing data would need a documented migration. |

## Known limitations

- Admin is a single wallet, not yet a multisig. The Bohr Testnet deployment's admin key was exposed; treat it as a sandbox.
- Not audited.
- No real pilot assets or users yet. Example data is always labeled.
- Registry and dashboard read every asset; an indexer is needed past pilot scale.
- On BOT Mainnet's public RPC, transaction hashes aren't shown (no `eth_getLogs`); records link their block instead.
- No pause or upgrade mechanism, by design: fewer admin powers.
- The serial commitment hides a private serial only as long as the salt stays private.

## Roadmap

| Milestone | Status |
|---|---|
| M1 Discovery and foundation: ADR, cohort, network verification | Done |
| M2 Registry contract: registration, roles, unique IDs | Done (tested, local) |
| M3 Records and handover: status machine, corrections, expiry | Done (tested, local) |
| M4 Frontend MVP: six pages, wallet flows, QR | Done (demo and local chain) |
| M5 Testnet pilot and hardening: deploy and verify on Bohr, e2e from separate devices, edge cases | In progress: development deployment verified on Bohr; clean redeploy and device testing next |
| M6 Mainnet and real usage: multisig admin, mainnet deploy, real pilot, demo video, build log | In progress: deployed and verified on mainnet; multisig, pilot, demo video and build log next |

## License

[MIT](LICENSE)
