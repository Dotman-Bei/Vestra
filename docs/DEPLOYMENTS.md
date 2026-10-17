# Deployments

## Bohr Testnet (chain 968)

| | |
|---|---|
| Contract | `VestraRegistry` |
| Address | [`0xEa3f5Bf22DEAe2E7bd0Cb14c741e301d9c2E632A`](https://scan.bohr.life/address/0xEa3f5Bf22DEAe2E7bd0Cb14c741e301d9c2E632A) |
| Deploy transaction | [`0xb5b2060673253cd43bde55f27160d065fe2e08be3114e55877a0ae0f6465e7aa`](https://scan.bohr.life/tx/0xb5b2060673253cd43bde55f27160d065fe2e08be3114e55877a0ae0f6465e7aa) |
| Block | 26,717,757 |
| Date | 2026-10-13 |
| Source verification | Verified on the Bohr explorer (Blockscout) |
| Compiler | solc 0.8.28, optimizer 200 runs, via-IR, EVM `cancun` |
| Default admin | `0x2e32a4d53628111125BC1b97D4D1f55d12aCe0A7` (the deployer), 2-day admin transfer delay |
| Roles granted at deploy | None |

### Role changes

| Date | Change | Wallet | Transaction |
|---|---|---|---|
| 2026-10-13 | Granted `REGISTRAR_ROLE` | `0x2e32a4d53628111125BC1b97D4D1f55d12aCe0A7` | [`0x0506…0791`](https://scan.bohr.life/tx/0x050688504a10713e3dadc356dba79c5c124299072e50c2820674eb0a37690791) |
| 2026-10-13 | Granted `SERVICE_PROVIDER_ROLE` | `0x2e32a4d53628111125BC1b97D4D1f55d12aCe0A7` | [`0x62d6…6731`](https://scan.bohr.life/tx/0x62d6279d07aa3c87c77d14d4d205bec4f5be0dc8c4c3addbc09066495bcf6731) |

**Status: development deployment only.** The deployer's private key was exposed in a development session log, so anyone with that log could act as admin and grant roles. Use this address for testing the app against a live network. Before onboarding real pilot assets, redeploy from a fresh wallet with a multisig admin, and record the new address here.

Broadcast receipts: `contracts/broadcast/Deploy.s.sol/968/`.

## BOT Mainnet (chain 677)

| | |
|---|---|
| Contract | `VestraRegistry` |
| Address | [`0x560Ec94e3c74F41F05352e535a75E2d16dFB7CdE`](https://scan.botchain.ai/address/0x560Ec94e3c74F41F05352e535a75E2d16dFB7CdE) |
| Deploy transaction | [`0xffcca116fd6827306bb08fca894c2f1b4a0662bc77cf63c07aef2154bfc52f9a`](https://scan.botchain.ai/tx/0xffcca116fd6827306bb08fca894c2f1b4a0662bc77cf63c07aef2154bfc52f9a) |
| Block | 26,994,296 |
| Date | 2026-10-17 |
| Source verification | Verified on the BOT Mainnet explorer (Blockscout) |
| Compiler | solc 0.8.28, optimizer 200 runs, via-IR, EVM `cancun` |
| Default admin | `0x3dB2d88263EA4c86Bac7abBC5Edb77Fac77d41B5` (fresh deployer wallet, never exposed), 2-day admin transfer delay |
| Roles granted at deploy | None |
| Gas used | 3,416,045 at 20 gwei (~0.068 BOT) |

The admin is a single wallet, not a multisig. Move admin to a multisig before the pilot grows, using `beginDefaultAdminTransfer` (2-day delay).

Broadcast receipts: `contracts/broadcast/Deploy.s.sol/677/`.
