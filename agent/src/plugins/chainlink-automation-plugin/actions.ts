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
import { ContractReceipt, ethers, Transaction } from 'ethers';
import { TransactionReceipt } from 'viem';

// Service instance will be initialized in the plugin
let chainlinkService: ChainlinkAutomationService;

// Set the service instance
export function setChainlinkService(service: ChainlinkAutomationService) {
  chainlinkService = service;
}



/**
* Deploy a ScheduledTransfer contract
*/
export const deployContractAction: Action = {
  name: 'DEPLOY_CHAINLINK_CONTRACT',
  similes: ['DEPLOY_CHAINLINK', 'CREATE_CHAINLINK_CONTRACT', 'SETUP_CHAINLINK'],
  description: 'Deploys a ScheduledTransfer contract for Chainlink Automation',
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
      const text = message.content?.text?.toLowerCase() || '';
      logger.info(`TEST_CHAINLINK validate called with text: ${text}`);
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
      logger.info('Handling DEPLOY_CHAINLINK_CONTRACT action');
      
      try {
          const result = await chainlinkService.deployScheduledTransferContract();
          
          if (result.success) {
              if (callback) {
                  await callback({
                      type: 'SUCCESS',
                      message: `Successfully deployed ScheduledTransfer contract at ${result.data.contractAddress}`,
                      data: {
                          contractAddress: result.data.contractAddress,
                          txHash: result.txHash,
                          explorerUrl: result.explorerUrl
                      }
                  });
              }
              
              return {
                  text: `✅ Successfully deployed ScheduledTransfer contract!\n\n` +
                        `📍 **Contract Address:** ${result.data.contractAddress}\n` +
                        `🔗 **Transaction:** [View on Explorer](${result.explorerUrl})\n` +
                        `📝 **Transaction Hash:** \`${result.txHash}\``
              };
          } else {
              if (callback) {
                  await callback({
                      type: 'ERROR',
                      message: `Failed to deploy contract: ${result.error}`,
                      data: { error: result.error }
                  });
              }
              
              return {
                  text: `❌ Failed to deploy contract: ${result.error}`
              };
          }
      } catch (error) {
          logger.error('Error in DEPLOY_CHAINLINK_CONTRACT action:', error);
          
          if (callback) {
              await callback({
                  type: 'ERROR',
                  message: `Error deploying contract: ${error.message}`,
                  data: { error: error.message }
              });
          }
          
          return {
              text: `❌ Error deploying contract: ${error.message}`
          };
      }
  },
  examples: [
      [
          {
              name: 'user',
              content: {
                  text: 'Deploy a new Chainlink automation contract'
              }
          },
          {
              name: 'agent',
              content: {
                  text: 'I\'ll deploy a new Chainlink automation contract for you.'
              }
          }
      ]
  ]
};

