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
            // Log the start of wallet creation
           
const {
    smartAddress,
    chainId,
    chainName,
    eoa: {
        privateKey,
    },
} = await generateBiconomyWallet();
            const responseContent: Content = {
              text:
                `🪪 A new smart wallet has been created!\n\n` +
                `📍 **Address:** ${smartAddress}\n` +
                `🔐 **Private Key:** ${privateKey}\n` +
                `🌐 **Network:** ${chainName}\n` +
                `🔗 **Chain ID:** ${chainId}\n\n` +
                `This wallet supports:\n` +
                `- Gasless transactions\n` +
                `- Social recovery\n` +
                `- Cross-chain operations\n` +
                `- Smart contract interactions\n\n` +
                `Would you like help funding your wallet or exploring DeFi opportunities?`,
              actions: ["CREATE_WALLET_SUCCESS"],
              source: message.content?.source,
              data: {
                address: "hello",
                privateKey: "hello",
                chainId: "hello",
                chainName: "hello"
              }
            };

            // Send immediate callback to prevent hanging
            if (callback) {
                try {
                    await callback(responseContent);
                    logger.info('HELLO_WORLD callback sent successfully');
                } catch (callbackError) {
                    logger.error('HELLO_WORLD callback error:', callbackError);
                }
            }

            // Return the response content
            return responseContent;

        } catch (error) {
            logger.error('Error in createWalletAction:', error);
            
            // Send error callback
            if (callback) {
                try {
                    await callback({
                        type: 'ERROR',
                        message: `Failed to create wallet: ${error.message}`,
                        data: { error: error.message }
                    });
                    logger.info('CREATE_WALLET error callback sent successfully');
                } catch (callbackError) {
                    logger.error('CREATE_WALLET error callback error:', callbackError);
                }
            }
            
            // Return error response
            return {
                text: `❌ Failed to create wallet: ${error.message}`,
                actions: ["HELLO_WORLD_FAILED"],
                source: message.content?.source
            };
        }
    },
    examples: [
        [
            {
                name: '{{name1}}',
                content: {
                    text: '🪪 A new smart wallet has been created!\n\n📍 **Address:** 0xd3b21E52Ae886f73933C591407EA3DA4E8Dd34D0\n🔐 **Private Key:** 0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d\n🌐 **Network:** Avalanche Fuji Testnet\n🔗 **Chain ID:** 43113\n\nThis wallet supports:\n- Gasless transactions\n- Social recovery\n- Cross-chain operations\n- Smart contract interactions\n\nWould you like help funding your wallet or exploring DeFi opportunities?',
                    actions: ['CREATE_WALLET'],
                    data: {
                      address: '0xd3b21E52Ae886f73933C591407EA3DA4E8Dd34D0',
                      privateKey: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d',
                      chainId: 43113,
                      chainName: 'Avalanche Fuji Testnet'
                    }
                }
            },
            {
                name: '{{name2}}',
                content: {
                    text: '🪪 A Biconomy smart wallet has been created!\n\n📍 **Address:** 0x...\n🔐 **Private keys:** 0x1234...abcd\n🌐 **Network:** Avalanche Fuji Testnet\n🔗 **Chain ID:** 43113\n\nThis is an ERC-4337 compatible smart contract wallet with advanced features like gasless transactions and social recovery.',
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
                    text: '🪪 A Biconomy smart wallet has been created!\n\n📍 **Address:** 0x...\n🔐 **Private keys:** 0x1234...abcd\n🌐 **Network:** Avalanche Fuji Testnet\n🔗 **Chain ID:** 43113\n\nThis is an ERC-4337 compatible smart contract wallet with advanced features like gasless transactions and social recovery.',
                    actions: ['CREATE_WALLET']
                }
            }
        ]
    ]
};