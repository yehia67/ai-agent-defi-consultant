import { ethers } from 'ethers';
import { logger, Service, IAgentRuntime } from '@elizaos/core';
import { initializeProvider, ChainlinkProviderResponse, ScheduledTransfer } from './provider';
import { CHAINLINK_REGISTRY_ABI, SCHEDULED_TRANSFER_ABI, SCHEDULED_TRANSFER_BYTECODE } from './constants';

/**
 * Service class for Chainlink Automation
 */
export class ChainlinkAutomationService extends Service {
  static serviceType = 'CHAINLINK_AUTOMATION';
  static capabilityDescription = 'Manages scheduled tasks and automated transfers using Chainlink Automation';
  
  // Required by Service abstract class
  capabilityDescription = ChainlinkAutomationService.capabilityDescription;
  
  private provider!: ethers.providers.JsonRpcProvider;
  private wallet!: ethers.Wallet;
  private registryAddress!: string;
  // runtime is already declared in the Service base class
  private initialized: boolean = false; // Track initialization status
  private deployedContracts: Map<string, string> = new Map(); // Map of task type to contract address
  private scheduledTransfers: Map<string, ScheduledTransfer> = new Map(); // Map of transfer ID to transfer details
  
  constructor() {
    super();
    logger.info('ChainlinkAutomationService instance created');
    this.initialized = false;
  }
  
