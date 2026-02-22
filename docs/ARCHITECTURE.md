# Architecture

Technical architecture overview of GluedLaunch.

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                         User Browser                          │
│                                                               │
│  ┌────────────────┐  ┌────────────┐  ┌─────────────────────┐ │
│  │  Next.js Pages │  │  Wagmi     │  │  RainbowKit         │ │
│  │  (React 19)    │  │  + Viem    │  │  (Wallet Connect)   │ │
│  └───────┬────────┘  └─────┬──────┘  └──────────┬──────────┘ │
│          │                 │                     │            │
└──────────┼─────────────────┼─────────────────────┼────────────┘
           │                 │                     │
           ▼                 ▼                     ▼
┌─────────────────┐  ┌──────────────┐  ┌───────────────────────┐
│  Next.js API    │  │  Sepolia     │  │  Wallet Provider      │
│  /api/comments  │  │  RPC Nodes   │  │  (MetaMask, etc.)     │
│  (Server-side)  │  │              │  │                       │
└─────────────────┘  └──────┬───────┘  └───────────────────────┘
                            │
              ┌─────────────┼─────────────────┐
              │             │                 │
       ┌──────▼──────┐ ┌───▼──────┐ ┌────────▼────────┐
       │ GluedLaunch │ │ Glue     │ │ Uniswap V2      │
       │ (Factory)   │ │ Protocol │ │ (After grad.)   │
       └─────────────┘ └──────────┘ └─────────────────┘
```

## Smart Contract Layer

### GluedLaunch.sol — Factory & Bonding Curve

The main entry point contract. Responsibilities:

- **Token creation** (`createToken`) — Deploys new GluedToken instances with configurable parameters
- **Bonding curve sales** (`buyTokens`) — Handles ETH purchases with price calculated from the curve
- **Uniswap graduation** (`graduateToUniswap`) — Creates DEX liquidity pair after sale completes
- **Price calculation** — Quadratic formula for bonding curve pricing

Key design decisions:
- All ETH from purchases is sent directly to the Glue collateral contract (rug-proof)
- 90% of non-creator tokens are for bonding curve sale, 10% reserved for Uniswap LP
- Creator allocation capped at 20% maximum
- Slippage protection via `minTokens` parameter

### GluedToken.sol — Token with Tax & Vesting

Each launched token is a GluedToken instance. Features:

- **ERC20** — Standard token interface via OpenZeppelin
- **StickyAsset** — Glue Protocol integration for collateral backing
- **Transfer tax** — Optional 0-10% tax that burns tokens (increasing floor price)
- **Creator vesting** — Linear unlock over configurable duration
- **Platform hook** — 2% fee on unglue operations goes to platform treasury

### Glue Protocol Integration

GluedToken inherits from `StickyAsset`, which:
- Automatically creates a Glue collateral contract on deployment
- Enables the `unglue()` function for burning tokens to redeem ETH
- Supports hook fees (2% platform fee on withdrawals)
- Floor price = total collateral ETH / total token supply

### Uniswap V2 Integration

After a bonding curve sale completes:
1. Anyone can call `graduateToUniswap()` with ETH
2. Reserved LP tokens + caller's ETH create a Uniswap pair
3. The Uniswap pair is excluded from transfer tax
4. Caller receives LP tokens as a reward
5. Token is now freely tradable on Uniswap

## Frontend Layer

### Next.js App Structure

```
frontend/src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout with providers
│   ├── globals.css                 # Global styles
│   ├── features/page.tsx           # Features overview
│   ├── launch/page.tsx             # Token creation form
│   ├── tokens/page.tsx             # All tokens listing
│   ├── token/[address]/page.tsx    # Token detail + trading
│   └── api/comments/route.ts       # Comments API endpoint
├── components/
│   ├── Header.tsx                  # Navigation + wallet button
│   ├── LaunchForm.tsx              # Token creation form
│   ├── TokenCard.tsx               # Token card in listings
│   ├── TradingPanel.tsx            # Buy/sell tabs
│   ├── BuyPanel.tsx                # Token purchase UI
│   ├── BurnPanel.tsx               # Burn tokens for ETH
│   ├── GraduationPanel.tsx         # Graduate to Uniswap
│   ├── PriceChart.tsx              # Price chart (Lightweight Charts)
│   ├── PriceStats.tsx              # Price statistics display
│   ├── TradeHistory.tsx            # Recent trades table
│   ├── UserPosition.tsx            # User's holdings
│   ├── Comments.tsx                # Token comments/discussion
│   ├── TokenAbout.tsx              # Token metadata display
│   ├── TokenAvatar.tsx             # Token avatar image
│   ├── CopyShareButtons.tsx        # Copy address / share buttons
│   └── Identicon.tsx               # Address identicon
├── contracts/
│   ├── abi.ts                      # Contract ABIs
│   └── addresses.ts                # Contract address helpers
├── hooks/
│   └── useTradeHistory.ts          # On-chain trade event fetcher
├── lib/
│   ├── formatTokens.ts             # Number formatting utilities
│   └── tokenMetadata.ts            # localStorage metadata manager
├── providers.tsx                   # Web3 provider setup
└── wagmi.config.ts                 # Wagmi chain configuration
```

### Web3 Stack

- **Wagmi v2** — React hooks for reading/writing contracts, watching events
- **Viem** — Low-level Ethereum interaction, type-safe ABI encoding
- **RainbowKit v2** — Wallet connection modal with dark theme
- **React Query v5** — Caching and state management for blockchain data

### Provider Configuration

The app wraps all pages in:
1. `WagmiProvider` — Sepolia chain with public RPC fallbacks
2. `QueryClientProvider` — React Query for data caching
3. `RainbowKitProvider` — Custom dark theme with green accent (`#00e87b`)

