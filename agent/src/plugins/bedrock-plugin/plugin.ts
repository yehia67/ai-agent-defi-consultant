import { Plugin } from '@elizaos/core';
import { BedrockService } from './service';
import {
  analyzeTransactionHistoryAction
} from './actions';
import { configSchema } from './config';

/**
 * Bedrock Plugin for AI Agent DeFi Consultant
 * 
 * This plugin provides integration with AWS Bedrock AI agents for:
 * - Transaction history analysis and DeFi insights
 */
export const bedrockPlugin: Plugin = {
  name: 'bedrock-agent',
  description: 'AWS Bedrock AI agent integration for DeFi transaction analysis',
  
  config: configSchema,
  
  services: [BedrockService],
  
  actions: [
    analyzeTransactionHistoryAction
  ],
  
  providers: [],
  
  evaluators: [],
  
};

export default bedrockPlugin;
