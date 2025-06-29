# DeFi Consultant AI Agent

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DeFi Consultant AI Agent                         │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                           ElizaOS Framework                                                │
└───┬──────────────────────────┬───────────────────────────────┬───────────────┬───────────────┬─┘
    │                            │                               │               │             │
    ▼                            ▼                               ▼               ▼               ▼
┌─────────────────┐ ┌───────────────┐ ┌───────────────────┐ ┌─────────────────┐ ┌────────────────────┐
│   Bedrock       │ │  Smart Wallet │ │     Chainlink     │ │   Chainlink     │ │    Core Plugins    │
│    Plugin       │ │    Plugin     │ │   Automation      │ │ Historical Price│ │                    │
└────────┬────────┘ └───────┬───────┘ │     Plugin        │ │ Feeder Plugin   │ │ - OpenAI/Anthropic │
         │                  │         └─────────┬─────────┘ └────────┬────────┘ │ - SQL Database     │
         │                  │                   │                    │          │ - EVM Integration  │
         ▼                  │                   │                    │          └────────────────────┘
┌─────────────────┐         ▼                   ▼                    ▼
│   Bedrock       │ ┌───────────────┐ ┌───────────────────┐ ┌─────────────────┐
│   AI Agent      │ │   Biconomy    │ │     Chainlink     │ │   Chainlink     │
└────────┬────────┘ │Account Abstr. │ │    Automation     │ │ Data Feeds      │
         │          │     SDK       │ │     Network       │ └─────────────────┘
         ▼          └───────┬───────┘ └─────────┬─────────┘
┌─────────────────┐         │                   │
│getTransactionHis│         ▼                   ▼
│tory AWS Lambda  │ ┌───────────────────────────────────────────┐
│   function      │ │             Avalanche Network             │
└─────────────────┘ │      (Fuji Testnet & Mainnet)             │
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

**Chainlink Historical Price Feeder Plugin:**
 - 📈 Latest Crypto Prices
 - 📊 Historical Price Data (by round)
 - 🔍 Symbol Recognition in Messages
 - 🧠 Natural Language Understanding
 - 🚫 Invalid Token Handling & Suggestions

**Bedrock Plugin:**
- 🤖 AI-Powered Transaction Analysis
- 📝 Transaction Summarization
- ☁️ AWS Bedrock AI Agent Integration

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
│   │       ├── bedrock-plugin/               # AWS Bedrock AI Agent integration
│   │       ├── chainlink-automation-plugin/  # Chainlink Automation integration
│   │       ├── chainlink-price-feeder/       # Chainlink Historical Price Feeder integration
│   │       └── smart-wallet-plugin/          # Biconomy Smart Wallet integration
│   ├── package.json           # Agent dependencies
│   └── .env.example           # Environment variables template
├── aws-lambda/                # AWS Lambda functions
│   └── lambda_function.py     # getTransactionHistory function
└── contracts/                 # Smart contracts
    ├── src/
    │   ├── ScheduledTransfer.sol  # Chainlink Automation contract
    │   └── interfaces/        # Contract interfaces
    ├── test/                  # Contract tests
    ├── hardhat.config.ts      # Hardhat configuration
    └── package.json           # Contract dependencies
```

## Smart Contracts

### Chainlink Automation

The smart contract repository contains the Chainlink Automation-compatible contracts that enable scheduled transfers of AVAX on the Avalanche network. The main contract is `ScheduledTransfer.sol`, which implements the Chainlink Automation interface to execute recurring transfers based on predefined schedules.

### Chainlink Price Feeder
The smart contract repository includes `src/HistoricalPriceFeeder.sol`, a utility contract designed to fetch both historical and latest cryptocurrency price data using Chainlink oracles on the Avalanche network. By providing a Chainlink price feed address and a specific round ID, the contract enables precise retrieval of historical price points, making it ideal for audit trails, analytics, and time-based financial logic.


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

### Bedrock Plugin

The Bedrock Plugin integrates AWS Bedrock AI agents to provide intelligent transaction analysis and DeFi consulting capabilities.

#### Features:
- **AI-Powered Transaction Analysis**: Leverages AWS Bedrock AI agents to analyze transaction patterns and provide insights
- **Transaction Summarization**: Generates concise summaries of transaction history and trading behavior
- **DeFi Consulting**: Provides expert guidance on DeFi strategies based on historical data analysis
- **Session Management**: Maintains conversation continuity for ongoing analysis sessions

#### Implementation:
The plugin connects to an AI agent that is set up in AWS Bedrock, which specializes in DeFi transaction analysis. The AI agent is connected to a Lambda function that supplies it with transaction history data for a given wallet address using SIM API by Dune. The plugin uses AWS Bedrock Agent Runtime to invoke this pre-configured AI agent and retrieve intelligent insights about transaction patterns and DeFi strategies. The plugin supports both explicit AWS credentials and default credential chain authentication, with configurable regions and trace enablement for development purposes.

### Chainlink Price Feed Plugin

The Chainlink Price Feed Plugin integrates Chainlink oracles to fetch real-time and historical cryptocurrency price data on the Avalanche network.

#### Features:

- **Latest Price Retrieval**: Get up-to-date price information for supported tokens like BTC, AVAX, and ETH
- **Natural Language Parsing**: Understands user queries like "What's the price of BTC for the last 3 rounds?"
- **Error Handling & Suggestions**: Informs users when a token is unsupported and suggests valid symbols

#### Implementation:

The plugin uses Chainlink's decentralized oracle network to query price feeds via smart contracts deployed on Avalanche network. It includes a flexible action handler that:

- Parses user text to identify target symbols and desired historical depth
- Maps symbols to Chainlink feed addresses
- Queries Chainlink aggregators for current and past round data
- Returns a friendly, structured response summarizing the price information

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
- "What's the price of BTC for the last 3 months?""

## License

MIT
