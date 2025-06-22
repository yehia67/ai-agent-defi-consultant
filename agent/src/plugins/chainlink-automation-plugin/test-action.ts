import {
  type Action,
  type Content,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  logger,
} from '@elizaos/core';

/**
 * Simple test action for Chainlink Automation
 */
export const testChainlinkAction: Action = {
  name: 'TEST_CHAINLINK_ACTION',
  similes: ['test chainlink'],
  description: 'Test Chainlink action that returns the wallet URL',
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = message.content?.text?.toLowerCase() || '';
    logger.info(`TEST_CHAINLINK validate checking: "${text}"`);
    const exactMatch = text === 'test chainlink';
    logger.info(`TEST_CHAINLINK validate exact match: ${exactMatch}`);
    return exactMatch;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ): Promise<Content> => {
    logger.info('Handling TEST_CHAINLINK_ACTION');
    
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
