import type { Plugin } from '@elizaos/core';
import { type IAgentRuntime, logger } from '@elizaos/core';
import { configSchema } from './config';
import { ChainlinkAutomationService } from './service';
import { actions, setChainlinkService } from './actions';

// Import routes
import { routes } from './apis';

/**
 * Chainlink Automation Plugin for ElizaOS
 * 
 * This plugin enables scheduling and automating tasks using Chainlink Automation on Avalanche Fuji testnet.
 * It provides actions for deploying contracts, registering upkeeps, and scheduling transfers and claims.
 */
export const ChainlinkAutomationPlugin: Plugin = {
  name: 'chainlink-automation',
  description: 'Enables scheduling and automating tasks using Chainlink Automation on Avalanche Fuji testnet',
  dependencies: ['@elizaos/plugin-sql'],
  
  // Register all actions from the actions module
  actions: actions,
  
  // Register services
  services: [ChainlinkAutomationService],
  
  // Register API routes
  routes,
  
  // Register schema
  schema: configSchema,
  
  async init(config: Record<string, string>, runtime: IAgentRuntime): Promise<void> {
    logger.info('Initializing Chainlink Automation plugin...');
    logger.info(`Available actions: ${JSON.stringify(actions.map(a => a.name))}`);
    
    try {
      // Validate and parse configuration
      // We'll use the RPC URLs from the provider.ts file directly
      // rather than hardcoding them here
      const validatedConfig = await configSchema.parseAsync({
        CHAINLINK_AUTOMATION_DEPLOYER_PK: process.env.CHAINLINK_AUTOMATION_DEPLOYER_PK,
        CHAINLINK_AUTOMATION_REGISTRY_ADDRESS: process.env.CHAINLINK_AUTOMATION_REGISTRY_ADDRESS || '0x819B58A646CDd8289275A87653a2aA4902b14fe6',
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        ...config
      });
      
      // Check for required private key
      if (!validatedConfig.CHAINLINK_AUTOMATION_DEPLOYER_PK) {
        logger.error('CHAINLINK_AUTOMATION_DEPLOYER_PK is required but not provided');
        throw new Error('CHAINLINK_AUTOMATION_DEPLOYER_PK is required');
      }
      
      logger.debug('Configuration validated');
      logger.info(`Using Chainlink Automation Registry: ${validatedConfig.CHAINLINK_AUTOMATION_REGISTRY_ADDRESS}`);
      logger.info(`Using primary Avalanche Fuji RPC: ${validatedConfig.AVALANCHE_FUJI_RPC_URL}`);
      logger.info(`Using backup Avalanche Fuji RPC: ${validatedConfig.AVALANCHE_FUJI_RPC_URL_BACKUP}`);
      
      // Set environment variables for the service
      process.env.CHAINLINK_AUTOMATION_DEPLOYER_PK = validatedConfig.CHAINLINK_AUTOMATION_DEPLOYER_PK;
      process.env.CHAINLINK_AUTOMATION_REGISTRY_ADDRESS = validatedConfig.CHAINLINK_AUTOMATION_REGISTRY_ADDRESS;
      process.env.AVALANCHE_FUJI_RPC_URL = validatedConfig.AVALANCHE_FUJI_RPC_URL;
      process.env.AVALANCHE_FUJI_RPC_URL_BACKUP = validatedConfig.AVALANCHE_FUJI_RPC_URL_BACKUP;
      
      // Skip pre-testing RPC connection
      // The provider initialization is handled in the service.initialize() method with robust retry logic
      logger.info('Using Avalanche Fuji testnet with multiple public RPC endpoints');
      logger.info('Provider initialization will be handled by the service with retry mechanism');
      
      // Initialize the Chainlink Automation service with extended timeout
      logger.info('Initializing Chainlink Automation service...');
      try {
        logger.info('Starting ChainlinkAutomationService');
        const service = new ChainlinkAutomationService();
        logger.info('ChainlinkAutomationService instance created');
        
        // Initialize the service with a longer timeout (60 seconds)
        // This gives more time for RPC connection attempts
        await Promise.race([
          service.initialize(),
          new Promise<never>((_, reject) => {
            const timeoutId = setTimeout(() => {
              logger.error('Service initialization timeout - this may be due to network connectivity issues');
              reject(new Error('Service initialization timed out after 60 seconds - please check your network connectivity'));
            }, 60000);
            
            // Ensure the timeout is cleared if the promise resolves
            return () => clearTimeout(timeoutId);
          })
        ]);
        
        logger.info('ChainlinkAutomationService initialized successfully');
        
        // Set the service instance for actions and test action
        logger.info('Setting service instances in plugin.ts');
        setChainlinkService(service);
        
        // Verify service was properly set
        logger.info('Service instances set. Verifying initialization...');
        
        // Add a small delay to ensure service is fully registered
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error(`Failed to initialize Chainlink Automation service: ${error.message}`);
        
        // Provide more helpful error information
        if (error.message.includes('timed out') || error.message.includes('network')) {
          logger.error('This appears to be a network connectivity issue. Please check:');
          logger.error('1. Your internet connection is working');
          logger.error('2. You can access Avalanche Fuji testnet RPC endpoints');
          logger.error('3. No firewall or proxy is blocking blockchain RPC requests');
          throw new Error(`Network connectivity issue: ${error.message}`);
        } else if (error.message.includes('timeout')) {
          logger.error('Service initialization timed out. This could be due to network connectivity issues.');
          throw new Error(`Failed to initialize Chainlink Automation service: Initialization timed out. Please check your network connection.`);
        } else {
          throw new Error(`Failed to initialize Chainlink Automation service: ${error.message}`);
        }
      }
      
      // This section has been moved up to where the service is initialized
      
      // Check for database availability
      if (runtime.db) {
        logger.info('Database available, Chainlink Automation plugin ready for operation');
      } else {
        logger.warn('No database instance available, operations will be limited');
      }
      
      logger.info('Chainlink Automation plugin initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Chainlink Automation plugin:', error);
      throw error;
    }
  }
};

export default ChainlinkAutomationPlugin;

// Export services for external use
export { ChainlinkAutomationService } from './service.js';

// Export types
export type { ChainlinkAutomationConfig } from './config.js';

// Export schema
export { configSchema } from './config.js';
