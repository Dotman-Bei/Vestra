# ADR-001: Vestra registry contract, pilot cohort, data boundaries and network

- **Status:** Accepted
- **Date:** 2026-10-13
- **Milestone:** M1, Discovery and Foundation (PRD section 23)

## 1. Context

The PRD asks for an on-chain passport and append-only lifecycle record for real-world equipment, with authorized registration, service records, status changes and a two-party custodian handover. Before choosing a contract approach, the PRD requires reading the current official BOT Chain RWA material and using an official component only if its documented interface fits and its address is verified.

### What the official material says (read 2026-10-13)

| Source | Finding |
|---|---|
| [RWA Development Manual](https://dev-docs.botchain.ai/docs/RWA/project-rwa-developer-docs/) | Documents an **ERC-3643 (T-REX)** issuance and transfer suite: Token, IdentityRegistry, ModularCompliance, ONCHAINID, gateways. Deployed demo addresses exist on Bohr Testnet (968) and a BOT Mainnet capability demo (677). It does **not** describe an Asset Registry component or interface. |
| [RWA Core overview](https://www.botchain.ai/en/blog/rwa-core-real-world-asset-tokenization-infrastructure/) | Names five capabilities, including **Asset Registry** ("links an asset identifier to relevant contracts, status, metadata references, and authorized issuer information"). States that until "specific interfaces, deployment details or product materials are published", readers should rely only on the stated capabilities. No ABI, address or SDK is published. |
| [Environment and acceptance](https://dev-docs.botchain.ai/docs/RWA/testnet-practice/), [JSON-RPC endpoints](https://dev-docs.botchain.ai/docs/Developers/json-rpc-endpoint/), [Quick guide](https://dev-docs.botchain.ai/docs/Developers/quick-guide/), [Test tokens](https://dev-docs.botchain.ai/docs/Developers/claim-test-tbot-tokens/) | Network values in section 5 below. The JSON-RPC page states: "`eth_getLogs` is disabled on below Mainnet endpoints." |

## 2. Decision: a Vestra-specific registry contract

Vestra deploys its own minimal contract, **`VestraRegistry`**, and does not integrate an RWA Core component.

- The documented RWA contracts are an investor-gated **token issuance and transfer** system. Vestra issues no token and has no investors (PRD 4, 5.4). Using ERC-3643 would misrepresent the product as an investment instrument.
- The RWA Core **Asset Registry** has no published interface or address. The PRD forbids inventing an ABI or claiming an integration that hasn't been implemented and verified.

Vestra uses compatible concepts (an asset identifier linked to status, metadata references and the authorized issuer; role-separated permissions), but it is described everywhere as **"a Vestra contract on BOT Chain"**, never as an official RWA Core product or integration. If BOT Chain later publishes an Asset Registry interface, a follow-up ADR will evaluate mirroring Vestra assets into it.

## 3. Pilot cohort

**Commercial solar and backup-power equipment**: string and hybrid inverters, battery storage cabinets, charge controllers and standby generators. This is the first cohort the PRD suggests, and these assets share the same lifecycle (install, inspect, service, incident, hand over, retire). Categories are a short fixed list in the frontend (`web/lib/registration.ts`); the contract stores the category as a string, so adding a category needs no contract change.

## 4. Contract design

### Roles (OpenZeppelin `AccessControlDefaultAdminRules`)

| Role | Holder | Can |
|---|---|---|
| Default admin | Deployer, then a multisig for production | Grant and revoke `REGISTRAR_ROLE` and `SERVICE_PROVIDER_ROLE`. Admin transfer is two-step with a 2-day delay. **Cannot** register assets, write records, change status, move stewardship or edit history. |
| `REGISTRAR_ROLE` | Manufacturers, distributors, pilot operators | Register assets. On assets they registered: add Warranty, Installation and Status change records. |
| `SERVICE_PROVIDER_ROLE` | Technicians and inspectors | Add Inspection, Maintenance, Installation and Incident records to any non-retired asset. |
| Steward (per asset, not a role) | The wallet recorded as responsible | Add Incident, Status change and Retirement records; propose and cancel handovers. |
| Anyone | | Read everything. |

Revoking a role stops future restricted actions immediately. It never erases or alters records that wallet already submitted.

### Identifiers

Asset IDs are assigned by the contract: sequential `uint256` starting at 1, displayed as `VST-0001`. Duplicate IDs are impossible by construction. **ID 0 is never assigned**, so `VST-0000` is used for the Home page example and can never collide with a real asset.

### Status machine (enforced on-chain)

| From | Allowed next status | Via |
|---|---|---|
| Registered | Active | Status change |
| Active | Under maintenance, Reported damaged, Reported lost | Status change |
| Under maintenance | Active, Reported damaged | Status change |
| Reported damaged | Under maintenance, Active | Status change |
| Reported lost | Active | Status change |
| Any except Retired | Retired | Retirement record (steward only) |
| Retired | none; terminal | |

A status is a recorded assertion by an authorized wallet. `Reported lost` records that someone reported it lost; it proves nothing about the physical asset.

### Records

Append-only. Each record stores type, submitter, block timestamp and number, summary (1 to 280 bytes), optional evidence hash, document URI, provider reference, and for specific types the new status, the new steward or the corrected record. Records are never edited or deleted. A **Correction** links to the record it supersedes and marks it superseded; only the original submitter can correct, only while they still hold a role that lets them write to that asset, and only once per record. Handover and Correction records can't themselves be corrected.

### Handover

1. The steward proposes: recipient (not zero, not themselves), expiry between now and 30 days, optional evidence hash. One live proposal per asset; retired assets can't be handed over.
2. Only the nominated recipient can accept, before expiry, and only if the proposer is still the steward.
3. Acceptance updates the steward and appends a Handover record in the same transaction.
4. The steward can cancel a live or expired proposal. Expired or cancelled proposals can't be accepted.

The UI and docs call this a **registered steward handover**, not a transfer of ownership.

### State is readable without event logs

Because `eth_getLogs` is disabled on the public mainnet RPC, the app can't rely on events to rebuild history. All authoritative state (assets, records, pending handovers, registration evidence) is held in storage and exposed through **paginated view functions**. Events are still emitted for every state change so explorers and a future indexer can use them.

Transaction hashes aren't stored on-chain. The frontend links each record to its block, and, where the BOT Chain explorer's Blockscout-style API is available, enriches records with their transaction hash. That enrichment is checked against the record's block and submitter; it never overrides contract state.

### Scale

For the pilot (tens to low hundreds of assets), the registry and dashboard read assets through `getAssets(offset, limit)` and filter client-side. Past that, a small indexer rebuilt from contract events (via an endpoint that serves logs, or the explorer API) becomes necessary. It stays a read layer and is reconciled against contract state.

### Security baseline

- Access checks on every state-changing function, in the contract.
- No external calls, Ether handling or token transfers, so no reentrancy surface. `ReentrancyGuard` isn't needed and is not added.
- No unbounded loops in state-changing functions. Registration evidence is capped at 10 hashes.
- Input bounds on every string, enforced on-chain.
- Custom errors for every rejection; the frontend maps each to a plain sentence.
- No pause or upgrade mechanism in the MVP: fewer admin powers to abuse. A fix means deploying a new registry, documented as a known limitation.
- **Not audited.** This is stated in the README and threat model.

## 5. Network configuration (verified 2026-10-13)

| | Bohr Testnet | BOT Mainnet |
|---|---|---|
| Chain ID | 968 (RPC returned `0x3c8`) | 677 (RPC returned `0x2a5`) |
| RPC | `https://rpc.bohr.life` | `https://rpc.botchain.ai` |
| Explorer | `https://scan.bohr.life` | `https://scan.botchain.ai` |
| Native token | tBOT (no value) | BOT |
| Faucet | `https://faucet.botchain.ai/basic`, 10 tBOT per address per 24 h | n/a |
| `eth_getLogs` on public RPC | Works | Disabled (per docs; confirmed no response) |

Values come from the official pages in section 1 and were checked with `eth_chainId` against each RPC. They live only in `web/.env.example` and `contracts/.env.example`, never in code.

- **EVM version:** not documented. Probing both RPCs with `eth_call` contract-creation simulations showed `PUSH0`, `MCOPY` and `TSTORE` all execute, while an undefined opcode (`0x0c`) fails with "invalid opcode". The contract therefore targets `evm_version = "cancun"`.
- **Verification:** both explorers answer Blockscout-style `/api` and `/api/v2` routes. Contracts are verified with `forge verify-contract --verifier blockscout --verifier-url https://scan.bohr.life/api/` (testnet). No official verification guide was found; if this fails, the fallback is manual source upload through the explorer UI.

## 6. Data and privacy boundaries

| Data | Where | Why |
|---|---|---|
| Display name, category, type, manufacturer, model | On-chain, public strings | The verify page must say what the asset is even if off-chain metadata is offline. The register page tells registrars that everything entered is public and permanent, and warns against people's names or home addresses. |
| Public serial | On-chain, optional | Only if the registrar chooses to publish it. |
| Private serial | **Only** `keccak256(salt, serial)` on-chain | The raw serial never leaves the registrar's browser. A 16-byte random salt prevents guessing low-entropy serials from the hash. |
| Evidence documents | Never on-chain or uploaded by Vestra | Files are hashed in the browser (SHA-256); only the hash is recorded. Documents live wherever the participant stores them, linked by URI if they choose. |
| Personal data, identity documents, contact details | Never | Not collected by any form. |

If a linked document goes offline, its on-chain hash can still verify a copy supplied later but cannot restore it. The UI says so.

## 7. Consequences

- Vestra owns and must test, deploy and verify its contract. It is not an RWA Core integration and says so.
- History reads use storage, so they cost more gas at write time than an events-only design. Accepted: reads must work on the public mainnet RPC.
- Testnet and mainnet deployment need a funded deployer key held by the project team. The repo provides scripts; nobody commits keys.
- A pilot-scale dashboard reads all assets; an indexer is a later milestone.
