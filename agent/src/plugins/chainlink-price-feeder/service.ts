import { ethers } from 'ethers';
import { logger } from '@elizaos/core';
import { PRICE_FEDDER_ABI } from './constants';
import { initializeProvider } from './provider';

const aggregatorAbi = [
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
];

export class ChainlinkPriceFeedService {
  private provider: ethers.providers.JsonRpcProvider;
  private feederContract: ethers.Contract;

  constructor(rpcUrl: string, priceFeederAddress: string) {
    this.provider = initializeProvider();
    this.feederContract = new ethers.Contract(priceFeederAddress, PRICE_FEDDER_ABI, this.provider);
    logger.info('ChainlinkPriceFeedService initialized with HistoricalPriceFeeder at ' + priceFeederAddress);
  }

  /**
   * Gets the latest round ID for a given Chainlink aggregator address.
   * @param feedAddress Chainlink aggregator address.
   */
  async getLatestRoundId(feedAddress: string): Promise<bigint> {
    try {
      const aggregator = new ethers.Contract(feedAddress, aggregatorAbi, this.provider);
      const latest = await aggregator.latestRoundData();
      const latestRoundId = latest.roundId;
      console.log(`Latest round  ${latestRoundId}`);
      return latestRoundId;
    } catch (err) {
      logger.error('Failed to get latest round ID:', err);
      throw new Error('Failed to get latest round ID from aggregator');
    }
  }

  /**
   * Gets the historical price for a given feed and round ID via your deployed contract.
   * @param feedAddress Chainlink aggregator address.
   * @param roundId Historical round ID to query.
   */
  async getHistoricalData(feedAddress: string, roundId: bigint): Promise<bigint> {
    try {
      const result = await this.feederContract.getHistoricalData(feedAddress, roundId);
      return BigInt(result.toString());
    } catch (err) {
      logger.error(`Error fetching historical data for ${feedAddress} at round ${roundId}:`, err);
      throw new Error('Failed to fetch historical data');
    }
  }
}
