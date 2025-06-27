# DeFi Consultant AI Agent

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DeFi Consultant AI Agent                         │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           ElizaOS Framework                             │
└───────┬─────────────────────────┬───────────────────────────┬───────────┘
        │                         │                           │
        ▼                         ▼                           ▼
┌───────────────┐      ┌───────────────────┐      ┌────────────────────┐
│  Smart Wallet │      │     Chainlink     │      │    Core Plugins    │
│    Plugin     │      │   Automation      │      │                    │
└───────┬───────┘      │     Plugin        │      │ - OpenAI/Anthropic │
        │              └─────────┬─────────┘      │ - SQL Database     │
        │                        │                │ - EVM Integration  │
        │                        │                └────────────────────┘
        ▼                        ▼
┌───────────────┐      ┌───────────────────┐
│   Biconomy    │      │     Chainlink     │
│Account Abstr. │      │    Automation     │
│     SDK       │      │     Network       │
└───────┬───────┘      └─────────┬─────────┘
        │                        │
        ▼                        ▼
┌───────────────────────────────────────────┐
│             Avalanche Network             │
│      (Fuji Testnet & Mainnet)             │
└───────────────────────────────────────────┘
```

### Key Features

**Smart Wallet Plugin:**
- 🔐 Wallet Creation & Management
- 💸 Gasless Transactions
- 🔄 Batch Transactions
- 🛡️ Social Recovery
- 💰 Balance Checking

**Chainlink Automation Plugin:**
- ⏱️ Scheduled AVAX Transfers
- 📝 Contract Deployment
- 🔄 Upkeep Registration
- 📊 Transfer Management

## Chromion: A Chainlink Hackathon Project

This project is developed for **Chromion: A Chainlink Hackathon** - building the future of onchain finance and AI alongside thousands of developers, creators, artists, and mentors with the goal of enabling new use cases that combine DeFi, Tokenized Assets, and AI.

- Running from May 30 - June 29
- Free registration
- Completely virtual and across trending industry verticals
- Gain hands-on experience with the backbone of blockchain
- Explore innovative use cases in AI, Tokenization, RWAs, and more
- Learn with Chainlink's developer resources and connect with the community

This hackathon fast-tracks developers' journey into onchain finance with focused workshops, clear prize tracks, and opportunities for networking.

## Project Overview

The DeFi Consultant AI Agent is an intelligent assistant that integrates blockchain functionality with AI capabilities. It helps users manage their digital assets, create and load Biconomy smart wallets, schedule automated transactions using Chainlink Automation, and provides expert guidance on DeFi strategies.

## Project Structure

```
ai-agent-defi-consultant/
├── agent/                     # AI Agent code
│   ├── src/
│   │   ├── configs/           # Configuration files
│   │   │   └── networks.ts    # Network configurations
│   │   ├── index.ts           # Main agent entry point
│   │   └── plugins/           # Custom plugins
│   │       ├── chainlink-automation-plugin/  # Chainlink Automation integration
│   │       └── smart-wallet-plugin/          # Biconomy Smart Wallet integration
│   ├── package.json           # Agent dependencies
│   └── .env.example           # Environment variables template
└── contracts/                 # Smart contracts
    ├── src/
    │   ├── ScheduledTransfer.sol  # Chainlink Automation contract
    │   └── interfaces/        # Contract interfaces
    ├── test/                  # Contract tests
    ├── hardhat.config.ts      # Hardhat configuration
    └── package.json           # Contract dependencies
```

## Smart Contracts

### Overview

The smart contract repository contains the Chainlink Automation-compatible contracts that enable scheduled transfers of AVAX on the Avalanche network. The main contract is `ScheduledTransfer.sol`, which implements the Chainlink Automation interface to execute recurring transfers based on predefined schedules.

### Setup and Testing

1. Navigate to the contracts directory:
   ```bash
   cd contracts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile contracts:
   ```bash
   npx hardhat compile
   ```

4. Run tests:
   ```bash
   npx hardhat test
   ```

5. Deploy to Avalanche Fuji testnet:
   ```bash
   npx hardhat run scripts/deploy.ts --network fuji
   ```

### Key Contract Features

