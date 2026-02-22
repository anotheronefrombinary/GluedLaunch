# GluedLaunch

**Rug-proof token launchpad with bonding curves and Uniswap graduation.**

> 98.6% of traditional memecoins go to zero. GluedLaunch changes that by making every token backed by real ETH collateral that buyers can always redeem.

[Live Demo](https://gluedlaunch.3w.ge) | [Documentation](./docs/) | [Smart Contracts](./contracts/)

---

## Overview

GluedLaunch is a decentralized token launchpad built on [Glue Protocol](https://glue.finance) that makes it impossible for token creators to rug-pull investors. Every ETH spent buying tokens goes directly into a Glue collateral contract — never to the creator — providing a guaranteed floor price that holders can redeem at any time.

### Key Features

- **Rug-Proof by Design** — All purchase ETH goes directly to Glue collateral. Creators never touch buyer funds. Holders can always burn tokens to redeem their share of the ETH floor.
- **Bonding Curve Pricing** — Token price increases as supply is purchased: `Price = basePrice + (tokensSold * priceIncrement)`. Early buyers get better prices, creating organic price discovery.
- **Uniswap Graduation** — When the bonding curve sale completes, 10% of tokens are reserved for Uniswap V2 liquidity. Anyone can trigger graduation to create a real DEX trading pair.
- **Floor Boost Tax** — Optional transfer tax (0-10%) that *burns* tokens on every transfer, permanently reducing supply and increasing the ETH floor price per token.
- **Creator Vesting** — Optional linear vesting (1-12 months) for creator token allocations, preventing immediate dumps.
- **Platform Fee** — 2% fee on collateral withdrawals (unglue) sustains the platform. No fees on buying.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                            │
│           Next.js + RainbowKit + Wagmi + Viem           │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                   GluedLaunch.sol                         │
│              (Factory + Bonding Curve)                    │
│                                                          │
│  createToken() ──► deploys GluedToken                    │
│  buyTokens()   ──► ETH → Glue collateral                │
│  graduateToUniswap() ──► creates DEX pair                │
└───────────┬──────────────────────┬──────────────────────┘
            │                      │
┌───────────▼────────┐  ┌─────────▼──────────────────────┐
│   GluedToken.sol   │  │     Glue Protocol               │
│  (ERC20 + Tax +    │  │  (Collateral Vault)             │
│   Vesting)         │  │                                  │
│                    │  │  ETH locked as backing           │
│  Transfer tax ──►  │  │  unglue() = burn + redeem ETH   │
│  burns tokens      │  │  Floor price = ETH / supply     │
└────────────────────┘  └─────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────────────┐
│                    Uniswap V2                            │
│            (After graduation only)                       │
│  Free market trading with LP from reserved tokens        │
└─────────────────────────────────────────────────────────┘
```

### Token Lifecycle

1. **Launch** — Creator deploys token with custom parameters (supply, price curve, tax, vesting)
2. **Bonding Curve Sale** — Users buy tokens with ETH. All ETH goes to Glue as collateral.
3. **Graduate** — When sale completes, anyone can add Uniswap liquidity with the reserved tokens
4. **Free Trade** — Token trades on Uniswap. Floor price (burn for ETH) always available.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | [Next.js 16](https://nextjs.org/), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| Web3 | [Wagmi v2](https://wagmi.sh/), [Viem](https://viem.sh/), [RainbowKit v2](https://www.rainbowkit.com/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Charts | [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) |
| Contracts | [Solidity ^0.8.28](https://soliditylang.org/), [Glue Protocol](https://glue.finance), [OpenZeppelin](https://openzeppelin.com/) |
| Network | [Ethereum Sepolia Testnet](https://sepolia.dev/) |

## Quick Start

### Prerequisites

- Node.js 18+
- A wallet (MetaMask, Rainbow, etc.) with [Sepolia testnet ETH](https://sepoliafaucet.com/)

### Setup

```bash
# Clone the repository
git clone https://github.com/anotheronefrombinary/GluedLaunch.git
cd GluedLaunch/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local — add your WalletConnect Project ID from https://cloud.walletconnect.com

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

The default configuration uses the deployed GluedLaunch contract on Sepolia testnet (`0x709830275f17E895eAd128fbf8e39EE54658A420`), so you can start testing immediately.

## Documentation

| Document | Description |
|----------|-------------|
| [Setup Guide](./docs/SETUP.md) | Detailed installation and configuration |
| [Architecture](./docs/ARCHITECTURE.md) | Technical architecture deep dive |
| [Smart Contracts](./docs/CONTRACTS.md) | Contract documentation and deployment |
| [Deployment](./docs/DEPLOYMENT.md) | Production deployment guide |
| [API Reference](./docs/API.md) | Comments API documentation |

## Deployed Contracts (Sepolia)

| Contract | Address |
|----------|---------|
| GluedLaunch | [`0x709830275f17E895eAd128fbf8e39EE54658A420`](https://sepolia.etherscan.io/address/0x709830275f17E895eAd128fbf8e39EE54658A420) |

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on the process for submitting pull requests.

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- [Glue Protocol](https://glue.finance) — Collateral-backed asset infrastructure
- [Uniswap](https://uniswap.org) — DEX liquidity and trading
- [RainbowKit](https://www.rainbowkit.com/) — Wallet connection UI
- [Wagmi](https://wagmi.sh/) / [Viem](https://viem.sh/) — Ethereum interaction libraries
- [OpenZeppelin](https://openzeppelin.com/) — Secure smart contract primitives
