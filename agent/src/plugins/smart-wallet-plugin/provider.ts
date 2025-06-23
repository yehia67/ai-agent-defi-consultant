import { 
    type IAgentRuntime,
    type Provider,
    type ProviderResult,
    logger,
} from '@elizaos/core';
import { ethers } from 'ethers';
import { AVALANCHE_MAINNET_CONFIG, AVALANCHE_FUJI_CONFIG } from 'src/configs/networks';
import { 
    createSmartAccountClient,
} from '@biconomy/account';

// --- Wallet Generator Helper ---
export async function generateBiconomyWallet(useMainnet: boolean = false) {
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

export const createWalletProvider: Provider = {
    name: 'CREATE_WALLET_PROVIDER',
    description: 'Generates a Biconomy smart wallet address on Avalanche',
    get: async (runtime: IAgentRuntime): Promise<ProviderResult> => {
        try {
            const useMainnet = process.env.USE_AVALANCHE_MAINNET === 'true';
            const { smartAddress, chainName, chainId, eoa } = await generateBiconomyWallet(useMainnet);
            
            return {
                text: `🪪 A smart wallet is created with address ${smartAddress} on ${chainName} (Chain ID: ${chainId})`,
                values: { 
                    address: smartAddress,
                    chainId,
                    chainName,
                    privateKey: eoa.privateKey
                },
                data: { 
                    createdAt: new Date().toISOString(),
                    network: chainName,
                    eoa: eoa
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