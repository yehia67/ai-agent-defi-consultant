// Add Social Recovery Action
export const addSocialRecoveryAction = {
    name: 'ADD_SOCIAL_RECOVERY',
    similes: ['ADD_GUARDIANS', 'SETUP_RECOVERY', 'WALLET_RECOVERY', 'SOCIAL_GUARDIANS'],
    description: 'Add social recovery guardians to a Biconomy smart wallet',
    validate: async (runtime, message) => {
        // Check if required parameters are provided
        const privateKey = message.content?.data?.privateKey || '';
        const guardians = message.content?.data?.guardians || [];
        
        return privateKey.startsWith('0x') && 
               privateKey.length >= 64 && 
               Array.isArray(guardians) && 
               guardians.length > 0;
    },
    handler: async (runtime, message, state, options, callback) => {
        try {
            console.log({data:message.content?.data, content: message.content},"ADD_SOCIAL_RECOVERY")
            // Extract parameters from message
            const privateKey = message.content?.data?.privateKey || '';
            const guardians = message.content?.data?.guardians || [];
            
            if (!privateKey || !privateKey.startsWith('0x')) {
                throw new Error('Valid private key is required');
            }
            
            if (!Array.isArray(guardians) || guardians.length === 0) {
                throw new Error('At least one guardian address is required');
            }
            
            // Validate each guardian address
            for (const guardian of guardians) {
                if (!guardian || !guardian.startsWith('0x') || guardian.length !== 42) {
                    throw new Error(`Invalid guardian address: ${guardian}`);
                }
            }
            
            // Get the wallet service
            const service = runtime.getService('BiconomyWalletService');
            if (!service) {
                throw new Error('Biconomy wallet service not found');
            }
            
            // Add social recovery
            const useMainnet = process.env.USE_AVALANCHE_MAINNET === 'true';
            const result = await service.addSocialRecovery(privateKey, guardians, useMainnet);
            if (!result.success) {
                throw new Error(result.error);
            }
            
            // Build guardians summary
            let guardiansList = '';
            guardians.forEach((guardian, index) => {
                guardiansList += `${index + 1}. ${guardian}\n`;
            });
            
            const responseContent = {
              text:
                `✅ Social recovery guardians added successfully!\n\n` +
                `🛡️ **Number of Guardians:** ${guardians.length}\n` +
                `🔐 **Recovery Threshold:** ${Math.ceil(guardians.length / 2)}\n\n` +
                `**Guardian Addresses:**\n${guardiansList}\n` +
                `Your wallet is now protected with social recovery. If you ever lose access to your wallet, these guardians can help you recover it. The recovery process requires approval from at least ${Math.ceil(guardians.length / 2)} guardians.`,
                actions: ["SOCIAL_RECOVERY_SUCCESS"],
                source: message.content?.source,
                data: {
                    guardians: guardians,
                    threshold: Math.ceil(guardians.length / 2)
                }
            };

            // Send immediate callback to prevent hanging
            if (callback) {
                try {
                    await callback(responseContent);
                } catch (callbackError) {
                    console.error('SOCIAL_RECOVERY callback error:', callbackError);
                }
            }

            // Return the response content
            return responseContent;

        } catch (error) {
            console.error('Error in addSocialRecoveryAction:', error);
            
            // Send error callback
            if (callback) {
                try {
                    await callback({
                        type: 'ERROR',
                        message: `Failed to add social recovery: ${error.message}`,
                        data: { error: error.message }
                    });
                } catch (callbackError) {
                    console.error('SOCIAL_RECOVERY error callback error:', callbackError);
                }
            }
            
            // Return error response
            return {
                text: `❌ Failed to add social recovery: ${error.message}`,
                actions: ["SOCIAL_RECOVERY_FAILED"],
                source: message.content?.source
            };
        }
    },
    examples: [
        [
            {
                name: '{{name1}}',
                content: {
                    text: 'Add social recovery to my wallet with guardians 0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3, 0x1234567890123456789012345678901234567890, and 0x0987654321098765432109876543210987654321',
                    data: {
                        privateKey: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d',
                        guardians: [
                            '0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3',
                            '0x1234567890123456789012345678901234567890',
                            '0x0987654321098765432109876543210987654321'
                        ]
                    }
                }
            },
            {
                name: '{{name2}}',
                content: {
                    text: '✅ Social recovery guardians added successfully!\n\n🛡️ **Number of Guardians:** 3\n🔐 **Recovery Threshold:** 2\n\n**Guardian Addresses:**\n1. 0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3\n2. 0x1234567890123456789012345678901234567890\n3. 0x0987654321098765432109876543210987654321\n\nYour wallet is now protected with social recovery. If you ever lose access to your wallet, these guardians can help you recover it. The recovery process requires approval from at least 2 guardians.',
                    actions: ['SOCIAL_RECOVERY_SUCCESS'],
                    data: {
                        guardians: [
                            '0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3',
                            '0x1234567890123456789012345678901234567890',
                            '0x0987654321098765432109876543210987654321'
                        ],
                        threshold: 2
                    }
                }
            }
        ]
    ]
};
