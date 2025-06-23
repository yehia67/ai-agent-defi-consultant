import {
  type Action,
  type Content,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  logger,
} from '@elizaos/core';
import { ChainlinkAutomationService } from './service';
import { testChainlinkDailyTransfer } from './test-chainlink-transfer';
import { ethers } from 'ethers';

// Service instance will be initialized in the plugin
let chainlinkService: ChainlinkAutomationService | null = null;

// Set the service instance
export function setChainlinkService(service: ChainlinkAutomationService) {
  logger.info('Setting chainlinkService in test-action.ts');
  chainlinkService = service;
  logger.info(`ChainlinkService set: ${chainlinkService ? 'YES' : 'NO'}`);
}

/**
 * Simple test action for Chainlink Automation
 * This action is used to test the Chainlink Automation functionality
 * and verify that the plugin is working correctly.
 */
export const testChainlinkAction: Action = {
  name: 'TEST_CHAINLINK',
  similes: ['test chainlink', 'chainlink test', 'check chainlink'],
  description: 'Test Chainlink action that returns the wallet URL',
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = message.content?.text?.toLowerCase() || '';
    logger.info(`TEST_CHAINLINK validate checking: "${text}"`);
    return text.includes('test chainlink') || 
           text.includes('chainlink test') || 
           text.includes('check chainlink');
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ): Promise<Content> => {
    logger.info('Handling TEST_CHAINLINK action');
    
    const walletAddress = "0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3";
    const walletUrl = "https://testnet.snowtrace.io/address/0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3";
    
    // Send immediate callback to indicate processing has started
    if (callback) {
      try {
        await callback({
          type: 'PROCESSING',
          message: 'Processing Chainlink test request...',
          data: { walletAddress }
        });
      } catch (callbackError) {
        logger.error('Error sending initial callback:', callbackError);
        // Continue execution even if callback fails
      }
    }
    
    // Log service status immediately
    logger.info(`ChainlinkService status: ${chainlinkService ? 'Available' : 'Not Available'}`);
    if (chainlinkService) {
      logger.info(`Service initialized: ${chainlinkService.isInitialized() ? 'YES' : 'NO'}`);
    }
    
    try {
      // Check if the message contains a request for daily transfer test
      const text = message.content?.text?.toLowerCase() || '';
      const testDailyTransfer = text.includes('daily transfer') || 
                             text.includes('schedule transfer') || 
                             text.includes('automate transfer');
      
      // Set a timeout for the entire operation
      const timeoutMs = 10000; // 10 seconds
      const timeoutPromise = new Promise<Content>((resolve) => {
        setTimeout(() => {
          logger.warn(`TEST_CHAINLINK action timed out after ${timeoutMs/1000} seconds`);
          resolve({
            text: `⚠️ Chainlink Test Timed Out

The test operation took too long to complete. This could be due to:

1. Network connectivity issues with the Avalanche Fuji testnet
2. Service initialization problems
3. RPC endpoint response delays

Please try again later or check your network connection.`
          });
        }, timeoutMs);
      });
      
      // Create the handler promise
      const handlerPromise = (async (): Promise<Content> => {
        if (testDailyTransfer) {
          // Send immediate processing callback to prevent UI hanging
          if (callback) {
            await callback({
              type: 'PROCESSING',
              message: 'Starting Chainlink Automation test...',
              data: { status: 'starting' }
            });
          }
          
          if (!chainlinkService) {
            return {
              text: '❌ Cannot test Chainlink Automation: Service is not available'
            };
          }
          
          // Check if service is properly initialized
          if (!chainlinkService.isInitialized()) {
            return {
              text: '❌ Chainlink Automation service is not properly initialized. Please check your private key configuration.'
            };
          }
          
          logger.info('Testing daily transfer of 0.0001 AVAX');
          
          // Send progress update
          if (callback) {
            await callback({
              type: 'PROCESSING',
              message: 'Chainlink service is ready. Testing daily transfer of 0.0001 AVAX to ' + walletAddress,
              data: { walletAddress }
            });
          }
          
          try {
            // Run the daily transfer test with timeout
            const result = await testChainlinkDailyTransfer(chainlinkService);
            
            if (result.success) {
              return {
                text: `✅ Daily Transfer Test Successful!\n\n` +
                      `💰 **Amount:** ${result.data.amount} AVAX\n` +
                      `👤 **Recipient:** ${result.data.recipient}\n` +
                      `🕒 **Starting:** ${new Date(result.data.startTime).toLocaleString()}\n` +
                      `🔄 **Frequency:** ${result.data.frequency}\n` +
                      `📍 **Contract:** ${result.data.contractAddress}\n` +
                      `🆔 **Transfer ID:** ${result.data.transferId}\n\n` +
                      `This test confirms that the Chainlink Automation plugin can schedule daily transfers.`
              };
            } else {
              return {
                text: `❌ Daily Transfer Test Failed!\n\n` +
                      `**Error:** ${result.error || 'Unknown error'}\n\n` +
                      `Please check the logs for more details and ensure that the Chainlink Automation service is properly configured.`
              };
            }
          } catch (error) {
            logger.error('Error in daily transfer test:', error);
            return {
              text: `❌ Daily Transfer Test Failed!\n\n` +
                    `**Error:** ${error.message}\n\n` +
                    `Please check the logs for more details and ensure that the Chainlink Automation service is properly configured.`
            };
          }
        }
        
        // Default basic test - just return success if we got this far
        return {
          text: `✅ Chainlink Automation Test Successful!\n\n` +
                `📍 **Wallet Address:** ${walletAddress}\n` +
                `🔗 **Wallet URL:** [View on Explorer](${walletUrl})\n\n` +
                `This test confirms that the Chainlink Automation plugin is properly loaded and can be invoked.\n\n` +
                `To test scheduling a daily transfer of 0.0001 AVAX, say "Test daily transfer with Chainlink".`
        };
      })();
      
      // Race between the handler and the timeout
      return await Promise.race([handlerPromise, timeoutPromise]);
      
    } catch (error) {
      logger.error('Error in TEST_CHAINLINK action:', error);
      
      if (callback) {
        await callback({
          type: 'ERROR',
          message: `Error in TEST_CHAINLINK action: ${error.message}`,
          data: { error: error.message }
        });
      }
      
      return {
        text: `❌ Chainlink Automation Test Failed!\n\n` +
              `**Error:** ${error.message}\n\n` +
              `Please check that the Chainlink Automation service is properly configured.`
      };
    }
  },
  examples: [
    {
      name: 'user',
      content: {
        text: 'test chainlink'
      }
    },
    {
      name: 'agent',
      content: {
        text: 'Here\'s the Chainlink test wallet URL.'
      }
    }
  ]
};
        // Send immediate processing callback to prevent UI hanging
        if (callback) {
          await callback({
            type: 'PROCESSING',
            message: 'Starting Chainlink Automation test...',
            data: { status: 'starting' }
          });
        }
        
        if (!chainlinkService) {
          if (callback) {
            await callback({
              type: 'PROCESSING',
              message: 'Chainlink Automation service is not available. Checking plugin initialization...',
              data: { error: 'Service not initialized' }
            });
          }
          
          return {
            text: '❌ Cannot test Chainlink Automation: Service is not available'
          };
        }
        
        // Check if service is properly initialized
        if (!chainlinkService.isInitialized()) {
          if (callback) {
            await callback({
              type: 'PROCESSING',
              message: 'Chainlink Automation service is not properly initialized. Checking RPC connection...',
              data: { error: 'Service initialization incomplete' }
            });
          }
          
          // Try to get network info to provide more specific error
          try {
            await chainlinkService.getNetworkInfo();
          } catch (networkError) {
            return {
              text: `❌ Chainlink Automation service initialization failed: RPC connection error - ${networkError.message}. Please check your network connection and RPC configuration.`
            };
          }
          
          return {
            text: '❌ Chainlink Automation service is not properly initialized. Please check your private key configuration.'
          };
        }
        
        logger.info('Testing daily transfer of 0.0001 AVAX');
        
        // Send progress update
        if (callback) {
          await callback({
            type: 'PROCESSING',
            message: 'Chainlink service is ready. Testing daily transfer of 0.0001 AVAX to ' + walletAddress,
            data: { walletAddress }
          });
        }
        
        // Run the daily transfer test with timeout
        const result = await Promise.race([
          testChainlinkDailyTransfer(chainlinkService),
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('Test operation timed out after 30 seconds')), 30000)
          )
        ]);
        
        if (result.success) {
          if (callback) {
            await callback({
              type: 'SUCCESS',
              message: 'Successfully scheduled daily transfer of 0.0001 AVAX',
              data: result.data
            });
          }
          
          return {
            text: `✅ Daily Transfer Test Successful!\n\n` +
                  `💰 **Amount:** ${result.data.amount} AVAX\n` +
                  `👤 **Recipient:** ${result.data.recipient}\n` +
                  `🕒 **Starting:** ${new Date(result.data.startTime).toLocaleString()}\n` +
                  `🔄 **Frequency:** ${result.data.frequency}\n` +
                  `📍 **Contract:** ${result.data.contractAddress}\n` +
                  `🆔 **Transfer ID:** ${result.data.transferId}\n\n` +
                  `This test confirms that the Chainlink Automation plugin can schedule daily transfers.`
          };
        } else {
          if (callback) {
            await callback({
              type: 'ERROR',
              message: `Failed to schedule daily transfer: ${result.error || 'Unknown error'}`,
              data: { error: result.error || 'Unknown error' }
            });
          }
          
          return {
            text: `❌ Daily Transfer Test Failed!\n\n` +
                  `**Error:** ${result.error || 'Unknown error'}\n\n` +
                  `Please check the logs for more details and ensure that the Chainlink Automation service is properly configured.`
          };
        }
      }
      
      // Default basic test
      // Send immediate callback to prevent hanging
      if (callback) {
        await callback({
          type: 'SUCCESS',
          message: 'Test Chainlink action executed successfully',
          data: { walletAddress, walletUrl }
        });
      }
      
      return {
        text: `✅ Chainlink Automation Test Successful!\n\n` +
              `📍 **Wallet Address:** ${walletAddress}\n` +
              `🔗 **Wallet URL:** [View on Explorer](${walletUrl})\n\n` +
              `This test confirms that the Chainlink Automation plugin is properly loaded and can be invoked.\n\n` +
              `To test scheduling a daily transfer of 0.0001 AVAX, say "Test daily transfer with Chainlink".`
      };
    } catch (error) {
      logger.error('Error in TEST_CHAINLINK action:', error);
      
      if (callback) {
        await callback({
          type: 'ERROR',
          message: `Error in TEST_CHAINLINK action: ${error.message}`,
          data: { error: error.message }
        });
      }
      
      return {
        text: `❌ Chainlink Automation Test Failed!\n\n` +
              `**Error:** ${error.message}\n\n` +
              `Please check that the Chainlink Automation service is properly configured.`
      };
    }
  },
  examples: [
    [
      {
        name: 'user',
        content: {
          text: 'test chainlink'
        }
      },
      {
        name: 'agent',
        content: {
          text: 'Here\'s the Chainlink test wallet URL.'
        }
      }
    ]
  ]
};
