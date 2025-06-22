import { z } from 'zod';

// --- Config Schema ---
export const configSchema = z.object({
    BICONOMY_PAYMASTER_API_KEY: z.string().optional(),
    BICONOMY_BUNDLER_URL: z.string().optional(),
    USE_AVALANCHE_MAINNET: z.string().optional().transform(val => val === 'true'),
    EXAMPLE_PLUGIN_VARIABLE: z.string().optional()
});