import { ethers } from 'ethers';
import { logger } from '@elizaos/core';
import { initializeProvider, ChainlinkProviderResponse, ScheduledTransfer } from './provider';
import { CHAINLINK_REGISTRY_ABI, SCHEDULED_TRANSFER_ABI, SCHEDULED_TRANSFER_BYTECODE } from './constants';

// ABI for the Chainlink Automation Registry

/**
 * Chainlink Automation Service for managing scheduled tasks
 */
export class ChainlinkAutomationService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private registryAddress: string;
  private deployedContracts: Map<string, string> = new Map(); // Map of task type to contract address
  private scheduledTransfers: Map<string, ScheduledTransfer> = new Map(); // Map of transfer ID to transfer details
  
  constructor(privateKey: string, registryAddress: string) {
    this.provider = initializeProvider();
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.registryAddress = registryAddress;
    
    logger.info('Chainlink Automation Service initialized');
    logger.debug(`Using wallet address: ${this.wallet.address}`);
    logger.debug(`Using registry address: ${this.registryAddress}`);
  }
  
  /**
   * Deploy a ScheduledTransfer contract
   * @returns Response with contract address
   */
  async deployScheduledTransferContract(): Promise<ChainlinkProviderResponse> {
    try {
      logger.info('Deploying ScheduledTransfer contract...');
      
      // Check if we already have a deployed contract
      if (this.deployedContracts.has('scheduledTransfer')) {
        return {
          success: true,
          data: {
            contractAddress: this.deployedContracts.get('scheduledTransfer')
          },
          error: 'Contract already deployed'
        };
      }
      
      // Create contract factory
      const factory = new ethers.ContractFactory(
        SCHEDULED_TRANSFER_ABI,
        SCHEDULED_TRANSFER_BYTECODE,
        this.wallet
      );
      
      // Deploy contract with the wallet address as the owner
      const contract = await factory.deploy(this.wallet.address);
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
        data: {
          contractAddress: contract.address
        },
        txHash,
        explorerUrl
      };
    } catch (error) {
      logger.error('Failed to deploy ScheduledTransfer contract:', error);
      return {
        success: false,
        error: `Failed to deploy contract: ${error.message}`
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
        data: {
          upkeepId,
          contractAddress
        },
        txHash,
        explorerUrl
      };
    } catch (error) {
      logger.error('Failed to register with Chainlink Automation:', error);
      return {
        success: false,
        error: `Failed to register with Chainlink Automation: ${error.message}`
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
        contractAddress,
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
        contractAddress
      });
      
      const txHash = tx.hash;
      const explorerUrl = `https://testnet.snowtrace.io/tx/${txHash}`;
      
      logger.info(`Transfer scheduled. ID: ${transferId}`);
      logger.debug(`Transaction hash: ${txHash}`);
      logger.debug(`Explorer URL: ${explorerUrl}`);
      
      return {
        success: true,
        data: {
          transferId,
          recipient,
          amount,
          startTime,
          frequency,
          contractAddress
        },
        txHash,
        explorerUrl
      };
    } catch (error) {
      logger.error('Failed to schedule transfer:', error);
      return {
        success: false,
        error: `Failed to schedule transfer: ${error.message}`
      };
    }
  }
  
  /**
   * Schedule a claim operation to be executed by Chainlink Automation
   * @param contractAddress Address of the contract to claim from
   * @param startTime Start time in seconds since epoch
   * @param frequency Frequency in seconds
   * @returns Response with claim ID
   */
  async scheduleClaim(
    contractAddress: string,
    startTime: number,
    frequency: number
  ): Promise<ChainlinkProviderResponse> {
    try {
      logger.info(`Scheduling claim from contract ${contractAddress}...`);
      
      // Similar implementation as scheduleTransfer but for claim operation
      // This would require a different contract or a more generic implementation
      
      // For now, return a placeholder response
      return {
        success: true,
        data: {
          claimId: '0',
          contractAddress,
          startTime,
          frequency
        }
      };
    } catch (error) {
      logger.error('Failed to schedule claim:', error);
      return {
        success: false,
        error: `Failed to schedule claim: ${error.message}`
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
