import type { Address, Asset, AssetStatus, Hex, LifecycleRecord, RecordType } from "../types";
import { DEMO_WALLETS as W } from "./personas";

/**
 * Example data for the fixture adapter. Every page shows the "Demo data"
 * banner while this is in use. None of these assets exist on BOT Chain.
 */

/** Deterministic pseudo-hash so example data is stable across reloads. */
export function fakeHex(seed: string, bytes = 32): Hex {
  let h1 = 0x811c9dc5;
  let out = "";
  while (out.length < bytes * 2) {
    for (let i = 0; i < seed.length; i++) {
      h1 ^= seed.charCodeAt(i) + out.length;
      h1 = Math.imul(h1, 0x01000193) >>> 0;
    }
    out += h1.toString(16).padStart(8, "0");
  }
  return `0x${out.slice(0, bytes * 2)}`;
}

const DAY = 86_400;
const BASE_TIME = 1_767_225_600; // 1 Jan 2026 00:00 UTC
const BASE_BLOCK = 3_960_000;
const at = (day: number, hour = 9) => BASE_TIME + day * DAY + hour * 3600;
const blockAt = (t: number) => BASE_BLOCK + Math.floor((t - BASE_TIME) / 3);

/** A registrar whose role has since been revoked. Its records stay in the history. */
const FORMER_REGISTRAR: Address = "0x6a3e19c0b5d7f2a84e1c9b3d0f6a2e8c4b7d5f19";

interface Seed {
  id: string;
  name: string;
  category: string;
  type: string;
  manufacturer?: string;
  model?: string;
  serial: string | null;
  steward: Address;
  registrar?: Address;
  day: number;
  metadata?: "available" | "unavailable" | "none";
  records: Array<{
    type: RecordType;
    by: Address;
    day: number;
    summary: string;
    newStatus?: AssetStatus;
    newSteward?: Address;
    supersedes?: number;
    evidence?: boolean;
    providerId?: string;
  }>;
  pendingTo?: Address;
}

const R = W.registrar;
const S = W.service;

