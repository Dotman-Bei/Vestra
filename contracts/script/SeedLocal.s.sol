// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {VestraRegistry as R} from "../src/VestraRegistry.sol";

/// LOCAL TEST DATA ONLY. Deploys a registry on a local Anvil node (chain 31337) and writes a few
/// example assets so the frontend can be exercised against a real contract. Refuses any other chain:
/// example data must never be presented as real usage (PRD 5.6).
///
///   anvil
///   forge script script/SeedLocal.s.sol --rpc-url local --broadcast
contract SeedLocal is Script {
    // Anvil's default development keys. Public, worthless, local only.
    uint256 constant ADMIN = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    uint256 constant REGISTRAR = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
    uint256 constant STEWARD_A = 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a;
    uint256 constant STEWARD_B = 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6;
    uint256 constant SERVICE = 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a;

    function run() external {
        require(block.chainid == 31337, "SeedLocal only runs on a local Anvil node");

        vm.startBroadcast(ADMIN);
        R reg = new R(vm.addr(ADMIN));
        reg.grantRole(reg.REGISTRAR_ROLE(), vm.addr(REGISTRAR));
        reg.grantRole(reg.SERVICE_PROVIDER_ROLE(), vm.addr(SERVICE));
        vm.stopBroadcast();

        vm.startBroadcast(REGISTRAR);
        uint256 a1 = reg.registerAsset(_asset("Battery cabinet, Unit 2", "Battery storage", "LFP cabinet, 100 kWh", "NV100C-23-08841", vm.addr(STEWARD_A)));
        uint256 a2 = reg.registerAsset(_asset("Rooftop inverter, Block A", "Solar inverter", "String inverter, 3-phase", "HX50-2291-0388", vm.addr(STEWARD_A)));
        uint256 a3 = reg.registerAsset(_asset("Standby generator, Clinic East", "Generator", "Diesel standby, 60 kVA", "AG60S-0917-2204", vm.addr(STEWARD_B)));
        reg.addRecord(a1, _rec(R.RecordType.Installation, "Installed and commissioned in the Unit 2 plant room."));
        vm.stopBroadcast();

        vm.startBroadcast(SERVICE);
        reg.addRecord(a1, _rec(R.RecordType.Inspection, "Quarterly inspection. Cell voltages balanced, no alarms."));
        reg.addRecord(a3, _rec(R.RecordType.Maintenance, "Oil and filter change at 250 run hours."));
        R.RecordParams memory fix = _rec(R.RecordType.Correction, "Run hours were 520, not 250. Work done is unchanged.");
        fix.supersedes = 1;
        reg.addRecord(a3, fix);
        vm.stopBroadcast();

        vm.startBroadcast(STEWARD_A);
        reg.addRecord(a2, _rec(R.RecordType.Incident, "Tripped on a ground fault after a storm."));
        R.RecordParams memory s = _rec(R.RecordType.StatusChange, "Taken offline pending repair.");
        s.newStatus = R.Status.UnderMaintenance;
        reg.addRecord(a2, s);
        reg.proposeHandover(a1, vm.addr(STEWARD_B), uint64(block.timestamp + 7 days), keccak256("handover agreement"));
        vm.stopBroadcast();

        console2.log("VestraRegistry (LOCAL TEST DATA)", address(reg));
    }

    function _asset(string memory name, string memory category, string memory assetType, string memory serial, address steward)
        internal
        pure
        returns (R.RegisterParams memory p)
    {
        p.name = name;
        p.category = category;
        p.assetType = assetType;
        p.publicSerial = serial;
        p.steward = steward;
        p.initialStatus = R.Status.Active;
    }

    function _rec(R.RecordType t, string memory summary) internal pure returns (R.RecordParams memory p) {
        p.recordType = t;
        p.summary = summary;
        p.evidenceHash = keccak256(bytes(summary));
    }
}
