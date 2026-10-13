// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";
import {VestraRegistry as R} from "../src/VestraRegistry.sol";

contract VestraRegistryTest is Test {
    R internal reg;

    address internal admin = makeAddr("admin");
    address internal registrar = makeAddr("registrar");
    address internal registrar2 = makeAddr("registrar2");
    address internal service = makeAddr("service");
    address internal stewardA = makeAddr("stewardA");
    address internal stewardB = makeAddr("stewardB");
    address internal stranger = makeAddr("stranger");

    function setUp() public {
        vm.warp(1_780_000_000);
        reg = new R(admin);
        vm.startPrank(admin);
        reg.grantRole(reg.REGISTRAR_ROLE(), registrar);
        reg.grantRole(reg.REGISTRAR_ROLE(), registrar2);
        reg.grantRole(reg.SERVICE_PROVIDER_ROLE(), service);
        vm.stopPrank();
    }

    // ------------------------------------------------------------ helpers

    function _params() internal view returns (R.RegisterParams memory p) {
        p.name = "Rooftop inverter, Block B";
        p.category = "Solar inverter";
        p.assetType = "String inverter, 3-phase";
        p.manufacturer = "Halden Energy";
        p.model = "HX-50";
        p.publicSerial = "HX50-2291-0402";
        p.steward = stewardA;
        p.initialStatus = R.Status.Active;
        p.metadataUri = "ipfs://bafy";
        p.evidenceHashes = new bytes32[](1);
        p.evidenceHashes[0] = keccak256("datasheet");
    }

    function _register() internal returns (uint256 id) {
        vm.prank(registrar);
        id = reg.registerAsset(_params());
    }

    function _rec(R.RecordType t, string memory summary) internal pure returns (R.RecordParams memory p) {
        p.recordType = t;
        p.summary = summary;
        p.evidenceHash = keccak256(bytes(summary));
    }

    function _status(R.Status s) internal pure returns (R.RecordParams memory p) {
        p = _rec(R.RecordType.StatusChange, "status");
        p.newStatus = s;
    }

    function _records(uint256 id) internal view returns (R.Record[] memory) {
        return reg.getRecords(id, 0, 100);
    }

    // ------------------------------------------------------------ registration

    function test_RegistrarRegistersAsset() public {
        vm.expectEmit(true, true, true, true);
        emit R.AssetRegistered(1, registrar, stewardA, R.Status.Active);
        uint256 id = _register();

        assertEq(id, 1);
        assertEq(reg.assetCount(), 1);
        R.Asset memory a = reg.getAsset(id);
        assertEq(a.name, "Rooftop inverter, Block B");
        assertEq(a.registrar, registrar);
        assertEq(a.steward, stewardA);
        assertEq(uint8(a.status), uint8(R.Status.Active));
        assertEq(a.registeredAt, block.timestamp);
        assertEq(a.registeredBlock, block.number);
        assertEq(a.recordCount, 0);
        assertEq(reg.getRegistrationEvidence(id)[0], keccak256("datasheet"));
    }

    function test_IdsAreSequentialAndNeverZero() public {
        for (uint256 i = 1; i <= 5; ++i) {
            assertEq(_register(), i);
        }
        vm.expectRevert(abi.encodeWithSelector(R.UnknownAsset.selector, 0));
        reg.getAsset(0);
        vm.expectRevert(abi.encodeWithSelector(R.UnknownAsset.selector, 6));
        reg.getAsset(6);
    }

    function test_UnauthorizedRegistrationFails() public {
        R.RegisterParams memory p = _params();
        bytes32 role = reg.REGISTRAR_ROLE();
        for (uint256 i; i < 3; ++i) {
            address who = [stranger, service, stewardA][i];
            vm.prank(who);
            vm.expectRevert(abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, who, role));
            reg.registerAsset(p);
        }
    }

    function test_RevokedRegistrarCannotRegisterButKeepsHistory() public {
        uint256 id = _register();
        vm.prank(registrar);
        reg.addRecord(id, _rec(R.RecordType.Warranty, "Warranty extended"));

        vm.startPrank(admin);
        reg.revokeRole(reg.REGISTRAR_ROLE(), registrar);
        vm.stopPrank();

        vm.prank(registrar);
        vm.expectRevert();
        reg.registerAsset(_params());

        // Past registration and record are untouched.
        assertEq(reg.getAsset(id).registrar, registrar);
        assertEq(_records(id)[0].submitter, registrar);

        // And the revoked registrar can no longer add records to its asset.
        vm.prank(registrar);
        vm.expectRevert(R.NotAuthorized.selector);
        reg.addRecord(id, _rec(R.RecordType.Warranty, "again"));
    }

    function test_RegistrationRejectsInvalidFields() public {
        R.RegisterParams memory p;

        p = _params();
        p.name = "";
        _expectInvalid(p, "name");

        p = _params();
        p.name = string(new bytes(81));
        _expectInvalid(p, "name");

        p = _params();
        p.category = "";
        _expectInvalid(p, "category");

        p = _params();
        p.assetType = "";
        _expectInvalid(p, "assetType");

        p = _params();
        p.manufacturer = string(new bytes(61));
        _expectInvalid(p, "manufacturer");

        p = _params();
        p.metadataUri = string(new bytes(257));
        _expectInvalid(p, "metadataUri");

        p = _params();
        p.serialCommitment = keccak256("salted");
        _expectInvalid(p, "serial");

        p = _params();
        p.steward = address(0);
        _expectInvalid(p, "steward");

        p = _params();
        p.initialStatus = R.Status.UnderMaintenance;
        _expectInvalid(p, "initialStatus");

        p = _params();
        p.evidenceHashes = new bytes32[](11);
        _expectInvalid(p, "evidenceHashes");
    }

    function test_PrivateSerialStoresOnlyCommitment() public {
        R.RegisterParams memory p = _params();
        p.publicSerial = "";
        p.serialCommitment = keccak256(abi.encodePacked(bytes16(0x142cde83e08edc4580efb30e0cf57152), "HX50-2291-0519"));
        vm.prank(registrar);
        uint256 id = reg.registerAsset(p);
        R.Asset memory a = reg.getAsset(id);
        assertEq(bytes(a.publicSerial).length, 0);
        assertEq(a.serialCommitment, p.serialCommitment);
    }

    function _expectInvalid(R.RegisterParams memory p, string memory field) internal {
        vm.prank(registrar);
        vm.expectRevert(abi.encodeWithSelector(R.InvalidInput.selector, field));
        reg.registerAsset(p);
    }

    // ------------------------------------------------------------ record permissions

    function test_ServiceProviderRecords() public {
        uint256 id = _register();
        R.RecordType[4] memory allowed =
            [R.RecordType.Inspection, R.RecordType.Maintenance, R.RecordType.Installation, R.RecordType.Incident];
        for (uint256 i; i < allowed.length; ++i) {
            vm.prank(service);
            assertEq(reg.addRecord(id, _rec(allowed[i], "work done")), i + 1);
        }
        R.RecordType[3] memory denied = [R.RecordType.Warranty, R.RecordType.StatusChange, R.RecordType.Retirement];
        for (uint256 i; i < denied.length; ++i) {
            vm.prank(service);
            vm.expectRevert(R.NotAuthorized.selector);
            reg.addRecord(id, _rec(denied[i], "nope"));
        }
    }

    function test_StewardAndRegistrarRecords() public {
        uint256 id = _register();
        vm.startPrank(stewardA);
        reg.addRecord(id, _rec(R.RecordType.Incident, "Storm damage noticed"));
        vm.expectRevert(R.NotAuthorized.selector);
        reg.addRecord(id, _rec(R.RecordType.Inspection, "Self inspection"));
        vm.expectRevert(R.NotAuthorized.selector);
        reg.addRecord(id, _rec(R.RecordType.Warranty, "Self warranty"));
        vm.stopPrank();

        vm.startPrank(registrar);
        reg.addRecord(id, _rec(R.RecordType.Warranty, "Extended"));
        reg.addRecord(id, _rec(R.RecordType.Installation, "Installed"));
        vm.expectRevert(R.NotAuthorized.selector);
        reg.addRecord(id, _rec(R.RecordType.Inspection, "Inspected"));
        vm.stopPrank();

        // A registrar can't write to an asset another registrar registered.
        vm.prank(registrar2);
        vm.expectRevert(R.NotAuthorized.selector);
        reg.addRecord(id, _rec(R.RecordType.Warranty, "Not mine"));
    }

    function test_StrangerCannotAddAnyRecord() public {
        uint256 id = _register();
        for (uint8 t; t <= uint8(R.RecordType.Correction); ++t) {
            if (t == uint8(R.RecordType.Handover)) continue;
            vm.prank(stranger);
            vm.expectRevert(R.NotAuthorized.selector);
            reg.addRecord(id, _rec(R.RecordType(t), "x"));
        }
    }

    function test_HandoverRecordsOnlyFromHandoverFlow() public {
        uint256 id = _register();
        vm.prank(stewardA);
        vm.expectRevert(R.HandoverRecordsUseHandoverFlow.selector);
        reg.addRecord(id, _rec(R.RecordType.Handover, "fake handover"));
    }

    function test_RecordRejectsInvalidText() public {
        uint256 id = _register();
        vm.startPrank(service);
        vm.expectRevert(abi.encodeWithSelector(R.InvalidInput.selector, "summary"));
        reg.addRecord(id, _rec(R.RecordType.Inspection, ""));
        vm.expectRevert(abi.encodeWithSelector(R.InvalidInput.selector, "summary"));
        reg.addRecord(id, _rec(R.RecordType.Inspection, string(new bytes(281))));
        R.RecordParams memory p = _rec(R.RecordType.Inspection, "ok");
        p.providerId = string(new bytes(65));
        vm.expectRevert(abi.encodeWithSelector(R.InvalidInput.selector, "providerId"));
        reg.addRecord(id, p);
        vm.stopPrank();
    }

    function test_RecordOnUnknownAssetFails() public {
        vm.prank(service);
        vm.expectRevert(abi.encodeWithSelector(R.UnknownAsset.selector, 42));
        reg.addRecord(42, _rec(R.RecordType.Inspection, "x"));
    }

    // ------------------------------------------------------------ append-only and corrections

    function test_HistoryIsAppendOnly() public {
        uint256 id = _register();
        vm.startPrank(service);
        reg.addRecord(id, _rec(R.RecordType.Inspection, "first"));
        reg.addRecord(id, _rec(R.RecordType.Maintenance, "second"));
        vm.stopPrank();
        R.Record[] memory before = _records(id);

        vm.prank(service);
        reg.addRecord(id, _rec(R.RecordType.Inspection, "third"));
        R.Record[] memory after_ = _records(id);

        assertEq(after_.length, 3);
        for (uint256 i; i < before.length; ++i) {
            assertEq(after_[i].summary, before[i].summary);
            assertEq(after_[i].submitter, before[i].submitter);
            assertEq(after_[i].timestamp, before[i].timestamp);
            assertEq(after_[i].evidenceHash, before[i].evidenceHash);
        }
        assertEq(reg.getAsset(id).recordCount, 3);
    }

    function test_CorrectionSupersedesOwnRecordOnce() public {
        uint256 id = _register();
        vm.startPrank(service);
        reg.addRecord(id, _rec(R.RecordType.Maintenance, "Oil change at 250 hours"));
        R.RecordParams memory c = _rec(R.RecordType.Correction, "Run hours were 520, not 250");
        c.supersedes = 1;
        vm.expectEmit(true, true, true, true);
        emit R.RecordSuperseded(id, 1, 2);
        reg.addRecord(id, c);

        // The original stays, marked superseded; it can't be corrected twice.
        R.Record[] memory list = _records(id);
        assertEq(list[0].summary, "Oil change at 250 hours");
        assertEq(list[0].supersededBy, 2);
        assertEq(list[1].supersedes, 1);
        vm.expectRevert(abi.encodeWithSelector(R.InvalidCorrectionTarget.selector, 1));
        reg.addRecord(id, c);

        // A correction can't itself be corrected.
        c.supersedes = 2;
        vm.expectRevert(abi.encodeWithSelector(R.InvalidCorrectionTarget.selector, 2));
        reg.addRecord(id, c);
        vm.stopPrank();
    }

    function test_CannotCorrectSomeoneElsesRecord() public {
        uint256 id = _register();
        vm.prank(service);
        reg.addRecord(id, _rec(R.RecordType.Inspection, "Inspected"));
        R.RecordParams memory c = _rec(R.RecordType.Correction, "Not yours");
        c.supersedes = 1;
        vm.prank(stewardA);
        vm.expectRevert(abi.encodeWithSelector(R.InvalidCorrectionTarget.selector, 1));
        reg.addRecord(id, c);

        c.supersedes = 9;
        vm.prank(service);
        vm.expectRevert(abi.encodeWithSelector(R.InvalidCorrectionTarget.selector, 9));
        reg.addRecord(id, c);
    }

    function test_RevokedServiceProviderCannotCorrect() public {
        uint256 id = _register();
        vm.prank(service);
        reg.addRecord(id, _rec(R.RecordType.Inspection, "Inspected"));
        vm.startPrank(admin);
        reg.revokeRole(reg.SERVICE_PROVIDER_ROLE(), service);
        vm.stopPrank();
        R.RecordParams memory c = _rec(R.RecordType.Correction, "Late fix");
        c.supersedes = 1;
        vm.prank(service);
        vm.expectRevert(R.NotAuthorized.selector);
        reg.addRecord(id, c);
        assertEq(_records(id)[0].submitter, service);
    }

    // ------------------------------------------------------------ status machine

    function test_StatusChangeFollowsStateMachine() public {
        uint256 id = _register(); // Active
        vm.startPrank(stewardA);
        reg.addRecord(id, _status(R.Status.UnderMaintenance));
        reg.addRecord(id, _status(R.Status.Active));
        vm.expectRevert(
            abi.encodeWithSelector(R.InvalidStatusTransition.selector, R.Status.Active, R.Status.Registered)
        );
        reg.addRecord(id, _status(R.Status.Registered));
        vm.expectRevert(abi.encodeWithSelector(R.InvalidStatusTransition.selector, R.Status.Active, R.Status.Retired));
        reg.addRecord(id, _status(R.Status.Retired));
        vm.stopPrank();
        assertEq(uint8(reg.getAsset(id).status), uint8(R.Status.Active));
    }

    /// The contract's transition table matches an independent copy of the documented table.
    function testFuzz_TransitionTable(uint8 fromRaw, uint8 toRaw) public view {
        R.Status from = R.Status(bound(fromRaw, 0, 5));
        R.Status to = R.Status(bound(toRaw, 0, 5));
        assertEq(reg.isAllowedTransition(from, to), _documented(from, to));
    }

    function _documented(R.Status f, R.Status t) internal pure returns (bool) {
        bool[6][6] memory m;
        m[0][1] = true; // Registered -> Active
        m[1][2] = true; // Active -> Under maintenance
        m[1][3] = true; // Active -> Reported damaged
        m[1][4] = true; // Active -> Reported lost
        m[2][1] = true; // Under maintenance -> Active
        m[2][3] = true; // Under maintenance -> Reported damaged
        m[3][2] = true; // Reported damaged -> Under maintenance
        m[3][1] = true; // Reported damaged -> Active
        m[4][1] = true; // Reported lost -> Active
        return m[uint8(f)][uint8(t)];
    }

    function test_RetirementIsTerminal() public {
        uint256 id = _register();
        vm.prank(stewardA);
        reg.proposeHandover(id, stewardB, uint64(block.timestamp + 7 days), bytes32(0));

        vm.prank(stewardA);
        reg.addRecord(id, _rec(R.RecordType.Retirement, "Decommissioned"));
        assertEq(uint8(reg.getAsset(id).status), uint8(R.Status.Retired));
        // Retiring clears any open handover.
        assertEq(reg.getHandover(id).to, address(0));

        vm.prank(service);
        vm.expectRevert(R.NotAuthorized.selector);
        reg.addRecord(id, _rec(R.RecordType.Inspection, "after"));
        vm.prank(stewardA);
        vm.expectRevert(R.NotAuthorized.selector);
        reg.addRecord(id, _status(R.Status.Active));
        vm.prank(stewardA);
        vm.expectRevert(R.AssetRetired.selector);
        reg.proposeHandover(id, stewardB, uint64(block.timestamp + 1 days), bytes32(0));
        vm.prank(stewardB);
        vm.expectRevert(R.NoPendingHandover.selector);
        reg.acceptHandover(id);
    }

    function test_CorrectionStillAllowedAfterRetirement() public {
        uint256 id = _register();
        vm.startPrank(stewardA);
        reg.addRecord(id, _rec(R.RecordType.Retirement, "Recycled at site A"));
        R.RecordParams memory c = _rec(R.RecordType.Correction, "Recycled at site B");
        c.supersedes = 1;
        reg.addRecord(id, c);
        vm.stopPrank();
        assertEq(_records(id)[0].supersededBy, 2);
    }

    // ------------------------------------------------------------ handover

    function test_HandoverProposeAndAccept() public {
        uint256 id = _register();
        uint64 exp = uint64(block.timestamp + 7 days);
        vm.expectEmit(true, true, true, true);
        emit R.HandoverProposed(id, stewardA, stewardB, exp, keccak256("agreement"));
        vm.prank(stewardA);
        reg.proposeHandover(id, stewardB, exp, keccak256("agreement"));

        R.Handover memory h = reg.getHandover(id);
        assertEq(h.from, stewardA);
        assertEq(h.to, stewardB);
        assertEq(h.expiresAt, exp);

        vm.warp(block.timestamp + 1 days);
        vm.expectEmit(true, true, true, true);
        emit R.HandoverAccepted(id, stewardA, stewardB);
        vm.prank(stewardB);
        uint32 index = reg.acceptHandover(id);

        assertEq(reg.getAsset(id).steward, stewardB);
        assertEq(reg.getHandover(id).to, address(0));
        R.Record memory r = _records(id)[index - 1];
        assertEq(uint8(r.recordType), uint8(R.RecordType.Handover));
        assertEq(r.newSteward, stewardB);
        assertEq(r.submitter, stewardB);
        assertEq(r.evidenceHash, keccak256("agreement"));
    }

    function test_OnlyStewardCanPropose() public {
        uint256 id = _register();
        for (uint256 i; i < 3; ++i) {
            address who = [registrar, service, stranger][i];
            vm.prank(who);
            vm.expectRevert(R.NotSteward.selector);
            reg.proposeHandover(id, stewardB, uint64(block.timestamp + 1 days), bytes32(0));
        }
    }

    function test_ProposeRejectsBadRecipientAndExpiry() public {
        uint256 id = _register();
        vm.startPrank(stewardA);
        vm.expectRevert(R.InvalidRecipient.selector);
        reg.proposeHandover(id, address(0), uint64(block.timestamp + 1 days), bytes32(0));
        vm.expectRevert(R.InvalidRecipient.selector);
        reg.proposeHandover(id, stewardA, uint64(block.timestamp + 1 days), bytes32(0));
        vm.expectRevert(R.InvalidExpiry.selector);
        reg.proposeHandover(id, stewardB, uint64(block.timestamp), bytes32(0));
        vm.expectRevert(R.InvalidExpiry.selector);
        reg.proposeHandover(id, stewardB, uint64(block.timestamp + 30 days + 1), bytes32(0));
        vm.stopPrank();
    }

    function test_WrongRecipientCannotAccept() public {
        uint256 id = _register();
        vm.prank(stewardA);
        reg.proposeHandover(id, stewardB, uint64(block.timestamp + 7 days), bytes32(0));
        for (uint256 i; i < 3; ++i) {
            address who = [stranger, stewardA, admin][i];
            vm.prank(who);
            vm.expectRevert(R.NotRecipient.selector);
            reg.acceptHandover(id);
        }
        assertEq(reg.getAsset(id).steward, stewardA);
    }

    function test_ExpiredHandoverCannotBeAccepted() public {
        uint256 id = _register();
        uint64 exp = uint64(block.timestamp + 3 days);
        vm.prank(stewardA);
        reg.proposeHandover(id, stewardB, exp, bytes32(0));
        vm.warp(exp);
        vm.prank(stewardB);
        vm.expectRevert(R.HandoverExpired.selector);
        reg.acceptHandover(id);

        // After expiry the steward can propose again without cancelling first.
        vm.prank(stewardA);
        reg.proposeHandover(id, stewardB, uint64(block.timestamp + 1 days), bytes32(0));
    }

    function test_CancelledHandoverCannotBeAccepted() public {
        uint256 id = _register();
        vm.prank(stewardA);
        reg.proposeHandover(id, stewardB, uint64(block.timestamp + 7 days), bytes32(0));
        vm.prank(stewardB);
        vm.expectRevert(R.NotSteward.selector);
        reg.cancelHandover(id);
        vm.prank(stewardA);
        reg.cancelHandover(id);
        vm.prank(stewardB);
        vm.expectRevert(R.NoPendingHandover.selector);
        reg.acceptHandover(id);
        vm.prank(stewardA);
        vm.expectRevert(R.NoPendingHandover.selector);
        reg.cancelHandover(id);
    }

    function test_OnlyOneLiveProposal() public {
        uint256 id = _register();
        vm.startPrank(stewardA);
        reg.proposeHandover(id, stewardB, uint64(block.timestamp + 7 days), bytes32(0));
        vm.expectRevert(R.HandoverAlreadyPending.selector);
        reg.proposeHandover(id, stranger, uint64(block.timestamp + 7 days), bytes32(0));
        vm.stopPrank();
        assertEq(reg.getHandover(id).to, stewardB);
    }

    function test_AcceptedHandoverCannotBeReplayed() public {
        uint256 id = _register();
        vm.prank(stewardA);
        reg.proposeHandover(id, stewardB, uint64(block.timestamp + 7 days), bytes32(0));
        vm.prank(stewardB);
        reg.acceptHandover(id);
        vm.prank(stewardB);
        vm.expectRevert(R.NoPendingHandover.selector);
        reg.acceptHandover(id);
        // The previous steward lost steward powers.
        vm.prank(stewardA);
        vm.expectRevert(R.NotSteward.selector);
        reg.proposeHandover(id, stranger, uint64(block.timestamp + 1 days), bytes32(0));
        vm.prank(stewardA);
        vm.expectRevert(R.NotAuthorized.selector);
        reg.addRecord(id, _rec(R.RecordType.Incident, "not mine any more"));
    }

    // ------------------------------------------------------------ admin

    function test_AdminCannotWriteRecordsOrRegister() public {
        uint256 id = _register();
        vm.startPrank(admin);
        vm.expectRevert(R.NotAuthorized.selector);
        reg.addRecord(id, _rec(R.RecordType.Inspection, "admin claim"));
        vm.expectRevert(R.NotSteward.selector);
        reg.proposeHandover(id, stewardB, uint64(block.timestamp + 1 days), bytes32(0));
        vm.expectRevert();
        reg.registerAsset(_params());
        vm.stopPrank();
    }

    function test_OnlyAdminManagesRoles() public {
        bytes32 role = reg.REGISTRAR_ROLE();
        vm.prank(registrar);
        vm.expectRevert();
        reg.grantRole(role, stranger);
        assertFalse(reg.hasRole(role, stranger));
    }

    function test_AdminTransferIsTwoStepWithDelay() public {
        address next = makeAddr("multisig");
        vm.prank(admin);
        reg.beginDefaultAdminTransfer(next);
        vm.prank(next);
        vm.expectRevert();
        reg.acceptDefaultAdminTransfer();
        vm.warp(block.timestamp + 2 days + 1);
        vm.prank(next);
        reg.acceptDefaultAdminTransfer();
        assertEq(reg.defaultAdmin(), next);
    }

    // ------------------------------------------------------------ views

    function test_Pagination() public {
        for (uint256 i; i < 5; ++i) {
            _register();
        }
        assertEq(reg.getAssets(0, 2).length, 2);
        assertEq(reg.getAssets(4, 10).length, 1);
        assertEq(reg.getAssets(5, 10).length, 0);
        vm.expectRevert(R.PageTooLarge.selector);
        reg.getAssets(0, 101);

        vm.startPrank(service);
        for (uint256 i; i < 3; ++i) {
            reg.addRecord(1, _rec(R.RecordType.Inspection, "check"));
        }
        vm.stopPrank();
        assertEq(reg.getRecords(1, 1, 10).length, 2);
        assertEq(reg.getRecords(1, 3, 10).length, 0);
    }

    function test_CanSubmitMatchesAddRecord() public {
        uint256 id = _register();
        address[5] memory who = [registrar, registrar2, service, stewardA, stranger];
        for (uint256 w; w < who.length; ++w) {
            for (uint8 t; t <= uint8(R.RecordType.Retirement); ++t) {
                R.RecordType rt = R.RecordType(t);
                if (rt == R.RecordType.Retirement || rt == R.RecordType.Handover) continue;
                bool expected = reg.canSubmit(id, who[w], rt);
                R.RecordParams memory p = rt == R.RecordType.StatusChange ? _status(R.Status.UnderMaintenance) : _rec(rt, "x");
                uint256 snap = vm.snapshotState();
                vm.prank(who[w]);
                (bool ok,) = address(reg).call(abi.encodeCall(R.addRecord, (id, p)));
                assertEq(ok, expected);
                vm.revertToState(snap);
            }
        }
    }
}
