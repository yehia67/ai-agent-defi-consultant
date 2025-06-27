// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/HistoricalPriceFeeder.sol";

contract HistoricalPriceFeederTest is Test {
    HistoricalPriceFeeder public feeder;

    // Example feed address from Avalanche
    address public constant BTC_USD = 0x31CF013A08c6Ac228C94551d535d5BAfE19c602a;
    address public constant AVAX_USD = 0x5498BB86BC934c8D34FDA08E81D444153d0D06aD;

    function setUp() public {
        feeder = new HistoricalPriceFeeder();

        // Fork Avalanche Mainnet at recent block
        // (make sure `foundry.toml` has an RPC URL set for this chain)
        // You can also set it via env var: `export AVAX_RPC_URL=https://...`
        string memory rpcUrl = vm.envString("AVAX_RPC_URL");
        vm.createSelectFork(rpcUrl);
    }

    function testGetLatestAVAXPrice() public {
        int256 price = feeder.getLatestData(AVAX_USD);
        console2.log("AVAX/USD price:", price);
        assertGt(price, 0);
    }

    function testGetLatestBTCPrice() public {
        int256 price = feeder.getLatestData(BTC_USD);
        console2.log("BTC/USD price:", price);
        assertGt(price, 0);
    }

    function testGetHistoricalBTCPrice() public {
        uint80 roundId = 18446744073709554683;
        int256 price = feeder.getHistoricalData(BTC_USD, roundId);
        console2.log("BTC/USD historical price:", price);
        assertGt(price, 0);
    }
}
