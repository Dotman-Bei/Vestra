# PRD.md — VESTRA

## 1. Product Overview

**Product name:** Vestra  
**Ecosystem category:** RWA (Real-World Assets)  
**Target chain:** BOT Chain  
**Product type:** On-chain asset passport and lifecycle registry  
**Primary MVP users:** Asset registrars, equipment owners/custodians, maintenance providers, and public verifiers

### One-sentence pitch

**Vestra gives real-world equipment a verifiable digital passport, recording its registration, service history, condition attestations, and custodian handovers on BOT Chain.**

### Product concept

Vestra connects a physical asset to a persistent on-chain record. Each registered asset receives a unique passport reference. Authorized participants can append maintenance, inspection, warranty, incident, and handover records. Anyone with the asset's public verification link or QR code can inspect the information that is intentionally public and verify that the current record exists on BOT Chain.

The MVP should focus on durable equipment, with the first pilot using one defined equipment cohort such as commercial solar or backup-power equipment. Keep the data model reusable, but do not build a multi-industry platform in the first release.

Vestra is an asset registry and lifecycle record product, not a fractional-investment marketplace. It must not claim that an on-chain record alone proves that an asset exists, establishes legal ownership, validates a valuation, or guarantees a claim against the asset.

---

## 2. Ecosystem Research and Differentiation

Before building, the agent must read the current official BOT Chain RWA documentation and ecosystem sources:

- BOT Chain Project Party: https://www.botchain.ai/en/project-party/
- BOT Chain RWA Core overview: https://www.botchain.ai/en/blog/rwa-core-real-world-asset-tokenization-infrastructure/
- BOT Chain RWA Development Manual: https://dev-docs.botchain.ai/docs/RWA/project-rwa-developer-docs/
- BOT Chain ecosystem support: https://www.botchain.ai/en/ecosystem-support/

The official directory includes an RWA category. BOT Chain's published RWA Core materials describe a foundational capability layer organized around RWA Token, Identity, Permission, Policy, and Asset Registry. BOT Chain's public RWA Development Manual also documents an ERC-3643-based issuance and transfer system with identity/eligibility and compliance checks.

**Vestra must occupy a distinct product role:** an equipment passport and lifecycle/provenance app. The MVP focuses on asset registration, authorized record updates, verifiable maintenance/inspection evidence, and custodian handovers. It is not a clone of an investor-gated ERC-3643 token issuance product and must not claim to be an official RWA Core product.

### Integration rule

During the technical discovery phase, inspect the current official documentation, contract interfaces, address table, network environment, and acceptance checks. Use an official RWA Core/project component only if its documented interface is suitable for this lifecycle-registry use case and the deployed address is verified from an official source at build time.

Do not invent an ABI, assume undocumented methods, or claim an official RWA Core integration that has not actually been implemented and verified. If no suitable documented interface is available, build a minimal application-specific registry contract on BOT Chain and describe it accurately as a Vestra contract that uses compatible asset-registry/permission concepts, not as an official RWA Core integration.

---

## 3. Problem

Important asset information is often split across paper receipts, spreadsheets, service providers, warranty documents, and separate company systems. When an asset is repaired, inspected, moved, resold, or handed to a new custodian, the next party may not have a complete, reliable history.

Vestra provides a stable asset reference and an append-only record of approved lifecycle events. It makes it easier to check which registrar introduced an asset, which authorized parties added records, and whether a record was changed or superseded.

Vestra does not independently validate off-chain claims. Reliable onboarding depends on authorized registrars and appropriate evidence supplied by the relevant participants.

---

## 4. Product Goals

### MVP goals

1. Give each registered asset a unique, durable on-chain identifier.
2. Record asset metadata references and current lifecycle status.
3. Let authorized participants append maintenance, inspection, warranty, incident, and handover records.
4. Support a two-party custodian handover flow.
5. Provide a public asset verification page and QR code.
6. Preserve an auditable history of important state changes.
7. Deploy and verify the contracts on BOT Chain, test the full flow, and pilot with real assets and participants.

### Non-goals

- Fractional ownership or investment products
- Yield, lending, borrowing, or profit promises
- A token sale or project token
- A general NFT marketplace
- Automated valuation of physical assets
- Custody of the physical assets
- Legal title adjudication
- A universal KYC/AML or compliance service
- A supply-chain ERP replacement
- AI-generated attestations presented as authoritative evidence

