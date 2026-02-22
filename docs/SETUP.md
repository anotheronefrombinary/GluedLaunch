# Setup Guide

Detailed instructions for setting up GluedLaunch locally.

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Web3 Wallet** — [MetaMask](https://metamask.io/), [Rainbow](https://rainbow.me/), or any WalletConnect-compatible wallet
- **Sepolia Testnet ETH** — Get free test ETH from a [Sepolia faucet](https://sepoliafaucet.com/)
- **WalletConnect Project ID** — Free from [cloud.walletconnect.com](https://cloud.walletconnect.com)

## 1. Clone the Repository

```bash
git clone https://github.com/anotheronefrombinary/GluedLaunch.git
cd GluedLaunch
```

## 2. Frontend Setup

### Install Dependencies

```bash
cd frontend
npm install
```

### Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Required: Get from https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_ID=your_project_id_here

# Optional: Use the deployed contract or deploy your own
NEXT_PUBLIC_LAUNCH_ADDRESS=0x709830275f17E895eAd128fbf8e39EE54658A420
```

#### Getting a WalletConnect Project ID

1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Sign up or log in
3. Click "Create a New Project"
4. Name it anything (e.g., "GluedLaunch Dev")
5. Copy the **Project ID**
6. Paste it into your `.env.local`

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 3. Smart Contract Setup

The repository includes smart contracts in `/contracts` for reference. The default configuration uses contracts already deployed to Sepolia testnet.

### Using Deployed Contracts (Recommended for Testing)

No additional setup needed. The `.env.example` already includes the deployed contract address:

```
NEXT_PUBLIC_LAUNCH_ADDRESS=0x709830275f17E895eAd128fbf8e39EE54658A420
```

### Deploying Your Own Contracts

If you want to deploy your own instance:

1. You'll need a Solidity development environment (Hardhat, Foundry, or Remix)
2. Install dependencies:
   - `@glue-finance/expansions-pack` — Glue Protocol base contracts
   - `@openzeppelin/contracts` — ERC20 and utility contracts
3. Deploy `GluedLaunch.sol` with:
   - `_platformTreasury`: Your treasury address for platform fees
   - `_uniswapRouter`: Uniswap V2 Router address on your target network
4. Update `NEXT_PUBLIC_LAUNCH_ADDRESS` in `.env.local` with your new contract address

See [CONTRACTS.md](./CONTRACTS.md) for detailed contract documentation.

## 4. Wallet Setup

1. Install MetaMask or another Web3 wallet
2. Add Sepolia testnet to your wallet (MetaMask usually has it built-in)
3. Get test ETH from a faucet:
   - [sepoliafaucet.com](https://sepoliafaucet.com/)
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
4. Connect your wallet on the GluedLaunch site

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### WalletConnect not connecting
- Ensure your `NEXT_PUBLIC_WALLETCONNECT_ID` is valid
- Check that you're on Sepolia testnet in your wallet

### Transactions failing
- Ensure you have enough Sepolia ETH for gas
- Check that the contract address in `.env.local` is correct
- Try increasing the gas limit in your wallet

### Port 3000 already in use
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>

# Or use a different port
npm run dev -- -p 3001
```
