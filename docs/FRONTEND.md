# FRONTEND.md - Vestra

Source of truth for Vestra's visual design, layout, components, copy and frontend behavior. The PRD (`Vestra_PRD.md`, section 17) defers all design decisions to this file. If this file and the PRD disagree on product facts, the PRD wins; on anything visual, this file wins.

---

## 0. Design read

**Reading this as:** a trust-first registry product for equipment registrars, service technicians and people scanning a tag on a site visit, with a factual "equipment nameplate" language, leaning toward Next.js + Tailwind v4 + Geist/Geist Mono + restrained motion.

Vestra is mostly product UI (registry, passport, forms, dashboard), with one marketing surface (Home). The taste skill is written for landing pages, so it applies in two strengths:

| Surface | VARIANCE | MOTION | DENSITY | Why |
|---|---|---|---|---|
| Home `/` | 6 | 4 | 4 | Has to explain a new idea and earn trust. Some composition, no spectacle. |
| App pages (`/assets`, `/assets/[id]`, `/register`, `/dashboard`) | 3 | 3 | 5 | People are reading hashes, wallets and dates. Predictable layout beats clever layout. |
| Verify `/verify/[id]` | 2 | 2 | 4 | Opened from a QR on a phone, often outdoors. One answer, instantly. |

No official design system fits (this is not Fluent/Carbon/Material territory and none is a brand requirement), so the build uses Tailwind v4 utilities over CSS-variable tokens, with headless primitives from Radix (`@radix-ui/react-dialog`, `react-popover`, `react-select`, `react-tabs`) for accessible behavior. No shadcn default styling.

---

## 1. Who it's for and the one action each page drives

| User | Arrives because | Needs to leave with |
|---|---|---|
| **Public verifier** (buyer, site manager, insurer, technician) | Scanned a QR tag or got a link | "This record exists on BOT Chain, here's its status and history, and here's what it does not prove." |
| **Registrar** (manufacturer, distributor, pilot operator) | Onboarding equipment | A registered asset with an ID and a printable QR. |
| **Steward / custodian** (the wallet responsible today) | Handing equipment over, or checking their fleet | A completed or accepted handover. |
| **Service provider / inspector** | Just did a job on site | A maintenance or inspection record appended, with evidence hash. |

| Page | Route | The one main action |
|---|---|---|
| Home | `/` | Look up an asset by ID |
| Asset Registry | `/assets` | Open a passport |
| Asset Passport | `/assets/[assetId]` | Read the history; if permitted, add a record |
| Public Verification | `/verify/[assetId]` | Confirm the record exists and see current status |
| Register Asset | `/register` | Submit a new asset registration |
| Dashboard | `/dashboard` | Clear pending handovers and actions |

---

## 2. Visual direction

### 2.1 Thesis

**An equipment nameplate, not a crypto app.** The riveted metal plate on an inverter or generator: model, serial, ratings, set in plain type on a quiet surface, legible from a metre away. Vestra treats every asset the same way. Identifiers are set in mono and given room. Status is stated, not decorated. The chain shows up as receipts (block, transaction, hash) rather than as glowing gradients. The page should feel like something an insurer or facilities manager would trust on first look.

### 2.2 Palette (one accent, cool neutrals, locked)

Tokens live as CSS variables on `:root` and are swapped under `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`. Theme follows the system by default; a manual toggle sits in the footer. One theme per page, no section inverts.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F3F4F6` | `#0E1013` | Page background |
| `--surface` | `#FBFBFC` | `#15181D` | Panels, plates, inputs |
| `--surface-sunk` | `#E9EBEF` | `#1C2027` | Code/hash wells, table header, skeletons |
| `--border` | `#D7DAE0` | `#2A2F37` | Hairlines, input borders |
| `--border-strong` | `#B4B9C2` | `#3D434D` | Focused/hovered borders, plate rim |
| `--text` | `#14171C` | `#ECEEF1` | Primary text |
| `--text-muted` | `#555B66` | `#9CA3AE` | Secondary text (≥ 6:1 on `--bg` in both modes) |
| `--accent` | `#2443C9` | `#8197FF` | The single accent: primary buttons, links, focus ring, active nav |
| `--accent-ink` | `#F7F8FC` | `#0E1013` | Text on accent |
| `--accent-wash` | `#E4E9FB` | `#1B2244` | Tinted fill for selected rows, the "on-chain" proof tile |