---

## 5. BOT Labs Incubation Requirements

The build must follow the principles in the provided BOT Chain Builder / BOT Labs incubation notes and re-check the latest official BOT Chain materials before submission.

### 5.1 Build a real product

Prefer a deployed product over a prototype, a working demo over slides, and real users over pitch-only claims. The goal is a credible BOT Labs incubation candidate, not just a repository or hackathon submission.

### 5.2 Make the chain load-bearing

BOT Chain must be the authoritative location for:

- Asset registration references and authorized registrar
- Current lifecycle status
- Authorized custodian/steward reference
- Append-only event/attestation references
- Handover proposals and accepted handovers
- Transaction/event history for critical lifecycle changes

The frontend and any indexer are read/aggregation layers, not the source of truth for these records.

### 5.3 Demonstrate ecosystem fit

Vestra should be described as an RWA lifecycle application that uses an EVM-compatible chain for verifiable records, role-based actions, and observable state transitions. Do not claim that BOT Chain validates the underlying physical asset or supplies custody, valuation, legal title, insurance, or regulatory approval.

### 5.4 No unnecessary token

Do not issue a Vestra project token. The MVP does not need one. The on-chain asset record is not an investment token and must not be marketed as one. If tokenized economic rights are ever considered in a later phase, that requires a separate legal, operational, and technical review before implementation.

### 5.5 Deployment and verification

The target is a working frontend and deployed, verified smart contracts, with a documented testnet-to-mainnet path. Before a public mainnet launch, finish critical tests, document the threat model and known limitations, and review any legal/privacy issues relating to the pilot asset class.

### 5.6 Evidence of real usage

Track actual:

- Registered assets
- Authorized registrars
- Unique steward wallets
- Lifecycle records added
- Inspection/maintenance records submitted
- Handovers proposed and completed
- Public verification-page visits where privacy-respecting analytics are available
- On-chain transactions and active wallets
- Repeat users and real pilot participants

Do not fabricate assets, custodians, activity, user counts, partner names, or traction. An initial pilot with at least 10 real participants or a small set of genuinely registered assets is preferable to simulated usage being presented as real.

### 5.7 Public project quality

Prepare:

- Public repository with an MIT or GPL license unless there is a documented reason to choose another compatible open-source license
- Clear README with pitch, problem, architecture, setup, deployment, security assumptions, and limitations
- 2–4 minute demo video
- Verified contract links
- Real commit history
- Milestone roadmap
- Public build log or tutorial/content contribution about building on BOT Chain

### 5.8 Milestone-based execution

Plan delivery in stages with measurable acceptance criteria. Do not present all future features as if they are part of the MVP.

---

## 6. Target Users and Roles

### 6.1 Platform administrator

Configures platform-level roles and can revoke a compromised or no-longer-authorized registrar/service-provider role. Admin powers must be limited, documented, and tested.

### 6.2 Authorized registrar

A manufacturer, distributor, equipment provider, or trusted pilot operator allowed to register assets and set their initial metadata reference.

### 6.3 Asset steward/custodian

The wallet currently recorded as responsible for the asset in Vestra. This is an operational record and must not be described as conclusive legal title.

### 6.4 Authorized service provider/inspector

An authorized party that can append maintenance or inspection attestations. The record must identify the submitting wallet and reference supporting evidence. Vestra does not guarantee the quality of the work merely because a record is on-chain.

### 6.5 Public verifier

A person scanning an asset QR code or opening its public link to check the passport, public status, and disclosed history without needing a wallet connection.

---

## 7. Core MVP Workflow

```text
Authorized registrar connects wallet
                 ↓
Register physical asset
                 ↓
Asset ID and initial record written on BOT Chain
                 ↓
Public passport page and QR link become available
                 ↓
Authorized party appends inspection/service event
                 ↓
A custodian handover is proposed
                 ↓
Recipient accepts the handover
                 ↓
Current steward reference updates on-chain
                 ↓
Public verifier checks passport and record history
```

---

## 8. Asset Registration

An authorized registrar can register an asset with the following fields:

- Display name
- Asset category and type
- Manufacturer and model where available
- Public serial/reference, if appropriate to disclose
- Optional serial/reference commitment for cases where the raw value should not be public
- Initial steward/custodian wallet
- Metadata URI pointing to the public asset record
- Hashes of evidence documents, when available
- Initial lifecycle status
- Created timestamp

The contract must generate or accept a unique asset ID and reject duplicate IDs.

### Data rules

- Store only the minimum data needed on-chain.
- Never store identity documents, private contact data, confidential agreements, passwords, or raw personal information in public contract storage or calldata.
- Store full documents off-chain in an access-controlled location where appropriate; record a content hash and stable metadata/document reference on-chain.
- Make clear which fields are public.
- If document storage becomes unavailable, the on-chain hash can still help verify a later supplied copy but cannot restore the missing document.

---

## 9. Asset Passport

Each registered asset must have a public passport page that can be opened by asset ID or QR link.

The passport should show:

- Vestra Asset ID
- Display name and category
- Manufacturer/model fields that the registrar chose to publish
- Current lifecycle status
- Current registered steward/custodian wallet, with truncation where appropriate
- Registrar wallet
- Registration timestamp
- Relevant public metadata/evidence links
- Timeline of lifecycle events
- Hashes/transaction links that allow users to verify on-chain changes
- Clear limitations statement that the record is not itself legal proof of ownership or proof that an off-chain fact is true

The page must distinguish between:

1. On-chain facts, such as which wallet submitted a transaction and what state was recorded.
2. Off-chain assertions, such as an inspector's claim that maintenance was performed.
3. External facts that Vestra cannot independently confirm, such as current physical location, market value, custody, or legal title.

---

## 10. Lifecycle Records

Authorized users can append records of the following types:

- Inspection
- Maintenance/service
- Warranty update
- Installation/commissioning
- Incident/damage
- Status change
- Custodian handover
- Retirement/decommissioning
- Evidence correction or superseding record

Each record should include:

- Asset ID
- Record type
- Submitting wallet
- Timestamp recorded by the chain
- Short public summary
- Evidence/document hash if available
- Metadata/document URI if available
- Optional service provider/inspector identifier

Records should be append-only. Do not silently rewrite past events. If an entry is wrong, append a correction/superseding entry and make the relationship to the previous record clear.

Only authorized roles may append restricted record types. Role checks must happen in the contract, not only in the UI.

---

## 11. Asset Status

Use a small, explicit state machine for the MVP. Suggested statuses:

- `REGISTERED`
- `ACTIVE`
- `UNDER_MAINTENANCE`
- `REPORTED_DAMAGED`
- `REPORTED_LOST`
- `RETIRED`

The implementation may use a smaller set if that makes state transitions safer. Each allowed transition must be documented and enforced on-chain. Define who can make each transition and whether any transition requires evidence or a second-party approval.

A status is a recorded assertion made by an authorized actor. For example, `REPORTED_LOST` records that an authorized party reported the asset lost; it does not independently prove the asset's physical condition.

---

## 12. Custodian Handover

Vestra should support an auditable handover between the currently registered steward and a recipient.

Recommended flow:

1. Current steward creates a handover proposal specifying the recipient wallet and optional evidence hash.
2. Proposal has a deadline/expiry and cannot be modified silently after creation.
3. The nominated recipient accepts before expiry.
4. The contract updates the registered steward only after valid acceptance.
5. Handover is recorded in the asset timeline.
6. Expired or cancelled proposals cannot be accepted.
7. Only one active handover proposal per asset should exist in the MVP, unless the implementation has a clear, tested reason for a different design.

The UI and documentation must call this a **registered custodian/steward handover**, not an automatic legal transfer of ownership. The legal effect of any handover remains dependent on off-chain agreements and applicable law.

---

## 13. Public Verification and QR Code

Every public passport should offer a QR code linking to its Vestra verification page.

The QR code must encode only a public asset ID or public URL. It must never contain private keys, secret tokens, credentials, or sensitive personal data.

The public verifier should:

- Load the asset record from BOT Chain or from an indexer checked against chain state
- Confirm that the asset record exists
- Display current on-chain status and recorded steward reference
- Show public event history and transaction links
- Distinguish missing metadata from invalid on-chain records
- Provide useful states for unknown ID, RPC/indexer error, and unavailable metadata