const SEEDS: Seed[] = [
  {
    id: "VST-0001",
    name: "Battery cabinet, Unit 2",
    category: "Battery storage",
    type: "LFP cabinet, 100 kWh",
    manufacturer: "Norvik Power",
    model: "NV-100C",
    serial: "NV100C-23-08841",
    steward: W.stewardA,
    day: 40,
    records: [
      { type: "INSTALLATION", by: R, day: 41, summary: "Installed and commissioned in the Unit 2 plant room. Firmware 3.4.1.", evidence: true },
      { type: "STATUS_CHANGE", by: R, day: 41, summary: "Commissioning tests passed.", newStatus: "ACTIVE" },
      { type: "INSPECTION", by: S, day: 132, summary: "Quarterly inspection. Cell voltages balanced, enclosure sealed, no alarms.", evidence: true, providerId: "SolarServ field team 3" },
      { type: "MAINTENANCE", by: S, day: 180, summary: "Replaced cabinet air filter and cleared a fan-speed warning.", evidence: true, providerId: "SolarServ field team 3" },
      { type: "INSPECTION", by: S, day: 223, summary: "Quarterly inspection. Thermal scan normal.", evidence: true, providerId: "SolarServ field team 3" },
    ],
  },
  {
    id: "VST-0002",
    name: "Rooftop inverter, Block A",
    category: "Solar inverter",
    type: "String inverter, 3-phase",
    manufacturer: "Halden Energy",
    model: "HX-50",
    serial: "HX50-2291-0388",
    steward: W.stewardA,
    day: 52,
    records: [
      { type: "INSTALLATION", by: R, day: 53, summary: "Mounted on the Block A roof, 4 strings connected.", evidence: true },
      { type: "STATUS_CHANGE", by: R, day: 54, summary: "Grid connection approved.", newStatus: "ACTIVE" },
      { type: "INCIDENT", by: W.stewardA, day: 225, summary: "Tripped on a ground fault after the storm on 14 Aug.", evidence: true },
      { type: "STATUS_CHANGE", by: W.stewardA, day: 225, summary: "Taken offline pending repair.", newStatus: "UNDER_MAINTENANCE" },
      { type: "MAINTENANCE", by: S, day: 229, summary: "Isolated a damaged DC string connector. Replacement part ordered.", evidence: true, providerId: "SolarServ field team 1" },
    ],
  },
  {
    id: "VST-0003",
    name: "Rooftop inverter, Block B",
    category: "Solar inverter",
    type: "String inverter, 3-phase",
    manufacturer: "Halden Energy",
    model: "HX-50",
    serial: "HX50-2291-0402",
    steward: W.stewardA,
    day: 52,
    records: [
      { type: "INSTALLATION", by: R, day: 53, summary: "Mounted on the Block B roof, 4 strings connected.", evidence: true },
      { type: "STATUS_CHANGE", by: R, day: 54, summary: "Grid connection approved.", newStatus: "ACTIVE" },
      { type: "WARRANTY", by: R, day: 90, summary: "Warranty extended to 10 years under the site service plan.", evidence: true },
      { type: "INSPECTION", by: S, day: 210, summary: "Annual inspection. Terminals torqued, fans cleaned, no faults logged.", evidence: true, providerId: "SolarServ field team 1" },
    ],
    pendingTo: W.stewardB,
  },
  {
    id: "VST-0004",
    name: "Standby generator, Clinic East",
    category: "Generator",
    type: "Diesel standby, 60 kVA",
    manufacturer: "Arclight Systems",
    model: "AG-60S",
    serial: "AG60S-0917-2204",
    steward: W.stewardB,
    registrar: FORMER_REGISTRAR,
    day: 12,
    records: [
      { type: "INSTALLATION", by: FORMER_REGISTRAR, day: 14, summary: "Installed with automatic transfer switch on the clinic main board.", evidence: true },
      { type: "STATUS_CHANGE", by: FORMER_REGISTRAR, day: 15, summary: "Load test passed.", newStatus: "ACTIVE" },
      { type: "HANDOVER", by: W.stewardB, day: 120, summary: "Registered steward changed after the recipient accepted.", newSteward: W.stewardB, evidence: true },
      { type: "MAINTENANCE", by: S, day: 170, summary: "Oil and filter change at 250 run hours.", evidence: true, providerId: "Eastside Power Services" },
      { type: "CORRECTION", by: S, day: 171, summary: "Run hours were 520, not 250. Work done is unchanged.", supersedes: 4, providerId: "Eastside Power Services" },
      { type: "INSPECTION", by: S, day: 244, summary: "Load test at 75% for 30 minutes. Passed.", evidence: true, providerId: "Eastside Power Services" },
    ],
  },
  {
    id: "VST-0005",
    name: "Charge controller, Pump house",
    category: "Charge controller",
    type: "MPPT controller, 48 V",
    manufacturer: "Norvik Power",
    model: "MC-80",
    serial: "MC80-22-11907",
    steward: W.stewardB,
    day: 66,
    records: [
      { type: "INSTALLATION", by: R, day: 67, summary: "Installed with the borehole pump array.", evidence: true },
      { type: "STATUS_CHANGE", by: R, day: 67, summary: "Pump running on solar supply.", newStatus: "ACTIVE" },
      { type: "INCIDENT", by: W.stewardB, day: 238, summary: "Water found inside the enclosure after flooding.", evidence: true },
      { type: "STATUS_CHANGE", by: W.stewardB, day: 238, summary: "Unit isolated. Not safe to operate.", newStatus: "REPORTED_DAMAGED" },
    ],
  },
  {
    id: "VST-0006",
    name: "Battery cabinet, Unit 1",
    category: "Battery storage",
    type: "Lead-acid bank, 48 V",
    manufacturer: "Norvik Power",
    model: "NV-48L",
    serial: "NV48L-19-02215",
    steward: W.stewardA,
    day: 3,
    records: [
      { type: "INSTALLATION", by: R, day: 3, summary: "Existing bank registered for tracking until replacement.", evidence: true },
      { type: "STATUS_CHANGE", by: R, day: 3, summary: "In service.", newStatus: "ACTIVE" },
      { type: "INSPECTION", by: S, day: 95, summary: "Capacity test: well below rated capacity. Replacement advised.", evidence: true, providerId: "SolarServ field team 3" },
      { type: "RETIREMENT", by: W.stewardA, day: 140, summary: "Decommissioned and collected for recycling.", newStatus: "RETIRED", evidence: true },
    ],
  },
  {
    id: "VST-0008",
    name: "Hybrid inverter, Farm office",
    category: "Solar inverter",
    type: "Hybrid inverter, single-phase",
    manufacturer: "Halden Energy",
    serial: null,
    steward: W.stewardB,
    day: 270,
    metadata: "unavailable",
    records: [],
  },
  {
    id: "VST-0009",
    name: "Portable generator, Site 4",
    category: "Generator",
    type: "Petrol portable, 7 kVA",
    manufacturer: "Arclight Systems",
    model: "AP-7",
    serial: "AP7-0623-5530",
    steward: W.stewardA,
    day: 100,
    records: [
      { type: "INSTALLATION", by: R, day: 100, summary: "Assigned to the Site 4 maintenance crew." },
      { type: "STATUS_CHANGE", by: R, day: 100, summary: "In use.", newStatus: "ACTIVE" },
      { type: "INCIDENT", by: W.stewardA, day: 247, summary: "Missing from the Site 4 store during the weekly check. Police report filed.", evidence: true },
      { type: "STATUS_CHANGE", by: W.stewardA, day: 247, summary: "Reported missing.", newStatus: "REPORTED_LOST" },
    ],
  },
];

