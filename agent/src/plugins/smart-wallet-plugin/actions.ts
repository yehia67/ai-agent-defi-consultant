import {
    type Action,
    type Content,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
    logger,
} from '@elizaos/core';

import { generateBiconomyWallet } from './provider';





// --- Action ---
export const createWalletAction: Action = {
    name: 'CREATE_WALLET',
    similes: ['CREATE_WALLET', 'NEW_WALLET', 'MAKE_WALLET', 'GENERATE_WALLET', 'CREATE_ACCOUNT'],
    description: 'Creates a new ERC-4337 smart wallet using Biconomy on Avalanche network',
    validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
        // Basic validation - could be extended with more complex logic
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        options?: any,
        callback?: HandlerCallback
    ): Promise<Content> => {
        try {
            const useMainnet = process.env.USE_AVALANCHE_MAINNET === 'true';
            const { smartAddress, chainName, chainId } = await generateBiconomyWallet(useMainnet);

            const responseContent: Content = {
                text: `🪪 A Biconomy smart wallet has been created!\n\n` +
                      `📍 **Address:** ${smartAddress}\n` +
                      `🌐 **Network:** ${chainName}\n` +
                      `🔗 **Chain ID:** ${chainId}\n\n` +
                      `This is an ERC-4337 compatible smart contract wallet with advanced features like gasless transactions and social recovery.`,
                actions: ['CREATE_WALLET'],
                source: message.content?.source || 'biconomy_plugin'
            };

            if (callback) {
                await callback(responseContent);
            }

            logger.info(`Wallet created: ${smartAddress} on ${chainName}`);
            return responseContent;

        } catch (error) {
            logger.error('Error in createWalletAction:', error);
            
            const errorContent: Content = {
                text: `❌ Failed to create wallet: ${error.message}`,
                actions: ['CREATE_WALLET'],
                source: message.content?.source || 'biconomy_plugin'
            };

            if (callback) {
                await callback(errorContent);
            }

            return errorContent;
        }
    },
    examples: [
        [
            {
                name: '{{name1}}',
                content: {
                    text: 'create a wallet'
                }
            },
            {
                name: '{{name2}}',
                content: {
                    text: '🪪 A Biconomy smart wallet has been created!\n\n📍 **Address:** 0x...\n🌐 **Network:** Avalanche Fuji Testnet\n🔗 **Chain ID:** 43113',
                    actions: ['CREATE_WALLET']
                }
            }
        ],
        [
            {
                name: '{{name1}}',
                content: {
                    text: 'generate new wallet'
                }
            },
            {
                name: '{{name2}}',
                content: {
                    text: '🪪 A Biconomy smart wallet has been created!\n\n📍 **Address:** 0x...\n🌐 **Network:** Avalanche Fuji Testnet\n🔗 **Chain ID:** 43113',
                    actions: ['CREATE_WALLET']
                }
            }
        ]
    ]
};