/**
* Register a contract with Chainlink Automation
*/
export const registerUpkeepAction: Action = {
  name: 'REGISTER_CHAINLINK_UPKEEP',
  similes: ['REGISTER_UPKEEP', 'SETUP_UPKEEP', 'REGISTER_WITH_CHAINLINK'],
  description: 'Registers a contract with Chainlink Automation for automated execution',
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
      const text = message.content?.text?.toLowerCase() || '';
      logger.info(`TEST_CHAINLINK validate called with text: ${text}`);
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
      logger.info('Handling REGISTER_CHAINLINK_UPKEEP action');
      
      try {
          // Extract data from message with proper type safety
          const data = message.content?.data || {};
          
          // Use type assertion after checking it's an object
          const dataObj = (typeof data === 'object' && data !== null) ? data as Record<string, any> : {};
          
          // Now safely extract properties
          const contractAddress = dataObj.contractAddress || '';
          let gasLimit = 500000; // Default gas limit
          
          
          // Try to extract gas limit from message text
          if (message.content?.text) {
              // Look for gas limit pattern (e.g., "gas limit: 300000" or "gas: 300000")
              const gasMatch = message.content.text.match(/gas(?:\s+limit)?[:\s]+([0-9]+)/i);
              if (gasMatch && gasMatch.length > 1) {
                  const extractedGasLimit = parseInt(gasMatch[1], 10);
                  if (!isNaN(extractedGasLimit)) {
                      gasLimit = extractedGasLimit;
                      logger.info(`Extracted gas limit from message: ${gasLimit}`);
                  }
              }
          }
          
          if (!contractAddress) {
              if (callback) {
                  await callback({
                      type: 'ERROR',
                      message: 'Contract address is required',
                      data: { error: 'Missing contractAddress parameter' }
                  });
              }
              
              return {
                  text: '❌ Contract address is required to register with Chainlink Automation'
              };
          }
          
          const result = await chainlinkService.registerWithChainlinkAutomation(
              contractAddress,
              gasLimit
          );
          
          if (result.success) {
              if (callback) {
                  await callback({
                      type: 'SUCCESS',
                      message: `Successfully registered contract with Chainlink Automation. Upkeep ID: ${result.data.upkeepId}`,
                      data: {
                          upkeepId: result.data.upkeepId,
                          contractAddress: result.data.contractAddress,
                          txHash: result.txHash,
                          explorerUrl: result.explorerUrl
                      }
                  });
              }
              
              return {
                  text: `✅ Successfully registered contract with Chainlink Automation!\n\n` +
                        `🆔 **Upkeep ID:** ${result.data.upkeepId}\n` +
                        `📍 **Contract Address:** ${result.data.contractAddress}\n` +
                        `🔗 **Transaction:** [View on Explorer](${result.explorerUrl})\n` +
                        `📝 **Transaction Hash:** \`${result.txHash}\``
              };
          } else {
              if (callback) {
                  await callback({
                      type: 'ERROR',
                      message: `Failed to register with Chainlink Automation: ${result.error}`,
                      data: { error: result.error }
                  });
              }
              
              return {
                  text: `❌ Failed to register with Chainlink Automation: ${result.error}`
              };
          }
      } catch (error) {
          logger.error('Error in REGISTER_CHAINLINK_UPKEEP action:', error);
          
          if (callback) {
              await callback({
                  type: 'ERROR',
                  message: `Error registering upkeep: ${error.message}`,
                  data: { error: error.message }
              });
          }
          
          return {
              text: `❌ Error registering upkeep: ${error.message}`
          };
      }
  },
  examples: [
      [
          {
              name: 'user',
              content: {
                  text: 'Register my contract with Chainlink Automation'
              }
          },
          {
              name: 'agent',
              content: {
                  text: 'I\'ll register your contract with Chainlink Automation. What\'s the contract address?'
              }
          }
      ]
  ]
};

