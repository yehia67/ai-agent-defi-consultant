import { ethers } from 'ethers';
import { logger } from '@elizaos/core';
import { AVALANCHE_FUJI_CONFIG } from '../../configs/networks';

/**
 * Initialize provider with fallback RPC URLs
 * @returns Ethers provider for Avalanche Fuji testnet
 */
export function initializeProvider(): ethers.providers.JsonRpcProvider {
  try {
    // Use the primary RPC URL from the network config
    const provider = new ethers.providers.JsonRpcProvider(AVALANCHE_FUJI_CONFIG.rpcUrl);
    
    // Test the provider connection
    provider.getBlockNumber()
      .then(() => logger.debug('Connected to primary Avalanche Fuji RPC'))
      .catch(() => {
        logger.warn('Primary RPC connection failed, switching to backup');
        // If primary fails, try the backup URL
        const backupProvider = new ethers.providers.JsonRpcProvider(
          process.env.AVALANCHE_FUJI_RPC_URL_BACKUP || 'https://api.avax-test.network/ext/bc/C/rpc'
        );
        return backupProvider;
      });
    
    return provider;
  } catch (error) {
    logger.error('Failed to initialize provider:', error);
    throw new Error('Failed to initialize Avalanche Fuji provider');
  }
}
