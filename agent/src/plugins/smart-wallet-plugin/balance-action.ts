// Get Balance Action
export const getBalanceAction = {
    name: 'GET_WALLET_BALANCE',
    similes: ['CHECK_BALANCE', 'VIEW_BALANCE', 'WALLET_BALANCE', 'SHOW_BALANCE'],
    description: 'Check the balance of a Biconomy smart wallet',
    validate: async (runtime, message) => {
        // Check if address is provided
        const address = message.content?.data?.address || '';
        return address.startsWith('0x') && address.length === 42;
    },
    handler: async (runtime, message, state, options, callback) => {
        try {
            console.log({data:message.content?.data, content: message.content},"GET_WALLET_BALANCE");

            // Extract address from message
            const address = message.content?.data?.address || '';
            if (!address || !address.startsWith('0x') || address.length !== 42) {
                throw new Error('Valid wallet address is required');
            }
            
            // Get the wallet service
            const service = runtime.getService('BiconomyWalletService');
            if (!service) {
                throw new Error('Biconomy wallet service not found');
            }
            
            // Get the balance
            const useMainnet = process.env.USE_AVALANCHE_MAINNET === 'true';
            const result = await service.getBalance(address, useMainnet);
            if (!result.success) {
                throw new Error(result.error);
            }
            
            const balanceData = result.data;
            
            const responseContent = {
              text:
                `💰 Wallet Balance\n\n` +
                `📍 **Address:** ${address}\n` +
                `💵 **Balance:** ${balanceData.formattedBalance} AVAX\n` +
                `🌐 **Network:** ${balanceData.network}\n\n` +
                `What would you like to do next?`,
                actions: ["GET_BALANCE_SUCCESS"],
                source: message.content?.source,
                data: {
                    address: address,
                    balance: balanceData.balance,
                    formattedBalance: balanceData.formattedBalance,
                    network: balanceData.network
                }
            };

            // Send immediate callback to prevent hanging
            if (callback) {
                try {
                    await callback(responseContent);
                } catch (callbackError) {
                    console.error('GET_BALANCE callback error:', callbackError);
                }
            }

            // Return the response content
            return responseContent;

        } catch (error) {
            console.error('Error in getBalanceAction:', error);
            
            // Send error callback
            if (callback) {
                try {
                    await callback({
                        type: 'ERROR',
                        message: `Failed to get wallet balance: ${error.message}`,
                        data: { error: error.message }
                    });
                } catch (callbackError) {
                    console.error('GET_BALANCE error callback error:', callbackError);
                }
            }
            
            // Return error response
            return {
                text: `❌ Failed to get wallet balance: ${error.message}`,
                actions: ["GET_BALANCE_FAILED"],
                source: message.content?.source
            };
        }
    },
    examples: [
        [
            {
                name: '{{name1}}',
                content: {
                    text: 'Check the balance of my wallet 0xd3b21E52Ae886f73933C591407EA3DA4E8Dd34D0',
                    data: {
                        address: '0xd3b21E52Ae886f73933C591407EA3DA4E8Dd34D0'
                    }
                }
            },
            {
                name: '{{name2}}',
                content: {
                    text: '💰 Wallet Balance\n\n📍 **Address:** 0xd3b21E52Ae886f73933C591407EA3DA4E8Dd34D0\n💵 **Balance:** 0.1 AVAX\n🌐 **Network:** Avalanche Fuji Testnet\n\nWhat would you like to do next?',
                    actions: ['GET_BALANCE_SUCCESS'],
                    data: {
                      address: '0xd3b21E52Ae886f73933C591407EA3DA4E8Dd34D0',
                      balance: '100000000000000000',
                      formattedBalance: '0.1',
                      network: 'Avalanche Fuji Testnet'
                    }
                }
            }
        ]
    ]
};