A QR code is a pointer, not proof by itself. The verifier must read the authoritative record.

---

## 14. Dashboard

The connected user's dashboard should show only assets and actions relevant to their on-chain role.

For a registrar:

- Assets registered by their wallet
- Current status of each asset
- Latest event record
- Link to add allowed records

For a steward/custodian:

- Assets currently associated with their wallet
- Pending incoming/outgoing handovers
- Recent lifecycle events
- Link to view each passport

For service providers/inspectors:

- Assets they are authorized to service/inspect, where this relationship is explicitly represented by the system
- Record submission action
- Recent submitted attestations

The MVP may combine role-specific panels in one dashboard. Do not build a complex enterprise administration suite.

---

## 15. Permissions and Administrative Controls

The contract must enforce at minimum:

- Platform admin can add/revoke registrar roles.
- Platform admin can add/revoke service provider/inspector roles if this role is used.
- Only an authorized registrar can create an asset record.
- Only the current steward or a specifically authorized role can initiate permitted status changes/handover actions.
- Only the nominated recipient can accept a handover.
- Only authorized actors can append restricted record types.
- Revoking a role prevents future restricted actions but does not erase records previously submitted by that wallet.

Admin powers must be documented in the README and threat model. Use safe ownership-transfer patterns and consider a multisig for production administration. Do not make administrative powers wider than needed for the MVP.

---

## 16. Standard Pages and Routes

The MVP has **6 standard pages/routes**.

### 1. Home
**Route:** `/`

Purpose:
- Explain Vestra
- Explain what an asset passport proves and does not prove
- Direct users to browse/verify assets or open the management dashboard
- Show a small set of public asset records or platform usage metrics when real data exists

### 2. Asset Registry
**Route:** `/assets`

Purpose:
- Browse public asset records
- Search by Vestra Asset ID or supported public identifier
- Filter by lifecycle status/category if simple to implement
- Open a passport

### 3. Asset Passport
**Route:** `/assets/[assetId]`

Purpose:
- Show one asset's public passport
- Show current status and registered steward
- Show chronological lifecycle records
- Show evidence/document references and transaction links
- Provide QR code
- Show authorized record actions when the connected wallet has permission
- Propose/accept handover where applicable

### 4. Register Asset
**Route:** `/register`

Purpose:
- Allow authorized registrar wallets to submit a new asset
- Validate fields before requesting a transaction
- Show pending, success, and failure states
- Display the created Asset ID after confirmation

### 5. Dashboard
**Route:** `/dashboard`

Purpose:
- Show assets relevant to the connected wallet's roles
- Show pending handovers
- Provide permitted lifecycle-record actions
- Show recent transactions and their status

### 6. Public Verification
**Route:** `/verify/[assetId]`

Purpose:
- Provide a QR-friendly public verification destination
- Read and display current chain-backed asset status
- Show key public identifiers, registration reference, and history summary
- Clearly explain if the ID is unknown, metadata is missing, or data could not be fetched

### Route summary

```text
/                     Home
/assets               Asset Registry
/assets/[assetId]     Asset Passport
/register             Register Asset
/dashboard            Dashboard
/verify/[assetId]     Public Verification
```

**Total standard pages/routes: 6**

Record forms, transaction confirmation, wallet connection, handover actions, loading states, and success/error states should live within these routes rather than creating unnecessary standalone routes.

---

## 17. Frontend Rule

This PRD intentionally contains **no visual design requirements**.

When frontend implementation begins, the coding agent **MUST read and follow `frontend.md`**. That file is the source of truth for visual design, layout, components, styling, responsive behavior, interaction patterns, typography, and frontend polish.

Do not invent competing design requirements in this PRD. If `frontend.md` is missing, stop before making visual decisions and ask for it or report the blocker instead of silently inventing a replacement design system.

---

## 18. Suggested Technical Architecture

Use a small architecture with clearly separated responsibilities.

### On-chain contract(s)

A minimal Vestra Asset Registry contract, or an officially documented BOT RWA component if verified and suitable, should support:

- Asset registration
- Unique asset identifiers
- Asset status
- Role/permission checks
- Append-only lifecycle record references
- Handover proposal/acceptance
- Events for indexing and audit history

