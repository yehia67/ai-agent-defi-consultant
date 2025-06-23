import { DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account";

// --- Avalanche Configuration ---
export const AVALANCHE_FUJI_CONFIG = {
    chainId: 43113,
    rpcUrl: 'https://avax-fuji.g.alchemy.com/v2/0syyeOykgk2mVv2b6DPMOqnYsmvNZCUV',
    bundlerUrl: 'https://bundler.biconomy.io/api/v2/43113', // Biconomy bundler for Avalanche Fuji
    paymasterUrl: 'https://paymaster.biconomy.io/api/v1/43113', // Biconomy paymaster for Avalanche Fuji
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS
};

export const AVALANCHE_MAINNET_CONFIG = {
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    bundlerUrl: 'https://bundler.biconomy.io/api/v2/43114',
    paymasterUrl: 'https://paymaster.biconomy.io/api/v1/43114',
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS
};