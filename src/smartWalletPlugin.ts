
import type { Plugin } from '@elizaos/core';
import {
  type Action,
  type Content,
  type GenerateTextParams,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  ModelType,
  type Provider,
  type ProviderResult,
  Service,
  type State,
  logger,
} from '@elizaos/core';
import { z } from 'zod';

/**
 * Define the configuration schema for the plugin with the following properties:
 *
 * @param {string} EXAMPLE_PLUGIN_VARIABLE - The name of the plugin (min length of 1, optional)
 * @returns {object} - The configured schema object
 */
const configSchema = z.object({
  EXAMPLE_PLUGIN_VARIABLE: z
    .string()
    .min(1, 'Example plugin variable is not provided')
    .optional()
    .transform((val) => {
      if (!val) {
        console.warn('Warning: Example plugin variable is not provided');
      }
      return val;
    }),
});


/**
 * Wallet Creation Provider
 * Demonstrates a provider that returns a static wallet address
 */
const createWalletProvider: Provider = {
  name: 'CREATE_WALLET_PROVIDER',
  description: 'Provides a new wallet address',

  get: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State
  ): Promise<ProviderResult> => {
    const staticWalletAddress = '0x1234567890abcdef'; // You can later make this dynamic

    return {
      text: `🪪 A wallet is created with address ${staticWalletAddress}`,
      values: {
        address: staticWalletAddress,
      },
      data: {
        createdAt: new Date().toISOString(),
      },
    };
  },
};

export class StarterService extends Service {
  static serviceType = 'starter';
  capabilityDescription =
    'This is a starter service which is attached to the agent through the starter plugin.';

  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  static async start(runtime: IAgentRuntime) {
    logger.info('*** Starting starter service ***');
    const service = new StarterService(runtime);
    return service;
  }

  static async stop(runtime: IAgentRuntime) {
    logger.info('*** Stopping starter service ***');
    // get the service from the runtime
    const service = runtime.getService(StarterService.serviceType);
    if (!service) {
      throw new Error('Starter service not found');
    }
    service.stop();
  }

  async stop() {
    logger.info('*** Stopping starter service instance ***');
  }
}


const createWalletAction: Action = {
  name: 'CREATE_WALLET',
  similes: ['CREATE_WALLET', 'NEW_WALLET', 'MAKE_WALLET'],
  description: 'Creates a new wallet and returns its address',

  validate: async (_runtime: IAgentRuntime, _message: Memory, _state: State): Promise<boolean> => {
    return true;
  },

  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[]
  ) => {
    const staticWalletAddress = '0x1234567890abcdef';

    const responseContent: Content = {
      text: `🪪 A wallet is created with address ${staticWalletAddress}`,
      actions: ['CREATE_WALLET'],
      source: message.content.source,
    };

    await callback(responseContent);
    return responseContent;
  },

  examples: [
    [
      {
        name: '{{name1}}',
        content: {
          text: 'create a wallet',
        },
      },
      {
        name: '{{name2}}',
        content: {
          text: '🪪 A wallet is created with address 0x1234567890abcdef',
          actions: ['CREATE_WALLET'],
        },
      },
    ],
  ],
};


const plugin: Plugin = {
  name: 'wallet_creator',
  description: 'A plugin that creates wallets for users',
  priority: -1000,
  config: {
    EXAMPLE_PLUGIN_VARIABLE: process.env.EXAMPLE_PLUGIN_VARIABLE,
  },
  async init(config: Record<string, string>) {
    logger.info('*** Initializing wallet creator plugin ***');
    try {
      const validatedConfig = await configSchema.parseAsync(config);

      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid plugin configuration: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  },
  models: {
    [ModelType.TEXT_SMALL]: async () => {
      return '🪪 Your wallet has been created.';
    },
    [ModelType.TEXT_LARGE]: async () => {
      return '🪪 A new wallet address has been successfully created.';
    },
  },
  routes: [
    {
      name: 'createwallet',
      path: '/createwallet',
      type: 'GET',
      handler: async (_req: any, res: any) => {
        res.json({
          message: '🪪 A wallet is created with address 0x1234567890abcdef',
        });
      },
    },
  ],
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        logger.info('MESSAGE_RECEIVED event received');
        logger.info(Object.keys(params));
      },
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger.info('VOICE_MESSAGE_RECEIVED event received');
        logger.info(Object.keys(params));
      },
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger.info('WORLD_CONNECTED event received');
        logger.info(Object.keys(params));
      },
    ],
    WORLD_JOINED: [
      async (params) => {
        logger.info('WORLD_JOINED event received');
        logger.info(Object.keys(params));
      },
    ],
  },
  services: [StarterService],
  actions: [createWalletAction],
  providers: [createWalletProvider],
};

export default plugin;


