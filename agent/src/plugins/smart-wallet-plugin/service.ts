import {
    type IAgentRuntime,
    logger,
    Service,
} from '@elizaos/core';

import { 
    generateBiconomyWallet, 
    createSmartAccountFromPrivateKey,
    sendGaslessTransaction,
    batchTransactions,
    addSocialRecovery,
    getAccountBalance
} from './provider';
import { ethers } from 'ethers';
import { BiconomySmartAccountV2 } from '@biconomy/account';

// --- Service ---
export class BiconomyWalletService extends Service {
    static serviceType = 'biconomy_wallet';
    
    capabilityDescription = 'This plugin enables ERC-4337 wallet creation and management via Biconomy on Avalanche network';

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
    
    // --- Wallet Creation ---
    async createWallet(useMainnet: boolean = false) {
        try {
            logger.info(`Creating new Biconomy wallet on ${useMainnet ? 'mainnet' : 'testnet'}`);
            const walletData = await generateBiconomyWallet(useMainnet);
            return {
                success: true,
                data: {
                    smartAddress: walletData.smartAddress,
                    chainId: walletData.chainId,
                    chainName: walletData.chainName,
                    privateKey: walletData.eoa.privateKey,
                    eoaAddress: walletData.eoa.address
                }
            };
        } catch (error) {
            logger.error('Error creating wallet:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // --- Load Wallet from Private Key ---
    async loadWallet(privateKey: string, useMainnet: boolean = false) {
        try {
            logger.info(`Loading Biconomy wallet from private key on ${useMainnet ? 'mainnet' : 'testnet'}`);
            const walletData = await createSmartAccountFromPrivateKey(privateKey, useMainnet);
            return {
                success: true,
                data: {
                    smartAddress: walletData.smartAddress,
                    chainId: walletData.chainId,
                    chainName: walletData.chainName,
                    privateKey: walletData.eoa.privateKey,
                    eoaAddress: walletData.eoa.address
                }
            };
        } catch (error) {
            logger.error('Error loading wallet:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // --- Get Wallet Balance ---
    async getBalance(address: string, useMainnet: boolean = false) {
        try {
            logger.info(`Getting balance for address ${address}`);
            const balanceData = await getAccountBalance(address, useMainnet);
            return {
                success: true,
                data: balanceData
            };
        } catch (error) {
            logger.error('Error getting balance:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // --- Send Gasless Transaction ---
    async sendGaslessTransaction(privateKey: string, to: string, amount: string, useMainnet: boolean = false) {
        try {
            logger.info(`Sending ${amount} AVAX to ${to} via gasless transaction`);
            const { smartAccount } = await createSmartAccountFromPrivateKey(privateKey, useMainnet);
            const result = await sendGaslessTransaction(smartAccount, to, amount);
            
            return {
                success: true,
                data: result,
                txHash: result.transactionHash,
                explorerUrl: `https://${useMainnet ? '' : 'testnet.'}snowtrace.io/tx/${result.transactionHash}`
            };
        } catch (error) {
            logger.error('Error sending gasless transaction:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // --- Batch Transactions ---
    async batchTransactions(privateKey: string, transactions: Array<{to: string, amount: string}>, useGasless: boolean = true, useMainnet: boolean = false) {
        try {
            logger.info(`Batching ${transactions.length} transactions`);
            const { smartAccount } = await createSmartAccountFromPrivateKey(privateKey, useMainnet);
            const result = await batchTransactions(smartAccount, transactions, useGasless);
            
            return {
                success: true,
                data: result,
                txHash: result.transactionHash,
                explorerUrl: `https://${useMainnet ? '' : 'testnet.'}snowtrace.io/tx/${result.transactionHash}`
            };
        } catch (error) {
            logger.error('Error batching transactions:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // --- Add Social Recovery ---
    async addSocialRecovery(privateKey: string, guardians: string[], useMainnet: boolean = false) {
        try {
            logger.info(`Adding ${guardians.length} guardians for social recovery`);
            const { smartAccount } = await createSmartAccountFromPrivateKey(privateKey, useMainnet);
            const result = await addSocialRecovery(smartAccount, guardians);
            
            return {
                success: true,
                data: result
            };
        } catch (error) {
            logger.error('Error adding social recovery:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}