**Status colors are semantic state, not accents.** They appear only inside `StatusChip`, timeline markers and verification results, always paired with an icon and a text label (never color alone).

| Status | Light fg / bg | Dark fg / bg | Icon (Phosphor) |
|---|---|---|---|
| Registered | `#3F4651` / `#E6E8EC` | `#C3C8D0` / `#252A31` | `Tag` |
| Active | `#17663F` / `#DDF1E6` | `#6FD39E` / `#12291E` | `CheckCircle` |
| Under maintenance | `#8A5600` / `#FBEBCB` | `#F2C064` / `#2D2312` | `Wrench` |
| Reported damaged | `#A3231B` / `#FBE1DE` | `#FF8F86` / `#341614` | `WarningOctagon` |
| Reported lost | `#A3231B` / transparent, 1px border `#A3231B` | `#FF8F86` / transparent, border | `Binoculars` |
| Retired | `#555B66` / transparent, 1px border `--border-strong` | `#9CA3AE` / transparent | `Archive` |

Shadows: only on floating layers (dialogs, sheets, menus). `0 12px 32px rgb(20 23 28 / 0.12)` light, `0 12px 32px rgb(0 0 0 / 0.45)` dark. No glows anywhere.

### 2.3 Typography (two families)

- **Geist** (via `next/font`): all UI and headings. Weights 400, 500, 600.
- **Geist Mono**: asset IDs, wallet addresses, hashes, block numbers, timestamps in record metadata. This is load-bearing, not decoration: mono makes long identifiers scannable and comparable.

| Role | Size / line-height / weight | Tracking |
|---|---|---|
| Display (Home hero only) | 48/52 desktop, 36/40 mobile, 600 | -0.02em |
| H1 (page titles) | 32/38 desktop, 26/32 mobile, 600 | -0.015em |
| H2 (section titles) | 22/28, 600 | -0.01em |
| H3 (panel titles) | 17/24, 600 | 0 |
| Body | 16/26, 400, max 65ch | 0 |
| Small / meta | 14/20, 400 | 0 |
| Label (form labels, fact keys) | 13/18, 500 | 0 |
| Mono ID (passport header) | 20/28, 500 | 0 |
| Mono inline | 13/20, 400 | 0 |

Emphasis inside a heading uses Geist 600 vs 400 or `--accent` color. Never italic display, never a second family.

### 2.4 Spacing, grid, shape

- **Spacing scale (4px base):** 4, 8, 12, 16, 24, 32, 48, 64, 96. Nothing off-scale.
- **Section rhythm:** Home sections `py-24` desktop / `py-16` mobile. App pages use 32 between panels, 24 inside panels.
- **Container:** `max-w-[1200px] mx-auto px-4 md:px-8`. Verify page `max-w-[560px]`.
- **Grid:** 12 columns desktop, single column below 768px with no exceptions.
- **Radius rule (one system):** controls and chips 6px; panels, plates, sheets and dialogs 10px; avatars/QR quiet zone none. Nothing pill-shaped, nothing sharp-zero.
- **Borders over cards:** group with 1px `--border` hairlines and spacing. A raised panel only for the passport plate, dialogs and sheets.
- **Nav height:** 64px, single line at ≥1024px.

### 2.5 Motion rules

Motion library: `motion/react`, isolated in `'use client'` leaf components. Every animation has a job:

| Where | What | Why | Spec |
|---|---|---|---|
| Home hero | Passport plate fades up 12px after text | Hierarchy: message first, object second | 0.5s, ease `[0.16,1,0.3,1]`, delay 0.15s, once |
| Home lifecycle rail | Four stages reveal left to right as the rail enters view | Storytelling: the loop is a sequence | `whileInView`, stagger 0.08s, once |
| Passport timeline | Entries fade in on first load only | Signals data has arrived (replaces skeleton) | 0.3s, stagger 0.03s, max 10 entries animated |
| Transaction status | Step indicator advances; check draws on confirm | State transition | 0.25s |
| Buttons | `:active` translateY(1px) | Feedback | CSS, 80ms |
| Sheet / dialog | Slide from right (desktop) or bottom (mobile), fade scrim | State transition | spring stiffness 380, damping 36 |
| Copy-to-clipboard | Icon swaps to check for 1.2s | Feedback | CSS |

