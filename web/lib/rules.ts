import type { Address, Asset, AssetStatus, LifecycleRecord, RecordType } from "./types";

/**
 * Permission and state-machine rules. The registry contract is the authority;
 * these mirror its rules so the UI only offers actions that would succeed, and
 * so the fixture adapter rejects what the contract would reject.
 */

export interface ViewerRoles {
  registrar: boolean;
  serviceProvider: boolean;
}

export const NO_ROLES: ViewerRoles = { registrar: false, serviceProvider: false };

export const STATUS_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  REGISTERED: ["ACTIVE", "RETIRED"],
  ACTIVE: ["UNDER_MAINTENANCE", "REPORTED_DAMAGED", "REPORTED_LOST", "RETIRED"],
  UNDER_MAINTENANCE: ["ACTIVE", "REPORTED_DAMAGED", "RETIRED"],
  REPORTED_DAMAGED: ["UNDER_MAINTENANCE", "ACTIVE", "RETIRED"],
  REPORTED_LOST: ["ACTIVE", "RETIRED"],
  RETIRED: [],
};

/** Status changes go through STATUS_CHANGE records; RETIRED is reached through a RETIREMENT record. */
export function statusChangeTargets(status: AssetStatus): AssetStatus[] {
  return STATUS_TRANSITIONS[status].filter((s) => s !== "RETIRED");
}

const same = (a?: string | null, b?: string | null) => !!a && !!b && a.toLowerCase() === b.toLowerCase();

export function isSteward(asset: Asset, who: Address | null) {
  return same(asset.steward, who);
}
export function isAssetRegistrar(asset: Asset, who: Address | null, roles: ViewerRoles) {
  // A revoked registrar keeps its past records but can't act on the asset any more.
  return roles.registrar && same(asset.registrar, who);
}

/** Record types this wallet may append to this asset. HANDOVER records only come from the handover flow. */
export function allowedRecordTypes(
  asset: Asset,
  who: Address | null,
  roles: ViewerRoles,
  records: LifecycleRecord[],
): RecordType[] {
  if (!who) return [];
  const types = new Set<RecordType>();
  const retired = asset.status === "RETIRED";

  if (roles.serviceProvider && !retired) {
    ["INSPECTION", "MAINTENANCE", "INSTALLATION", "INCIDENT"].forEach((t) => types.add(t as RecordType));
  }
  if (isSteward(asset, who) && !retired) {
    types.add("INCIDENT");
    if (statusChangeTargets(asset.status).length) types.add("STATUS_CHANGE");
    types.add("RETIREMENT");
  }
  if (isAssetRegistrar(asset, who, roles) && !retired) {
    types.add("WARRANTY");
    types.add("INSTALLATION");
    if (statusChangeTargets(asset.status).length) types.add("STATUS_CHANGE");
  }
  // Anyone may correct a record they submitted themselves, even after retirement.
  if (correctableRecords(records, who).length) types.add("CORRECTION");

  const order: RecordType[] = [
    "INSPECTION",
    "MAINTENANCE",
    "INSTALLATION",
    "WARRANTY",
    "INCIDENT",
    "STATUS_CHANGE",
    "RETIREMENT",
    "CORRECTION",
  ];
  return order.filter((t) => types.has(t));
}

export function correctableRecords(records: LifecycleRecord[], who: Address | null) {
  return records.filter(
    (r) => same(r.submitter, who) && r.supersededBy === undefined && r.type !== "HANDOVER" && r.type !== "CORRECTION",
  );
}

export function canProposeHandover(asset: Asset, who: Address | null, nowSeconds: number) {
  return (
    isSteward(asset, who) &&
    asset.status !== "RETIRED" &&
    !(asset.pendingHandover && asset.pendingHandover.expiresAt > nowSeconds)
  );
}

export function canAcceptHandover(asset: Asset, who: Address | null, nowSeconds: number) {
  const h = asset.pendingHandover;
  return !!h && h.expiresAt > nowSeconds && same(h.to, who) && same(h.from, asset.steward);
}

export function canCancelHandover(asset: Asset, who: Address | null) {
  return !!asset.pendingHandover && isSteward(asset, who);
}

export const SUMMARY_MAX = 280;
