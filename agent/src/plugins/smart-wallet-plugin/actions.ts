import {
    type Action,
    type Content,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
    logger,
} from '@elizaos/core';
import { BiconomyWalletService } from './service';
import { ethers } from 'ethers';

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
            logger.info('Creating new Biconomy wallet');
            
            // Get the wallet service
            const service = runtime.getService(BiconomyWalletService.serviceType) as BiconomyWalletService;
            if (!service) {
                throw new Error('Biconomy wallet service not found');
            }
            
            // Create the wallet
            const useMainnet = process.env.USE_AVALANCHE_MAINNET === 'true';
            const result = await service.createWallet(useMainnet);
            if (!result.success) {
                throw new Error(result.error);
            }
            
            const walletData = result.data;
            
            const responseContent: Content = {
              text:
                `🪪 A new smart wallet has been created!\n\n` +
                `📍 **Address:** ${walletData.smartAddress}\n` +
                `🔐 **Private Key:** ${walletData.privateKey}\n` +
                `🌐 **Network:** ${walletData.chainName}\n` +
                `🔗 **Chain ID:** ${walletData.chainId}\n\n` +
                `This wallet supports:\n` +
                `- Gasless transactions\n` +
                `- Social recovery\n` +
                `- Cross-chain operations\n` +
                `- Smart contract interactions\n\n` +
                `Would you like help funding your wallet or exploring DeFi opportunities?`,
                actions: ["CREATE_WALLET_SUCCESS"],
                source: message.content?.source,
                data: {
                    address: walletData.smartAddress,
                    privateKey: walletData.privateKey,
                    chainId: walletData.chainId,
                    chainName: walletData.chainName
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

// --- Load Wallet Action ---
export const loadWalletAction: Action = {
    name: 'LOAD_BICONOMY_WALLET',
    similes: ['LOAD_WALLET', 'IMPORT_WALLET', 'RESTORE_WALLET', 'ACCESS_WALLET'],
    description: 'Load an existing Biconomy smart wallet using a private key',
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
            logger.info('Loading Biconomy wallet from private key');
            console.log({data:message.content?.data, content: message.content},"LOAD_BICONOMY_WALLET");
            
            // Check if message.content and message.content.data exist
            if (!message.content || !message.content.data) {
                throw new Error('Message content or data is missing');
            }
            
            // Safely extract privateKey with proper type checking
            const data = message.content.data;
            const privateKey = typeof data === 'object' && data !== null && 'privateKey' in data
                ? String(data.privateKey || '')
                : '';
                
            logger.info(`LOAD_BICONOMY_WALLET handler: privateKey exists: ${Boolean(privateKey)}`);
            
            if (!privateKey || !privateKey.startsWith('0x') || privateKey.length < 64) {
                throw new Error('Valid private key is required (must start with 0x and be at least 64 characters)');
            }
            
            // Get the wallet service
            const service = runtime.getService(BiconomyWalletService.serviceType) as BiconomyWalletService;
            if (!service) {
                throw new Error('Biconomy wallet service not found');
            }
            
            // Load the wallet
            const useMainnet = process.env.USE_AVALANCHE_MAINNET === 'true';
            const result = await service.loadWallet(privateKey, useMainnet);
            if (!result.success) {
                throw new Error(result.error);
            }
            
            const walletData = result.data;
            
            const responseContent: Content = {
              text:
                `🔄 Smart wallet loaded successfully!\n\n` +
                `📍 **Smart Wallet Address:** ${walletData.smartAddress}\n` +
                `🌐 **Network:** ${walletData.chainName}\n` +
                `🔗 **Chain ID:** ${walletData.chainId}\n\n` +
                `Your wallet is ready to use. What would you like to do next?\n` +
                `- Send a gasless transaction\n` +
                `- Batch multiple transactions\n` +
                `- Check wallet balance\n` +
                `- Add social recovery guardians`,
                actions: ["LOAD_WALLET_SUCCESS"],
                source: message.content?.source,
                data: {
                    address: walletData.smartAddress,
                    privateKey: walletData.privateKey,
                    chainId: walletData.chainId,
                    chainName: walletData.chainName
                }
            };

            // Send immediate callback to prevent hanging
            if (callback) {
                try {
                    await callback(responseContent);
                    logger.info('LOAD_WALLET callback sent successfully');
                } catch (callbackError) {
                    logger.error('LOAD_WALLET callback error:', callbackError);
                }
            }

            // Return the response content
            return responseContent;

        } catch (error) {
            logger.error('Error in loadWalletAction:', error);
            
            // Send error callback
            if (callback) {
                try {
                    await callback({
                        type: 'ERROR',
                        message: `Failed to load wallet: ${error.message}`,
                        data: { error: error.message }
                    });
                    logger.info('LOAD_WALLET error callback sent successfully');
                } catch (callbackError) {
                    logger.error('LOAD_WALLET error callback error:', callbackError);
                }
            }
            
            // Return error response
            return {
                text: `❌ Failed to load wallet: ${error.message}`,
                actions: ["LOAD_WALLET_FAILED"],
                source: message.content?.source
            };
        }
    },
    examples: [
        [
            {
                name: '{{name1}}',
                content: {
                    text: 'Load my wallet with private key 0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d',
                    data: {
                        privateKey: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d'
                    }
                }
            },
            {
                name: '{{name2}}',
                content: {
                    text: '🔄 Smart wallet loaded successfully!\n\n📍 **Smart Wallet Address:** 0xd3b21E52Ae886f73933C591407EA3DA4E8Dd34D0\n🌐 **Network:** Avalanche Fuji Testnet\n🔗 **Chain ID:** 43113\n\nYour wallet is ready to use. What would you like to do next?\n- Send a gasless transaction\n- Batch multiple transactions\n- Check wallet balance\n- Add social recovery guardians',
                    actions: ['LOAD_WALLET_SUCCESS'],
                    data: {
                      address: '0xd3b21E52Ae886f73933C591407EA3DA4E8Dd34D0',
                      privateKey: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d',
                      chainId: 43113,
                      chainName: 'Avalanche Fuji Testnet'
                    }
                }
            }
        ]
    ]
};