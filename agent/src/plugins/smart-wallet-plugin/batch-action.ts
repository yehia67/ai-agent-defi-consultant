// Batch Transactions Action
export const batchTransactionsAction = {
    name: 'BATCH_TRANSACTIONS',
    similes: ['BATCH_TRANSFER', 'MULTIPLE_TRANSACTIONS', 'BULK_TRANSFER', 'MULTI_SEND'],
    description: 'Send multiple transactions in a single batch using Biconomy smart account',
    validate: async (runtime, message) => {
        // Check if required parameters are provided
        const privateKey = message.content?.data?.privateKey || '';
        const transactions = message.content?.data?.transactions || [];
        
        return privateKey.startsWith('0x') && 
               privateKey.length >= 64 && 
               Array.isArray(transactions) && 
               transactions.length > 0;
    },
    handler: async (runtime, message, state, options, callback) => {
        try {
            console.log({data:message.content?.data, content: message.content},"BATCH_TRANSACTIONS");

            // Extract parameters from message
            const privateKey = message.content?.data?.privateKey || '';
            const transactions = message.content?.data?.transactions || [];
            const useGasless = message.content?.data?.useGasless !== false; // Default to true
            
            if (!privateKey || !privateKey.startsWith('0x')) {
                throw new Error('Valid private key is required');
            }
            
            if (!Array.isArray(transactions) || transactions.length === 0) {
                throw new Error('At least one transaction is required');
            }
            
            // Validate each transaction
            for (const tx of transactions) {
                if (!tx.to || !tx.to.startsWith('0x') || tx.to.length !== 42) {
                    throw new Error(`Invalid recipient address: ${tx.to}`);
                }
                
                if (!tx.amount || isNaN(parseFloat(tx.amount))) {
                    throw new Error(`Invalid amount for recipient ${tx.to}: ${tx.amount}`);
                }
            }
            
            // Get the wallet service
            const service = runtime.getService('BiconomyWalletService');
            if (!service) {
                throw new Error('Biconomy wallet service not found');
            }
            
            // Send the batch transaction
            const useMainnet = process.env.USE_AVALANCHE_MAINNET === 'true';
            const result = await service.batchTransactions(privateKey, transactions, useGasless, useMainnet);
            if (!result.success) {
                throw new Error(result.error);
            }
            
            // Build transaction summary
            let txSummary = '';
            transactions.forEach((tx, index) => {
                txSummary += `${index + 1}. ${tx.amount} AVAX to ${tx.to}\n`;
            });
            
            const responseContent = {
              text:
                `✅ Batch transaction sent successfully!\n\n` +
                `📦 **Transactions:** ${transactions.length}\n` +
                `${useGasless ? '🔄 **Mode:** Gasless (sponsored)\n' : '🔄 **Mode:** Standard\n'}` +
                `🧾 **Transaction Hash:** ${result.data.txHash}\n` +
                `🔍 **Explorer Link:** ${result.data.explorerUrl}\n\n` +
                `**Transaction Details:**\n${txSummary}\n` +
                `All transactions were processed in a single operation, saving on gas fees and simplifying your workflow.`,
                actions: ["BATCH_TRANSACTION_SUCCESS"],
                source: message.content?.source,
                data: {
                    transactions: transactions,
                    useGasless: useGasless,
                    txHash: result.data.txHash,
                    explorerUrl: result.data.explorerUrl
                }
            };

            // Send immediate callback to prevent hanging
            if (callback) {
                try {
                    await callback(responseContent);
                } catch (callbackError) {
                    console.error('BATCH_TRANSACTION callback error:', callbackError);
                }
            }

            // Return the response content
            return responseContent;

        } catch (error) {
            console.error('Error in batchTransactionsAction:', error);
            
            // Send error callback
            if (callback) {
                try {
                    await callback({
                        type: 'ERROR',
                        message: `Failed to send batch transaction: ${error.message}`,
                        data: { error: error.message }
                    });
                } catch (callbackError) {
                    console.error('BATCH_TRANSACTION error callback error:', callbackError);
                }
            }
            
            // Return error response
            return {
                text: `❌ Failed to send batch transaction: ${error.message}`,
                actions: ["BATCH_TRANSACTION_FAILED"],
                source: message.content?.source
            };
        }
    },
    examples: [
        [
            {
                name: '{{name1}}',
                content: {
                    text: 'Send 0.01 AVAX to 0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3 and 0.005 AVAX to 0x1234567890123456789012345678901234567890 in a single transaction',
                    data: {
                        privateKey: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d',
                        transactions: [
                            {
                                to: '0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3',
                                amount: '0.01'
                            },
                            {
                                to: '0x1234567890123456789012345678901234567890',
                                amount: '0.005'
                            }
                        ],
                        useGasless: true
                    }
                }
            },
            {
                name: '{{name2}}',
                content: {
                    text: '✅ Batch transaction sent successfully!\n\n📦 **Transactions:** 2\n🔄 **Mode:** Gasless (sponsored)\n🧾 **Transaction Hash:** 0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234\n🔍 **Explorer Link:** https://testnet.snowtrace.io/tx/0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234\n\n**Transaction Details:**\n1. 0.01 AVAX to 0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3\n2. 0.005 AVAX to 0x1234567890123456789012345678901234567890\n\nAll transactions were processed in a single operation, saving on gas fees and simplifying your workflow.',
                    actions: ['BATCH_TRANSACTION_SUCCESS'],
                    data: {
                        transactions: [
                            {
                                to: '0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3',
                                amount: '0.01'
                            },
                            {
                                to: '0x1234567890123456789012345678901234567890',
                                amount: '0.005'
                            }
                        ],
                        useGasless: true,
                        txHash: '0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234',
                        explorerUrl: 'https://testnet.snowtrace.io/tx/0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234'
                    }
                }
            }
        ]
    ]
};
