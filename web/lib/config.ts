/**
 * Environment-driven chain configuration.
 *
 * BOT Chain network values (chain ID, RPC, explorer) must be taken from the
 * official BOT Chain documentation at deploy time (PRD section 19). Nothing
 * here is hardcoded: when the env is empty the app targets a local Hardhat
 * node, which is what contract development uses.
 */

const env = {
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
  chainName: process.env.NEXT_PUBLIC_CHAIN_NAME,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
  explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL,
  registryAddress: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS,
  dataSource: process.env.NEXT_PUBLIC_DATA_SOURCE,
  repoUrl: process.env.NEXT_PUBLIC_REPO_URL,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
};

export const chainConfigured = Boolean(env.chainId && env.rpcUrl);

export const chain = {
  id: chainConfigured ? Number(env.chainId) : 31337,
  name: chainConfigured ? (env.chainName ?? "BOT Chain") : "Local development chain",
  rpcUrl: chainConfigured ? env.rpcUrl! : "http://127.0.0.1:8545",
  explorerUrl: env.explorerUrl?.replace(/\/$/, "") || null,
  nativeSymbol: process.env.NEXT_PUBLIC_NATIVE_SYMBOL || "ETH",
};

export const registryAddress = (env.registryAddress || null) as `0x${string}` | null;

/** "fixtures" serves labeled example data; "chain" reads the deployed registry. */
export const dataSource: "fixtures" | "chain" =
  env.dataSource === "chain" && registryAddress ? "chain" : "fixtures";

export const repoUrl = env.repoUrl || null;
export const siteUrl = (env.siteUrl || "http://localhost:3000").replace(/\/$/, "");

export function explorerTx(hash: string) {
  return chain.explorerUrl ? `${chain.explorerUrl}/tx/${hash}` : null;
}
export function explorerAddress(address: string) {
  return chain.explorerUrl ? `${chain.explorerUrl}/address/${address}` : null;
}
export function explorerBlock(block: number) {
  return chain.explorerUrl ? `${chain.explorerUrl}/block/${block}` : null;
}