/**
* Schedule a transfer to be executed by Chainlink Automation
*/
export const scheduleTransferAction: Action = {
  name: 'SCHEDULE_CHAINLINK_TRANSFER',
  similes: ['SCHEDULE_TRANSFER', 'AUTOMATE_TRANSFER', 'SETUP_RECURRING_TRANSFER'],
  description: 'Schedules a recurring transfer to be executed automatically by Chainlink Automation',
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
      const text = message.content?.text?.toLowerCase() || '';
      logger.info(`TEST_CHAINLINK validate called with text: ${text}`);
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
      logger.info('Handling SCHEDULE_CHAINLINK_TRANSFER action');
      
      try {
          // Extract data from message with proper type safety
          const data = message.content?.data || {};
          
          // Use type assertion after checking it's an object
          const dataObj = (typeof data === 'object' && data !== null) ? data as Record<string, any> : {};
          
          // Now safely extract properties
          const recipient = dataObj.contractAddress || dataObj.recipient || '';
          const amount = dataObj.amount || '';
          
          // Default to 5 minutes from now if not a valid number
          const startTime = typeof dataObj.startTime === 'number' ? 
              dataObj.startTime : Math.floor(Date.now() / 1000) + 300;
          
          // Default to daily (86400 seconds) if not a valid number
          const frequency = typeof dataObj.frequency === 'number' ? 
              dataObj.frequency : 86400;
          
          // Validate required parameters
          if (!recipient || !amount) {
              if (callback) {
                  await callback({
                      type: 'ERROR',
                      message: 'Recipient and amount are required',
                      data: { error: 'Missing required parameters' }
                  });
              }
              
              return {
                  text: '❌ Recipient address and amount are required to schedule a transfer'
              };
          }
          
          // Use current time + 5 minutes if startTime not provided
          const actualStartTime = startTime || Math.floor(Date.now() / 1000) + 300;
          
          // Use daily frequency (24 hours) if not provided
          const actualFrequency = frequency || 86400;
          
          const result = await chainlinkService.scheduleTransfer(
              recipient,
              amount,
              actualStartTime,
              actualFrequency
          );
          
          if (result.success) {
              if (callback) {
                  await callback({
                      type: 'SUCCESS',
                      message: `Successfully scheduled transfer of ${amount} wei to ${recipient}. Transfer ID: ${result.data.transferId}`,
                      data: {
                          transferId: result.data.transferId,
                          recipient: result.data.recipient,
                          amount: result.data.amount,
                          startTime: result.data.startTime,
                          frequency: result.data.frequency,
                          contractAddress: result.data.contractAddress,
                          txHash: result.txHash,
                          explorerUrl: result.explorerUrl
                      }
                  });
              }
              
              // Format frequency in a human-readable way
              let frequencyText = 'daily';
              if (actualFrequency === 3600) frequencyText = 'hourly';
              else if (actualFrequency === 86400) frequencyText = 'daily';
              else if (actualFrequency === 604800) frequencyText = 'weekly';
              else frequencyText = `every ${actualFrequency} seconds`;
              
              // Format start time
              const startDate = new Date(actualStartTime * 1000).toLocaleString();
              
              return {
                  text: `✅ Successfully scheduled recurring transfer!\n\n` +
                        `🆔 **Transfer ID:** ${result.data.transferId}\n` +
                        `💰 **Amount:** ${ethers.utils.formatEther(result.data.amount)} AVAX\n` +
                        `👤 **Recipient:** ${result.data.recipient}\n` +
                        `🕒 **Starting:** ${startDate}\n` +
                        `🔄 **Frequency:** ${frequencyText}\n` +
                        `📍 **Contract:** ${result.data.contractAddress}\n` +
                        `🔗 **Transaction:** [View on Explorer](${result.explorerUrl})\n` +
                        `📝 **Transaction Hash:** \`${result.txHash}\``
              };
          } else {
              if (callback) {
                  await callback({
                      type: 'ERROR',
                      message: `Failed to schedule transfer: ${result.error}`,
                      data: { error: result.error }
                  });
              }
              
              return {
                  text: `❌ Failed to schedule transfer: ${result.error}`
              };
          }
      } catch (error) {
          logger.error('Error in SCHEDULE_CHAINLINK_TRANSFER action:', error);
          
          if (callback) {
              await callback({
                  type: 'ERROR',
                  message: `Error scheduling transfer: ${error.message}`,
                  data: { error: error.message }
              });
          }
          
          return {
              text: `❌ Error scheduling transfer: ${error.message}`
          };
      }
  },
  examples: [
      [
          {
              name: 'user',
              content: {
                  text: 'Schedule a daily transfer of 0.01 AVAX to 0x1234...'
              }
          },
          {
              name: 'agent',
              content: {
                  text: 'I\'ll set up a daily transfer of 0.01 AVAX for you.'
              }
          }
      ]
  ]
};

