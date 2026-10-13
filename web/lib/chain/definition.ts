import { defineChain } from "viem";
import { chain } from "../config";

/** The configured network as a viem chain. Shared by server reads and the wallet config. */
export const appChain = defineChain({
  id: chain.id,
  name: chain.name,
  nativeCurrency: { name: chain.nativeSymbol, symbol: chain.nativeSymbol, decimals: 18 },
  rpcUrls: { default: { http: [chain.rpcUrl] } },
  blockExplorers: chain.explorerUrl ? { default: { name: "Explorer", url: chain.explorerUrl } } : undefined,
});