### Data Storage

- **Blockchain** — All token data, balances, prices, events read from Sepolia
- **localStorage** — Token metadata (descriptions, websites, images) stored client-side
- **Server file** — Comments persisted in `data/comments.json` via API route

## API Layer

### Comments API (`/api/comments`)

Server-side comment persistence using Next.js API routes:

- `GET /api/comments?tokenAddress=<address>` — Fetch comments for a token
- `POST /api/comments` — Create a comment (requires tokenAddress, author, text)
- Data stored in `data/comments.json` (file-based, created automatically)

See [API.md](./API.md) for full documentation.

## Data Flow

### Buy Flow

```
User clicks "Buy" with ETH amount
    │
    ▼
BuyPanel calculates tokens via calculateTokensForETH() (read)
    │
    ▼
User confirms transaction in wallet
    │
    ▼
buyTokens(token, minTokens) called with ETH value
    │
    ▼
GluedLaunch sends ETH to Glue collateral contract
    │
    ▼
GluedLaunch transfers tokens to buyer
    │
    ▼
TokensPurchased event emitted → TradeHistory updates
```

### Burn/Redeem Flow

```
User clicks "Burn" with token amount
    │
    ▼
BurnPanel shows ETH they'll receive (floor price * amount - 2% fee)
    │
    ▼
User approves token spending to Glue contract
    │
    ▼
unglue() called on GluedToken
    │
    ▼
Glue burns tokens, calculates proportional ETH
    │
    ▼
2% hook fee sent to platform treasury
    │
    ▼
Remaining ETH sent to user
```

### Graduation Flow

```
Sale ends (all tokens sold)
    │
    ▼
GraduationPanel becomes available
    │
    ▼
Anyone calls graduateToUniswap() with ETH for LP
    │
    ▼
Reserved tokens + ETH added to Uniswap V2
    │
    ▼
Uniswap pair excluded from transfer tax
    │
    ▼
Caller receives LP tokens as reward
    │
    ▼
Token now tradable on Uniswap
```

## Network Configuration

The frontend is configured for Sepolia testnet with fallback RPC endpoints:

1. `https://ethereum-sepolia-rpc.publicnode.com`
2. `https://rpc2.sepolia.org`
3. `https://sepolia.gateway.tenderly.co`

Chain ID: `11155111`