Banned: marquees, parallax, scroll-jacking, infinite loops, magnetic buttons, hover tilt, cursor effects, page-load spinners. Only `transform` and `opacity` animate. Under `prefers-reduced-motion: reduce` every item above becomes instant.

### 2.6 Imagery

- **Hero visual is a real component**, not a picture of one: the actual `PassportPlate` rendered with a clearly labeled example record (caption under it: "Example record. Not a registered asset."). This shows the product honestly without a div-based fake screenshot.
- **Photography:** no image-generation tool is available and stock seeds won't show the right equipment, so Home uses real components where photos would go: a real `TimelineEntry` in the "Claimed by a participant" cell, an on-chain receipt in the "Recorded on BOT Chain" cell, and the printable `PrintTag` in the closing band. When real photos of pilot equipment (inverters / battery cabinets with a Vestra tag fixed to the casing) exist, they can be added to the closing band; real pilot photos are also evidence of real usage (PRD 5.6).
- **Icons:** `@phosphor-icons/react`, regular weight, one family only.
- No logos wall. Vestra has no partners to show yet and the PRD forbids implying any.

### 2.7 Data honesty in the UI

- All chain reads go through one data adapter (`lib/data`). Until contracts are deployed, a **fixture adapter** serves example data and a persistent banner appears at the top of every page: "Demo data. These records are examples and are not on BOT Chain." The banner disappears automatically when the chain adapter is configured.
- While the fixture adapter is active, the banner also carries a **"Viewing as"** select (Visitor, Registrar, two Stewards, Service provider). It picks which example wallet the app acts as, so every role's view and every write flow can be exercised. Demo writes go through server actions that apply the same rules the contract will enforce (`lib/rules.ts`). In chain mode the select disappears and the connected wallet's on-chain roles decide.
- Home shows usage metrics **only** when the chain adapter is live and counts are > 0. Otherwise the section does not render.
- Every chain-sourced value links to the explorer (tx, block, address). Explorer base URL and chain ID come from env config, never hardcoded.

---

## 3. Pages and sections in build order

Build order follows the object model: the shell and Home set tokens and shared components; the Passport is the core object every other page reuses; Verify is a narrow cut of the Passport; the Registry lists passports; Register creates them; the Dashboard aggregates everything and is built last.

1. App shell + Home `/`
2. Asset Passport `/assets/[assetId]`
3. Public Verification `/verify/[assetId]`
4. Asset Registry `/assets`
5. Register Asset `/register`
6. Dashboard `/dashboard`

Status labels used in all copy: Registered, Active, Under maintenance, Reported damaged, Reported lost, Retired.
Record type labels: Inspection, Maintenance, Warranty update, Installation, Incident, Status change, Handover, Retirement, Correction.

---

### 3.0 App shell (built with Home)

**Header** (64px, sticky, `--bg` with bottom hairline once scrolled)
- Left: Vestra wordmark (Geist 600, 18px) with a simple square mark: a 2px-rimmed rounded square containing a single mono "V". This is the only hand-made graphic.
- Center-left nav: `Registry` · `Register` · `Dashboard`
- Right: `Connect wallet` button (secondary style). Hidden while the fixture adapter is active, because the "Viewing as" select is then the acting wallet. Connected state: network name + truncated address `0x4f2a…91c3`, opens a menu with "Copy address", "View on explorer", "Disconnect".
- Wrong network: button turns to "Switch network" (accent). The network name stays out of the label so it never wraps.
- Mobile (<768px): wordmark + wallet icon button + menu button; menu opens a full-height sheet with the three links and the wallet controls.

**Demo banner** (when fixture adapter active): full-width strip above header, `--surface-sunk`, 13px: "Demo data. These records are examples and are not on BOT Chain."

**Footer**
- Line 1: "Vestra is a lifecycle record for real-world equipment on BOT Chain."
- Limitations (always visible, 14px muted): "A Vestra record shows what authorized wallets submitted and when. It is not proof of legal ownership, physical condition, location or value."
- Links: Registry · Register · Dashboard · Source code · Contract on explorer (renders "Contract not yet deployed" text when env is empty)
- Theme toggle (System / Light / Dark)
- "MIT License"

