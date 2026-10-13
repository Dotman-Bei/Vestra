// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AccessControlDefaultAdminRules} from
    "@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol";

/// @title Vestra asset passport registry
/// @notice An append-only lifecycle record for real-world equipment. A record shows which authorized
/// wallet submitted what and when. It does not prove that an asset exists, who legally owns it, its
/// condition, location or value. This is a Vestra contract, not an official BOT Chain RWA Core component.
/// @dev All authoritative state is kept in storage and exposed through paginated views, because
/// `eth_getLogs` is disabled on the public BOT Chain mainnet RPC (see docs/ADR-001). Events are still
/// emitted for explorers and indexers.
contract VestraRegistry is AccessControlDefaultAdminRules {
    // ---------------------------------------------------------------- roles

    /// @notice May register assets, and on assets it registered add Warranty, Installation and
    /// Status change records.
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    /// @notice May add Inspection, Maintenance, Installation and Incident records to any non-retired asset.
    bytes32 public constant SERVICE_PROVIDER_ROLE = keccak256("SERVICE_PROVIDER_ROLE");

    // ---------------------------------------------------------------- types

    enum Status {
        Registered,
        Active,
        UnderMaintenance,
        ReportedDamaged,
        ReportedLost,
        Retired
    }

    enum RecordType {
        Inspection,
        Maintenance,
        Warranty,
        Installation,
        Incident,
        StatusChange,
        Handover,
        Retirement,
        Correction
    }

    struct Asset {
        string name;
        string category;
        string assetType;
        string manufacturer;
        string model;
        /// Empty when not published.
        string publicSerial;
        /// keccak256(salt, serial) when the serial is kept private; zero otherwise.
        bytes32 serialCommitment;
        address registrar;
        address steward;
        Status status;
        uint64 registeredAt;
        uint64 registeredBlock;
        string metadataUri;
        bytes32 metadataHash;
        uint32 recordCount;
    }

    struct Record {
        RecordType recordType;
        /// Meaningful only for StatusChange and Retirement records.
        Status newStatus;
        address submitter;
        /// Set only on Handover records.
        address newSteward;
        uint64 timestamp;
        uint64 blockNumber;
        /// 1-based index of the record this one corrects; 0 if none.
        uint32 supersedes;
        /// 1-based index of the record that corrected this one; 0 if none.
        uint32 supersededBy;
        bytes32 evidenceHash;
        string summary;
        string documentUri;
        string providerId;
    }

    struct Handover {
        address from;
        address to;
        uint64 expiresAt;
        uint64 proposedAt;
        bytes32 evidenceHash;
    }

    struct RegisterParams {
        string name;
        string category;
        string assetType;
        string manufacturer;
        string model;
        string publicSerial;
        bytes32 serialCommitment;
        address steward;
        Status initialStatus;
        string metadataUri;
        bytes32 metadataHash;
        bytes32[] evidenceHashes;
    }

    struct RecordParams {
        RecordType recordType;
        string summary;
        bytes32 evidenceHash;
        string documentUri;
        string providerId;
        /// Required for StatusChange; ignored otherwise.
        Status newStatus;
        /// Required for Correction: 1-based index of the record being corrected.
        uint32 supersedes;
    }

    // ---------------------------------------------------------------- limits

    uint256 public constant MAX_NAME_LENGTH = 80;
    uint256 public constant MAX_CATEGORY_LENGTH = 40;
    uint256 public constant MAX_TYPE_LENGTH = 80;
    uint256 public constant MAX_MAKER_LENGTH = 60;
    uint256 public constant MAX_SERIAL_LENGTH = 64;
    uint256 public constant MAX_URI_LENGTH = 256;
    uint256 public constant MAX_SUMMARY_LENGTH = 280;
    uint256 public constant MAX_PROVIDER_LENGTH = 64;
    uint256 public constant MAX_EVIDENCE = 10;
    uint256 public constant MAX_PAGE = 100;
    uint64 public constant MAX_HANDOVER_DURATION = 30 days;

    string internal constant HANDOVER_SUMMARY = "Registered steward changed after the recipient accepted.";

    // ---------------------------------------------------------------- storage

    uint256 private _assetCount;
    mapping(uint256 assetId => Asset) private _assets;
    mapping(uint256 assetId => Record[]) private _records;
    mapping(uint256 assetId => bytes32[]) private _registrationEvidence;
    mapping(uint256 assetId => Handover) private _handovers;

    // ---------------------------------------------------------------- events

    event AssetRegistered(uint256 indexed assetId, address indexed registrar, address indexed steward, Status status);
    event RecordAdded(
        uint256 indexed assetId,
        uint32 indexed index,
        address indexed submitter,
        RecordType recordType,
        bytes32 evidenceHash
    );
    event StatusChanged(uint256 indexed assetId, Status from, Status to, address indexed by);
    event RecordSuperseded(uint256 indexed assetId, uint32 indexed index, uint32 byIndex);
    event HandoverProposed(
        uint256 indexed assetId, address indexed from, address indexed to, uint64 expiresAt, bytes32 evidenceHash
    );
    event HandoverAccepted(uint256 indexed assetId, address indexed from, address indexed to);
    event HandoverCancelled(uint256 indexed assetId, address indexed by);

    // ---------------------------------------------------------------- errors

    error UnknownAsset(uint256 assetId);
    error NotAuthorized();
    error InvalidInput(string field);
    error InvalidStatusTransition(Status from, Status to);
    error HandoverRecordsUseHandoverFlow();
    error InvalidCorrectionTarget(uint32 index);
    error AssetRetired();
    error NotSteward();
    error InvalidRecipient();
    error InvalidExpiry();
    error HandoverAlreadyPending();
    error NoPendingHandover();
    error NotRecipient();
    error HandoverExpired();
    error StaleHandover();
    error PageTooLarge();

    // ---------------------------------------------------------------- setup

    /// @param admin Receives the default admin role. Admin transfer is two-step with a 2-day delay.
    constructor(address admin) AccessControlDefaultAdminRules(2 days, admin) {}

    // ---------------------------------------------------------------- registration

    /// @notice Registers an asset and returns its ID. IDs are sequential from 1, so 0 is never used.
    function registerAsset(RegisterParams calldata p) external onlyRole(REGISTRAR_ROLE) returns (uint256 assetId) {
        _requireLength(p.name, 1, MAX_NAME_LENGTH, "name");
        _requireLength(p.category, 1, MAX_CATEGORY_LENGTH, "category");
        _requireLength(p.assetType, 1, MAX_TYPE_LENGTH, "assetType");
        _requireLength(p.manufacturer, 0, MAX_MAKER_LENGTH, "manufacturer");
        _requireLength(p.model, 0, MAX_MAKER_LENGTH, "model");
        _requireLength(p.publicSerial, 0, MAX_SERIAL_LENGTH, "publicSerial");
        _requireLength(p.metadataUri, 0, MAX_URI_LENGTH, "metadataUri");
        if (bytes(p.publicSerial).length != 0 && p.serialCommitment != bytes32(0)) revert InvalidInput("serial");
        if (p.steward == address(0)) revert InvalidInput("steward");
        if (p.initialStatus != Status.Registered && p.initialStatus != Status.Active) {
            revert InvalidInput("initialStatus");
        }
        if (p.evidenceHashes.length > MAX_EVIDENCE) revert InvalidInput("evidenceHashes");

        assetId = ++_assetCount;
        Asset storage a = _assets[assetId];
        a.name = p.name;
        a.category = p.category;
        a.assetType = p.assetType;
        a.manufacturer = p.manufacturer;
        a.model = p.model;
        a.publicSerial = p.publicSerial;
        a.serialCommitment = p.serialCommitment;
        a.registrar = msg.sender;
        a.steward = p.steward;
        a.status = p.initialStatus;
        a.registeredAt = uint64(block.timestamp);
        a.registeredBlock = uint64(block.number);
        a.metadataUri = p.metadataUri;
        a.metadataHash = p.metadataHash;

        bytes32[] storage ev = _registrationEvidence[assetId];
        for (uint256 i; i < p.evidenceHashes.length; ++i) {
            ev.push(p.evidenceHashes[i]);
        }

        emit AssetRegistered(assetId, msg.sender, p.steward, p.initialStatus);
    }

    // ---------------------------------------------------------------- records

    /// @notice Appends a lifecycle record. Records can't be edited or deleted; mistakes are fixed with a
    /// Correction record that supersedes the original.
    function addRecord(uint256 assetId, RecordParams calldata p) external returns (uint32 index) {
        Asset storage a = _existing(assetId);
        RecordType t = p.recordType;
        if (t == RecordType.Handover) revert HandoverRecordsUseHandoverFlow();
        if (!canSubmit(assetId, msg.sender, t)) revert NotAuthorized();
        _requireLength(p.summary, 1, MAX_SUMMARY_LENGTH, "summary");
        _requireLength(p.documentUri, 0, MAX_URI_LENGTH, "documentUri");
        _requireLength(p.providerId, 0, MAX_PROVIDER_LENGTH, "providerId");

        Record[] storage list = _records[assetId];
        index = uint32(list.length + 1);
        Status newStatus = a.status;

        if (t == RecordType.StatusChange) {
            if (p.newStatus == Status.Retired || !isAllowedTransition(a.status, p.newStatus)) {
                revert InvalidStatusTransition(a.status, p.newStatus);
            }
            newStatus = p.newStatus;
        } else if (t == RecordType.Retirement) {
            newStatus = Status.Retired;
        } else if (t == RecordType.Correction) {
            uint32 target = p.supersedes;
            if (target == 0 || target > list.length) revert InvalidCorrectionTarget(target);
            Record storage original = list[target - 1];
            if (
                original.submitter != msg.sender || original.supersededBy != 0
                    || original.recordType == RecordType.Handover || original.recordType == RecordType.Correction
            ) revert InvalidCorrectionTarget(target);
            original.supersededBy = index;
            emit RecordSuperseded(assetId, target, index);
        }

        list.push(
            Record({
                recordType: t,
                newStatus: newStatus,
                submitter: msg.sender,
                newSteward: address(0),
                timestamp: uint64(block.timestamp),
                blockNumber: uint64(block.number),
                supersedes: t == RecordType.Correction ? p.supersedes : 0,
                supersededBy: 0,
                evidenceHash: p.evidenceHash,
                summary: p.summary,
                documentUri: p.documentUri,
                providerId: p.providerId
            })
        );
        a.recordCount = index;
        emit RecordAdded(assetId, index, msg.sender, t, p.evidenceHash);

        if (newStatus != a.status) {
            emit StatusChanged(assetId, a.status, newStatus, msg.sender);
            a.status = newStatus;
            if (newStatus == Status.Retired && _handovers[assetId].to != address(0)) {
                delete _handovers[assetId];
                emit HandoverCancelled(assetId, msg.sender);
            }
        }
    }

    // ---------------------------------------------------------------- handover

    /// @notice The steward proposes handing the asset over to `to`. Only `to` can accept, before `expiresAt`.
    /// This changes the registered steward in Vestra; it does not transfer legal ownership.
    function proposeHandover(uint256 assetId, address to, uint64 expiresAt, bytes32 evidenceHash) external {
        Asset storage a = _existing(assetId);
        if (msg.sender != a.steward) revert NotSteward();
        if (a.status == Status.Retired) revert AssetRetired();
        if (to == address(0) || to == a.steward) revert InvalidRecipient();
        if (expiresAt <= block.timestamp || expiresAt > block.timestamp + MAX_HANDOVER_DURATION) {
            revert InvalidExpiry();
        }
        Handover storage h = _handovers[assetId];
        if (h.to != address(0) && h.expiresAt > block.timestamp) revert HandoverAlreadyPending();

        _handovers[assetId] = Handover({
            from: a.steward,
            to: to,
            expiresAt: expiresAt,
            proposedAt: uint64(block.timestamp),
            evidenceHash: evidenceHash
        });
        emit HandoverProposed(assetId, a.steward, to, expiresAt, evidenceHash);
    }

    /// @notice The nominated recipient accepts a live proposal and becomes the registered steward.
    function acceptHandover(uint256 assetId) external returns (uint32 index) {
        Asset storage a = _existing(assetId);
        Handover memory h = _handovers[assetId];
        if (h.to == address(0)) revert NoPendingHandover();
        if (msg.sender != h.to) revert NotRecipient();
        if (block.timestamp >= h.expiresAt) revert HandoverExpired();
        if (h.from != a.steward || a.status == Status.Retired) revert StaleHandover();

        delete _handovers[assetId];
        a.steward = msg.sender;

        Record[] storage list = _records[assetId];
        index = uint32(list.length + 1);
        list.push(
            Record({
                recordType: RecordType.Handover,
                newStatus: a.status,
                submitter: msg.sender,
                newSteward: msg.sender,
                timestamp: uint64(block.timestamp),
                blockNumber: uint64(block.number),
                supersedes: 0,
                supersededBy: 0,
                evidenceHash: h.evidenceHash,
                summary: HANDOVER_SUMMARY,
                documentUri: "",
                providerId: ""
            })
        );
        a.recordCount = index;
        emit RecordAdded(assetId, index, msg.sender, RecordType.Handover, h.evidenceHash);
        emit HandoverAccepted(assetId, h.from, msg.sender);
    }

    /// @notice The steward cancels a live or expired proposal.
    function cancelHandover(uint256 assetId) external {
        Asset storage a = _existing(assetId);
        if (_handovers[assetId].to == address(0)) revert NoPendingHandover();
        if (msg.sender != a.steward) revert NotSteward();
        delete _handovers[assetId];
        emit HandoverCancelled(assetId, msg.sender);
    }

    // ---------------------------------------------------------------- rules

    /// @notice Whether `account` may append a record of type `t` to the asset right now.
    /// Handover records only come from `acceptHandover`, so this returns false for them.
    function canSubmit(uint256 assetId, address account, RecordType t) public view returns (bool) {
        Asset storage a = _existing(assetId);
        if (t == RecordType.Handover) return false;

        bool isService = hasRole(SERVICE_PROVIDER_ROLE, account);
        bool isSteward = account == a.steward;
        bool isAssetRegistrar = account == a.registrar && hasRole(REGISTRAR_ROLE, account);

        // Corrections stay possible after retirement, for wallets that can still act on the asset.
        // Which record may be corrected is checked in addRecord.
        if (t == RecordType.Correction) return isService || isSteward || isAssetRegistrar;
        if (a.status == Status.Retired) return false;

        if (
            isService
                && (
                    t == RecordType.Inspection || t == RecordType.Maintenance || t == RecordType.Installation
                        || t == RecordType.Incident
                )
        ) return true;
        if (isSteward && (t == RecordType.Incident || t == RecordType.StatusChange || t == RecordType.Retirement)) {
            return true;
        }
        if (
            isAssetRegistrar
                && (t == RecordType.Warranty || t == RecordType.Installation || t == RecordType.StatusChange)
        ) return true;
        return false;
    }

    /// @notice Status changes allowed through a StatusChange record. Retired is reached only through a
    /// Retirement record and is terminal.
    function isAllowedTransition(Status from, Status to) public pure returns (bool) {
        if (from == Status.Registered) return to == Status.Active;
        if (from == Status.Active) {
            return to == Status.UnderMaintenance || to == Status.ReportedDamaged || to == Status.ReportedLost;
        }
        if (from == Status.UnderMaintenance) return to == Status.Active || to == Status.ReportedDamaged;
        if (from == Status.ReportedDamaged) return to == Status.UnderMaintenance || to == Status.Active;
        if (from == Status.ReportedLost) return to == Status.Active;
        return false;
    }

    // ---------------------------------------------------------------- views

    function assetCount() external view returns (uint256) {
        return _assetCount;
    }

    function getAsset(uint256 assetId) external view returns (Asset memory) {
        return _existing(assetId);
    }

    /// @notice Assets `offset + 1` to `offset + limit`, oldest first.
    function getAssets(uint256 offset, uint256 limit) external view returns (Asset[] memory page) {
        if (limit > MAX_PAGE) revert PageTooLarge();
        uint256 total = _assetCount;
        if (offset >= total) return new Asset[](0);
        uint256 end = offset + limit > total ? total : offset + limit;
        page = new Asset[](end - offset);
        for (uint256 i; i < page.length; ++i) {
            page[i] = _assets[offset + i + 1];
        }
    }

    /// @notice Records `offset + 1` to `offset + limit` of an asset, oldest first.
    function getRecords(uint256 assetId, uint256 offset, uint256 limit) external view returns (Record[] memory page) {
        _existing(assetId);
        if (limit > MAX_PAGE) revert PageTooLarge();
        Record[] storage list = _records[assetId];
        if (offset >= list.length) return new Record[](0);
        uint256 end = offset + limit > list.length ? list.length : offset + limit;
        page = new Record[](end - offset);
        for (uint256 i; i < page.length; ++i) {
            page[i] = list[offset + i];
        }
    }

    function getRegistrationEvidence(uint256 assetId) external view returns (bytes32[] memory) {
        _existing(assetId);
        return _registrationEvidence[assetId];
    }

    /// @notice The open proposal, if any. `to == address(0)` means none; check `expiresAt` for liveness.
    function getHandover(uint256 assetId) external view returns (Handover memory) {
        _existing(assetId);
        return _handovers[assetId];
    }

    // ---------------------------------------------------------------- internal

    function _existing(uint256 assetId) internal view returns (Asset storage a) {
        if (assetId == 0 || assetId > _assetCount) revert UnknownAsset(assetId);
        return _assets[assetId];
    }

    function _requireLength(string calldata s, uint256 min, uint256 max, string memory field) internal pure {
        uint256 len = bytes(s).length;
        if (len < min || len > max) revert InvalidInput(field);
    }
}
