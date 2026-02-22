// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@glue-finance/expansions-pack/contracts/tools/GluedToolsERC20Base.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./GluedToken.sol";
import "./interfaces/IUniswapV2.sol";

/**
 * @title GluedLaunch
 * @notice Rug-proof token launchpad with bonding curve, transfer tax, creator vesting, and Uniswap graduation
 * @dev Factory contract that deploys GluedTokens and handles initial ETH sale
 *
 * Key Features:
 * - All ETH from purchases goes directly to Glue contract as collateral (rug-proof)
 * - Optional transfer tax (0-10%) that burns tokens to increase floor price
 * - Optional creator vesting with linear unlock
 * - Uniswap V2 graduation after bonding curve sale ends
 *
 * Bonding Curve: Price = basePrice + (tokensSold * priceIncrement)
 * Early buyers pay less, creating FOMO for early participation.
 */
contract GluedLaunch is GluedToolsERC20Base {

    /// @notice Platform treasury address
    address public immutable platformTreasury;

    /// @notice Uniswap V2 Router (Sepolia: 0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3)
    IUniswapV2Router02 public immutable uniswapRouter;

    /// @notice Percentage of tokens reserved for Uniswap liquidity (10%)
    uint256 public constant LIQUIDITY_PERCENT = 1e17; // 10% in PRECISION

    /// @notice Array of all launched tokens
    address[] public allTokens;

    /// @notice Token sale information
    struct TokenSale {
        address token;           // Token contract address
        address glue;            // Glue contract address (holds collateral)
        address creator;         // Token creator
        uint256 tokensForSale;   // Total tokens available for sale (90% of launchpad allocation)
        uint256 tokensSold;      // Tokens already sold
        uint256 tokensForLP;     // Tokens reserved for Uniswap LP (10% of launchpad allocation)
        uint256 basePrice;       // Starting price per token (in wei)
        uint256 priceIncrement;  // Price increase per token sold (in wei)
        uint256 launchTime;      // Block timestamp of launch
        bool saleActive;         // Whether sale is still active
        bool graduated;          // Whether token has graduated to Uniswap
        address uniswapPair;     // Uniswap pair address (after graduation)
        uint256 transferTaxBps;  // Transfer tax in basis points (0-1000)
        uint256 vestingDuration; // Creator vesting duration in seconds
    }

    /// @notice Token address => Sale info
    mapping(address => TokenSale) public sales;

    /// @notice Emitted when a new token is created
    event TokenCreated(
        address indexed token,
        address indexed glue,
        address indexed creator,
        string name,
        string symbol,
        uint256 totalSupply,
        uint256 tokensForSale,
        uint256 basePrice,
        uint256 priceIncrement,
        uint256 transferTaxBps,
        uint256 vestingDuration
    );

    /// @notice Emitted when tokens are purchased
    event TokensPurchased(
        address indexed token,
        address indexed buyer,
        uint256 ethSpent,
        uint256 tokensReceived,
        uint256 newTokensSold
    );

    /// @notice Emitted when a sale ends
    event SaleEnded(address indexed token, uint256 totalTokensSold, uint256 totalCollateral);

    /// @notice Emitted when token graduates to Uniswap
    event TokenGraduated(
        address indexed token,
        address indexed pair,
        uint256 tokenAmount,
        uint256 ethAmount,
        uint256 liquidity
    );

    /**
     * @notice Deploy the GluedLaunch factory
     * @param _platformTreasury Address to receive platform fees from token hooks
     * @param _uniswapRouter Uniswap V2 Router address (can be zero if not available)
     */
    constructor(address _platformTreasury, address _uniswapRouter) {
        require(_platformTreasury != address(0), "Invalid treasury");
        platformTreasury = _platformTreasury;
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
    }

    /**
     * @notice Create a new token with bonding curve sale, optional tax, and optional vesting
     * @param name Token name
     * @param symbol Token symbol (ticker)
     * @param totalSupply Total token supply (18 decimals)
     * @param creatorPercent Creator allocation (in PRECISION, e.g., 5e16 = 5%, max 20%)
     * @param basePrice Starting price per token in wei
     * @param priceIncrement Price increase per token sold in wei
     * @param transferTaxBps Transfer tax in basis points (0-1000, where 100 = 1%, max 10%)
     * @param vestingDuration Creator vesting duration in seconds (0 = no vesting)
     * @return token The deployed token address
     *
     * @dev Flow:
     * 1. Validate inputs
     * 2. Deploy GluedToken with tax and vesting params
     * 3. Store sale info with all parameters
     * 4. Emit event for frontend tracking
     */
    function createToken(
        string calldata name,
        string calldata symbol,
        uint256 totalSupply,
        uint256 creatorPercent,
        uint256 basePrice,
        uint256 priceIncrement,
        uint256 transferTaxBps,
        uint256 vestingDuration
    ) external nnrtnt returns (address token) {
        require(bytes(name).length > 0, "Empty name");
        require(bytes(symbol).length > 0, "Empty symbol");
        require(totalSupply > 0, "Zero supply");
        require(creatorPercent <= 2e17, "Creator % > 20%");
        require(basePrice > 0, "Zero base price");
        require(transferTaxBps <= 1000, "Tax > 10%");

        // Deploy new GluedToken with tax and vesting
        GluedToken newToken = new GluedToken(
            name,
            symbol,
            totalSupply,
            platformTreasury,
            msg.sender,         // creator
            creatorPercent,
            address(this),      // launchpad receives tokens for sale
            transferTaxBps,     // transfer tax
            vestingDuration     // creator vesting
        );

        token = address(newToken);
        address glue = newToken.glueAddress();

        // Calculate tokens for sale (total - creator allocation)
        uint256 creatorAllocation = _md512(totalSupply, creatorPercent, PRECISION);
        uint256 launchpadTokens = totalSupply - creatorAllocation;

        // Reserve 10% for Uniswap liquidity, 90% for bonding curve sale
        uint256 tokensForLP = _md512(launchpadTokens, LIQUIDITY_PERCENT, PRECISION);
        uint256 tokensForSale = launchpadTokens - tokensForLP;

        // Store sale info
        sales[token] = TokenSale({
            token: token,
            glue: glue,
            creator: msg.sender,
            tokensForSale: tokensForSale,
            tokensSold: 0,
            tokensForLP: tokensForLP,
            basePrice: basePrice,
            priceIncrement: priceIncrement,
            launchTime: block.timestamp,
            saleActive: true,
            graduated: false,
            uniswapPair: address(0),
            transferTaxBps: transferTaxBps,
            vestingDuration: vestingDuration
        });

        allTokens.push(token);

        emit TokenCreated(
            token,
            glue,
            msg.sender,
            name,
            symbol,
            totalSupply,
            tokensForSale,
            basePrice,
            priceIncrement,
            transferTaxBps,
            vestingDuration
        );
    }

    /**
     * @notice Buy tokens with ETH using bonding curve pricing
     * @param token Token address to buy
     * @param minTokens Minimum tokens to receive (slippage protection)
     *
     * @dev Bonding Curve Formula:
     * For N tokens starting from tokensSold:
     * totalCost = N * basePrice + priceIncrement * (tokensSold * N + N*(N-1)/2)
     *
     * KEY INNOVATION: ETH is sent directly to the Glue contract as collateral.
     * The creator NEVER touches buyer funds. This is the rug-proof mechanism.
     *
     * Note: Transfers from launchpad are excluded from transfer tax.
     */
    function buyTokens(address token, uint256 minTokens) external payable nnrtnt {
        TokenSale storage sale = sales[token];
        require(sale.token != address(0), "Token not found");
        require(sale.saleActive, "Sale ended");
        require(msg.value > 0, "No ETH sent");

        // Calculate how many tokens can be bought with the ETH sent
        (uint256 tokensToReceive, uint256 actualCost) = calculateTokensForETH(token, msg.value);
        require(tokensToReceive > 0, "Insufficient ETH");
        require(tokensToReceive >= minTokens, "Slippage exceeded");

        // Check if enough tokens available
        uint256 tokensAvailable = sale.tokensForSale - sale.tokensSold;
        if (tokensToReceive > tokensAvailable) {
            // Recalculate for remaining tokens
            tokensToReceive = tokensAvailable;
            actualCost = calculateETHForTokens(token, tokensToReceive);
        }

        // Update state BEFORE external calls (CEI pattern)
        sale.tokensSold += tokensToReceive;

        // Check if sale should end
        if (sale.tokensSold >= sale.tokensForSale) {
            sale.saleActive = false;
            emit SaleEnded(token, sale.tokensSold, address(sale.glue).balance);
        }

        // CRITICAL: Send ETH directly to Glue as collateral (rug-proof mechanism)
        // The Glue contract accepts ETH sent to it as collateral
        (bool success, ) = payable(sale.glue).call{value: actualCost}("");
        require(success, "Collateral transfer failed");

        // Transfer tokens to buyer (no tax - launchpad is excluded)
        IERC20(token).transfer(msg.sender, tokensToReceive);

        // Refund excess ETH if any
        uint256 excess = msg.value - actualCost;
        if (excess > 0) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: excess}("");
            require(refundSuccess, "Refund failed");
        }

        emit TokensPurchased(token, msg.sender, actualCost, tokensToReceive, sale.tokensSold);
    }

    /**
     * @notice Graduate a token to Uniswap V2 after sale ends
     * @param token Token address to graduate
     * @dev Anyone can call this with ETH to provide initial liquidity.
     * The caller receives LP tokens as reward for graduating the token.
     * After graduation, Uniswap pair is excluded from transfer tax for efficient trading.
     *
     * WHY: Creates real DEX liquidity so token can be traded freely.
     * The floor price (from Glue collateral) still applies - burning always works.
     */
    function graduateToUniswap(address token) external payable nnrtnt {
        TokenSale storage sale = sales[token];
        require(sale.token != address(0), "Token not found");
        require(address(uniswapRouter) != address(0), "Uniswap not configured");
        require(!sale.saleActive, "Sale still active");
        require(!sale.graduated, "Already graduated");
        require(msg.value > 0, "ETH required for LP");
        require(sale.tokensForLP > 0, "No LP tokens reserved");

        // Mark as graduated BEFORE external calls
        sale.graduated = true;

        uint256 tokenAmount = sale.tokensForLP;
        uint256 ethAmount = msg.value;

        // Approve router to spend tokens
        IERC20(token).approve(address(uniswapRouter), tokenAmount);

        // Add liquidity to Uniswap
        (uint256 amountToken, uint256 amountETH, uint256 liquidity) = uniswapRouter.addLiquidityETH{value: ethAmount}(
            token,
            tokenAmount,
            tokenAmount * 95 / 100,  // 5% slippage on tokens
            ethAmount * 95 / 100,     // 5% slippage on ETH
            msg.sender,               // LP tokens go to caller as reward
            block.timestamp + 300     // 5 minute deadline
        );

        // Get pair address
        address factory = uniswapRouter.factory();
        address weth = uniswapRouter.WETH();
        sale.uniswapPair = IUniswapV2Factory(factory).getPair(token, weth);

        // IMPORTANT: Exclude Uniswap pair from transfer tax for efficient trading
        // This ensures trading on Uniswap doesn't incur the burn tax
        GluedToken(payable(token)).setTaxExclusion(sale.uniswapPair, true);

        // Refund unused ETH
        uint256 ethRefund = ethAmount - amountETH;
        if (ethRefund > 0) {
            (bool success, ) = payable(msg.sender).call{value: ethRefund}("");
            require(success, "ETH refund failed");
        }

        // Refund unused tokens (shouldn't happen but just in case)
        uint256 tokenRefund = tokenAmount - amountToken;
        if (tokenRefund > 0) {
            IERC20(token).transfer(msg.sender, tokenRefund);
        }

        emit TokenGraduated(token, sale.uniswapPair, amountToken, amountETH, liquidity);
    }

    /**
     * @notice Calculate how many tokens can be bought with a given ETH amount
     * @param token Token address
     * @param ethAmount ETH amount in wei
     * @return tokens Number of tokens that can be purchased
     * @return cost Actual ETH cost for those tokens
     *
     * @dev Uses quadratic formula to solve:
     * ethAmount = tokens * basePrice + priceIncrement * (sold * tokens + tokens*(tokens-1)/2)
     */
    function calculateTokensForETH(address token, uint256 ethAmount)
        public view returns (uint256 tokens, uint256 cost)
    {
        TokenSale storage sale = sales[token];
        if (!sale.saleActive || ethAmount == 0) return (0, 0);

        uint256 basePrice = sale.basePrice;
        uint256 increment = sale.priceIncrement;
        uint256 sold = sale.tokensSold;
        uint256 available = sale.tokensForSale - sold;

        if (available == 0) return (0, 0);

        // Special case: no price increment (flat rate)
        if (increment == 0) {
            tokens = ethAmount / basePrice;
            if (tokens > available) tokens = available;
            cost = tokens * basePrice;
            return (tokens, cost);
        }

        // Quadratic formula: solve for tokens
        uint256 bTimesTwo = 2 * basePrice + increment * (2 * sold) - increment;
        uint256 discriminant = bTimesTwo * bTimesTwo + 8 * increment * ethAmount;
        uint256 sqrtDiscriminant = sqrt(discriminant);

        if (sqrtDiscriminant <= bTimesTwo) return (0, 0);

        tokens = (sqrtDiscriminant - bTimesTwo) / (2 * increment);

        // Cap at available tokens
        if (tokens > available) tokens = available;
        if (tokens == 0) return (0, 0);

        // Calculate actual cost for these tokens
        cost = calculateETHForTokens(token, tokens);

        return (tokens, cost);
    }

    /**
     * @notice Calculate ETH cost to buy a specific number of tokens
     * @param token Token address
     * @param tokenAmount Number of tokens to buy
     * @return cost ETH cost in wei
     */
    function calculateETHForTokens(address token, uint256 tokenAmount)
        public view returns (uint256 cost)
    {
        TokenSale storage sale = sales[token];
        if (tokenAmount == 0) return 0;

        uint256 basePrice = sale.basePrice;
        uint256 increment = sale.priceIncrement;
        uint256 sold = sale.tokensSold;

        // Part 1: N * basePrice
        uint256 baseCost = tokenAmount * basePrice;

        if (increment == 0) return baseCost;

        // Part 2: increment * N * (2*sold + N - 1) / 2
        uint256 incrementCost = _md512(
            increment * tokenAmount,
            2 * sold + tokenAmount - 1,
            2
        );

        cost = baseCost + incrementCost;
    }

    /**
     * @notice Get current price per token based on bonding curve
     * @param token Token address
     * @return price Current price in wei
     */
    function getCurrentPrice(address token) external view returns (uint256 price) {
        TokenSale storage sale = sales[token];
        return sale.basePrice + sale.priceIncrement * sale.tokensSold;
    }

    /// @notice Token info struct for getTokenInfo return
    struct TokenInfo {
        address glue;
        uint256 totalSupply;
        uint256 collateralBalance;
        uint256 floorPrice;
        uint256 currentPrice;
        uint256 tokensSold;
        uint256 tokensForSale;
        address creator;
        uint256 launchTime;
        bool saleActive;
        bool graduated;
        address uniswapPair;
        uint256 tokensForLP;
        uint256 transferTaxBps;
        uint256 vestingDuration;
    }

    /**
     * @notice Get comprehensive token info for frontend
     * @param token Token address
     * @return info TokenInfo struct with all token data
     */
    function getTokenInfo(address token) external view returns (TokenInfo memory info) {
        TokenSale storage sale = sales[token];
        require(sale.token != address(0), "Token not found");

        info.glue = sale.glue;
        info.totalSupply = IERC20(token).totalSupply();
        info.collateralBalance = address(sale.glue).balance;

        // Floor price = collateral / total supply (what you get per token when burning)
        if (info.totalSupply > 0) {
            info.floorPrice = _md512(info.collateralBalance, PRECISION, info.totalSupply);
        }

        // Current bonding curve price
        info.currentPrice = sale.basePrice + sale.priceIncrement * sale.tokensSold;

        info.tokensSold = sale.tokensSold;
        info.tokensForSale = sale.tokensForSale;
        info.creator = sale.creator;
        info.launchTime = sale.launchTime;
        info.saleActive = sale.saleActive;
        info.graduated = sale.graduated;
        info.uniswapPair = sale.uniswapPair;
        info.tokensForLP = sale.tokensForLP;
        info.transferTaxBps = sale.transferTaxBps;
        info.vestingDuration = sale.vestingDuration;
    }

    /**
     * @notice Get all launched tokens
     * @return Array of token addresses
     */
    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }

    /**
     * @notice Get number of launched tokens
     * @return count Number of tokens
     */
    function getTokenCount() external view returns (uint256 count) {
        return allTokens.length;
    }

    /**
     * @notice Integer square root using Newton's method
     * @param x The number to find square root of
     * @return y The floor of the square root
     */
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;

        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    /**
     * @notice Required to receive ETH refunds
     */
    receive() external payable override {}
}