---

### 3.1 Home `/`

Main action: look up an asset by ID. Sections (5) use 5 different layout families. Eyebrows used: 1 (section 3).

**1. Hero** (asymmetric split, 7/5 columns, `min-h-[calc(100dvh-64px)]` capped at 760px, `pt-16` desktop)

- Headline: **A service record that travels with the equipment.**
- Subtext: Vestra gives each asset a passport on BOT Chain: registration, inspections, repairs and handovers in one checkable record.
- Primary action: `AssetIdLookup` inline form. Label above input: "Asset ID". Placeholder-free input with helper text below: "Printed under the QR tag, starts with VST-". Button: **Verify**.
- Secondary: text link **Browse the registry** → `/assets`
- Right column: `PassportPlate` with an example record, caption below: "Example record. Not a registered asset."
- Mobile: single column, plate moves below the lookup, plate scales to full width.

**2. The lifecycle loop** (horizontal 4-stage rail, no cards)

- H2: **One record, from install to handover.**
- A horizontal line with four markers, each a verb heading and one sentence:
  - **Register.** An authorized registrar creates the asset and its passport ID on BOT Chain.
  - **Record.** Technicians and inspectors append service and inspection entries with evidence hashes.
  - **Hand over.** The current steward proposes a handover. It completes only when the recipient accepts.
  - **Verify.** Anyone scans the QR tag and reads the record straight from the chain.
- Mobile: the rail turns vertical (line on the left, stages stacked).

**3. What a passport proves** (asymmetric bento, 3 cells: one large left, two stacked right). Eyebrow: "Read this before trusting a record"

