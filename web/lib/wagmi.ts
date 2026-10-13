import { createConfig, http } from "wagmi";
import { injected, mock } from "wagmi/connectors";
import { chain } from "./config";
import { appChain } from "./chain/definition";

export { appChain };

/**
 * Test-only wallet for automated end-to-end runs against a local Anvil node. It's enabled only when
 * NEXT_PUBLIC_E2E_MOCK_WALLET is set AND the configured chain is the local chain (31337), so it can't
 * appear against BOT Chain.
 */
const e2eAccounts = (process.env.NEXT_PUBLIC_E2E_MOCK_WALLET ?? "")
  .split(",")
  .map((a) => a.trim())
  .filter((a): a is `0x${string}` => /^0x[0-9a-fA-F]{40}$/.test(a));
const e2e = chain.id === 31337 && e2eAccounts.length > 0;

/** In e2e runs a test can pick which of the allowed accounts acts, via localStorage "vestra-e2e-account". */
function e2eAccountList(): [`0x${string}`, ...`0x${string}`[]] {
  let chosen: string | null = null;
  try {
    chosen = typeof window === "undefined" ? null : localStorage.getItem("vestra-e2e-account");
  } catch {}
  const pick = e2eAccounts.find((a) => a.toLowerCase() === chosen?.toLowerCase()) ?? e2eAccounts[0];
  return [pick, ...e2eAccounts.filter((a) => a !== pick)];
}

export const wagmiConfig = createConfig({
  chains: [appChain],
  connectors: e2e ? [mock({ accounts: e2eAccountList() }), injected()] : [injected()],
  transports: { [appChain.id]: http(chain.rpcUrl) },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
