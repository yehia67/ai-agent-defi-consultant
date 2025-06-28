import { z } from 'zod';

export const configSchema = z.object({
    BEDROCK_AGENT_ID: z.string(),
    BEDROCK_AGENT_ALIAS_ID: z.string(),
    AWS_REGION: z.string().default('us-east-1'),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    ENABLE_TRACE: z.string().optional().transform(val => val === 'true'),
});