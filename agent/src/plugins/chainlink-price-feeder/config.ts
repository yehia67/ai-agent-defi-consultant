import { z } from 'zod';

export const configSchema = z.object({
    CHAINLINK_PRICE_FEED_ADDRESS: z.string()
        .default("0x778270C40b93578D60EF11e313b9E9E9d9F6EC29")
        .describe("Chainlink Price Feed contract address on Avalanche Fuji testnet"),
        
    // Avalanche Fuji RPC URLs with fallbacks
    AVALANCHE_FUJI_RPC_URL: z.string()
        .default("https://ava-testnet.public.blastapi.io/ext/bc/C/rpc")
        .describe("Primary RPC URL for Avalanche Fuji testnet"),
    
    AVALANCHE_FUJI_RPC_URL_BACKUP: z.string()
        .default("https://api.avax-test.network/ext/bc/C/rpc")
        .describe("Backup RPC URL for Avalanche Fuji testnet"),
    
    // Optional: Log level for debugging
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"])
        .default("info")
        .describe("Log level for the Chainlink Automation plugin"),
});

// Type for the validated config
export type ChainlinkAutomationConfig = z.infer<typeof configSchema>;

// Default configuration values
export const DEFAULT_CONFIG: Partial<ChainlinkAutomationConfig> = {
    AVALANCHE_FUJI_RPC_URL: "https://avalanche-fuji.drpc.org",
    AVALANCHE_FUJI_RPC_URL_BACKUP: "https://api.avax-test.network/ext/bc/C/rpc",
    LOG_LEVEL: "info"
};
