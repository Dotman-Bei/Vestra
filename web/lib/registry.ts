import type { Asset, AssetStatus } from "./types";
import { ASSET_STATUSES } from "./types";

export const PAGE_SIZE = 25;

export interface RegistryQuery {
  q: string;
  statuses: AssetStatus[];
  category: string;
  show: number;
}

type Params = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Reads registry filters from the URL. Unknown values are ignored rather than erroring. */
export function parseRegistryQuery(params: Params): RegistryQuery {
  const statuses = first(params.status)
    .split(",")
    .filter((s): s is AssetStatus => (ASSET_STATUSES as readonly string[]).includes(s));
  const show = Math.max(PAGE_SIZE, Math.min(1000, Number(first(params.show)) || PAGE_SIZE));
  return { q: first(params.q).trim().slice(0, 80), statuses, category: first(params.category).slice(0, 80), show };
}

export function toSearchString(query: Partial<RegistryQuery>) {
  const p = new URLSearchParams();
  if (query.q) p.set("q", query.q);
  if (query.statuses?.length) p.set("status", query.statuses.join(","));
  if (query.category) p.set("category", query.category);
  if (query.show && query.show > PAGE_SIZE) p.set("show", String(query.show));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Matches name, asset ID (with or without the VST- prefix) and public serial. Most recent activity first. */
export function filterAssets(assets: Asset[], query: RegistryQuery) {
  const needle = query.q.toLowerCase().replace(/\s+/g, "");
  const matches = assets.filter((a) => {
    if (query.statuses.length && !query.statuses.includes(a.status)) return false;
    if (query.category && a.category !== query.category) return false;
    if (!needle) return true;
    const id = a.id.toLowerCase();
    const digits = /^\d+$/.test(needle) ? needle.replace(/^0+/, "") : "";
    return (
      id.includes(needle) ||
      (digits !== "" && id.replace("vst-", "").replace(/^0+/, "") === digits) ||
      a.name.toLowerCase().replace(/\s+/g, "").includes(needle) ||
      (a.publicSerial ?? "").toLowerCase().includes(needle)
    );
  });
  const activity = (a: Asset) => a.lastRecord?.at ?? a.registeredAt;
  return matches.sort((x, y) => activity(y) - activity(x));
}

export function categoriesOf(assets: Asset[]) {
  return [...new Set(assets.map((a) => a.category))].sort();
}
