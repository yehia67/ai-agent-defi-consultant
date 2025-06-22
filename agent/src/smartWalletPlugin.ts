import type { Plugin } from '@elizaos/core';
import {
    type Action,
    type Content,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
    type Provider,
    type ProviderResult,
    logger,
    Service,
    ModelType
} from '@elizaos/core';
import { z } from 'zod';
import { ethers } from 'ethers';
import { 
    createSmartAccountClient,
    DEFAULT_ENTRYPOINT_ADDRESS
} from '@biconomy/account';

// --- Avalanche Configuration ---
const AVALANCHE_FUJI_CONFIG = {
    chainId: 43113,
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    bundlerUrl: 'https://bundler.biconomy.io/api/v2/43113', // Biconomy bundler for Avalanche Fuji
    paymasterUrl: 'https://paymaster.biconomy.io/api/v1/43113', // Biconomy paymaster for Avalanche Fuji
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS
};

const AVALANCHE_MAINNET_CONFIG = {
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    bundlerUrl: 'https://bundler.biconomy.io/api/v2/43114',
    paymasterUrl: 'https://paymaster.biconomy.io/api/v1/43114',
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS
};

// --- Wallet Generator Helper ---
async function generateBiconomyWallet(useMainnet: boolean = false) {
    const config = useMainnet ? AVALANCHE_MAINNET_CONFIG : AVALANCHE_FUJI_CONFIG;
    
    // Create provider for Avalanche
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    
    // Generate random EOA wallet
    const eoa = ethers.Wallet.createRandom().connect(provider);
    
    try {
        // Create smart account client with Biconomy
        const smartAccount = await createSmartAccountClient({
            signer: eoa,
            chainId: config.chainId,
            bundlerUrl: config.bundlerUrl,
            paymasterUrl: config.paymasterUrl, // Optional: for gasless transactions
            entryPointAddress: config.entryPointAddress
        });

        const smartAccountAddress = await smartAccount.getAccountAddress();

        return {
            smartAddress: smartAccountAddress,
            chainId: config.chainId,
            chainName: useMainnet ? 'Avalanche Mainnet' : 'Avalanche Fuji Testnet',
            eoa: {
                address: eoa.address,
                privateKey: eoa.privateKey
            },
            smartAccount
        };
    } catch (error) {
        logger.error('Error creating Biconomy wallet:', error);
        throw new Error(`Failed to create Biconomy wallet: ${error.message}`);
    }
}

// --- Config Schema ---
const configSchema = z.object({
    BICONOMY_PAYMASTER_API_KEY: z.string().optional(),
    BICONOMY_BUNDLER_URL: z.string().optional(),
    USE_AVALANCHE_MAINNET: z.string().optional().transform(val => val === 'true'),
    EXAMPLE_PLUGIN_VARIABLE: z.string().optional()
});

// --- Provider ---
const createWalletProvider: Provider = {
    name: 'CREATE_WALLET_PROVIDER',
    description: 'Generates a Biconomy smart wallet address on Avalanche',
    get: async (runtime: IAgentRuntime): Promise<ProviderResult> => {
        try {
            const useMainnet = process.env.USE_AVALANCHE_MAINNET === 'true';
            const { smartAddress, chainName, chainId } = await generateBiconomyWallet(useMainnet);
            
            return {
                text: `🪪 A smart wallet is created with address ${smartAddress} on ${chainName} (Chain ID: ${chainId})`,
                values: { 
                    address: smartAddress,
                    chainId,
                    chainName
                },
                data: { 
                    createdAt: new Date().toISOString(),
                    network: chainName
                }
            };
        } catch (error) {
            logger.error('Provider error:', error);
            return {
                text: `❌ Failed to create wallet: ${error.message}`,
                values: {},
                data: { error: error.message }
            };
        }
    }
};

// --- Service ---
class BiconomyWalletService extends Service {
    static serviceType = 'biconomy_wallet';
    
    capabilityDescription = 'This plugin enables ERC-4337 wallet creation via Biconomy on Avalanche network';

    constructor(runtime: IAgentRuntime) {
        super(runtime);
    }

    static async start(runtime: IAgentRuntime): Promise<BiconomyWalletService> {
        logger.info('*** Starting Biconomy wallet service ***');
        return new BiconomyWalletService(runtime);
    }

    static async stop(runtime: IAgentRuntime): Promise<void> {
        const service = runtime.getService(BiconomyWalletService.serviceType);
        if (!service) {
            throw new Error('Biconomy wallet service not found');
        }
        await service.stop();
    }

    async stop(): Promise<void> {
        logger.info('*** Stopping Biconomy wallet service instance ***');
    }

    async validateConfiguration(): Promise<boolean> {
        try {
            // Test wallet creation to validate configuration
            await generateBiconomyWallet();
            return true;
        } catch (error) {
            logger.error('Configuration validation failed:', error);
            return false;
        }
    }
}

// --- Action ---
const createWalletAction: Action = {
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

// --- Plugin ---
const plugin: Plugin = {
    name: 'biconomy_avalanche_wallet',
    description: 'Creates Biconomy ERC-4337 smart wallets on Avalanche network with advanced features',
    priority: -1000,
    
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
            
            // Validate by creating a test wallet (optional)
            // await generateBiconomyWallet(useMainnet);
            
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
                    const { smartAddress, chainName, chainId } = await generateBiconomyWallet(useMainnet);
                    
                    res.json({
                        success: true,
                        message: `🪪 A wallet is created with address ${smartAddress}`,
                        data: {
                            address: smartAddress,
                            chainId,
                            chainName,
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