import { isAddress } from "viem";
import type { NextRequest } from "next/server";
import { ChainReadError, getDashboard } from "@/lib/data";

/** Wallet-scoped dashboard data. Read-only; the chain stays the source of truth. */
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address") ?? "";
  if (!isAddress(address)) return Response.json({ error: "Invalid wallet address." }, { status: 400 });
  try {
    return Response.json(await getDashboard(address), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    if (e instanceof ChainReadError) return Response.json({ error: e.message }, { status: 503 });
    throw e;
  }
}
