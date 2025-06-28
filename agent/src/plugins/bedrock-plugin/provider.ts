import { 
    type IAgentRuntime,
    logger,
} from '@elizaos/core';
import { 
    BedrockAgentRuntimeClient,
    InvokeAgentCommand,
    InvokeAgentCommandInput,
    InvokeAgentCommandOutput,
} from "@aws-sdk/client-bedrock-agent-runtime";

// --- Bedrock Agent Client Configuration ---
export async function createBedrockAgentClient(region: string = 'us-east-1'): Promise<{
    client: BedrockAgentRuntimeClient;
    region: string;
}> {
    try {
        const client = new BedrockAgentRuntimeClient({
            region,
            credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                sessionToken: process.env.AWS_SESSION_TOKEN, // Optional, for temporary credentials
            } : undefined, // Use default credential chain if not provided
        });

        logger.info(`Bedrock Agent client created for region: ${region}`);
        return { client, region };
    } catch (error) {
        logger.error('Failed to create Bedrock Agent client:', error);
        throw error;
    }
}

// --- Agent Invocation Parameters Interface ---
export interface AgentInvocationParams {
    agentId: string;
    agentAliasId: string;
    sessionId: string;
    inputText: string;
    endSession?: boolean;
    enableTrace?: boolean;
}

// --- Bedrock Agent Service Class ---
export class BedrockAgentService {
    private client: BedrockAgentRuntimeClient;

    constructor(client: BedrockAgentRuntimeClient) {
        this.client = client;
    }

    async invokeAgent(params: AgentInvocationParams): Promise<string> {
        try {
            const input: InvokeAgentCommandInput = {
                agentId: params.agentId,
                agentAliasId: params.agentAliasId,
                sessionId: params.sessionId,
                inputText: params.inputText,
                endSession: params.endSession || false,
                enableTrace: params.enableTrace || false,
            };

            const command = new InvokeAgentCommand(input);
            const response: InvokeAgentCommandOutput = await this.client.send(command);

            // Process the streaming response
            let fullResponse = "";
            
            if (response.completion) {
                for await (const chunk of response.completion) {
                    if (chunk.chunk?.bytes) {
                        const decoder = new TextDecoder();
                        const text = decoder.decode(chunk.chunk.bytes);
                        fullResponse += text;
                    }
                }
            }

            return fullResponse;
        } catch (error) {
            logger.error("Error invoking Bedrock agent:", error);
            throw error;
        }
    }

    async invokeAgentWithStreaming(
        params: AgentInvocationParams,
        onChunk?: (chunk: string) => void
    ): Promise<string> {
        try {
            const input: InvokeAgentCommandInput = {
                agentId: params.agentId,
                agentAliasId: params.agentAliasId,
                sessionId: params.sessionId,
                inputText: params.inputText,
                endSession: params.endSession || false,
                enableTrace: params.enableTrace || false,
            };

            const command = new InvokeAgentCommand(input);
            const response: InvokeAgentCommandOutput = await this.client.send(command);

            let fullResponse = "";
            
            if (response.completion) {
                for await (const chunk of response.completion) {
                    if (chunk.chunk?.bytes) {
                        const decoder = new TextDecoder();
                        const text = decoder.decode(chunk.chunk.bytes);
                        fullResponse += text;
                        
                        // Call the callback function with each chunk
                        if (onChunk) {
                            onChunk(text);
                        }
                    }
                    
                    // Handle trace information if enabled
                    if (chunk.trace && params.enableTrace) {
                        logger.info("Bedrock Agent Trace:", JSON.stringify(chunk.trace, null, 2));
                    }
                }
            }

            return fullResponse;
        } catch (error) {
            logger.error("Error invoking Bedrock agent with streaming:", error);
            throw error;
        }
    }
}
