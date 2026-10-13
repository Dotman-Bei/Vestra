"use server";

import { refresh } from "next/cache";
import { isAddress } from "viem";
import type { Address, AssetStatus, Hex, LifecycleRecord, RecordType } from "../types";
import { dataSource } from "../config";
import {
  allowedRecordTypes,
  canAcceptHandover,
  canCancelHandover,
  canProposeHandover,
  correctableRecords,
  statusChangeTargets,
  SUMMARY_MAX,
  type ViewerRoles,
} from "../rules";
import { fakeHex, nextBlock, store } from "./fixtures";
import { DEMO_REGISTRARS, DEMO_SERVICE_PROVIDERS } from "./personas";
import { validateRegistration, type RegistrationInput } from "../registration";

/**
 * Demo writes for the fixture adapter. They apply the same rules the registry
 * contract enforces, and answer with the plain-language reason a revert would
 * map to. In chain mode the UI sends real transactions instead.
 */

export type WriteResult = { ok: true; tx: Hex; index?: number; assetId?: string } | { ok: false; error: string };

const DAY = 86_400;
const latency = () => new Promise((r) => setTimeout(r, 900));

function rolesOf(who: Address): ViewerRoles {
  const w = who.toLowerCase();
  return { registrar: DEMO_REGISTRARS.has(w), serviceProvider: DEMO_SERVICE_PROVIDERS.has(w) };
}

function fail(error: string): WriteResult {
  return { ok: false, error };
}

function append(assetId: string, rec: Omit<LifecycleRecord, "index" | "assetId" | "timestamp" | "block" | "tx">) {
  const list = store.records.get(assetId)!;
  const { timestamp, block } = nextBlock();
  const index = list.length + 1;
  const tx = fakeHex(`${assetId}-tx-${index}-${timestamp}`);
  const full: LifecycleRecord = { ...rec, index, assetId, timestamp, block, tx };
  list.push(full);
  const asset = store.assets.get(assetId)!;
  asset.recordCount = list.length;
  asset.lastRecord = { type: full.type, at: timestamp };
  return full;
}

export interface SubmitRecordInput {
  assetId: string;
  actor: Address;
  type: RecordType;
  summary: string;
  evidenceHash?: Hex;
  documentUri?: string;
  providerId?: string;
  newStatus?: AssetStatus;
  supersedes?: number;
}

export async function submitRecord(input: SubmitRecordInput): Promise<WriteResult> {
  if (dataSource !== "fixtures") return fail("Demo writes are disabled.");
  await latency();

  const asset = store.assets.get(input.assetId);
  if (!asset) return fail("No asset with this ID is registered.");
  const records = store.records.get(input.assetId)!;
  const roles = rolesOf(input.actor);

  if (!allowedRecordTypes(asset, input.actor, roles, records).includes(input.type)) {
    return fail("Your wallet isn’t allowed to add this type of record to this asset.");
  }
  const summary = input.summary.trim();
  if (!summary || summary.length > SUMMARY_MAX) return fail(`The summary must be 1 to ${SUMMARY_MAX} characters.`);

  let newStatus: AssetStatus | undefined;
  if (input.type === "STATUS_CHANGE") {
    if (!input.newStatus || !statusChangeTargets(asset.status).includes(input.newStatus)) {
      return fail("That status change isn’t allowed from the asset’s current status.");
    }
    newStatus = input.newStatus;
  }
  if (input.type === "RETIREMENT") newStatus = "RETIRED";

  if (input.type === "CORRECTION") {
    const target = correctableRecords(records, input.actor).find((r) => r.index === input.supersedes);
    if (!target) return fail("You can only correct a record your wallet submitted that hasn’t already been corrected.");
  }

  const rec = append(input.assetId, {
    type: input.type,
    submitter: input.actor,
    summary,
    evidenceHash: input.evidenceHash,
    documentUri: input.documentUri || undefined,
    providerId: input.providerId || undefined,
    newStatus,
    supersedes: input.type === "CORRECTION" ? input.supersedes : undefined,
  });
  if (rec.supersedes) records.find((r) => r.index === rec.supersedes)!.supersededBy = rec.index;
  if (newStatus) asset.status = newStatus;
  if (newStatus === "RETIRED") asset.pendingHandover = undefined;

  refresh();
  return { ok: true, tx: rec.tx!, index: rec.index };
}