Avoid adding token issuance, trading, payment, or investment logic to the MVP unless the selected asset use case actually requires it.

### Frontend

- Standard EVM wallet connection
- Read authoritative contract state
- Submit signed transactions for authorized actions
- Display transaction pending/success/failure states
- Generate public QR links
- Use `frontend.md` for all design decisions

### Optional indexing/read service

A small indexer/read database may support search, pagination, and dashboards. It must be rebuildable from contract events where practical and must never override authoritative contract state. If no indexer is needed for the initial asset count, read directly from the contracts first and add indexing only when required.

### Metadata/document storage

Store larger documents and metadata off-chain. Where relevant, keep a content hash on-chain so a subsequently supplied document can be checked against the recorded hash. Make storage availability and privacy limitations explicit.

---

## 19. BOT Chain Configuration and RWA Documentation

Before connecting or deploying, the agent MUST inspect current official BOT Chain docs and verify:

- Mainnet chain ID and RPC
- Testnet network and RPC
- Explorer URLs
- Faucet details
- Contract verification process
- RWA development manual and address table
- Any applicable official interface or deployment guide

Do not rely on remembered or copied network configuration values. Do not hardcode unverified deployed contract addresses. Put environment-specific values in configuration/environment files and document how they were verified.

If the documented BOT RWA contracts are integrated, use the official ABI/interface and verify that the selected addresses correspond to the intended network. If they are not used, document why and avoid implying that Vestra is built on an undocumented RWA Core SDK.

---

## 20. Security, Privacy, and Threat Model

Security is a required implementation concern, not a final cosmetic task.

### Smart contract baseline

- Access control on every privileged operation
- Checks-effects-interactions where external calls exist
- Reentrancy protection where applicable
- No unbounded loops in transaction-critical functions
- Unique asset ID enforcement
- Valid lifecycle transitions only
- Recipient-only handover acceptance
- Handover expiry/cancellation handling
- Revoked roles cannot perform future restricted actions
- Events emitted for key state changes
- Safe ownership/admin transfer
- No sensitive data in public calldata/storage
- Fail safely when metadata or external services are unavailable

### Threats to consider

**Fake asset registration:** restrict registration to authorized registrars and clearly label issuer/registrar assertions.

**False maintenance/inspection claims:** identify the submitting wallet, require evidence references where appropriate, preserve an audit trail, and avoid describing an attestation as independently verified unless a separate verification process exists.

**Unauthorized record changes:** enforce role checks in the contract. Prior records should not be silently erased or rewritten.

**Handover hijacking:** only the intended recipient can accept; expire/cancel proposals safely; prevent use of stale proposals.

**Compromised admin:** document admin powers, enable role revocation, use safe admin-key management, and consider multisig governance for a production deployment.

**Privacy leaks:** do not publish personally identifying or confidential documents. Hashing alone does not automatically make low-entropy data private.

**Off-chain metadata tampering/unavailability:** hash evidence where practical, show missing content clearly, and do not treat an unavailable link as proof that a record is false or true.

**False ownership implication:** explain everywhere relevant that the recorded steward is the address acknowledged by this application. The record does not independently establish legal ownership/title.

**Stale indexer data:** reconcile important data against current chain state and provide transaction links so users can verify records.

### Required tests

- Registrar authorization and revocation
- Asset registration and duplicate prevention
- Invalid field/state rejection
- Lifecycle transition rules
- Append-only event history
- Service-provider permissions
- Handover proposal and recipient acceptance
- Wrong recipient rejection
- Expired/cancelled handover rejection
- Double/duplicate handover prevention
- Public verification for existing/unknown assets
- Frontend wallet rejection, RPC failure, and reverted transactions

Include a threat model in the README. If a formal audit is not available, say so plainly; do not claim the contracts are audited.

---

## 21. Technology Expectations

Prefer familiar, maintainable EVM tooling. The agent may select equivalent tools if compatible with BOT Chain and appropriate for a small production MVP.

Reasonable options include:

- Solidity
- Hardhat or Foundry
- TypeScript
- React/Next.js or another established frontend framework
- viem/wagmi or equivalent wallet tooling
- A QR generation library
- Optional indexer/read layer if needed

