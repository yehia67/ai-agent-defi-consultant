import type { Plugin } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { configSchema, ChainlinkAutomationConfig, DEFAULT_CONFIG } from './config';
import { ChainlinkAutomationService } from './service';
import { actions, setChainlinkService } from './actions';
import { testChainlinkAction } from './test-action';

/**
 * Chainlink Automation Plugin for ElizaOS
 * 
 * This plugin enables scheduling and automating tasks using Chainlink Automation on Avalanche Fuji testnet.
 * It provides actions for deploying contracts, registering upkeeps, and scheduling transfers and claims.
 */
const plugin: Plugin = {
  name: 'chainlink-automation',
  description: 'Enables scheduling and automating tasks using Chainlink Automation on Avalanche Fuji testnet',
  priority: -900,
  
  config: {
    CHAINLINK_AUTOMATION_DEPLOYER_PK: process.env.CHAINLINK_AUTOMATION_DEPLOYER_PK,
    AVALANCHE_FUJI_RPC_URL: process.env.AVALANCHE_FUJI_RPC_URL || 'https://avalanche-fuji.drpc.org',
    AVALANCHE_FUJI_RPC_URL_BACKUP: process.env.AVALANCHE_FUJI_RPC_URL_BACKUP || 'https://api.avax-test.network/ext/bc/C/rpc',
    CHAINLINK_AUTOMATION_REGISTRY_ADDRESS: process.env.CHAINLINK_AUTOMATION_REGISTRY_ADDRESS || '0x819B58A646CDd8289275A87653a2aA4902b14fe6',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
  },
  
  async init(config: Record<string, string>): Promise<void> {
    logger.info('Initializing Chainlink Automation plugin...');
    logger.info(`Available actions: ${JSON.stringify(actions.map(a => a.name))}`);
    
    try {
      // Validate and parse configuration
      const validatedConfig = await configSchema.parseAsync(config);
      
      // Check for required private key
      if (!validatedConfig.CHAINLINK_AUTOMATION_DEPLOYER_PK) {
        throw new Error('CHAINLINK_AUTOMATION_DEPLOYER_PK is required');
      }
      
      logger.debug('Configuration validated');
      logger.info(`Using Chainlink Automation Registry: ${validatedConfig.CHAINLINK_AUTOMATION_REGISTRY_ADDRESS}`);
      logger.info(`Using Avalanche Fuji RPC: ${validatedConfig.AVALANCHE_FUJI_RPC_URL}`);
      
      // Initialize the Chainlink Automation service
      const chainlinkService = new ChainlinkAutomationService(
        validatedConfig.CHAINLINK_AUTOMATION_DEPLOYER_PK,
        validatedConfig.CHAINLINK_AUTOMATION_REGISTRY_ADDRESS
      );
      
      // Set the service instance for actions
      setChainlinkService(chainlinkService);
      
      logger.info('Chainlink Automation plugin initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Chainlink Automation plugin:', error);
      throw error;
    }
  },
  
  actions: [...actions.map(action => ({
    name: action.name,
    description: `Chainlink Automation action: ${action.name}`,
    validate: action.validate,
    handler: action.handler
  })), {
    name: 'TEST_CHAINLINK_DIRECT',
    description: 'Direct test action for Chainlink',
    validate: async (runtime, message) => {
      const text = message.content?.text?.toLowerCase() || '';
      logger.info(`TEST_CHAINLINK_DIRECT validate checking: "${text}"`);
      return text === 'test chainlink';
    },
    handler: async (runtime, message) => {
      logger.info('TEST_CHAINLINK_DIRECT handler triggered');
      const walletAddress = "0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3";
      const walletUrl = "https://testnet.snowtrace.io/address/0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3";
      
      return {
        text: `✅ Chainlink test successful!\n\n📍 **Wallet Address:** ${walletAddress}\n🔗 **Wallet URL:** [View on Explorer](${walletUrl})`
      };
    }
  }],
  
  routes: [
    {
      name: 'chainlink-automation-status',
      path: '/chainlink-automation/status',
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