export async function proposeHandover(input: {
  assetId: string;
  actor: Address;
  to: string;
  days: number;
  evidenceHash?: Hex;
}): Promise<WriteResult> {
  if (dataSource !== "fixtures") return fail("Demo writes are disabled.");
  await latency();

  const asset = store.assets.get(input.assetId);
  if (!asset) return fail("No asset with this ID is registered.");
  const now = Math.floor(Date.now() / 1000);
  if (!canProposeHandover(asset, input.actor, now)) {
    return fail("Only the registered steward can propose a handover, and only one can be open at a time.");
  }
  if (!isAddress(input.to)) return fail("The recipient isn’t a valid wallet address.");
  if (input.to.toLowerCase() === input.actor.toLowerCase()) return fail("You can’t hand an asset over to your own wallet.");
  if (![3, 7, 14, 30].includes(input.days)) return fail("Choose an expiry of 3, 7, 14 or 30 days.");

  const tx = fakeHex(`${input.assetId}-propose-${now}`);
  asset.pendingHandover = {
    from: asset.steward,
    to: input.to as Address,
    expiresAt: now + input.days * DAY,
    evidenceHash: input.evidenceHash,
    proposedTx: tx,
  };
  refresh();
  return { ok: true, tx };
}

export async function acceptHandover(input: { assetId: string; actor: Address }): Promise<WriteResult> {
  if (dataSource !== "fixtures") return fail("Demo writes are disabled.");
  await latency();

  const asset = store.assets.get(input.assetId);
  if (!asset) return fail("No asset with this ID is registered.");
  const now = Math.floor(Date.now() / 1000);
  if (!asset.pendingHandover || asset.pendingHandover.expiresAt <= now) {
    return fail("This handover has expired or was cancelled. Ask the steward to propose it again.");
  }
  if (!canAcceptHandover(asset, input.actor, now)) return fail("Only the nominated recipient can accept this handover.");

  const h = asset.pendingHandover;
  const rec = append(input.assetId, {
    type: "HANDOVER",
    submitter: input.actor,
    summary: "Registered steward changed after the recipient accepted.",
    evidenceHash: h.evidenceHash,
    newSteward: input.actor,
  });
  asset.steward = input.actor;
  asset.pendingHandover = undefined;
  refresh();
  return { ok: true, tx: rec.tx!, index: rec.index };
}

export async function cancelHandover(input: { assetId: string; actor: Address }): Promise<WriteResult> {
  if (dataSource !== "fixtures") return fail("Demo writes are disabled.");
  await latency();

  const asset = store.assets.get(input.assetId);
  if (!asset) return fail("No asset with this ID is registered.");
  if (!canCancelHandover(asset, input.actor)) return fail("Only the steward who proposed this handover can cancel it.");
  asset.pendingHandover = undefined;
  refresh();
  return { ok: true, tx: fakeHex(`${input.assetId}-cancel-${Date.now()}`) };
}

export async function registerAsset(input: RegistrationInput & { actor: Address }): Promise<WriteResult> {
  if (dataSource !== "fixtures") return fail("Demo writes are disabled.");
  await latency();

  if (!rolesOf(input.actor).registrar) return fail("Only approved registrar wallets can register assets.");
  const errors = validateRegistration(input);
  const firstError = Object.values(errors)[0];
  if (firstError) return fail(firstError);

  // Sequential IDs, as the contract assigns them.
  const used = new Set(store.assets.keys());
  const idFor = (n: number) => `VST-${String(n).padStart(4, "0")}`;
  let n = Math.max(...[...used].map((id) => Number(id.slice(4)))) + 1;
  while (used.has(idFor(n))) n++;
  const id = idFor(n);

  const { timestamp, block } = nextBlock();
  const tx = fakeHex(`${id}-reg-${timestamp}`);
  const uri = input.metadataUri?.trim() || undefined;
  store.assets.set(id, {
    id,
    name: input.name.trim(),
    category: input.category,
    type: input.type.trim(),
    manufacturer: input.manufacturer?.trim() || undefined,
    model: input.model?.trim() || undefined,
    publicSerial: input.publicSerial?.trim() || null,
    serialCommitment: input.serialCommitment,
    steward: input.steward.trim() as Address,
    registrar: input.actor,
    status: input.status,
    registeredAt: timestamp,
    registeredBlock: block,
    registeredTx: tx,
    metadataUri: uri,
    evidenceHashes: input.evidenceHashes,
    recordCount: 0,
  });
  store.records.set(id, []);
  store.metadata.set(id, uri ? "available" : "none");
  refresh();
  return { ok: true, tx, assetId: id };
}