- H2: **On-chain doesn't mean true. It means accountable.**
- Large cell (`--accent-wash` fill, `Cube` icon, ends with a mono receipt of the example asset's on-chain fields): **Recorded on BOT Chain.** Which wallet registered the asset, who submitted each record and when, the current status, the registered steward, and every handover. These can't be quietly edited.
- Cell 2 (`--surface`, contains a real example `TimelineEntry` for an inspection): **Claimed by a participant.** An inspector's note that maintenance was done, or a registrar's description of the asset. Vestra shows who made the claim and the evidence hash, not whether it's correct.
- Cell 3 (`--surface-sunk`, `Question` icon): **Outside what Vestra can know.** Legal ownership, the asset's location today, its condition right now, or what it's worth.
- Mobile: three cells stack, large cell first.

**4. Who writes to a passport** (two-column definition list: role on left, permissions on right; one hairline between groups)

- H2: **Four roles, checked by the contract.**
- **Registrar.** Manufacturers, distributors and pilot operators approved by the Vestra administrator. They register assets and set the initial record.
- **Steward.** The wallet currently responsible for the asset. Proposes handovers and reports status changes. Being the steward is an operational role, not legal title.
- **Service provider.** Approved technicians and inspectors. They append maintenance and inspection records signed by their own wallet.
- **Verifier.** Anyone with the link or QR code. No wallet and no account needed.
- Mobile: role name stacks above its description.

**5. Closing band** (full-width split: printable tag left 5 cols, text right 7 cols)

- H2: **Registering equipment for the pilot?**
- Body: Registrar access is granted per organization. Connect the wallet you'll register from to see whether it's approved.
- Button: **Register an asset** → `/register`
- Left: the `PrintTag` for the example asset, captioned "Each asset gets a printable tag like this one."
- Mobile: photo on top, text below.

**Conditional: Registry figures** (renders between 4 and 5 only when chain adapter is live and counts > 0). Plain inline figures, no cards: "Assets registered", "Lifecycle records", "Handovers completed", each a large mono number with an explorer-backed "as of block #…" note.

---

### 3.2 Asset Passport `/assets/[assetId]`

Main action: read the history; if the wallet is permitted, add a record. Layout: 8/4 columns desktop.

**1. Passport header** (left 8 cols)
- Breadcrumb: Registry / `VST-0007`
- H1: asset display name, e.g. "Rooftop inverter, Block C"
- Mono ID row: `VST-0007` + copy button
- `StatusChip`
- Meta line (14px muted): category, type, manufacturer, model (only fields the registrar published)

**2. QR plate** (right 4 cols, sticky on desktop)
- QR code (encodes only `https://<host>/verify/VST-0007`)
- Caption: "Scan to verify this record"
- Buttons: **Download QR** (SVG + PNG) and icon button "Copy link"
- Note (13px muted): "The QR is a pointer to this record. It is not proof by itself."
- Mobile: collapses into a "Show QR" disclosure under the header.

**3. Handover banner** (only when a proposal is active)
- Recipient view: "**Handover waiting for you.** 0x4f2a…91c3 has proposed handing this asset to your wallet. Expires 21 Oct 2026, 14:00." Buttons: **Accept handover**, "View evidence".
- Steward view: "**Handover proposed** to 0x9b10…e7d2. Expires 21 Oct 2026, 14:00." Button: **Cancel proposal**.
- Others: read-only line "A handover to 0x9b10…e7d2 is pending."

**4. Actions row** (only for permitted wallets, computed from on-chain roles)
- **Add record** (primary) opens `RecordSheet`
- **Propose handover** (secondary, steward only) opens `HandoverDialog`
- Hidden entirely for verifiers. No disabled buttons teasing actions people can't take.

**5. Key facts** (`FactList`, 2 columns of key/value pairs, each value tagged with `ProvenanceTag`)
- Registered steward: address chip + "Responsible wallet in Vestra. Not legal title."
- Registrar: address chip
- Registered: date + block + tx link
- Public serial: value, or "Kept private (commitment on-chain)"
- Metadata: URI link + hash chip + availability state ("Available", "Couldn't load metadata. The on-chain record is unaffected.")

**6. Lifecycle timeline** (`Timeline`)
- H2: **History**
- Filter: record-type select ("All records" default)
- Newest first. Each entry: type icon + label, one-line summary, "Submitted by 0x…", date/time (mono), evidence hash chip, tx link. Claim-type entries carry `ProvenanceTag` "Participant claim".
- Corrections: the corrected entry dims to 60% with "Superseded by entry #14" link; the correction shows "Corrects entry #9".
- First 20 entries, then "Show older records".

**7. Limitations** (bottom, `--surface-sunk` block, 14px)
- "**About this record.** Entries show what authorized wallets submitted to BOT Chain and when. Vestra doesn't inspect equipment or check documents. The registered steward is the wallet Vestra recognizes as responsible, which may differ from the legal owner. Off-chain documents can go offline; their hashes stay on-chain so a copy can be checked later."

**States:** skeleton matching header + facts + 4 timeline rows; unknown ID ("No asset with ID VST-0099 is registered on BOT Chain." + lookup field); RPC error ("Couldn't reach BOT Chain. Nothing is wrong with the record; try again." + **Retry**); empty timeline ("No records yet beyond registration.").

---

### 3.3 Public Verification `/verify/[assetId]`

Main action: confirm the record exists and see status. Mobile-first, narrow column, no nav clutter (its own layout: wordmark-only header, no nav, and a footer with the limitations sentence and theme toggle; "Open full passport" sits in the content).

**1. Result block**
- Found: `SealCheck` icon, H1 **Record found on BOT Chain**, line "Read from block #4,812,033 just now" (mono, explorer link).
- Then: asset name, mono ID, `StatusChip`, and a status note naming who recorded the current status and when ("Reported damaged since 27 Aug 2026, recorded by 0x2d71…5b08."), so a verifier can judge the assertion.
- If a handover is pending: "A handover to 0x… is pending. The steward above stays registered until it's accepted."

**2. Key identifiers** (compact `FactList`): Registered steward, Registrar, Registered on, Public serial (if published).

**3. Recent history** (last 3 entries, condensed) + total count line "12 records since 3 Mar 2026". Button: **Open full passport**.

**4. What this confirms** (short, always visible)
- "This confirms the record exists on BOT Chain and shows its current recorded status. It doesn't confirm who legally owns the equipment or its condition right now."

**States (each a full-page answer, not a toast):**
- Loading: skeleton of result block.
- Unknown ID: `MagnifyingGlass` icon, **No asset with this ID.** "VST-0099 isn't registered on Vestra. Check the ID under the QR tag, or the tag may not be a Vestra tag." + lookup field.
- Malformed ID: **That isn't a Vestra asset ID.** "Vestra IDs look like VST-0007."
- Metadata missing: record still shows; inline notice "Description unavailable. The on-chain record is intact; the linked metadata couldn't be loaded."
- RPC error: **Couldn't reach BOT Chain.** "This is a connection problem, not a problem with the asset." + **Retry**.

---

### 3.4 Asset Registry `/assets`

Main action: open a passport.

**1. Header**: H1 **Registry**. Body: "Every asset registered on Vestra. Open one to see its full history."

**2. Search + filters**
- Search input, label "Search by name, asset ID or serial". Typing filters live (debounced); pressing Enter on a complete ID (e.g. VST-0003) jumps straight to the passport.
- Filters: Status (multi-select chips), Category (select).
- All filter state lives in the URL (`?q=&status=&category=`), so a filtered view can be shared. Results dim while new ones load.
- Desktop: search and category on one row, status toggles on the row below (six statuses don't fit beside a usable search box). Mobile: search and category stacked full width, status toggles in a horizontal scroll row.
- "Clear filters" sits on the results count line so it works at every width.

**3. Results**
- Desktop: `RegistryTable` columns: Asset (name + mono ID), Status, Category, Last record (type + relative date), Steward (truncated). Whole row is the link. Zebra off; hairline under header only; row hover `--surface`.
- Mobile: each result is a compact block: name, ID, status chip, last record line. Separated by spacing, no borders.
- Pagination: "Load 25 more".
- Count line: "Showing 25 of 61 assets".

**States:** skeleton rows (6); empty registry ("No assets are registered yet. Registrars can add the first one." + **Register an asset**); no results ("Nothing matches “VST-02”." + "Check the spelling, try the full asset ID, or remove a filter." + "Clear filters"); error with Retry.

---

### 3.5 Register Asset `/register`

Main action: submit a new asset registration. Layout: form 7 cols, live preview 5 cols (sticky).

**Gate states (`RoleGate`)**
- Not connected: H1 **Register an asset**. "Registration is limited to approved registrar wallets. Connect yours to continue." **Connect wallet**.
- Connected, not a registrar: "**This wallet isn't an approved registrar.** 0x4f2a…91c3 doesn't have the registrar role on Vestra. Registrar access is granted by the Vestra administrator." Link to Registry.
- Wrong network: "**Switch network** to register assets." button.

**Form (registrar)**, grouped with H3 headings and one hairline between groups:

1. **The asset**: Display name (required, ≤ 80 chars, helper "Shown publicly, e.g. 'Rooftop inverter, Block C'"), Category (select: Solar inverter, Battery storage, Generator, Charge controller, Other), Type (text), Manufacturer (optional), Model (optional).
2. **Serial number**: Toggle "Publish serial number" (default on). On: Serial (text). Off: Serial + helper "We'll store only a salted hash on-chain. Keep the salt; you'll need it to prove the serial later." with the generated salt shown and a **Copy salt** button.
3. **Steward**: Initial steward wallet (default: connected wallet, with "Use my wallet" link), validated as an address.
4. **Records and evidence**: Metadata URI (optional, https or ipfs), Evidence files (`FileHashInput`: files are hashed in the browser and never uploaded; shows filename + SHA-256 chip per file).
5. **Starting status**: radio Registered / Active, helper "Use Active if the equipment is already installed and running."

**What goes on-chain**: name, category, type, manufacturer, model, serial or serial hash, steward, status, metadata link and evidence hashes are stored on-chain as short public strings, so the verify page can always show what the asset is even if off-chain metadata is down. Longer documents stay behind the metadata link. The page says up front that everything entered is public and permanent. A private serial never leaves the browser: only keccak256(salt, serial) is sent, and the registrar must confirm they saved the salt.

**Preview column**: "What will be public" (plate preview updates live) and "Written to BOT Chain" (list of fields that go on-chain: asset ID, registrar, steward, status, metadata URI, evidence hashes, serial or serial hash).

**Submit flow**: **Review registration** → review panel listing on-chain fields → **Sign and register** → `TxStatus` (Waiting for your wallet → Submitted, tx link → Confirmed). Wallet rejection: "You declined the transaction in your wallet. Nothing was registered." Revert: "The contract rejected this registration: Asset ID already exists." (map known revert reasons to plain sentences).

**Success**: H2 **VST-0012 is registered.** QR plate, **Download QR**, **Open passport**, "Register another".

---

### 3.6 Dashboard `/dashboard`

Main action: clear pending handovers and actions. Roles detected on-chain and shown as small labels next to the wallet ("Registrar", "Steward of 4 assets", "Service provider").

**Gate**: not connected → H1 **Dashboard**, "Connect a wallet to see the assets and actions tied to it." **Connect wallet**.

**Sections (only those relevant to the wallet's roles render):**

1. **Needs your action** (always first if non-empty): incoming handovers (Accept / view passport), outgoing handovers (Cancel, expiry countdown), expired proposals ("Expired 2 days ago, propose again").
2. **In your care** (steward): asset rows (name, ID, status, last record) with "Add record" and "Propose handover" row actions.
3. **Registered by you** (registrar): asset rows, latest record, "Add record" link. Header button **Register an asset**.
4. **Your records** (service provider): last 10 submitted records with asset name, type, date, tx link; button **Add record** opens asset picker then `RecordSheet`.
5. **Recent transactions**: this session's transactions with `TxStatus` (pending / confirmed / failed), tx links.

Desktop: "Needs your action" first; sections 2-4 as tabs when the wallet has 2+ roles, a single titled section otherwise; Recent transactions in a sticky right rail (4 cols).

Row actions ("Add record", "Propose handover") are light accent text links, not bordered buttons, so long lists stay calm. They open the passport with the matching sheet already open (`/assets/VST-0001?do=record`), reusing the passport's tested flows. Accept and cancel happen inline. Dashboard data comes from a wallet-scoped read endpoint (`/api/dashboard?address=`), which an indexer serves in chain mode. Recent transactions are this browser session's writes, kept in sessionStorage.
Mobile: single column, tabs become a segmented control, transactions at the bottom.

**Empty (no roles, no assets)**: "**Nothing here for this wallet yet.** It isn't a registrar or service provider and isn't the steward of any asset. If someone proposes a handover to 0x4f2a…91c3, it will appear here."

---

## 4. Components

| Component | Behavior | Desktop | Mobile (<768px) |
|---|---|---|---|
| `SiteHeader` | Sticky, hairline after scroll (IntersectionObserver sentinel, no scroll listener) | Inline nav, wallet button | Wordmark, wallet icon, menu sheet |
| `WalletButton` | wagmi; states: disconnected, connecting, connected, wrong network | Address + network | Icon-only, address inside menu |
| `DemoBanner` | Renders when fixture adapter active | Single line | Wraps to 2 lines max |
| `AssetIdLookup` | Normalizes input (`vst7` → `VST-0007`), validates format inline, routes to `/verify/[id]` | Input + button in one row | Button below input, full width |
| `PassportPlate` | The nameplate: name, ID, status, steward, registrar, date. Used in Home hero, Register preview, Register success | 10px radius, 1px `--border-strong` rim | Full width |
| `QRPlate` | `qrcode.react` SVG, quiet zone, download SVG/PNG, copy link | Sticky right column | Disclosure |
| `StatusChip` | Icon + label, colors from status table | Same | Same |
| `AddressChip` | Mono, truncated `0x4f2a…91c3`, copy, explorer link, full address in `title` and to screen readers | Hover shows full | Tap opens popover with full + actions |
| `HashChip` | Mono, truncated `sha256:7c1e…a40b`, copy | Same | Same |
| `ProvenanceTag` | "On-chain", "Participant claim", "Not verifiable by Vestra"; neutral text + small icon (`LinkSimple`, `ChatText`, `Question`), no colored dots | Inline after value | Below value |
| `FactList` | `<dl>` key/value with optional `ProvenanceTag` | 2 columns | 1 column |
| `Timeline` / `TimelineEntry` | Vertical rail, type icon on rail, supersede links, type filter | Meta on one line | Meta wraps under summary |
| `RecordSheet` | Radix Dialog. Fields: Record type (segmented for common, select for rest; only types the wallet may submit), Summary (≤ 280, counter), Evidence files (`FileHashInput`), Document URI, Provider ID (optional), New status (only for Status change; only valid transitions offered), Corrects entry (only for Correction). Then `TxStatus` inline | Right drawer, 480px | Bottom sheet, 92dvh, drag handle |
| `HandoverDialog` | Recipient address (validated, not self), Expires in (3 / 7 / 14 / 30 days), Evidence file optional. Fixed note: "This changes the registered steward in Vestra once the recipient accepts. It doesn't transfer legal ownership." | Centered dialog 520px | Bottom sheet |
| `TxStatus` | Steps: Waiting for wallet → Submitted → Confirmed / Failed, plain-language errors, tx link | Inline horizontal | Inline vertical |
| `FormField` | Label above, helper below input, error below helper in status-red with icon; `aria-describedby` wired | Same | Same |
| `FileHashInput` | Drop zone + browse; hashes with Web Crypto; lists file name, size, hash; "Files stay on your device" note | Drop zone | Browse button only |
| `RegistryTable` | Sortable by last record; row is a link | Table | Stacked blocks |
| `FilterBar` | Status chips (toggle), category select, clear | Single row | Horizontal scroll row |
| `RoleGate` | Wraps restricted UI; renders the right gate copy per state | Same | Same |
| `EmptyState` / `ErrorState` | Icon, one heading, one sentence, one action | Left-aligned in content column | Same |
| `Skeleton` | Shape-matched blocks in `--surface-sunk`, subtle opacity pulse (disabled under reduced motion) | Same | Same |
| `Toast` | Only for transient confirmations ("Copied", "Link copied") | Bottom-right | Bottom-center |
| `ThemeToggle` | System / Light / Dark, stored in localStorage (try/catch) | Footer | Footer |

Buttons: Primary (`--accent` bg, `--accent-ink` text), Secondary (`--surface` bg, `--border-strong` border, `--text`), Ghost/text link (`--accent`). Heights 40px (44px on touch). Labels max 3 words, never wrap. Focus ring: 2px `--accent` with 2px offset on every interactive element.

One label per intent across the app: **Verify** (look up), **Register an asset** (create), **Add record**, **Propose handover**, **Accept handover**, **Cancel proposal**, **Open passport** / **Open full passport** (Verify page only), **Connect wallet**, **Retry**.

---

## 5. Tech notes for the build

- Next.js (App Router, TypeScript), Tailwind v4 via `@tailwindcss/postcss`, `next/font` for Geist + Geist Mono.
- `motion` (import from `motion/react`), `@phosphor-icons/react`, Radix primitives, `wagmi` + `viem`, `qrcode.react`.
- Chain config (chain ID, RPC, explorer, contract address) from env only, per PRD section 19. Nothing hardcoded.
- `lib/data` adapter interface: `getAsset`, `listAssets`, `getRecords`, `getRoles`, `getPendingHandover`. Fixture implementation first; chain implementation when contracts exist.
- Server Components for layout and static copy; motion, wallet and forms as client leaves.
- Z-index scale in `lib/z.ts`: header 30, sheet/dialog 50, toast 60.
- Breakpoints: Tailwind defaults (640 / 768 / 1024 / 1280).

---

## 6. Avoid

- Crypto-app clichés: dark mesh gradients, neon glows, purple-blue gradient buttons, glassmorphism, "Web3-powered" copy, token iconography.
- Investment language anywhere: "own", "yield", "tokenized asset", "invest", "NFT". The record is not a token and the steward is not the owner.
- Implying verification Vestra doesn't do: no "Verified asset" badges, no green check on claim-type records, no "certified". The only "found/confirmed" language is about the record existing on-chain.
- Fake traction: no invented counters, no logo walls, no testimonials, no "trusted by".
- Div-based fake dashboards or fake product screenshots; the hero uses the real `PassportPlate` component, labeled as an example.
- Three equal feature cards; a repeated layout family across Home sections; split headers with a floating paragraph.
- Eyebrows over every section (Home uses one), section numbering (`01 / Lifecycle`), "Step 1 / Step 2" labels.
- Em-dashes and en-dashes in any visible string. Middle dots only in the footer link row.
- Decorative status dots; status color without icon and label.
- Placeholder-as-label; disabled buttons for actions the wallet can't take (hide them instead).
- Spinners for page loads (use shape-matched skeletons); toasts for errors (errors live inline where they happened).
- `h-screen`, scroll listeners, animating layout properties, motion without a reduced-motion path.
- Inter, serif display type, a second accent color.
