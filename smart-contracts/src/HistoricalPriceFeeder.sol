// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * This contract allows querying historical price data
 * from any Chainlink price feed, given its address and a round ID.
 */
contract HistoricalPriceFeeder {
    /**
     * Returns historical price data from a given feed address and round ID.
     * @param feedAddress The address of the Chainlink price feed.
     * @param roundId The historical round ID to query.
     */
    function getHistoricalData(address feedAddress, uint80 roundId) public view returns (int256) {
        AggregatorV3Interface dataFeed = AggregatorV3Interface(feedAddress);

        (
            , // uint80 roundID
            int256 answer,
            , // uint startedAt
            , // uint updatedAt
            // uint80 answeredInRound
        ) = dataFeed.getRoundData(roundId);

        return answer;
    }

    /**
     * Get latest price too if needed.
     */
    function getLatestData(address feedAddress) public view returns (int256) {
        AggregatorV3Interface dataFeed = AggregatorV3Interface(feedAddress);

        (
            , // uint80 roundID
            int256 answer,
            , // uint startedAt
            , // uint updatedAt
            // uint80 answeredInRound
        ) = dataFeed.latestRoundData();

        return answer;
    }
}
