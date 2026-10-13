import type { AssetStatus, RecordType } from "./types";

export function truncateAddress(address: string) {
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function truncateHash(hash: string, prefix = "") {
  if (hash.length < 16) return `${prefix}${hash}`;
  return `${prefix}${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

const ID_PATTERN = /^VST-\d{4,}$/;

/**
 * Normalizes what people type into the lookup field.
 * "vst7", "VST 7", "7" and "VST-0007" all become "VST-0007".
 */
export function normalizeAssetId(input: string): string | null {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, "");
  const match = cleaned.match(/^(?:VST)?-?(\d{1,})$/);
  if (!match) return null;
  return `VST-${match[1].padStart(4, "0")}`;
}

export function isAssetId(value: string) {
  return ID_PATTERN.test(value);
}

/** Dates render in UTC so server and browser output match. */
const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export function formatDate(unixSeconds: number) {
  return dateFmt.format(new Date(unixSeconds * 1000));
}

export function formatDateTime(unixSeconds: number) {
  return `${dateTimeFmt.format(new Date(unixSeconds * 1000)).replace(",", "")} UTC`;
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-GB").format(n);
}

export const STATUS_LABEL: Record<AssetStatus, string> = {
  REGISTERED: "Registered",
  ACTIVE: "Active",
  UNDER_MAINTENANCE: "Under maintenance",
  REPORTED_DAMAGED: "Reported damaged",
  REPORTED_LOST: "Reported lost",
  RETIRED: "Retired",
};

export const RECORD_LABEL: Record<RecordType, string> = {
  INSPECTION: "Inspection",
  MAINTENANCE: "Maintenance",
  WARRANTY: "Warranty update",
  INSTALLATION: "Installation",
  INCIDENT: "Incident",
  STATUS_CHANGE: "Status change",
  HANDOVER: "Handover",
  RETIREMENT: "Retirement",
  CORRECTION: "Correction",
};
