import { ethers } from 'ethers';
import { logger } from '@elizaos/core';
import { ChainlinkAutomationService } from './service';

/**
 * Test function for Chainlink Automation daily transfer
 * This function tests scheduling a daily transfer of 0.0001 AVAX to a specific address
 */
export async function testChainlinkDailyTransfer(service: ChainlinkAutomationService): Promise<any> {
  try {
    logger.info('Starting Chainlink daily transfer test...');
    
    // Check if service is initialized
    if (!service.isInitialized()) {
      throw new Error('ChainlinkAutomationService is not initialized');
    }
    
    // Test address to receive the transfer (fixed address for the user's requirement)
    const testAddress = '0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3';
    logger.info(`Using test recipient address: ${testAddress}`);
    
    // Test amount (0.0001 AVAX in wei)
    const testAmount = '100000000000000';
    logger.info(`Test amount: ${testAmount} wei (0.0001 AVAX)`);
    
    // Start time (5 minutes from now)
    const startTime = Math.floor(Date.now() / 1000) + 300;
    const startTimeFormatted = new Date(startTime * 1000).toLocaleString();
    logger.info(`Scheduled start time: ${startTimeFormatted} (${startTime})`);
    
    // Frequency (daily = 86400 seconds)
    const frequency = 86400;
    logger.info(`Frequency: ${frequency} seconds (daily)`);
    
    // First check provider connection before attempting to deploy
    logger.info('Verifying blockchain provider connection...');
    try {
      // Simple check by attempting to get the network
      await Promise.race([
        service.getNetworkInfo(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Provider connection check timed out')), 5000))
      ]);
      logger.info('Provider connection verified successfully');
    } catch (providerError) {
      logger.error('Provider connection check failed:', providerError);
      throw new Error(`Cannot proceed with test: Provider connection failed - ${providerError.message}`);
    }
    
    // First, deploy the contract if not already deployed
    logger.info('Deploying scheduled transfer contract...');
    const deployResult = await Promise.race([
      service.deployScheduledTransferContract(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Contract deployment timed out after 15 seconds')), 15000))
    ]) as { success: boolean; error?: string; data?: { contractAddress: string } };
    
    if (!deployResult.success) {
      logger.error('Failed to deploy contract:', deployResult.error);
      return {
        success: false,
        message: `Failed to deploy contract: ${deployResult.error || 'Unknown error'}`,
        error: deployResult.error || 'Unknown error'
      };
    }
    
    logger.info(`Contract deployed at: ${deployResult.data.contractAddress}`);
    
    // Schedule the transfer with timeout
    logger.info('Scheduling test transfer...');
    const scheduleResult = await Promise.race([
      service.scheduleTransfer(
        testAddress,
        testAmount,
        startTime,
        frequency
      ),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transfer scheduling timed out after 15 seconds')), 15000)
      )
    ]) as { success: boolean; error?: string; data?: { transferId: string } };
    
    if (!scheduleResult.success) {
      logger.error('Failed to schedule transfer:', scheduleResult.error);
      return {
        success: false,
        message: `Failed to schedule transfer: ${scheduleResult.error || 'Unknown error'}`,
        error: scheduleResult.error || 'Unknown error'
      };
    }
    
    logger.info(`Transfer scheduled with ID: ${scheduleResult.data.transferId}`);
    
    // Return the combined results
    return {
      success: true,
      message: 'Successfully tested Chainlink Automation daily transfer',
      data: {
        contractAddress: deployResult.data?.contractAddress || 'unknown',
        transferId: scheduleResult.data?.transferId || 'unknown',
        recipient: testAddress,
        amount: testAmount,
        startTime: new Date(startTime * 1000).toISOString(),
        frequency: 'daily'
      }
    };
  } catch (error) {
    logger.error('Error testing Chainlink Automation daily transfer:', error);
    return {
      success: false,
      message: `Error testing Chainlink Automation daily transfer: ${error.message}`,
      error: error.message
    };
  }
}
