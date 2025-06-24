import type { Plugin } from '@elizaos/core';
import {
    logger,
    ModelType
} from '@elizaos/core';
import { configSchema } from './config';
import { createWalletProvider, generateBiconomyWallet } from './provider';
import { createWalletAction } from './actions';
import { BiconomyWalletService } from './service';

// --- Plugin ---
const plugin: Plugin = {
    name: 'biconomy_avalanche_wallet',
    description: 'Creates Biconomy ERC-4337 smart wallets on Avalanche network with advanced features',    
    config: {
        BICONOMY_PAYMASTER_API_KEY: process.env.BICONOMY_PAYMASTER_API_KEY,
        BICONOMY_BUNDLER_URL: process.env.BICONOMY_BUNDLER_URL,
        USE_AVALANCHE_MAINNET: process.env.USE_AVALANCHE_MAINNET || 'false',
        EXAMPLE_PLUGIN_VARIABLE: process.env.EXAMPLE_PLUGIN_VARIABLE
    },

    async init(config: Record<string, string>): Promise<void> {
        logger.info('*** Initializing Biconomy Avalanche wallet creator plugin ***');
        
        try {
            const validatedConfig = await configSchema.parseAsync(config);
            
            // Set environment variables
            for (const [key, value] of Object.entries(validatedConfig)) {
                if (value !== undefined) {
                    process.env[key] = String(value);
                }
            }

            // Test configuration
            const useMainnet = validatedConfig.USE_AVALANCHE_MAINNET || false;
            logger.info(`Using ${useMainnet ? 'Avalanche Mainnet' : 'Avalanche Fuji Testnet'}`);
            
            
            logger.info('*** Biconomy Avalanche plugin initialized successfully ***');
            
        } catch (error) {
            logger.error('Plugin initialization failed:', error);
            throw error;
        }
    },

    models: {
        [ModelType.TEXT_SMALL]: async (): Promise<string> => '🪪 Wallet created on Avalanche.',
        [ModelType.TEXT_LARGE]: async (): Promise<string> => 
            '🪪 A new Biconomy ERC-4337 smart wallet has been created on the Avalanche network with advanced features.'
    },

    routes: [
        {
            name: 'createwallet',
            path: '/createwallet',
            type: 'POST',
            handler: async (req: any, res: any): Promise<void> => {
                try {
                    const useMainnet = req.query?.mainnet === 'true';
                    const { smartAddress, chainName, chainId,eoa } = await generateBiconomyWallet(useMainnet);
                    
                    res.json({
                        success: true,
                        message: `🪪 A wallet is created with address ${smartAddress}, with private key ${eoa.privateKey}`,
                        data: {
                            address: smartAddress,
                            chainId,
                            chainName,
                            eoa,
                            createdAt: new Date().toISOString()
                        }
                    });
                } catch (error) {
                    res.status(500).json({
                        success: false,
                        error: error.message
                    });
                }
            }
        },
        {
            name: 'wallet-status',
            path: '/wallet-status',
            type: 'GET',
            handler: async (req: any, res: any): Promise<void> => {
                res.json({
                    plugin: 'biconomy_avalanche_wallet',
                    status: 'active',
                    supportedNetworks: ['Avalanche Fuji Testnet', 'Avalanche Mainnet'],
                    features: ['ERC-4337', 'Smart Wallets', 'Gasless Transactions']
                });
            }
        }
    ],

    events: {
        MESSAGE_RECEIVED: [
            async (params): Promise<void> => {
                logger.debug('MESSAGE_RECEIVED in Biconomy plugin', params);
            }
        ],
        WORLD_CONNECTED: [
            async (params): Promise<void> => {
                logger.info('WORLD_CONNECTED in Biconomy plugin', params);
            }
        ]
    },

    services: [BiconomyWalletService],
    actions: [createWalletAction],
    providers: [createWalletProvider]
};

export default plugin;