import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  logger,
} from '@elizaos/core';
import { ChainlinkPriceFeedService } from './service';
import { chainlinkFeeds } from './chainlinkFeeds';

let priceFeedService: ChainlinkPriceFeedService;

export function setPriceFeedService(service: ChainlinkPriceFeedService) {
  priceFeedService = service;
}

export const fetchChainlinkPricesAction: Action = {
  name: 'FETCH_CHAINLINK_PRICES',
  similes: ['GET_PRICE_FEED', 'CHAINLINK_PRICE', 'ETH PRICE', 'PRICE HISTORY'],
  description: 'Fetches latest and historical prices from Chainlink on Avalanche Fuji testnet.',
  validate: async (runtime, message) => {
    const text = message.content?.text?.toLowerCase() || '';
    return text.includes('price');
  },
  handler: async (runtime, message, state, options, callback) => {
    try {
      const text = message.content?.text?.toLowerCase() || '';
      const match = text.match(/price\s+of\s+([a-z]+)/i);
      const symbol = match?.[1]?.toLowerCase();

      if (!symbol) {
        return { text: '❌ Please specify a valid crypto symbol like "BTC" or "AVAX".' };
      }

      const feedAddress = chainlinkFeeds[symbol];

      if (!feedAddress) {
        const available = Object.keys(chainlinkFeeds).map(s => s.toUpperCase()).join(', ');
        return {
          text: `❌ Price feed for "${symbol.toUpperCase()}" is not available on Avalanche.\n\n✅ Available currencies: ${available}`
        };
      }

      const rounds = parseInt(text.match(/(\d+)\s*(?:rounds|historical)/i)?.[1] || '5');
      const latestRoundId = await priceFeedService.getLatestRoundId(feedAddress);
      const roundIds = Array.from({ length: rounds }, (_, i) => latestRoundId - BigInt(i));

      const historical = await Promise.all(
        roundIds.map(async (id) => {
          const price = await priceFeedService.getHistoricalData(feedAddress, id);
          return { roundId: id.toString(), price: Number(price) / 1e8 }; // assuming 8 decimals
        })
      );

      let response = `✅ **Latest ${symbol.toUpperCase()}/USD Price:** $${historical[0].price.toFixed(2)} (Round ${historical[0].roundId})\n\n📊 **Historical Rounds:**\n`;
      for (const entry of historical.slice(1)) {
        response += `• Round ${entry.roundId}: $${entry.price.toFixed(2)}\n`;
      }

      if (callback) {
        await callback({ type: 'SUCCESS', message: 'Price data fetched', data: historical });
      }

      return { text: response };

    } catch (err) {
      if (callback) {
        await callback({ type: 'ERROR', message: err.message });
      }
      return { text: `❌ Error: ${err.message}` };
    }
  },
  examples: [
    [
      { name: 'user', content: { text: 'Get the price of BTC' } },
      { name: 'agent', content: { text: 'Here is the latest and historical BTC/USD price data from Chainlink.' } },
    ],
    [
      { name: 'user', content: { text: 'What is the price of AVAX for last 3 rounds' } },
      { name: 'agent', content: { text: 'Here is the latest and historical AVAX/USD price data from Chainlink.' } },
    ],
  ],
};

export const actions = [fetchChainlinkPricesAction];
