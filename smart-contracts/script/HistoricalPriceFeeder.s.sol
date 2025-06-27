// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {HistoricalPriceFeeder} from "../src/HistoricalPriceFeeder.sol";

contract AutoTriggerScript is Script {
    HistoricalPriceFeeder public historicalPriceFeeder;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        historicalPriceFeeder = new HistoricalPriceFeeder();
        vm.stopBroadcast();
    }
}
