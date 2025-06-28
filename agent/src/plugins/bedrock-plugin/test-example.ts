import {
    BedrockAgentRuntimeClient,
    InvokeAgentCommand,
    InvokeAgentCommandInput,
    InvokeAgentCommandOutput,
  } from "@aws-sdk/client-bedrock-agent-runtime";
  
  // Bun automatically loads .env files, but you can also use process.env directly
  const client = new BedrockAgentRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      sessionToken: process.env.AWS_SESSION_TOKEN, // Optional, for temporary credentials
    },
  });
  
  interface AgentInvocationParams {
    agentId: string;
    agentAliasId: string;
    sessionId: string;
    inputText: string;
    endSession?: boolean;
    enableTrace?: boolean;
  }
  
  class BedrockAgentService {
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
        console.error("Error invoking Bedrock agent:", error);
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
              console.log("Trace:", JSON.stringify(chunk.trace, null, 2));
            }
          }
        }
  
        return fullResponse;
      } catch (error) {
        console.error("Error invoking Bedrock agent with streaming:", error);
        throw error;
      }
    }
  }
  
  // Usage example with environment variables
  async function main() {
    const agentService = new BedrockAgentService(client);
    
    try {
      // Using environment variables for configuration
      const response = await agentService.invokeAgent({
        agentId: process.env.BEDROCK_AGENT_ID || "YOUR_AGENT_ID",
        agentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID || "TSTALIASID",
        sessionId: `session-${Date.now()}`,
        inputText: "Summarize transaction history",
        enableTrace: true,
      });
  
      console.log("Agent Response:", response);
  
      // Streaming invocation
    //   console.log("\n--- Streaming Response ---");
    //   const streamingResponse = await agentService.invokeAgentWithStreaming(
    //     {
    //       agentId: process.env.BEDROCK_AGENT_ID || "YOUR_AGENT_ID",
    //       agentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID || "TSTALIASID",
    //       sessionId: `session-${Date.now()}`,
    //       inputText: "Tell me about the weather today",
    //       enableTrace: true,
    //     },
    //     (chunk) => {
    //       process.stdout.write(chunk);
    //     }
    //   );
  
    //   console.log("\n\nFull streaming response:", streamingResponse);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  
  // Environment variables setup
  // Make sure to set these in your environment or .env file:
  // AWS_ACCESS_KEY_ID=your_access_key
  // AWS_SECRET_ACCESS_KEY=your_secret_key
  // AWS_REGION=us-east-1
  
  export { BedrockAgentService, AgentInvocationParams };
  
  // Uncomment to run the example
   main();