import type { Address, AssetStatus, Hex, RecordType } from "../types";
import type { RegistrationInput } from "../registration";
import { assetIdToChain, recordTypeToChain, statusToChain } from "./codec";

/** Builds VestraRegistry call arguments from the app's form values. */

const ZERO32 = `0x${"0".repeat(64)}` as Hex;

function id(assetId: string) {
  const n = assetIdToChain(assetId);
  if (n === null) throw new Error(`Not an asset ID: ${assetId}`);
  return n;
}

export function addRecordArgs(
  assetId: string,
  r: {
    type: RecordType;
    summary: string;
    evidenceHash?: Hex;
    documentUri?: string;
    providerId?: string;
    newStatus?: AssetStatus;
    supersedes?: number;
  },
) {
  return [
    id(assetId),
    {
      recordType: recordTypeToChain(r.type),
      summary: r.summary.trim(),
      evidenceHash: r.evidenceHash ?? ZERO32,
      documentUri: r.documentUri ?? "",
      providerId: r.providerId ?? "",
      newStatus: r.newStatus ? statusToChain(r.newStatus) : 0,
      supersedes: r.supersedes ?? 0,
    },
  ] as const;
}

/** Expiry is a few minutes short of the full period, so wallet clock drift can't push 30 days past the limit. */
export function proposeHandoverArgs(assetId: string, to: Address, days: number, evidenceHash?: Hex) {
  const expiresAt = BigInt(Math.floor(Date.now() / 1000) + days * 86_400 - 300);
  return [id(assetId), to, expiresAt, evidenceHash ?? ZERO32] as const;
}

export function assetArgs(assetId: string) {
  return [id(assetId)] as const;
}

export function registerArgs(input: RegistrationInput) {
  return [
    {
      name: input.name.trim(),
      category: input.category,
      assetType: input.type.trim(),
      manufacturer: input.manufacturer?.trim() ?? "",
      model: input.model?.trim() ?? "",
      publicSerial: input.publicSerial?.trim() ?? "",
      serialCommitment: input.serialCommitment ?? ZERO32,
      steward: input.steward.trim() as Address,
      initialStatus: statusToChain(input.status),
      metadataUri: input.metadataUri?.trim() ?? "",
      metadataHash: ZERO32,
      evidenceHashes: input.evidenceHashes,
    },
  ] as const;
}
