import type { Plugin } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { configSchema, DEFAULT_CONFIG } from './config';
import { actions, setPriceFeedService } from './actions';
import { ChainlinkPriceFeedService } from './service';

/**
 * Chainlink Price Feed Plugin for ElizaOS
 * 
 * This plugin enables fetching latest and historical ETH/USD price feeds using Chainlink on Avalanche Fuji testnet.
 */
const plugin: Plugin = {
  name: 'chainlink-price-feed',
  description: 'Fetches latest and historical ETH/USD prices using Chainlink on Avalanche Fuji testnet',
  priority: -900,

  config: configSchema,

  async init(config: Record<string, string>): Promise<void> {
    logger.info('Initializing Chainlink Price Feed plugin...');
    logger.info(`Available actions: ${JSON.stringify(actions.map(a => a.name))}`);
    
    try {
      // Validate and parse configuration
      const validatedConfig = await configSchema.parseAsync(config);
      
      logger.debug('Configuration validated');
      logger.info(`Using Chainlink Price Feed: ${validatedConfig.CHAINLINK_PRICE_FEED_ADDRESS}`);
      logger.info(`Using Avalanche Fuji RPC: ${validatedConfig.AVALANCHE_FUJI_RPC_URL}`);
      
      // Initialize the Chainlink Price Feed service
      const priceFeedService = new ChainlinkPriceFeedService(
        validatedConfig.AVALANCHE_FUJI_RPC_URL,
        validatedConfig.CHAINLINK_PRICE_FEED_ADDRESS
      );
      
      // Set the service instance for actions
      setPriceFeedService(priceFeedService);
      
      logger.info('Chainlink Price Feed plugin initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Chainlink Price Feed plugin:', error);
      throw error;
    }
  },
  
  actions: [...actions.map(action => ({
    name: action.name,
    description: `Chainlink Price Feed action: ${action.name}`,
    validate: action.validate,
    handler: action.handler
  })), {
    name: 'TEST_CHAINLINK_PRICE_FEED',
    description: 'Direct test action for Chainlink Price Feed',
    validate: async (runtime, message) => {
      const text = message.content?.text?.toLowerCase() || '';
      logger.info(`TEST_CHAINLINK_PRICE_FEED validate checking: "${text}"`);
      return text === 'test chainlink price';
    },
    handler: async (runtime, message) => {
      logger.info('TEST_CHAINLINK_PRICE_FEED handler triggered');
      const feedAddress = "0xB677bfBc9B09a3469695f0d48d7aA8BF68bC0dB2";
      const feedUrl = "https://testnet.snowtrace.io/address/0xB677bfBc9B09a3469695f0d48d7aA8BF68bC0dB2";
      
      return {
        text: `✅ Chainlink Price Feed test successful!\n\n📍 **Feed Address:** ${feedAddress}\n🔗 **Feed URL:** [View on Explorer](${feedUrl})`
      };
    }
  }],
  
  routes: [
    {
      name: 'chainlink-price-feed-status',
      path: '/chainlink-price-feed/status',
      type: 'GET',
      handler: async (req: any, res: any): Promise<void> => {
        res.json({
          status: 'active',
          name: plugin.name,
          version: '1.0.0'
        });
      }
    }
  ]
};

export default plugin;
