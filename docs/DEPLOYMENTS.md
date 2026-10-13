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

**Status: development deployment only.** The deployer's private key was exposed in a development session log, so anyone with that log could act as admin and grant roles. Use this address for testing the app against a live network. Before onboarding real pilot assets, redeploy from a fresh wallet with a multisig admin, and record the new address here.

Broadcast receipts: `contracts/broadcast/Deploy.s.sol/968/`.

## BOT Mainnet (chain 677)

Not deployed.
