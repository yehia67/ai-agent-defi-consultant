import {
    type Action,
    type Content,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
    logger,
} from '@elizaos/core';
import { BedrockService } from './service';

// --- Transaction History Analysis Action ---
export const analyzeTransactionHistoryAction: Action = {
    name: 'ANALYZE_TRANSACTION_HISTORY',
    similes: [
        'ANALYZE_TRANSACTIONS', 
        'TRANSACTION_ANALYSIS', 
        'ANALYZE_TX_HISTORY',
        'REVIEW_TRANSACTIONS',
        'TRANSACTION_INSIGHTS',
        'DEFI_ANALYSIS'
    ],
    description: 'Analyzes transaction history and provides insights using AWS Bedrock AI agent',
    validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
        // Check if Bedrock service is available
        const service = runtime.getService(BedrockService.serviceType);
        return !!service;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        options?: any,
        callback?: HandlerCallback
    ): Promise<void> => {
        try {
            logger.info('Starting transaction history analysis with Bedrock agent');
            
            // Compose state with relevant context
            const composedState = await runtime.composeState(message, [
                'TRANSACTION_HISTORY',
                'WALLET_DATA', 
                'RECENT_MESSAGES',
                'USER_PREFERENCES'
            ]);
            
            // Get the Bedrock service
            const service = runtime.getService(BedrockService.serviceType) as BedrockService;
            if (!service) {
                throw new Error('Bedrock service not found');
            }
            
            // Extract user message and context
            const userMessage = message.content?.text || '';
            const roomId = message.roomId || 'default';
            
            // Generate session ID for conversation continuity
            const sessionId = `tx-analysis-${Date.now()}`;
            
            // Get agent configuration from environment
            const agentId = process.env.BEDROCK_AGENT_ID;
            const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID;
            
            if (!agentId || !agentAliasId) {
                throw new Error('Bedrock agent configuration missing. Please set BEDROCK_AGENT_ID and BEDROCK_AGENT_ALIAS_ID environment variables.');
            }
            
            // Invoke Bedrock agent with user message
            logger.info(`Invoking Bedrock agent for transaction analysis (session: ${sessionId})`);
            const agentResponse = await service.invokeAgent({
                agentId,
                agentAliasId,
                sessionId,
                inputText: userMessage,
                enableTrace: process.env.ENABLE_TRACE === 'true',
                endSession: false
            });
            
            // Create response content
            const responseContent: Content = {
                text: `🔍 **Transaction Analysis**\n\n${agentResponse}`,
                actions: ["TRANSACTION_ANALYSIS_COMPLETE"],
                source: message.content?.source,
                data: {
                    sessionId,
                    analysisType: 'transaction_history',
                    traceEnabled: process.env.ENABLE_TRACE === 'true',
                    timestamp: new Date().toISOString()
                }
            };
            
            // Send response via callback
            if (callback) {
                await callback(responseContent);
                logger.info('Transaction analysis response sent successfully');
            }
            
            logger.info('Transaction analysis completed and response sent');
            
        } catch (error) {
            logger.error('Transaction history analysis error:', error);
            
            const errorContent: Content = {
                text: `❌ **Analysis Error**\n\nSorry, I encountered an error while analyzing your transaction history:\n\n${error.message}\n\nPlease check your Bedrock configuration and try again.`,
                actions: ["TRANSACTION_ANALYSIS_ERROR"],
                source: message.content?.source
            };
            
            if (callback) {
                await callback(errorContent);
            }
        }
    },
    examples: [
        [
            {
                name: "{{user1}}",
                content: {
                    text: "Can you analyze my recent DeFi transactions and tell me if I'm making good decisions?"
                }
            },
            {
                name: "{{user2}}",
                content: {
                    text: "🔍 **Transaction Analysis**\n\nBased on your recent DeFi activity, here's my analysis:\n\n**Transaction Patterns:**\n- You've been actively participating in liquidity mining\n- Strong focus on blue-chip DeFi protocols\n- Good diversification across different yield strategies\n\n**Risk Assessment:**\n- Low to moderate risk profile\n- Smart contract risks are well-managed\n- Consider impermanent loss exposure in LP positions\n\n**Optimization Suggestions:**\n- Consider yield farming opportunities in newer protocols\n- Monitor gas fees for optimal transaction timing\n- Explore cross-chain opportunities for better yields\n\n**Next Steps:**\n- Review your LP positions for impermanent loss\n- Consider dollar-cost averaging into positions\n- Set up alerts for yield rate changes",
                    actions: ["TRANSACTION_ANALYSIS_COMPLETE"]
                }
            }
        ],
        [
            {
                name: "{{user1}}",
                content: {
                    text: "What patterns do you see in my trading behavior over the last month?"
                }
            },
            {
                name: "{{user2}}",
                content: {
                    text: "🔍 **Transaction Analysis**\n\n**Monthly Trading Patterns:**\n\n**Frequency:** You've been quite active with 47 transactions\n**Timing:** Most activity during US market hours\n**Strategy:** Appears to be swing trading with some long-term holds\n\n**Key Insights:**\n- You tend to buy dips effectively\n- Good profit-taking discipline\n- Some FOMO purchases during pumps\n\n**Recommendations:**\n- Consider setting more systematic entry/exit rules\n- Use limit orders to avoid emotional trading\n- Track your win rate and average returns\n\nWould you like me to dive deeper into any specific aspect?",
                    actions: ["TRANSACTION_ANALYSIS_COMPLETE"]
                }
            }
        ]
    ]
};
