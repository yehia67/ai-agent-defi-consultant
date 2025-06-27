import { z } from 'zod';

// Configuration schema for the Chainlink Automation plugin
export const configSchema = z.object({
    // Required: Private key for deploying and interacting with Chainlink Automation
    CHAINLINK_AUTOMATION_DEPLOYER_PK: z.string()
        .min(1, "Private key is required")
        .describe("Private key for deploying and interacting with Chainlink Automation"),
    
    // Avalanche Fuji RPC URLs with fallbacks
    AVALANCHE_FUJI_RPC_URL: z.string()
        .default("https://avax-fuji.g.alchemy.com/v2/0syyeOykgk2mVv2b6DPMOqnYsmvNZCUV")
        .describe("Primary RPC URL for Avalanche Fuji testnet"),
    
    AVALANCHE_FUJI_RPC_URL_BACKUP: z.string()
        .default("https://avax-fuji.g.alchemy.com/v2/0syyeOykgk2mVv2b6DPMOqnYsmvNZCUV")
        .describe("Backup RPC URL for Avalanche Fuji testnet"),
    
    // Chainlink Automation Registry address on Fuji testnet
    CHAINLINK_AUTOMATION_REGISTRY_ADDRESS: z.string()
        .default("0x819B58A646CDd8289275A87653a2aA4902b14fe6")
        .describe("Chainlink Automation Registry address on Fuji testnet"),
    
    // Optional: Log level for debugging
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"])
        .default("info")
        .describe("Log level for the Chainlink Automation plugin"),
});

// Type for the validated config
export type ChainlinkAutomationConfig = z.infer<typeof configSchema>;

// Default configuration values
export const DEFAULT_CONFIG: Partial<ChainlinkAutomationConfig> = {
    AVALANCHE_FUJI_RPC_URL: "https://avax-fuji.g.alchemy.com/v2/0syyeOykgk2mVv2b6DPMOqnYsmvNZCUV",
    AVALANCHE_FUJI_RPC_URL_BACKUP: "https://avax-fuji.g.alchemy.com/v2/0syyeOykgk2mVv2b6DPMOqnYsmvNZCUV",
    CHAINLINK_AUTOMATION_REGISTRY_ADDRESS: "0x819B58A646CDd8289275A87653a2aA4902b14fe6",
    LOG_LEVEL: "info"
};
