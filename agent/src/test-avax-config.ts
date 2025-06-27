import { ethers } from 'ethers';
import { logger } from '@elizaos/core';

// Test function to verify Avalanche network configuration
async function testAvalancheConfig() {
  try {
    logger.info('Testing Avalanche Fuji Testnet connection...');
    
    // Connect to Fuji testnet
    const fujiProvider = new ethers.providers.JsonRpcProvider('https://avax-fuji.g.alchemy.com/v2/0syyeOykgk2mVv2b6DPMOqnYsmvNZCUV');
    const fujiNetwork = await fujiProvider.getNetwork();
    logger.info(`Successfully connected to Fuji testnet. Chain ID: ${fujiNetwork.chainId}`);
    
    // Connect to Avalanche mainnet
    logger.info('Testing Avalanche Mainnet connection...');
    const avalancheProvider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    const avalancheNetwork = await avalancheProvider.getNetwork();
    logger.info(`Successfully connected to Avalanche mainnet. Chain ID: ${avalancheNetwork.chainId}`);
    
    // Test with private key if available
    const privateKey = process.env.CHAINLINK_AUTOMATION_DEPLOYER_PK;
    if (privateKey) {
      logger.info('Private key found, testing wallet creation...');
      
      // Create wallet on Fuji
      const fujiWallet = new ethers.Wallet(privateKey, fujiProvider);
      const fujiAddress = await fujiWallet.getAddress();
      const fujiBalance = await fujiProvider.getBalance(fujiAddress);
      logger.info(`Fuji wallet address: ${fujiAddress}`);
      logger.info(`Fuji wallet balance: ${ethers.utils.formatEther(fujiBalance)} AVAX`);
      
      // Create wallet on Avalanche mainnet
      const avalancheWallet = new ethers.Wallet(privateKey, avalancheProvider);
      const avalancheBalance = await avalancheProvider.getBalance(fujiAddress);
      logger.info(`Avalanche mainnet balance: ${ethers.utils.formatEther(avalancheBalance)} AVAX`);
      
      // Test address for daily transfers
      const targetAddress = '0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3';
      const targetBalance = await fujiProvider.getBalance(targetAddress);
      logger.info(`Target address (${targetAddress}) balance: ${ethers.utils.formatEther(targetBalance)} AVAX`);
      
      return {
        success: true,
        fujiChainId: fujiNetwork.chainId,
        avalancheChainId: avalancheNetwork.chainId,
        walletAddress: fujiAddress,
        fujiBalance: ethers.utils.formatEther(fujiBalance),
        avalancheBalance: ethers.utils.formatEther(avalancheBalance),
        targetAddress,
        targetBalance: ethers.utils.formatEther(targetBalance)
      };
    } else {
      logger.warn('No private key found in environment variables');
      return {
        success: true,
        fujiChainId: fujiNetwork.chainId,
        avalancheChainId: avalancheNetwork.chainId,
        privateKeyFound: false
      };
    }
  } catch (error) {
    logger.error('Error testing Avalanche configuration:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testAvalancheConfig().then(result => {
  console.log('Test result:', JSON.stringify(result, null, 2));
}).catch(error => {
  console.error('Test failed:', error);
});
