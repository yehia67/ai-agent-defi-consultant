# DeFi AI Agent Consultant

The Wallet Agent Consultant is a new AI agent that integrates with any digital wallet to help manage your savings according to your preferred strategy. 

## Getting Started

```bash
# Use Node.js version 23.3.0
# You can use a version manager like nvm
nvm install 23.3.0
nvm use 23.3.0
```

# Clone the repository
```
git clone https://github.com/yehia67/ai-agent-defi-consultant.git
```

# Navigate to the project directory
```
cd ai-agent-defi-consultant
```

# Copy the environment variables template
```
cp .env.example .env
```

# Edit the .env file and fill in the required values

## Required environment variables
```
OPENAI_API_KEY=                # Your OpenAI API key
EVM_PRIVATE_KEY=               # Must start with "0x"
EVM_PROVIDER_URL=              # RPC URL for the Ethereum mainnet
ETHEREUM_PROVIDER_SEPOLIA=     # RPC URL for the Ethereum Sepolia testnet
```

# Start the project
```
elizaos start
```