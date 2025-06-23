import { ethers } from 'ethers';
import { logger } from '@elizaos/core';
import { AVALANCHE_FUJI_CONFIG } from '../../configs/networks';
import https from 'https';
import http from 'http';


// Interface for provider responses
export interface ChainlinkProviderResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  txHash?: string;
  explorerUrl?: string;
}

// Interface for scheduled transfer
export interface ScheduledTransfer {
  id: string;
  recipient: string;
  amount: string;
  startTime: number;
  frequency: number;
  contractAddress: string;
}

/**
 * Initialize provider with multiple fallback RPC URLs
 * Uses a more robust approach with multiple public RPC endpoints
 */
export async function initializeProvider(): Promise<ethers.providers.JsonRpcProvider> {
  // List of public RPC URLs for Avalanche Fuji testnet in order of preference
  const RPC_URLS = [
    // Prioritize the Alchemy endpoint which is confirmed working
    'https://avax-fuji.g.alchemy.com/v2/0syyeOykgk2mVv2b6DPMOqnYsmvNZCUV',
    'https://api.avax-test.network/ext/bc/C/rpc',
    'https://rpc.ankr.com/avalanche_fuji',
    'https://avalanche-fuji-c-chain.publicnode.com',
    'https://avalanche-fuji.blockpi.network/v1/rpc/public',
    'https://rpc.ankr.com/avalanche_fuji-c'
  ];
  
  // Define the network explicitly - this is critical for ethers.js to work properly
  const avalancheFujiNetwork = {
    name: 'avalanche-fuji',
    chainId: 43113,
    _defaultProvider: (providers: any) => new providers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc')
  };
  
  logger.info('Attempting to connect to Avalanche Fuji testnet...');
  
  let provider: ethers.providers.JsonRpcProvider | null = null;
  let lastError: Error | null = null;

  // Try a direct fetch to test connectivity before attempting ethers.js connection
  try {
    logger.info('Testing direct fetch to Avalanche Fuji RPC...');
    const testUrl = 'https://api.avax-test.network/ext/bc/C/rpc';
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });
    
    if (response.ok) {
      const data = await response.json() as { result: string, id: number, jsonrpc: string };
      logger.info(`Direct fetch successful! Current block: ${parseInt(data.result, 16)}`);
    } else {
      logger.warn(`Direct fetch failed with status: ${response.status}`);
    }
  } catch (error) {
    logger.warn(`Direct fetch test failed: ${error.message}`);
  }

  // Function to make a direct HTTP request to the RPC endpoint
  const directRpcRequest = async (url: string, method: string, params: any[] = []): Promise<any> => {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https');
      const httpModule = isHttps ? https : http;
      const urlObj = new URL(url);
      
      const data = JSON.stringify({
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 1000000),
        method,
        params
      });
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
          'Accept': 'application/json',
          'User-Agent': 'ElizaOS-ChainlinkAutomation/1.0.0'
        },
        timeout: 15000 // 15 second timeout
      };
      
      logger.info(`Making direct ${isHttps ? 'HTTPS' : 'HTTP'} request to ${url}`);
      
      const req = httpModule.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsedData = JSON.parse(responseData);
              if (parsedData.error) {
                reject(new Error(`RPC Error: ${JSON.stringify(parsedData.error)}`));
              } else {
                resolve(parsedData.result);
              }
            } catch (e) {
              reject(new Error(`Failed to parse response: ${e.message}`));
            }
          } else {
            reject(new Error(`HTTP Error: ${res.statusCode} ${res.statusMessage}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(new Error(`Request error: ${error.message}`));
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });
      
      req.write(data);
      req.end();
    });
  };
  
  // Create a custom provider that uses our direct HTTP implementation
  const createCustomProvider = (url: string) => {
    // Create a standard provider
    const provider = new ethers.providers.JsonRpcProvider(url);
    
    // Override the send method to use our direct HTTP implementation
    const originalSend = provider.send.bind(provider);
    provider.send = async (method: string, params: any[]): Promise<any> => {
      try {
        logger.info(`Sending direct RPC request: ${method}`);
        return await directRpcRequest(url, method, params);
      } catch (error) {
        logger.warn(`Direct RPC request failed, falling back to ethers.js: ${error.message}`);
        return originalSend(method, params);
      }
    };
    
    // Explicitly set the network to avoid detection issues
    provider._network = {
      chainId: 43113,
      name: 'avalanche-fuji'
    };
    
    return provider;
  };

  // Try each RPC URL with exponential backoff until one works
  for (let i = 0; i < RPC_URLS.length; i++) {
    // Try each URL up to 3 times with increasing backoff
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        logger.info(`Trying RPC URL: ${RPC_URLS[i]} (attempt ${attempt}/3)`);
        
        // Create provider with custom connection options
        const provider = createCustomProvider(RPC_URLS[i]);
        
        // Test the connection with a simple call and longer timeout
        const blockNumberPromise = provider.getBlockNumber();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 15000)
        );
        
        // Race the promises to implement a timeout
        const blockNumber = await Promise.race([
          blockNumberPromise,
          timeoutPromise
        ]) as number;
        
        logger.info(`Successfully connected to Avalanche Fuji testnet (block: ${blockNumber})`);
        
        // Set a reasonable polling interval
        provider.pollingInterval = 4000;
        
        return provider;
      } catch (error) {
        lastError = error;
        logger.warn(`RPC connection attempt ${attempt} failed for ${RPC_URLS[i]}: ${error.message}`);
        
        if (attempt < 3) {
          // Exponential backoff: 2s, 4s, 8s
          const backoffMs = Math.pow(2, attempt) * 1000;
          logger.info(`Waiting ${backoffMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }
  }
  
  // If we get here, all RPC URLs failed
  logger.error('All Avalanche Fuji RPC connections failed. Please check your network connection and firewall settings.');
  throw new Error('All Avalanche Fuji RPC connections failed. Please check your network connection and firewall settings.');
}
