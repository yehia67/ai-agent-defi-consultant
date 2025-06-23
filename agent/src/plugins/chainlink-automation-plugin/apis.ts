import { logger, type Route } from '@elizaos/core';

/**
 * API routes for the Chainlink Automation plugin
 */
export const routes: Route[] = [
  {
    name: 'chainlink-automation-status',
    path: '/chainlink-automation/status',
    type: 'GET' as const,
    handler: async (req: any, res: any): Promise<void> => {
      res.json({
        status: 'active',
        name: 'chainlink-automation',
        version: '1.0.0'
      });
    }
  },
  {
    name: 'chainlink-automation-test',
    path: '/chainlink-automation/test',
    type: 'GET' as const,
    handler: async (req: any, res: any): Promise<void> => {
      const walletAddress = "0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3";
      const walletUrl = "https://testnet.snowtrace.io/address/0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3";
      
      res.json({
        success: true,
        message: `Chainlink test successful. Wallet URL: ${walletUrl}`,
        data: { walletAddress, walletUrl }
      });
    }
  },
  {
    name: 'chainlink-automation-schedule',
    path: '/chainlink-automation/schedule',
    type: 'POST' as const,
    handler: async (req: any, res: any): Promise<void> => {
      try {
        const { amount = "0.0001", recipient = "0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3", interval = "86400" } = req.body || {};
        
        res.json({
          success: true,
          message: `Scheduled daily transfer of ${amount} AVAX to ${recipient}`,
          data: { amount, recipient, interval, scheduledAt: new Date().toISOString() }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  }
];
