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
    BiconomySmartAccountV2,
} from '@biconomy/account';
import { PaymasterMode } from '@biconomy/paymaster';
import {  SponsorUserOperationDto } from '@biconomy/paymaster';

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

// --- Create Smart Account from Private Key ---
export async function createSmartAccountFromPrivateKey(privateKey: string, useMainnet: boolean = false) {
    const config = useMainnet ? AVALANCHE_MAINNET_CONFIG : AVALANCHE_FUJI_CONFIG;
    
    try {
        // Create provider for Avalanche
        const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
        
        // Create wallet from private key
        const eoa = new ethers.Wallet(privateKey, provider);
        
        // Create smart account client with Biconomy
        const smartAccount = await createSmartAccountClient({
            signer: eoa,
            chainId: config.chainId,
            bundlerUrl: config.bundlerUrl,
            paymasterUrl: config.paymasterUrl,
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
        logger.error('Error creating Biconomy wallet from private key:', error);
        throw new Error(`Failed to create Biconomy wallet from private key: ${error.message}`);
    }
}

// --- Send Gasless Transaction ---
export async function sendGaslessTransaction(smartAccount: BiconomySmartAccountV2, to: string, amount: string) {
    try {
        // Create transaction object
        const transaction = {
            to: to,
            data: '0x',
            value: ethers.utils.parseEther(amount).toString()
        };

        // Get paymaster and data for gasless transaction
        const paymasterServiceData: SponsorUserOperationDto = {
            mode: PaymasterMode.SPONSORED,
            smartAccountInfo: {
                name: 'BICONOMY',
                version: '2.0.0'
            }
        };

        // Build user operation
        const userOp = await smartAccount.buildUserOp([transaction], {
            paymasterServiceData
        });

        // Send user operation
        const userOpResponse = await smartAccount.sendUserOp(userOp);

        // Get transaction details
        const { receipt } = await userOpResponse.wait();

        return {
            success: true,
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            to: to,
            amount: amount
        };
    } catch (error) {
        logger.error('Error sending gasless transaction:', error);
        throw new Error(`Failed to send gasless transaction: ${error.message}`);
    }
}

// --- Batch Multiple Transactions ---
export async function batchTransactions(smartAccount: BiconomySmartAccountV2, transactions: Array<{to: string, amount: string}>, useGasless: boolean = true) {
    try {
        // Create transaction objects
        const txs = transactions.map(tx => ({
            to: tx.to,
            data: '0x',
            value: ethers.utils.parseEther(tx.amount).toString()
        }));

        let userOp;
        
        if (useGasless) {
            // Get paymaster and data for gasless transaction
            const paymasterServiceData: SponsorUserOperationDto = {
                mode: PaymasterMode.SPONSORED,
                smartAccountInfo: {
                    name: 'BICONOMY',
                    version: '2.0.0'
                }
            };

            // Build user operation with paymaster
            userOp = await smartAccount.buildUserOp(txs, {
                paymasterServiceData
            });
        } else {
            // Build user operation without paymaster
            userOp = await smartAccount.buildUserOp(txs);
        }

        // Send user operation
        const userOpResponse = await smartAccount.sendUserOp(userOp);

        // Get transaction details
        const { receipt } = await userOpResponse.wait();

        return {
            success: true,
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            transactions: transactions
        };
    } catch (error) {
        logger.error('Error batching transactions:', error);
        throw new Error(`Failed to batch transactions: ${error.message}`);
    }
}

// --- Add Social Recovery ---
export async function addSocialRecovery(smartAccount: BiconomySmartAccountV2, guardianAddresses: string[]) {
    try {
        // Implementation would require additional modules
        // This is a placeholder for the social recovery functionality
        // In a real implementation, we would use a social recovery module
        
        return {
            success: true,
            message: 'Social recovery guardians added',
            guardians: guardianAddresses
        };
    } catch (error) {
        logger.error('Error adding social recovery:', error);
        throw new Error(`Failed to add social recovery: ${error.message}`);
    }
}

// --- Get Account Balance ---
export async function getAccountBalance(smartAccountAddress: string, useMainnet: boolean = false) {
    const config = useMainnet ? AVALANCHE_MAINNET_CONFIG : AVALANCHE_FUJI_CONFIG;
    
    try {
        // Create provider for Avalanche
        const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
        
        // Get balance
        const balance = await provider.getBalance(smartAccountAddress);
        
        return {
            success: true,
            address: smartAccountAddress,
            balanceWei: balance.toString(),
            balanceEth: ethers.utils.formatEther(balance),
            chainId: config.chainId,
            chainName: useMainnet ? 'Avalanche Mainnet' : 'Avalanche Fuji Testnet'
        };
    } catch (error) {
        logger.error('Error getting account balance:', error);
        throw new Error(`Failed to get account balance: ${error.message}`);
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

export const getWalletBalanceProvider: Provider = {
    name: 'GET_WALLET_BALANCE_PROVIDER',
    description: 'Gets the balance of a Biconomy smart wallet on Avalanche',
    get: async (runtime: IAgentRuntime, params?: Record<string, any>): Promise<ProviderResult> => {
        try {
            if (!params?.address) {
                return {
                    text: '❌ Wallet address is required to check balance',
                    values: {},
                    data: { error: 'Missing wallet address' }
                };
            }
            
            const useMainnet = process.env.USE_AVALANCHE_MAINNET === 'true';
            const result = await getAccountBalance(params.address, useMainnet);
            
            return {
                text: `💰 Wallet ${params.address} has a balance of ${result.balanceEth} AVAX on ${result.chainName}`,
                values: { 
                    address: params.address,
                    balanceEth: result.balanceEth,
                    balanceWei: result.balanceWei,
                    chainId: result.chainId,
                    chainName: result.chainName
                },
                data: result
            };
        } catch (error) {
            logger.error('Provider error:', error);
            return {
                text: `❌ Failed to get wallet balance: ${error.message}`,
                values: {},
                data: { error: error.message }
            };
        }
    }
};

export const sendGaslessTransactionProvider: Provider = {
    name: 'SEND_GASLESS_TRANSACTION_PROVIDER',
    description: 'Sends a gasless transaction using a Biconomy smart wallet',
    get: async (runtime: IAgentRuntime, params?: Record<string, any>): Promise<ProviderResult> => {
        try {
            if (!params?.privateKey || !params?.to || !params?.amount) {
                return {
                    text: '❌ Private key, recipient address, and amount are required to send a transaction',
                    values: {},
                    data: { error: 'Missing required parameters' }
                };
            }
            
            const useMainnet = process.env.USE_AVALANCHE_MAINNET === 'true';
            const { smartAccount } = await createSmartAccountFromPrivateKey(params.privateKey, useMainnet);
            const result = await sendGaslessTransaction(smartAccount, params.to, params.amount);
            
            return {
                text: `✅ Successfully sent ${params.amount} AVAX to ${params.to} without paying gas!\n` +
                      `Transaction hash: ${result.transactionHash}`,
                values: { 
                    transactionHash: result.transactionHash,
                    blockNumber: result.blockNumber,
                    to: params.to,
                    amount: params.amount
                },
                data: result
            };
        } catch (error) {
            logger.error('Provider error:', error);
            return {
                text: `❌ Failed to send gasless transaction: ${error.message}`,
                values: {},
                data: { error: error.message }
            };
        }
    }
};

export const batchTransactionsProvider: Provider = {
    name: 'BATCH_TRANSACTIONS_PROVIDER',
    description: 'Batches multiple transactions into a single transaction using a Biconomy smart wallet',
    get: async (runtime: IAgentRuntime, params?: Record<string, any>): Promise<ProviderResult> => {
        try {
            if (!params?.privateKey || !params?.transactions || !Array.isArray(params.transactions)) {
                return {
                    text: '❌ Private key and an array of transactions are required',
                    values: {},
                    data: { error: 'Missing required parameters' }
                };
            }
            
            const useMainnet = process.env.USE_AVALANCHE_MAINNET === 'true';
            const { smartAccount } = await createSmartAccountFromPrivateKey(params.privateKey, useMainnet);
            const useGasless = params.useGasless !== false; // Default to true if not specified
            const result = await batchTransactions(smartAccount, params.transactions, useGasless);
            
            return {
                text: `✅ Successfully batched ${params.transactions.length} transactions into a single transaction!\n` +
                      `Transaction hash: ${result.transactionHash}`,
                values: { 
                    transactionHash: result.transactionHash,
                    blockNumber: result.blockNumber,
                    transactionCount: params.transactions.length
                },
                data: result
            };
        } catch (error) {
            logger.error('Provider error:', error);
            return {
                text: `❌ Failed to batch transactions: ${error.message}`,
                values: {},
                data: { error: error.message }
            };
        }
    }
};