/**
* Schedule a claim operation to be executed by Chainlink Automation
*/
export const scheduleClaimAction: Action = {
  name: 'SCHEDULE_CHAINLINK_CLAIM',
  similes: ['SCHEDULE_CLAIM', 'AUTOMATE_CLAIM', 'SETUP_RECURRING_CLAIM'],
  description: 'Schedules a recurring claim operation to be executed automatically by Chainlink Automation',
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
      const text = message.content?.text?.toLowerCase() || '';
      logger.info(`TEST_CHAINLINK validate called with text: ${text}`);
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
      logger.info('Handling SCHEDULE_CHAINLINK_CLAIM action');
      
      try {
          // Extract data from message with proper type safety
          const data = message.content?.data || {};
          
          // Use type assertion after checking it's an object
          const dataObj = (typeof data === 'object' && data !== null) ? data as Record<string, any> : {};
          
          // Now safely extract properties
          const contractAddress = dataObj.contractAddress || '';
          
          // Keep as undefined if not a valid number
          const startTime = typeof dataObj.startTime === 'number' ? 
              dataObj.startTime : undefined;
              
          // Keep as undefined if not a valid number
          const frequency = typeof dataObj.frequency === 'number' ? 
              dataObj.frequency : undefined;
          
          // Validate required parameters
          if (!contractAddress) {
              if (callback) {
                  await callback({
                      type: 'ERROR',
                      message: 'Contract address is required',
                      data: { error: 'Missing contractAddress parameter' }
                  });
              }
              
              return {
                  text: '❌ Contract address is required to schedule a claim operation'
              };
          }
          
          // Use current time + 5 minutes if startTime not provided
          const actualStartTime = startTime || Math.floor(Date.now() / 1000) + 300;
          
          // Use daily frequency (24 hours) if not provided
          const actualFrequency = frequency || 86400;
          
          const result = await chainlinkService.scheduleClaim(
              contractAddress,
              actualStartTime,
              actualFrequency
          );
          
          if (result.success) {
              if (callback) {
                  await callback({
                      type: 'SUCCESS',
                      message: `Successfully scheduled claim from contract ${contractAddress}. Claim ID: ${result.data.claimId}`,
                      data: {
                          claimId: result.data.claimId,
                          contractAddress: result.data.contractAddress,
                          startTime: result.data.startTime,
                          frequency: result.data.frequency
                      }
                  });
              }
              
              // Format frequency in a human-readable way
              let frequencyText = 'daily';
              if (actualFrequency === 3600) frequencyText = 'hourly';
              else if (actualFrequency === 86400) frequencyText = 'daily';
              else if (actualFrequency === 604800) frequencyText = 'weekly';
              else frequencyText = `every ${actualFrequency} seconds`;
              
              // Format start time
              const startDate = new Date(actualStartTime * 1000).toLocaleString();
              
              return {
                  text: `✅ Successfully scheduled recurring claim operation!\n\n` +
                        `🆔 **Claim ID:** ${result.data.claimId}\n` +
                        `📍 **Contract:** ${result.data.contractAddress}\n` +
                        `🕒 **Starting:** ${startDate}\n` +
                        `🔄 **Frequency:** ${frequencyText}`
              };
          } else {
              if (callback) {
                  await callback({
                      type: 'ERROR',
                      message: `Failed to schedule claim: ${result.error}`,
                      data: { error: result.error }
                  });
              }
              
              return {
                  text: `❌ Failed to schedule claim: ${result.error}`
              };
          }
      } catch (error) {
          logger.error('Error in SCHEDULE_CHAINLINK_CLAIM action:', error);
          
          if (callback) {
              await callback({
                  type: 'ERROR',
                  message: `Error scheduling claim: ${error.message}`,
                  data: { error: error.message }
              });
          }
          
          return {
              text: `❌ Error scheduling claim: ${error.message}`
          };
      }
  },
  examples: [
      [
          {
              name: 'user',
              content: {
                  text: 'Set up a daily claim from my staking contract'
              }
          },
          {
              name: 'agent',
              content: {
                  text: 'I\'ll set up a daily claim operation for your staking contract. What\'s the contract address?'
              }
          }
      ]
  ]
};

