import { type IAgentRuntime, logger, Service } from '@elizaos/core';
import { 
    createBedrockAgentClient,
    BedrockAgentService,
    type AgentInvocationParams
} from './provider';
import { BedrockAgentRuntimeClient } from '@aws-sdk/client-bedrock-agent-runtime';

// --- Bedrock Service ---
export class BedrockService extends Service {
    static serviceType = 'bedrock_service';
    
    capabilityDescription = 'This plugin enables access to AWS Bedrock AI agents for DeFi transaction analysis and consulting';
    private agentClient: BedrockAgentRuntimeClient | null = null;
    private agentService: BedrockAgentService | null = null;
    private region: string = 'us-east-1';

    constructor(runtime: IAgentRuntime) {
        super(runtime);
    }

    static async start(runtime: IAgentRuntime): Promise<BedrockService> {
        logger.info('*** Starting AWS Bedrock Agent service ***');
        const service = new BedrockService(runtime);
        await service.initialize();
        return service;
    }

    static async stop(runtime: IAgentRuntime): Promise<void> {
        const service = runtime.getService(BedrockService.serviceType);
        if (service) {
            await service.stop();
        }
        logger.info('*** Stopped AWS Bedrock Agent service ***');
    }

    async initialize(): Promise<void> {
        try {
            this.region = process.env.AWS_REGION || 'us-east-1';
            
            // Create Bedrock Agent client
            const { client } = await createBedrockAgentClient(this.region);
            this.agentClient = client;
            this.agentService = new BedrockAgentService(client);
            
            logger.info(`Bedrock Agent service initialized for region: ${this.region}`);
            
            // Validate configuration
            await this.validateConfiguration();
            
        } catch (error) {
            logger.error('Failed to initialize Bedrock Agent service:', error);
            throw error;
        }
    }

    async cleanup(): Promise<void> {
        this.agentClient = null;
        this.agentService = null;
        logger.info('Bedrock Agent service cleaned up');
    }

    async invokeAgent(params: AgentInvocationParams): Promise<string> {
        if (!this.agentService) {
            throw new Error('Bedrock Agent service not initialized');
        }
        
        return await this.agentService.invokeAgent(params);
    }

    async invokeAgentWithStreaming(
        params: AgentInvocationParams,
        onChunk?: (chunk: string) => void
    ): Promise<string> {
        if (!this.agentService) {
            throw new Error('Bedrock Agent service not initialized');
        }
        
        return await this.agentService.invokeAgentWithStreaming(params, onChunk);
    }

    async validateConfiguration(): Promise<void> {
        try {
            // Check required environment variables
            const agentId = process.env.BEDROCK_AGENT_ID;
            const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID;
            
            if (!agentId) {
                throw new Error('BEDROCK_AGENT_ID environment variable is required');
            }
            
            if (!agentAliasId) {
                throw new Error('BEDROCK_AGENT_ALIAS_ID environment variable is required');
            }
            
            // Test agent invocation with a simple message
            logger.info('Testing Bedrock agent connectivity...');
            const testResponse = await this.invokeAgent({
                agentId,
                agentAliasId,
                sessionId: `test-${Date.now()}`,
                inputText: 'Hello, this is a connectivity test.',
                enableTrace: false
            });
            
            if (testResponse) {
                logger.info('Bedrock agent connectivity test successful');
            } else {
                logger.warn('Bedrock agent connectivity test returned empty response');
            }
            
        } catch (error) {
            logger.error('Bedrock agent configuration validation failed:', error);
            throw new Error(`Bedrock agent validation failed: ${error.message}`);
        }
    }

    // Instance method required by abstract Service class
    async stop(): Promise<void> {
        await this.cleanup();
    }
}
