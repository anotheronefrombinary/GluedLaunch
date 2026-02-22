# Smart Contracts

Documentation for GluedLaunch smart contracts.

## Overview

GluedLaunch uses two primary contracts built on top of Glue Protocol and OpenZeppelin:

| Contract | Purpose |
|----------|---------|
| `GluedLaunch.sol` | Factory contract — creates tokens, manages bonding curve sales, handles Uniswap graduation |
| `GluedToken.sol` | Token contract — ERC20 with Glue integration, transfer tax, creator vesting |
| `interfaces/IUniswapV2.sol` | Interface definitions for Uniswap V2 Router and Factory |

## Deployed Contracts (Sepolia Testnet)

| Contract | Address | Etherscan |
|----------|---------|-----------|
| GluedLaunch | `0x709830275f17E895eAd128fbf8e39EE54658A420` | [View](https://sepolia.etherscan.io/address/0x709830275f17E895eAd128fbf8e39EE54658A420) |

## GluedLaunch.sol

### Inheritance

```
GluedToolsERC20Base (Glue Protocol)
    └── GluedLaunch
```

### Constructor

```solidity
constructor(address _platformTreasury, address _uniswapRouter)
```

| Parameter | Description |
|-----------|-------------|
| `_platformTreasury` | Address receiving platform fees from token hooks |
| `_uniswapRouter` | Uniswap V2 Router address (can be zero if unavailable) |

### Functions

#### `createToken`

Creates a new token with bonding curve sale.

```solidity
function createToken(
    string calldata name,
    string calldata symbol,
    uint256 totalSupply,
    uint256 creatorPercent,   // in PRECISION (1e18 = 100%), max 20%
    uint256 basePrice,        // starting price per token in wei
    uint256 priceIncrement,   // price increase per token sold in wei
    uint256 transferTaxBps,   // 0-1000 (100 = 1%, max 10%)
    uint256 vestingDuration   // seconds (0 = no vesting)
) external returns (address token)
```

Token allocation:
- Creator: `creatorPercent` of total supply (max 20%)
- Bonding curve sale: 90% of remaining tokens
- Uniswap LP reserve: 10% of remaining tokens

#### `buyTokens`

Purchase tokens with ETH using the bonding curve.

```solidity
function buyTokens(address token, uint256 minTokens) external payable
```

| Parameter | Description |
|-----------|-------------|
| `token` | Token address to buy |
| `minTokens` | Minimum tokens to receive (slippage protection) |

All ETH goes directly to the Glue collateral contract. Excess ETH is refunded.

#### `graduateToUniswap`

Graduate a completed token sale to Uniswap V2.

```solidity
function graduateToUniswap(address token) external payable
```

Requirements:
- Sale must be ended (all tokens sold)
- Token must not already be graduated
- Caller must send ETH for LP pairing

The caller receives LP tokens as a reward for triggering graduation.

#### `calculateTokensForETH`

Calculate how many tokens a given ETH amount can buy.

```solidity
function calculateTokensForETH(address token, uint256 ethAmount)
    public view returns (uint256 tokens, uint256 cost)
```

#### `calculateETHForTokens`

Calculate ETH cost for a specific number of tokens.

```solidity
function calculateETHForTokens(address token, uint256 tokenAmount)
    public view returns (uint256 cost)
```

#### `getCurrentPrice`

Get the current bonding curve price per token.

```solidity
function getCurrentPrice(address token) external view returns (uint256 price)
```

#### `getTokenInfo`

Get comprehensive token information for frontend display.

```solidity
function getTokenInfo(address token) external view returns (TokenInfo memory info)
```

Returns: glue address, total supply, collateral balance, floor price, current price, tokens sold, tokens for sale, creator, launch time, sale status, graduation status, Uniswap pair, transfer tax, vesting duration.

#### `getAllTokens`

Get all launched token addresses.

```solidity
function getAllTokens() external view returns (address[] memory)
```

### Bonding Curve Math

The bonding curve uses a linear pricing model:

```
Price at position N = basePrice + (N * priceIncrement)
```

Total cost for buying `T` tokens starting from `sold` tokens already sold:

```
Cost = T * basePrice + priceIncrement * (sold * T + T*(T-1)/2)
```

The `calculateTokensForETH` function uses the quadratic formula to solve for `T` given an ETH amount.

### Events

```solidity
event TokenCreated(address indexed token, address indexed glue, address indexed creator, ...)
event TokensPurchased(address indexed token, address indexed buyer, uint256 ethSpent, uint256 tokensReceived, ...)
event SaleEnded(address indexed token, uint256 totalTokensSold, uint256 totalCollateral)
event TokenGraduated(address indexed token, address indexed pair, uint256 tokenAmount, uint256 ethAmount, uint256 liquidity)
```

---

## GluedToken.sol

### Inheritance

```
ERC20 (OpenZeppelin)
StickyAsset (Glue Protocol)
    └── GluedToken
```

### Constructor

```solidity
constructor(
    string memory _name,
    string memory _symbol,
    uint256 _totalSupply,
    address _platformTreasury,
    address _creator,
    uint256 _creatorPercent,
    address _launchpad,
    uint256 _transferTaxBps,
    uint256 _vestingDuration
)
```

On deployment:
1. Mints total supply to the contract
2. Transfers creator allocation to creator
3. Transfers remaining tokens to launchpad
4. Initializes Glue Protocol with hooks enabled

### Transfer Tax

Optional tax (0-10%) applied on transfers:

- Tax amount is **burned** (sent to address(0)), reducing total supply
- Burning increases the floor price (same ETH collateral / less tokens)
- **Excluded addresses** (launchpad, Uniswap pair) don't pay tax
- No tax on mint or burn operations

### Creator Vesting

Linear vesting over a configurable duration:

```
unlocked = initialAllocation * elapsed / vestingDuration
locked = initialAllocation - unlocked
```

Creator cannot transfer tokens that are still locked. After `vestingDuration` seconds, all tokens are fully unlocked.

### Platform Hook Fee

When users call `unglue()` (burn tokens to redeem ETH):

1. Glue Protocol calculates proportional ETH
2. `_calculateCollateralHookSize()` returns 2% of the amount
3. `_processCollateralHook()` sends the 2% to platform treasury
4. Remaining 98% goes to the user

### Key Functions

```solidity
function creatorLockedAmount() public view returns (uint256)   // Tokens still locked
function creatorUnlockedAmount() public view returns (uint256)  // Tokens available
function getVestingInfo() external view returns (...)           // Full vesting info
function setTaxExclusion(address, bool) external               // Only launchpad
function glueAddress() external view returns (address)          // Glue contract
```

---

## Dependencies

### Glue Protocol
- `@glue-finance/expansions-pack` — Base contracts for sticky assets
- `StickyAsset` — Manages collateral backing and unglue mechanics
- `GluedToolsERC20Base` — Base for contracts interacting with Glue tokens

### OpenZeppelin
- `@openzeppelin/contracts` — ERC20 implementation and utilities

### Uniswap
- Uniswap V2 Router and Factory interfaces for graduation

## Security Considerations

- **Rug-proof**: Creator never receives purchase ETH. All goes to Glue collateral.
- **CEI Pattern**: State updates happen before external calls in `buyTokens`.
- **Tax exclusion**: Only the launchpad contract can set tax exclusions.
- **Vesting enforcement**: Built into the `_update` override — cannot be bypassed.
- **Slippage protection**: `minTokens` parameter prevents frontrunning.
- **Refunds**: Excess ETH from purchases and graduation is always refunded.