Do not introduce an unnecessary database, AI model, external API, token, or complex service architecture merely to make the project look larger.

---

## 22. Metrics

Track verifiable metrics that can support future incubation milestones:

### Product usage
- Assets registered
- Active registrars
- Active stewards/custodians
- Lifecycle records added
- Handovers proposed and accepted
- Repeat asset managers
- Unique interacting wallets

### On-chain activity
- Registration transactions
- Lifecycle record transactions
- Handover transactions
- Total on-chain records
- Contract errors/reverts during testing and operation

### Real-world validation
- Number of real assets onboarded with the relevant participant's permission
- Number of real service/inspection events recorded
- Number of real custodian handovers
- Feedback from asset owners and service providers

Never mix simulated/demo fixtures with production statistics without labelling them clearly.

---

## 23. Milestone Plan

### M1 — Discovery and Foundation

- Read this PRD and the official BOT Chain RWA docs
- Confirm whether an official documented interface is suitable
- Choose the initial pilot asset cohort
- Define the record fields and role model
- Set up repository, contract tooling, frontend project, tests, and deployment configuration
- Verify current BOT Chain network configuration
- Document architecture and assumptions

**Acceptance:** a short architecture decision record explains the contract approach, chosen asset cohort, data/privacy boundaries, and deployment environment.

### M2 — Asset Registry Contract

- Implement authorized registration
- Enforce unique IDs
- Store current status/steward and metadata references
- Add role administration
- Emit clear events
- Add contract tests

**Acceptance:** authorized registration succeeds, unauthorized registration fails, and duplicate IDs cannot be registered.

### M3 — Lifecycle Records and Handover

- Append inspection/maintenance/status records
- Implement status transition rules
- Implement handover proposal and acceptance
- Enforce roles and expiry
- Test correction/superseding-record flow

**Acceptance:** an asset's history is auditable and unauthorized or stale actions fail.

### M4 — Frontend MVP

- Home
- Asset Registry
- Asset Passport
- Register Asset
- Dashboard
- Public Verification
- Wallet connection and transaction states
- QR generation
- Lifecycle record and handover flows

Before this milestone's frontend work, read and follow `frontend.md`.

**Acceptance:** a user can complete the full workflow without manually calling contract methods.

### M5 — Testnet Pilot and Hardening

- Deploy to the appropriate BOT Chain test environment
- Verify contracts where supported
- Run automated contract tests
- Run end-to-end tests
- Test public verification from a separate wallet/device
- Test role revocation, bad QR IDs, RPC failures, and handover edge cases
- Fix critical issues
- Complete README and threat model

**Acceptance:** complete a demonstration from registration through lifecycle record and successful handover, plus expected failure cases.

### M6 — Mainnet and Real Usage

- Review security and data/legal assumptions
- Deploy and verify mainnet contracts after testnet acceptance
- Publish production frontend
- Onboard real pilot assets and authorized participants
- Track real on-chain usage
- Publish a 2–4 minute demo and public build log
- Gather feedback and prioritize the next milestone

**Acceptance:** public app and contracts work on BOT Chain mainnet, or a documented blocker and credible mainnet deployment plan exists if mainnet launch is not yet appropriate.

---

## 24. Definition of Done

- [ ] Product is named Vestra and positioned under RWA.
- [ ] Official BOT Chain RWA documentation was reviewed during implementation.
- [ ] Decision to use an official component or a Vestra-specific registry is documented accurately.
- [ ] Smart contract(s) compile and critical tests pass.
- [ ] Registration is restricted to authorized registrars.
- [ ] Duplicate asset IDs are rejected.
- [ ] Public passport can be opened by Asset ID.
- [ ] Lifecycle entries are append-only or corrected via a visible superseding record.
- [ ] Role checks are enforced on-chain.
- [ ] Handover requires valid current steward and intended-recipient acceptance.
- [ ] Invalid/expired/replayed handover attempts fail.
- [ ] QR points to a public verification route and does not contain secrets.
- [ ] Public verification reads authoritative on-chain state or validates indexed data against it.
- [ ] Dashboard displays wallet-relevant assets/actions.
- [ ] Privacy limitations and legal/title limitations are visible and documented.
- [ ] Frontend follows `frontend.md`.
- [ ] Testnet end-to-end flow passes.
- [ ] Mainnet contracts are deployed and verified, or a credible deployment plan is documented.
- [ ] Production app is deployed.
- [ ] README includes setup, architecture, deployment, data model, role model, and threat model.
- [ ] 2–4 minute demo video is prepared.
- [ ] Repository has an appropriate open-source license.
- [ ] No fake usage or unauthenticated claims of traction are included.
- [ ] Real-user/asset pilot is run or explicitly identified as the next milestone.
- [ ] Git history reflects continuous meaningful work; run `git log` before completion.

