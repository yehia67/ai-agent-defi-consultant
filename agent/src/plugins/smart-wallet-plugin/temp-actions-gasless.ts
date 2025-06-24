import { Action, IAgentRuntime, Memory, State, HandlerCallback, Content } from "@elizaos/core";
import { logger } from "ethers";
import { BiconomyWalletService } from "./service";

// --- Send Gasless Transaction Action ---
export const sendGaslessTransactionAction: Action = {
    name: 'SEND_GASLESS_TRANSACTION',
    similes: ['GASLESS_TRANSFER', 'SEND_WITHOUT_GAS', 'FREE_TRANSACTION', 'SPONSORED_TRANSACTION'],
    description: 'Send a gasless transaction using Biconomy paymaster',
    validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
        // Check if required parameters are provided
        console.log({data:message.content?.data, content: message.content},"SEND_GASLESS_TRANSACTION");
        const privateKey = (message.content?.data as {privateKey:string})?.privateKey || '';
        const to = (message.content?.data as {to:string})?.to || '';
        const amount = (message.content?.data as {amount:string})?.amount || '';
        
        return privateKey.startsWith('0x') && 
               privateKey.length >= 64 && 
               to.startsWith('0x') && 
               to.length === 42 &&
               amount.length > 0;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        options?: any,
        callback?: HandlerCallback
    ): Promise<Content> => {
        try {
            // Extract parameters from message
            const privateKey = (message.content?.data as {privateKey:string})?.privateKey || '';
            const to = (message.content?.data as {to:string})?.to || '';
            const amount = (message.content?.data as {amount:string})?.amount || '';
            
            if (!privateKey || !privateKey.startsWith('0x')) {
                throw new Error('Valid private key is required');
            }
            
            if (!to || !to.startsWith('0x') || to.length !== 42) {
                throw new Error('Valid recipient address is required');
            }
            
            if (!amount || isNaN(parseFloat(amount))) {
                throw new Error('Valid amount is required');
            }
            
            // Get the wallet service
            const service = runtime.getService(BiconomyWalletService.serviceType) as BiconomyWalletService;
            if (!service) {
                throw new Error('Biconomy wallet service not found');
            }
            
            // Send the transaction
            const useMainnet = process.env.USE_AVALANCHE_MAINNET === 'true';
            const result = await service.sendGaslessTransaction(privateKey, to, amount, useMainnet);
            if (!result.success) {
                throw new Error(result.error);
            }
            
            const responseContent: Content = {
              text:
                `✅ Gasless transaction sent successfully!\n\n` +
                `📤 **Amount:** ${amount} AVAX\n` +
                `📥 **Recipient:** ${to}\n` +
                `🧾 **Transaction Hash:** ${result.txHash}\n` +
                `🔍 **Explorer Link:** ${result.explorerUrl}\n\n` +
                `Your transaction was processed without requiring any gas fees, thanks to Biconomy's paymaster service.`,
                actions: ["GASLESS_TRANSACTION_SUCCESS"],
                source: message.content?.source,
                data: {
                    to: to,
                    amount: amount,
                    txHash: result.txHash,
                    explorerUrl: result.explorerUrl
                }
            };

            // Send immediate callback to prevent hanging
            if (callback) {
                try {
                    await callback(responseContent);
                    logger.info('GASLESS_TRANSACTION callback sent successfully');
                } catch (callbackError) {
                    logger.debug('GASLESS_TRANSACTION callback error:', callbackError);
                }
            }

            // Return the response content
            return responseContent;

        } catch (error) {
            logger.debug('Error in sendGaslessTransactionAction:', error);
            
            // Send error callback
            if (callback) {
                try {
                    await callback({
                        type: 'ERROR',
                        message: `Failed to send gasless transaction: ${error.message}`,
                        data: { error: error.message }
                    });
                    logger.info('GASLESS_TRANSACTION error callback sent successfully');
                } catch (callbackError) {
                    logger.debug('GASLESS_TRANSACTION error callback error:', callbackError);
                }
            }
            
            // Return error response
            return {
                text: `❌ Failed to send gasless transaction: ${error.message}`,
                actions: ["GASLESS_TRANSACTION_FAILED"],
                source: message.content?.source
            };
        }
    },
    examples: [
        [
            {
                name: '{{name1}}',
                content: {
                    text: 'Send 0.01 AVAX to 0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3 without paying gas fees',
                    data: {
                        privateKey: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d',
                        to: '0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3',
                        amount: '0.01'
                    }
                }
            },
            {
                name: '{{name2}}',
                content: {
                    text: '✅ Gasless transaction sent successfully!\n\n📤 **Amount:** 0.01 AVAX\n📥 **Recipient:** 0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3\n🧾 **Transaction Hash:** 0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234\n🔍 **Explorer Link:** https://testnet.snowtrace.io/tx/0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234\n\nYour transaction was processed without requiring any gas fees, thanks to Biconomy\'s paymaster service.',
                    actions: ['GASLESS_TRANSACTION_SUCCESS'],
                    data: {
                      to: '0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3',
                      amount: '0.01',
                      txHash: '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
                      explorerUrl: 'https://testnet.snowtrace.io/tx/0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234'
                    }
                }
            }
        ]
    ]
};
