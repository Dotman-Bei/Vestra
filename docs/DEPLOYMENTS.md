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

### Team test run (2026-10-17)

A labeled end-to-end test of the deployed product, run by the Vestra team with **team test wallets**. It shows every feature works on BOT Mainnet. **It is not user activity and is not pilot usage.** The asset is named "Vestra team test asset (not real equipment)" and every record summary starts with "TEAM TEST:".

Asset: [VST-0001](https://vestra-ashy.vercel.app/assets/VST-0001). Script: `contracts/script/team-test-run.sh`.

**Team test wallets**

| Role in the test | Wallet |
|---|---|
| Registrar | [`0x811C46a24dc4d77B19F856c0F84F5C15E78471CC`](https://scan.botchain.ai/address/0x811C46a24dc4d77B19F856c0F84F5C15E78471CC) |
| Service provider | [`0x1684C93A6023af220011AEf1cE040c341331C3E7`](https://scan.botchain.ai/address/0x1684C93A6023af220011AEf1cE040c341331C3E7) |
| Steward | [`0x97FAe9Fa81Ae6eeaBBb27C41765Dc9c3997F37aa`](https://scan.botchain.ai/address/0x97FAe9Fa81Ae6eeaBBb27C41765Dc9c3997F37aa) |
| Handover recipient (steward after the test) | [`0x8b67bef2420ffEfBf8564dCc334DBC2F8C49d048`](https://scan.botchain.ai/address/0x8b67bef2420ffEfBf8564dCc334DBC2F8C49d048) |
| Service provider 2 | [`0xa510F9a2F716be0bEFD864fEedF51f5F34d99bBc`](https://scan.botchain.ai/address/0xa510F9a2F716be0bEFD864fEedF51f5F34d99bBc) |

**Setup by the admin** (role grants)

| Change | Transaction |
|---|---|
| `REGISTRAR_ROLE` to the test registrar | [`0x0273…e013`](https://scan.botchain.ai/tx/0x02732161f2cbe48ee989bf04f8f78e862ccea4478c91439ba047f157fc77e013) |
| `SERVICE_PROVIDER_ROLE` to test service provider | [`0xe2f9…9b6b`](https://scan.botchain.ai/tx/0xe2f941cd3c0df1910801978196f6122b1df87dd0373f89ba542ba82d21949b6b) |
| `SERVICE_PROVIDER_ROLE` to test service provider 2 | [`0x5d8c…a67a`](https://scan.botchain.ai/tx/0x5d8c8f29a5d9dab42e498a826d1a158ec201032d8b4763ea4591c34b9c74a67a) |

**The 10 test transactions**

| # | Wallet | Action | Gas | Transaction |
|---|---|---|---|---|
| 1 | Registrar | Register VST-0001 | 271,766 | [`0x288a…1151`](https://scan.botchain.ai/tx/0x288a696e1f648ccdec644e810000759b97af990b2f25cf4f4bd21d8f5f8b1151) |
| 2 | Registrar | Installation record | 183,549 | [`0x8843…b589`](https://scan.botchain.ai/tx/0x8843398a3f78b3d597025b8afe96411b53343ab29308420b9861368ff146b589) |
| 3 | Registrar | Status change to Active | 155,059 | [`0xfcae…c90e`](https://scan.botchain.ai/tx/0xfcae9d51eccad3dfd159b9fcb4736e37a4ac85f08eba6c8c7743e0941026c90e) |
| 4 | Service provider | Inspection record | 167,233 | [`0x8559…7bbc`](https://scan.botchain.ai/tx/0x855993bba196386f6aaced70e8031fd8f12fc7c5ebcff18878b6a8eda44b7bbc) |
| 5 | Service provider | Maintenance record | 167,287 | [`0x489b…3b17`](https://scan.botchain.ai/tx/0x489b2f4bc683535d4ce11ba26cddde1fa3bb7cfa0bfbeedaa316cd3b694c3b17) |
| 6 | Service provider | Correction superseding record 4 | 176,930 | [`0xa757…1d1e`](https://scan.botchain.ai/tx/0xa7579250b8b89face08e6e9a8baa3afba063d974c89b9b6087a868d786dd1d1e) |
| 7 | Steward | Incident record | 147,042 | [`0xba07…0123`](https://scan.botchain.ai/tx/0xba07279462b11cb891d86ff77faee79931d7dc8147a19cd1eb2e4eec08460123) |
| 8 | Steward | Propose handover | 98,701 | [`0x5744…4d3d`](https://scan.botchain.ai/tx/0x5744e4a93305d5a4e40ce32610422c0c28d568b7693d19acd441c4bd935a4d3d) |
| 9 | Recipient | Accept handover | 189,504 | [`0x6cd9…9cd8`](https://scan.botchain.ai/tx/0x6cd99ac6c9133f7c061c47773c3837abdae0d7d9e49956ce13cef95a76d09cd8) |
| 10 | Service provider 2 | Inspection record | 167,233 | [`0x1bba…9a4a`](https://scan.botchain.ai/tx/0x1bba86fc50930e17ff10219a6f4fc75d28eeb94a9431d96a2061287db6569a4a) |

All succeeded at 20 gwei (1,724,304 gas, about 0.034 BOT). Final state checked on-chain: the recipient is the registered steward, the previous steward lost steward rights, and the asset has 8 records.

The test wallets keep their roles for now; revoke them (`revokeRole`) before onboarding real participants if they're no longer needed.
