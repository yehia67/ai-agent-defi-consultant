// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {AutoTrigger} from "../src/AutoTrigger.sol";

contract AutoTriggerScript is Script {
    AutoTrigger public autoTrigger;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        // first param the default entry point 0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789
        // second param should be any wallet address
        autoTrigger = new AutoTrigger(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789, 0x996a1907B8a8CB39E7664baC1B74509189209D45);

        vm.stopBroadcast();
    }
}
