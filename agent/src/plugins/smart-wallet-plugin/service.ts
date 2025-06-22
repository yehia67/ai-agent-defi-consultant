import {
    type IAgentRuntime,
    logger,
    Service,
} from '@elizaos/core';

import { generateBiconomyWallet } from './provider';



// --- Service ---
export class BiconomyWalletService extends Service {
    static serviceType = 'biconomy_wallet';
    
    capabilityDescription = 'This plugin enables ERC-4337 wallet creation via Biconomy on Avalanche network';

    constructor(runtime: IAgentRuntime) {
        super(runtime);
    }

    static async start(runtime: IAgentRuntime): Promise<BiconomyWalletService> {
        logger.info('*** Starting Biconomy wallet service ***');
        return new BiconomyWalletService(runtime);
    }

    static async stop(runtime: IAgentRuntime): Promise<void> {
        const service = runtime.getService(BiconomyWalletService.serviceType);
        if (!service) {
            throw new Error('Biconomy wallet service not found');
        }
        await service.stop();
    }

    async stop(): Promise<void> {
        logger.info('*** Stopping Biconomy wallet service instance ***');
    }

    async validateConfiguration(): Promise<boolean> {
        try {
            // Test wallet creation to validate configuration
            await generateBiconomyWallet();
            return true;
        } catch (error) {
            logger.error('Configuration validation failed:', error);
            return false;
        }
    }
}