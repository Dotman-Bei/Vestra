import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";
import { chain } from "./config";

export const appChain = defineChain({
  id: chain.id,
  name: chain.name,
  nativeCurrency: { name: chain.nativeSymbol, symbol: chain.nativeSymbol, decimals: 18 },
  rpcUrls: { default: { http: [chain.rpcUrl] } },
  blockExplorers: chain.explorerUrl
    ? { default: { name: "Explorer", url: chain.explorerUrl } }
    : undefined,
});

export const wagmiConfig = createConfig({
  chains: [appChain],
  connectors: [injected()],
  transports: { [appChain.id]: http(chain.rpcUrl) },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