---

## 25. Git Commit Rules

Git commits are a required part of the development process.

During the build, commit changes continuously instead of waiting until the entire project is finished.

## Commit Frequency

For a normal build, aim for **50+ meaningful commits** across the development process.

Do NOT create 50 meaningless commits just to reach the number. Every commit should represent a real, completed development step.

Make a commit whenever you complete a logical unit of work, such as:

- Creating a new page
- Creating or modifying a component
- Adding a feature
- Implementing an API endpoint
- Adding database functionality
- Adding authentication logic
- Adding validation
- Adding error handling
- Connecting frontend to backend
- Adding a utility/helper
- Adding a configuration
- Refactoring a specific section
- Fixing a bug
- Improving an existing feature
- Adding tests
- Fixing failing tests
- Improving responsiveness
- Fixing accessibility issues
- Updating documentation
- Completing a route
- Completing a major UI section
- Integrating an external service

## Commit Process

After completing each logical development unit:

1. Check the current changes.
2. Verify that the changes work.
3. Stage only the relevant files.
4. Create a descriptive commit.
5. Continue building from the committed state.

Use conventional commit messages where appropriate:

- `feat: add dashboard`
- `feat: add wallet connection`
- `feat: implement transaction history`
- `fix: resolve wallet connection error`
- `refactor: simplify auth middleware`
- `test: add dashboard tests`
- `style: improve mobile layout`
- `docs: update setup instructions`

## Important Rules

- Do NOT wait until the end of the project to commit everything.
- Do NOT make one giant commit containing the entire project.
- Do NOT create fake changes solely to increase the commit count.
- Do NOT repeatedly modify and commit the same thing without a meaningful reason.
- Keep commits small, focused, and logically separated.
- Before moving to the next major feature, make sure the previous feature has been committed.
- If a task contains several independent steps, commit each completed step separately.
- If you encounter and fix a bug during development, commit the fix separately.
- If you make a meaningful refactor, commit it separately.

## Target

For a substantial project, aim for **50+ meaningful commits by the time the build is complete**, distributed naturally throughout development.

The commit history should clearly show the progression of the project from initial setup → individual features → integrations → fixes → testing → polish → final state.

At the end of the build, run `git log` and verify that the history accurately reflects the development process.

---

## 26. Rules for the Coding Agent

1. Read this entire PRD before coding.
2. Inspect current official BOT Chain RWA documentation before selecting/integrating contracts.
3. Do not invent official integrations, deployed addresses, partnerships, legal rights, or asset-verification claims.
4. Pick and document one initial asset cohort; keep the MVP narrow.
5. Read `frontend.md` before frontend implementation and follow it as the source of truth for design.
6. Do not create a project token or financial product for MVP.
7. Keep asset registration, record entry, verification, and handover usable end-to-end.
8. Treat on-chain data as an auditable record, not proof that off-chain claims are automatically true.
9. Never put sensitive documents or personal data in public contract storage or calldata.
10. Test privileged roles and all lifecycle transitions.
11. Commit continuously according to the Git Commit Rules.
12. Do not fake assets, transactions, usage, user counts, audits, or partner relationships.
13. Document unknowns, assumptions, and limitations rather than hiding them.
14. Run the Definition of Done checklist before declaring completion.
15. Run `git log` at the end and confirm the commit history reflects genuine development.

---

## 27. Final Positioning

> **Vestra is a verifiable digital passport and lifecycle record for real-world equipment, built on BOT Chain.**

The MVP proves one useful loop:

**Register asset → record lifecycle evidence → transfer registered stewardship → verify the public record.**

Build the smallest reliable version first. Expand only after real asset owners and service providers validate the workflow.
