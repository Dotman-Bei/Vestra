// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {VestraRegistry as R} from "../src/VestraRegistry.sol";

/// Drives random sequences of registrations, records and handovers from a fixed set of actors.
/// Calls that the contract rejects simply revert; the fuzzer keeps going.
contract Handler is Test {
    R public reg;
    address[] public actors;
    /// Ghost copy of every record ever written: assetId => count observed at write time.
    mapping(uint256 => uint256) public written;
    uint256 public accepted;

    constructor(R reg_, address[] memory actors_) {
        reg = reg_;
        actors = actors_;
    }

    function _actor(uint256 seed) internal view returns (address) {
        return actors[seed % actors.length];
    }

    function _asset(uint256 seed) internal view returns (uint256) {
        uint256 n = reg.assetCount();
        return n == 0 ? 1 : (seed % n) + 1;
    }

    function register(uint256 actorSeed, uint256 stewardSeed, bool active) external {
        R.RegisterParams memory p;
        p.name = "Asset";
        p.category = "Generator";
        p.assetType = "Diesel standby";
        p.steward = _actor(stewardSeed);
        p.initialStatus = active ? R.Status.Active : R.Status.Registered;
        vm.prank(_actor(actorSeed));
        try reg.registerAsset(p) {} catch {}
    }

    function addRecord(uint256 actorSeed, uint256 assetSeed, uint8 typeRaw, uint8 statusRaw, uint32 supersedes) external {
        uint256 id = _asset(assetSeed);
        R.RecordParams memory p;
        p.recordType = R.RecordType(bound(typeRaw, 0, 8));
        p.summary = "work";
        p.newStatus = R.Status(bound(statusRaw, 0, 5));
        p.supersedes = uint32(bound(supersedes, 0, 20));
        vm.prank(_actor(actorSeed));
        try reg.addRecord(id, p) {
            written[id]++;
        } catch {}
    }

    function propose(uint256 actorSeed, uint256 assetSeed, uint256 toSeed, uint64 days_) external {
        uint256 id = _asset(assetSeed);
        vm.prank(_actor(actorSeed));
        try reg.proposeHandover(id, _actor(toSeed), uint64(block.timestamp + bound(days_, 0, 40) * 1 days), bytes32(0)) {}
        catch {}
    }

    function accept(uint256 actorSeed, uint256 assetSeed) external {
        uint256 id = _asset(assetSeed);
        vm.prank(_actor(actorSeed));
        try reg.acceptHandover(id) {
            written[id]++;
            accepted++;
        } catch {}
    }

    function cancel(uint256 actorSeed, uint256 assetSeed) external {
        vm.prank(_actor(actorSeed));
        try reg.cancelHandover(_asset(assetSeed)) {} catch {}
    }

    function warp(uint256 secs) external {
        vm.warp(block.timestamp + bound(secs, 0, 10 days));
    }
}

contract VestraRegistryInvariantTest is Test {
    R internal reg;
    Handler internal handler;
    address[] internal actors;

    function setUp() public {
        vm.warp(1_780_000_000);
        address admin = makeAddr("admin");
        reg = new R(admin);
        for (uint256 i; i < 5; ++i) {
            actors.push(makeAddr(string(abi.encodePacked("actor", vm.toString(i)))));
        }
        vm.startPrank(admin);
        reg.grantRole(reg.REGISTRAR_ROLE(), actors[0]);
        reg.grantRole(reg.REGISTRAR_ROLE(), actors[1]);
        reg.grantRole(reg.SERVICE_PROVIDER_ROLE(), actors[2]);
        vm.stopPrank();
        handler = new Handler(reg, actors);
        targetContract(address(handler));
    }

    /// Every asset has a steward, and its record count matches the stored records and the writes we saw.
    function invariant_AssetsConsistent() public view {
        uint256 n = reg.assetCount();
        for (uint256 id = 1; id <= n; ++id) {
            R.Asset memory a = reg.getAsset(id);
            assertTrue(a.steward != address(0));
            R.Record[] memory list = reg.getRecords(id, 0, 100);
            assertEq(a.recordCount, list.length);
            assertEq(list.length, handler.written(id));
        }
    }

    /// Supersede links are mutual, point backwards, and never target a Handover or Correction.
    function invariant_CorrectionLinksValid() public view {
        uint256 n = reg.assetCount();
        for (uint256 id = 1; id <= n; ++id) {
            R.Record[] memory list = reg.getRecords(id, 0, 100);
            for (uint256 i; i < list.length; ++i) {
                R.Record memory r = list[i];
                if (r.recordType == R.RecordType.Correction) {
                    assertGt(r.supersedes, 0);
                    assertLt(r.supersedes, i + 1);
                    R.Record memory original = list[r.supersedes - 1];
                    assertEq(original.supersededBy, i + 1);
                    assertEq(original.submitter, r.submitter);
                    assertTrue(original.recordType != R.RecordType.Handover);
                    assertTrue(original.recordType != R.RecordType.Correction);
                } else {
                    assertEq(r.supersedes, 0);
                }
            }
        }
    }

    /// A retired asset never has an open handover, and a Retirement record exists for it.
    function invariant_RetiredAssetsAreClosed() public view {
        uint256 n = reg.assetCount();
        for (uint256 id = 1; id <= n; ++id) {
            if (reg.getAsset(id).status != R.Status.Retired) continue;
            assertEq(reg.getHandover(id).to, address(0));
            R.Record[] memory list = reg.getRecords(id, 0, 100);
            bool found;
            for (uint256 i; i < list.length; ++i) {
                if (list[i].recordType == R.RecordType.Retirement) found = true;
            }
            assertTrue(found);
        }
    }

    /// An open proposal always comes from the current steward and never names the steward as recipient.
    function invariant_HandoverFromCurrentSteward() public view {
        uint256 n = reg.assetCount();
        for (uint256 id = 1; id <= n; ++id) {
            R.Handover memory h = reg.getHandover(id);
            if (h.to == address(0)) continue;
            R.Asset memory a = reg.getAsset(id);
            assertEq(h.from, a.steward);
            assertTrue(h.to != a.steward);
        }
    }
}