export interface FixtureStore {
  assets: Map<string, Asset>;
  records: Map<string, LifecycleRecord[]>;
  metadata: Map<string, "available" | "unavailable" | "none">;
}

function build(): FixtureStore {
  const assets = new Map<string, Asset>();
  const records = new Map<string, LifecycleRecord[]>();
  const metadata = new Map<string, "available" | "unavailable" | "none">();
  const now = Math.floor(Date.now() / 1000);

  for (const s of SEEDS) {
    const registeredAt = at(s.day, 8);
    const list: LifecycleRecord[] = s.records.map((r, i) => {
      const t = at(r.day, 10 + i);
      return {
        index: i + 1,
        assetId: s.id,
        type: r.type,
        submitter: r.by,
        timestamp: t,
        block: blockAt(t),
        tx: fakeHex(`${s.id}-tx-${i}`),
        summary: r.summary,
        evidenceHash: r.evidence ? fakeHex(`${s.id}-ev-${i}`) : undefined,
        documentUri: r.evidence ? `ipfs://${fakeHex(`${s.id}-doc-${i}`).slice(2, 48)}` : undefined,
        providerId: r.providerId,
        supersedes: r.supersedes,
        newStatus: r.newStatus,
        newSteward: r.newSteward,
      };
    });
    for (const r of list) {
      if (r.supersedes) {
        const target = list.find((x) => x.index === r.supersedes);
        if (target) target.supersededBy = r.index;
      }
    }
    const status: AssetStatus =
      [...list].reverse().find((r) => r.newStatus)?.newStatus ?? "REGISTERED";
    const last = list.at(-1);

    assets.set(s.id, {
      id: s.id,
      name: s.name,
      category: s.category,
      type: s.type,
      manufacturer: s.manufacturer,
      model: s.model,
      publicSerial: s.serial,
      serialCommitment: s.serial === null ? fakeHex(`${s.id}-serial`) : undefined,
      steward: s.steward,
      registrar: s.registrar ?? R,
      status,
      registeredAt,
      registeredBlock: blockAt(registeredAt),
      registeredTx: fakeHex(`${s.id}-reg`),
      metadataUri: s.metadata === "none" ? undefined : `ipfs://${fakeHex(`${s.id}-meta`).slice(2, 48)}`,
      metadataHash: s.metadata === "none" ? undefined : fakeHex(`${s.id}-metahash`),
      evidenceHashes: [fakeHex(`${s.id}-regev`)],
      recordCount: list.length,
      lastRecord: last ? { type: last.type, at: last.timestamp } : undefined,
      pendingHandover: s.pendingTo
        ? {
            from: s.steward,
            to: s.pendingTo,
            expiresAt: now + 5 * DAY,
            evidenceHash: fakeHex(`${s.id}-handover`),
            proposedTx: fakeHex(`${s.id}-handover-tx`),
          }
        : undefined,
    });
    records.set(s.id, list);
    metadata.set(s.id, s.metadata ?? "available");
  }
  return { assets, records, metadata };
}

// Kept on globalThis so demo writes survive hot reloads in development.
const g = globalThis as unknown as { __vestraFixtures?: FixtureStore };
export const store: FixtureStore = (g.__vestraFixtures ??= build());

export function nextBlock() {
  const t = Math.floor(Date.now() / 1000);
  return { timestamp: t, block: blockAt(t) };
}
