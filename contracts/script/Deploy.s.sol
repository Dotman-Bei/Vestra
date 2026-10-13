// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {VestraRegistry} from "../src/VestraRegistry.sol";

/// Deploys VestraRegistry.
///
/// The deployer starts as default admin so it can grant the initial roles in the same run. If
/// ADMIN_ADDRESS differs, the script then begins the two-step admin transfer; ADMIN_ADDRESS must call
/// `acceptDefaultAdminTransfer()` after the 2-day delay.
///
///   forge script script/Deploy.s.sol --rpc-url bohr --broadcast \
///     --verify --verifier blockscout --verifier-url https://scan.bohr.life/api/
contract Deploy is Script {
    function run() external returns (VestraRegistry reg) {
        uint256 key = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(key);
        address admin = vm.envOr("ADMIN_ADDRESS", deployer);
        address[] memory registrars = vm.envOr("INITIAL_REGISTRARS", ",", new address[](0));
        address[] memory providers = vm.envOr("INITIAL_SERVICE_PROVIDERS", ",", new address[](0));

        vm.startBroadcast(key);
        reg = new VestraRegistry(deployer);
        for (uint256 i; i < registrars.length; ++i) {
            reg.grantRole(reg.REGISTRAR_ROLE(), registrars[i]);
        }
        for (uint256 i; i < providers.length; ++i) {
            reg.grantRole(reg.SERVICE_PROVIDER_ROLE(), providers[i]);
        }
        if (admin != deployer) reg.beginDefaultAdminTransfer(admin);
        vm.stopBroadcast();

        console2.log("VestraRegistry", address(reg));
        console2.log("chainId", block.chainid);
        console2.log("registrars granted", registrars.length);
        console2.log("service providers granted", providers.length);
        if (admin != deployer) console2.log("admin transfer pending to", admin);
    }
}