- **Scheduled Transfers**: Automate recurring AVAX transfers at specified intervals
- **Chainlink Automation Integration**: Uses Chainlink's time-based automation for reliable execution
- **Configurable Parameters**: Set recipient, amount, frequency, and start time for each transfer

## AI Agent

### Setup and Running

1. Navigate to the agent directory:
   ```bash
   cd agent
   ```

2. Install dependencies using Bun:
   ```bash
   bun i
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. Start the development server:
   ```bash
   bun dev
   ```

### Package Versions

Key dependencies:
- ElizaOS: 0.0.12
- Biconomy SDK: ^3.0.0
- Ethers.js: ^5.7.2
- Chainlink: ^1.1.2
- TypeScript: ^5.0.4
- Bun: ^1.0.0

## Custom Plugins

### Smart Wallet Plugin

The Smart Wallet Plugin integrates Biconomy's Account Abstraction SDK to provide gasless transactions and smart contract wallet functionality.

#### Features:
- **Wallet Creation**: Generate new Biconomy smart wallets with social recovery capabilities
- **Wallet Loading**: Import existing wallets using private keys
- **Balance Checking**: Query wallet balances across different tokens
- **Gasless Transactions**: Execute transactions without requiring gas fees
- **Batched Transactions**: Combine multiple operations into a single transaction

#### Implementation:
The plugin uses Biconomy's SDK to create and manage smart contract wallets on the Avalanche network. It handles the complexity of account abstraction, allowing users to perform operations without worrying about gas fees or transaction signing.

### Chainlink Automation Plugin

The Chainlink Automation Plugin enables scheduling of recurring transactions and automated tasks on the blockchain.

#### Features:
- **Scheduled Transfers**: Set up daily, weekly, or custom interval transfers of AVAX
- **Contract Deployment**: Deploy Chainlink Automation-compatible contracts
- **Upkeep Registration**: Register contracts with the Chainlink Automation network
- **Transfer Management**: View, modify, and cancel scheduled transfers

#### Implementation:
This plugin interacts with the Chainlink Automation Registry to register and manage upkeeps for scheduled tasks. It deploys the ScheduledTransfer contract and configures it to execute transfers at specified intervals, leveraging Chainlink's decentralized automation network for reliable execution.

## Environment Variables

The project uses environment variables for configuration. Copy the `.env.example` file to `.env` and configure the following variables:

### API Keys
```
# OpenAI API Key for AI capabilities
OPENAI_API_KEY=your_openai_api_key

# Anthropic API Key (optional alternative AI provider)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Biconomy API Keys for gasless transactions
BICONOMY_PAYMASTER_API_KEY=your_biconomy_paymaster_key
BICONOMY_BUNDLER_URL=https://bundler.biconomy.io/api/v2/43113
```

### Blockchain Configuration
```
# Private key for deploying and interacting with Chainlink Automation
CHAINLINK_AUTOMATION_DEPLOYER_PK=your_private_key

# Network selection (true for mainnet, false for testnet)
USE_AVALANCHE_MAINNET=false

# RPC URLs for Avalanche networks
AVALANCHE_FUJI_RPC_URL=https://avax-fuji.g.alchemy.com/v2/your_api_key
AVALANCHE_FUJI_RPC_URL_BACKUP=https://avalanche-fuji-c-chain.publicnode.com
```

### Plugin Configuration
```
# Chainlink Automation Registry address on Fuji testnet
CHAINLINK_AUTOMATION_REGISTRY_ADDRESS=0x819B58A646CDd8289275A87653a2aA4902b14fe6

# Logging level
LOG_LEVEL=info
```

## Usage

Once the agent is running, you can interact with it to:

1. Create a new Biconomy smart wallet
2. Load an existing wallet using a private key
3. Schedule daily AVAX transfers using Chainlink Automation
4. Check wallet balances
5. Get DeFi investment advice and strategies

Example commands:
- "Create a new wallet for me"
- "Load my wallet with private key 0x..."
- "Schedule a daily transfer of 0.0001 AVAX to 0xb89ec35c2b83D895dC2dfF76F2Ec734A023733a3"
- "Check my wallet balance"
- "What DeFi strategies do you recommend for low risk?"

## License

MIT