  /**
   * Check if the service is properly initialized
   * @returns true if the service is initialized and ready to use
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Get network information to check provider connection
   * @returns Network information including chainId and name
   */
  public async getNetworkInfo(): Promise<{chainId: number, name: string}> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: network.chainId,
        name: network.name
      };
    } catch (error) {
      logger.error('Failed to get network info:', error);
      throw new Error(`Provider connection failed: ${error.message}`);
    }
  }
  
  static async start(runtime: IAgentRuntime): Promise<Service> {
    logger.info('Starting ChainlinkAutomationService');
    const service = new ChainlinkAutomationService();
    service.runtime = runtime;
    await service.initialize();
    return service;
  }
  
  /**
   * Initialize the service
   */
  public async initialize(): Promise<void> {
    try {
      logger.info('Initializing ChainlinkAutomationService...');
      
      // Check for required environment variables early
      const privateKey = process.env.CHAINLINK_AUTOMATION_DEPLOYER_PK;
      if (!privateKey) {
        logger.error('CHAINLINK_AUTOMATION_DEPLOYER_PK environment variable is not set');
        throw new Error('CHAINLINK_AUTOMATION_DEPLOYER_PK environment variable is not set');
      }
      
      const registryAddress = process.env.CHAINLINK_AUTOMATION_REGISTRY_ADDRESS;
      if (!registryAddress) {
        logger.error('CHAINLINK_AUTOMATION_REGISTRY_ADDRESS environment variable is not set');
        throw new Error('CHAINLINK_AUTOMATION_REGISTRY_ADDRESS environment variable is not set');
      }
      
      // Initialize provider with simplified approach
      logger.info('Initializing blockchain provider...');
      try {
        // Use the provider initialization function with improved compatibility
        this.provider = await Promise.race([
          initializeProvider(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Provider initialization timed out after 30 seconds')), 30000)
          )
        ]);
        
        // Verify we can get the block number to confirm connection
        const blockNumber = await this.provider.getBlockNumber();
        logger.info(`Provider initialized successfully. Connected to Avalanche Fuji testnet (block: ${blockNumber})`);
        
        // Set initialized flag to true
        this.initialized = true;
      } catch (providerError) {
        this.initialized = false;
        logger.error(`Provider initialization failed: ${providerError.message}`);
        throw new Error(`Failed to initialize Avalanche Fuji provider: ${providerError.message}`);
      }
      
      // Initialize wallet
      try {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        logger.info(`Wallet initialized with address: ${this.wallet.address}`);
        
        // Check wallet balance to ensure it has funds
        const balance = await this.wallet.getBalance();
        logger.info(`Wallet balance: ${ethers.utils.formatEther(balance)} AVAX`);
        
        if (balance.eq(0)) {
          logger.warn('Warning: Wallet has zero balance. Transactions will fail.');
        }
      } catch (walletError) {
        this.initialized = false;
        logger.error(`Wallet initialization failed: ${walletError.message}`);
        throw new Error(`Failed to initialize wallet: ${walletError.message}`);
      }
      
      this.registryAddress = registryAddress;
      
      // Set initialized flag to true only after all initialization steps have succeeded
      this.initialized = true;
      logger.info('ChainlinkAutomationService initialized successfully');
    } catch (error) {
      this.initialized = false;
      logger.error('ChainlinkAutomationService initialization failed:', error);
      throw new Error(`ChainlinkAutomationService initialization failed: ${error.message}`);
    }
  }
  
  async stop(): Promise<void> {
    logger.info('Stopping ChainlinkAutomationService');
    // Clean up resources if needed
  }
  
  /**
   * Deploy a ScheduledTransfer contract
   * @returns Response with contract address
   */
  async deployScheduledTransferContract(): Promise<ChainlinkProviderResponse> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    
    logger.info('Deploying ScheduledTransfer contract...');
    
    try {
      // Check if we already have a deployed contract
      if (this.deployedContracts.has('scheduledTransfer')) {
        const contractAddress = this.deployedContracts.get('scheduledTransfer');
        return {
          success: true,
          message: `Contract already deployed at ${contractAddress}`,
          data: {
            contractAddress
          }
        };
      }
      
      // Create contract factory
      const factory = new ethers.ContractFactory(
        SCHEDULED_TRANSFER_ABI,
        SCHEDULED_TRANSFER_BYTECODE,
        this.wallet
      );
      
      // Deploy contract
      const contract = await factory.deploy();
      await contract.deployed();
      
      // Store the contract address
      this.deployedContracts.set('scheduledTransfer', contract.address);
      
      const txHash = contract.deployTransaction.hash;
      const explorerUrl = `https://testnet.snowtrace.io/tx/${txHash}`;
      
      logger.info(`ScheduledTransfer contract deployed at: ${contract.address}`);
      logger.debug(`Transaction hash: ${txHash}`);
      logger.debug(`Explorer URL: ${explorerUrl}`);
      
      return {
        success: true,
        message: `ScheduledTransfer contract deployed at ${contract.address}`,
        data: {
          contractAddress: contract.address,
          txHash,
          explorerUrl
        }
      };
    } catch (error) {
      logger.error('Failed to deploy ScheduledTransfer contract:', error);
      return {
        success: false,
        message: `Failed to deploy contract: ${error.message}`,
        error: error.message
      };
    }
  }
  
  /**
   * Register a contract with Chainlink Automation
   * @param contractAddress Address of the contract to register
   * @param gasLimit Gas limit for upkeep
   * @returns Response with upkeep ID
   */
  async registerWithChainlinkAutomation(
    contractAddress: string,
    gasLimit: number = 500000
  ): Promise<ChainlinkProviderResponse> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    
    try {
      logger.info(`Registering contract ${contractAddress} with Chainlink Automation...`);
      
      // Connect to the Chainlink Automation Registry
      const registry = new ethers.Contract(
        this.registryAddress,
        CHAINLINK_REGISTRY_ABI,
        this.wallet
      );
      
      // Register the upkeep
      // Parameters: target, gasLimit, admin, checkData, encryptedEmail
      const tx = await registry.registerUpkeep(
        contractAddress,
        gasLimit,
        this.wallet.address,
        '0x', // Empty checkData
        '0x' // Empty encryptedEmail
      );
      
      const receipt = await tx.wait();
      
      // Parse the logs to get the upkeep ID
      const upkeepId = receipt.events[0].args.id.toString();
      
      const txHash = tx.hash;
      const explorerUrl = `https://testnet.snowtrace.io/tx/${txHash}`;
      
      logger.info(`Contract registered with Chainlink Automation. Upkeep ID: ${upkeepId}`);
      logger.debug(`Transaction hash: ${txHash}`);
      logger.debug(`Explorer URL: ${explorerUrl}`);
      
      return {
        success: true,
        message: `Contract registered with Chainlink Automation. Upkeep ID: ${upkeepId}`,
        data: {
          upkeepId,
          contractAddress,
          txHash,
          explorerUrl
        }
      };
    } catch (error) {
      logger.error('Failed to register with Chainlink Automation:', error);
      return {
        success: false,
        message: `Failed to register with Chainlink Automation: ${error.message}`,
        error: error.message
      };
    }
  }
  
  /**
   * Schedule a transfer to be executed by Chainlink Automation
   * @param recipient Recipient address
   * @param amount Amount to transfer in wei
   * @param startTime Start time in seconds since epoch
   * @param frequency Frequency in seconds
   * @returns Response with transfer ID
   */
  async scheduleTransfer(
    recipient: string,
    amount: string,
    startTime: number,
    frequency: number
  ): Promise<ChainlinkProviderResponse> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    
    try {
      logger.info(`Scheduling transfer of ${amount} wei to ${recipient}...`);
      
      // Check if we have a deployed contract
      if (!this.deployedContracts.has('scheduledTransfer')) {
        const deployResponse = await this.deployScheduledTransferContract();
        if (!deployResponse.success) {
          return deployResponse;
        }
      }
      
      const contractAddress = this.deployedContracts.get('scheduledTransfer');
      
      // Connect to the contract
      const contract = new ethers.Contract(
        contractAddress as string,
        SCHEDULED_TRANSFER_ABI,
        this.wallet
      );
      
      // Create the scheduled transfer
      const tx = await contract.createScheduledTransfer(
        recipient,
        amount,
        startTime,
        frequency
      );
      
      const receipt = await tx.wait();
      
      // Parse the logs to get the transfer ID
      const transferId = receipt.events[0].args.id.toString();
      
      // Store the transfer details
      this.scheduledTransfers.set(transferId, {
        id: transferId,
        recipient,
        amount,
        startTime,
        frequency,
        contractAddress: contractAddress as string
      });
      
      const txHash = tx.hash;
      const explorerUrl = `https://testnet.snowtrace.io/tx/${txHash}`;
      
      logger.info(`Transfer scheduled. ID: ${transferId}`);
      logger.debug(`Transaction hash: ${txHash}`);
      logger.debug(`Explorer URL: ${explorerUrl}`);
      
      return {
        success: true,
        message: `Successfully scheduled transfer of ${amount} wei to ${recipient}`,
        data: {
          transferId,
          recipient,
          amount,
          startTime,
          frequency,
          contractAddress,
          txHash,
          explorerUrl
        }
      };
    } catch (error) {
      logger.error('Failed to schedule transfer:', error);
      return {
        success: false,
        message: `Failed to schedule transfer: ${error.message}`,
        error: error.message
      };
    }
  }
  
  /**
   * Get all scheduled transfers
   * @returns List of scheduled transfers
   */
  getScheduledTransfers(): ScheduledTransfer[] {
    return Array.from(this.scheduledTransfers.values());
  }
  
  /**
   * Get a scheduled transfer by ID
   * @param id Transfer ID
   * @returns Scheduled transfer or undefined
   */
  getScheduledTransfer(id: string): ScheduledTransfer | undefined {
    return this.scheduledTransfers.get(id);
  }
}