/**
* Get scheduled transfers
*/
export const getScheduledTransfersAction: Action = {
  name: 'GET_CHAINLINK_SCHEDULED_TRANSFERS',
  similes: ['LIST_SCHEDULED_TRANSFERS', 'SHOW_TRANSFERS', 'VIEW_SCHEDULED_TRANSFERS'],
  description: 'Retrieves all scheduled transfers from the Chainlink Automation contract',
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
      const text = message.content?.text?.toLowerCase() || '';
      logger.info(`TEST_CHAINLINK validate called with text: ${text}`);
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
      logger.info('Handling GET_CHAINLINK_SCHEDULED_TRANSFERS action');
      
      try {
          // Extract data from message with proper type safety
          const data = message.content?.data || {};
          
          // Use type assertion after checking it's an object
          const dataObj = (typeof data === 'object' && data !== null) ? data as Record<string, any> : {};
          
          // Now safely extract properties
          const contractAddress = dataObj.contractAddress || '';
          
          if (!contractAddress) {
              if (callback) {
                  await callback({
                      type: 'ERROR',
                      message: 'Contract address is required',
                      data: { error: 'Missing contractAddress parameter' }
                  });
              }
              
              return {
                  text: '❌ Contract address is required to get scheduled transfers'
              };
          }
          
          // Call the service to get transfers
          const transfers = await chainlinkService.getScheduledTransfers();
          
          // Handle successful response
          if (transfers && Array.isArray(transfers)) {
              
              if (callback) {
                  await callback({
                      type: 'SUCCESS',
                      message: `Successfully retrieved ${transfers.length} scheduled transfers`,
                      data: {
                          transfers: transfers,
                          contractAddress: contractAddress
                      }
                  });
              }
              
              // Format transfers for display
              let transfersText = '';
              if (transfers.length === 0) {
                  transfersText = 'No scheduled transfers found.';
              } else {
                  transfersText = transfers.map((transfer, index) => {
                      // Safely access properties with defaults
                      const startTime = typeof transfer.startTime === 'number' ? transfer.startTime : 0;
                      const startDate = new Date(startTime * 1000).toLocaleString();
                      const frequency = typeof transfer.frequency === 'number' ? transfer.frequency : 86400;
                      const id = transfer.id || `unknown-${index}`;
                      const amount = transfer.amount || '0';
                      const recipient = transfer.recipient || 'unknown';
                      
                      // Format frequency in a human-readable way
                      let frequencyText = 'daily';
                      if (frequency === 3600) frequencyText = 'hourly';
                      else if (frequency === 86400) frequencyText = 'daily';
                      else if (frequency === 604800) frequencyText = 'weekly';
                      else frequencyText = `every ${frequency} seconds`;
                      
                      return `**Transfer #${index + 1}**\n` +
                             `🆔 ID: ${id}\n` +
                             `💰 Amount: ${ethers.utils.formatEther(amount)} AVAX\n` +
                             `👤 Recipient: ${recipient}\n` +
                             `🕒 Starting: ${startDate}\n` +
                             `🔄 Frequency: ${frequencyText}\n`;
                  }).join('\n');
              }
              
              return {
                  text: `✅ Scheduled Transfers for Contract ${contractAddress}:\n\n${transfersText}`
              };
          } else {
              // Handle case where transfers is not an array
              const errorMessage = 'Failed to retrieve scheduled transfers';
              
              if (callback) {
                  await callback({
                      type: 'ERROR',
                      message: `Failed to get scheduled transfers: ${errorMessage}`,
                      data: { error: errorMessage }
                  });
              }
              
              return {
                  text: `❌ Failed to get scheduled transfers: ${errorMessage}`
              };
          }
      } catch (error) {
          logger.error('Error in GET_CHAINLINK_SCHEDULED_TRANSFERS action:', error);
          
          if (callback) {
              await callback({
                  type: 'ERROR',
                  message: `Error getting scheduled transfers: ${error.message}`,
                  data: { error: error.message }
              });
          }
          
          return {
              text: `❌ Error getting scheduled transfers: ${error.message}`
          };
      }
  },
  examples: [
      [
          {
              name: 'user',
              content: {
                  text: 'Show me all my scheduled transfers'
              }
          },
          {
              name: 'agent',
              content: {
                  text: 'Here are all your scheduled transfers.'
              }
          }
      ]
  ]
};

/**
* Test Chainlink action that returns the wallet URL
*/
export const testChainlinkAction: Action = {
  name: 'TEST_CHAINLINK',
  similes: ['TEST_CHAINLINK', 'CHAINLINK_TEST', 'CHECK_CHAINLINK'],
  description: 'Test Chainlink action that returns the wallet URL',
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
      const text = message.content?.text?.toLowerCase() || '';
      logger.info(`TEST_CHAINLINK validate called with text: ${text}`);
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
      
      if (callback) {
          await callback({
              type: 'SUCCESS',
              message: `Chainlink test successful. Wallet URL: ${walletUrl}`,
              data: { walletAddress, walletUrl }
          });
      }
      
      return {
          text: `✅ Chainlink test successful!\n\n📍 **Wallet Address:** ${walletAddress}\n🔗 **Wallet URL:** [View on Explorer](${walletUrl})`
      };
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

// Export all actions as an array
export const actions = [
  deployContractAction,
  registerUpkeepAction,
  scheduleTransferAction,
  scheduleClaimAction,
  getScheduledTransfersAction,
  testChainlinkAction
];