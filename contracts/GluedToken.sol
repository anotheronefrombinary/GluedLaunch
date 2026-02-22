// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@glue-finance/expansions-pack/contracts/base/StickyAsset.sol";

/**
 * @title GluedToken
 * @notice ERC20 token with Glue Protocol integration, transfer tax, and creator vesting
 * @dev Each token launched through GluedLaunch is a GluedToken instance
 *
 * Key Features:
 * - Inherits from StickyAsset for native Glue Protocol integration
 * - Auto-creates Glue contract on deployment
 * - 2% collateral hook fee on unglue goes to platform treasury
 * - Optional transfer tax (0-10%) that burns tokens to increase floor price
 * - Optional creator vesting with linear unlock
 * - Creator receives a percentage of tokens at launch
 * - Remaining tokens go to launchpad for sale
 */
contract GluedToken is ERC20, StickyAsset {

    /// @notice Platform treasury address that receives 2% hook fee
    address public immutable platformTreasury;

    /// @notice Creator address (for vesting enforcement)
    address public immutable creator;

    /// @notice Launchpad contract address (can set tax exclusions)
    address public immutable launchpad;

    /// @notice Platform hook fee: 2% = 2e16 (in PRECISION units where 1e18 = 100%)
    uint256 public constant PLATFORM_HOOK_FEE = 2e16;

    // ============ Transfer Tax ============

    /// @notice Transfer tax in basis points (100 = 1%, max 1000 = 10%)
    uint256 public immutable transferTaxBps;

    /// @notice Addresses excluded from transfer tax (launchpad, Uniswap pair, etc.)
    mapping(address => bool) public isExcludedFromTax;

    // ============ Creator Vesting ============

    /// @notice Creator's initial token allocation (for vesting tracking)
    uint256 public immutable creatorInitialAllocation;

    /// @notice Timestamp when vesting started (deployment time)
    uint256 public immutable vestingStart;

    /// @notice Vesting duration in seconds (0 = no vesting)
    uint256 public immutable vestingDuration;

    // ============ Events ============

    /// @notice Emitted when the token is created
    event TokenCreated(
        address indexed token,
        address indexed glue,
        address indexed creator,
        string name,
        string symbol,
        uint256 totalSupply,
        uint256 creatorAllocation,
        uint256 transferTaxBps,
        uint256 vestingDuration
    );

    /// @notice Emitted when tokens are burned as transfer tax
    event TransferTaxBurned(address indexed from, address indexed to, uint256 amount);

    /// @notice Emitted when an address is excluded/included from transfer tax
    event TaxExclusionSet(address indexed account, bool excluded);

    /**
     * @notice Creates a new GluedToken with optional tax and vesting
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _totalSupply Total token supply (in wei, 18 decimals)
     * @param _platformTreasury Address to receive platform hook fees
     * @param _creator Token creator address
     * @param _creatorPercent Percentage of tokens for creator (in PRECISION units, e.g., 5e16 = 5%)
     * @param _launchpad Launchpad contract address to receive remaining tokens
     * @param _transferTaxBps Transfer tax in basis points (0-1000, where 100 = 1%)
     * @param _vestingDuration Vesting duration in seconds (0 = no vesting)
     *
     * @dev Constructor flow:
     * 1. Initialize ERC20 with name and symbol
     * 2. Initialize StickyAsset with empty URI and [fungible=true, hooks=true]
     * 3. Store immutable addresses and parameters
     * 4. Mint total supply to this contract
     * 5. Transfer creator allocation to creator
     * 6. Transfer remaining tokens to launchpad for sale
     */
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
        ERC20(_name, _symbol)
        StickyAsset("", [true, true]) // fungible=true, hooks=true
    {
        require(_platformTreasury != address(0), "Invalid treasury");
        require(_creator != address(0), "Invalid creator");
        require(_launchpad != address(0), "Invalid launchpad");
        require(_creatorPercent <= 2e17, "Creator % too high"); // Max 20%
        require(_totalSupply > 0, "Zero supply");
        require(_transferTaxBps <= 1000, "Tax > 10%"); // Max 10%

        platformTreasury = _platformTreasury;
        creator = _creator;
        launchpad = _launchpad;
        transferTaxBps = _transferTaxBps;
        vestingDuration = _vestingDuration;
        vestingStart = block.timestamp;

        // Exclude launchpad from tax (for bonding curve sales and graduation)
        isExcludedFromTax[_launchpad] = true;

        // Mint total supply to this contract first
        _mint(address(this), _totalSupply);

        // Calculate and transfer creator allocation
        uint256 _creatorAllocation = _md512(_totalSupply, _creatorPercent, PRECISION);

        // Store for vesting tracking (must set before transfers)
        // Note: We use a local variable and set the immutable in assembly
        // Actually, immutables must be set directly, so we calculate first

        if (_creatorAllocation > 0) {
            _transfer(address(this), _creator, _creatorAllocation);
        }

        // Store creator allocation for vesting
        creatorInitialAllocation = _creatorAllocation;

        // Transfer remaining tokens to launchpad for sale
        uint256 launchpadAllocation = _totalSupply - _creatorAllocation;
        if (launchpadAllocation > 0) {
            _transfer(address(this), _launchpad, launchpadAllocation);
        }

        emit TokenCreated(
            address(this),
            GLUE,
            _creator,
            _name,
            _symbol,
            _totalSupply,
            _creatorAllocation,
            _transferTaxBps,
            _vestingDuration
        );
    }

    // ============ Transfer Tax & Vesting Logic ============

    /**
     * @notice Override ERC20 _update to apply transfer tax and vesting checks
     * @dev Called by transfer, transferFrom, mint, and burn
     * @param from Source address (address(0) for mint)
     * @param to Destination address (address(0) for burn)
     * @param amount Amount being transferred
     *
     * Tax Logic:
     * - No tax on mint (from == address(0))
     * - No tax on burn (to == address(0))
     * - No tax if sender or receiver is excluded
     * - Otherwise, burn transferTaxBps basis points of the transfer
     *
     * Vesting Logic:
     * - If sender is creator and vesting is active, ensure they keep locked tokens
     */
    function _update(address from, address to, uint256 amount) internal virtual override {
        // Vesting check: creator cannot transfer locked tokens
        if (from == creator && vestingDuration > 0) {
            uint256 locked = creatorLockedAmount();
            uint256 balance = balanceOf(from);
            require(balance - amount >= locked, "Tokens still vesting");
        }

        // No tax on mint or burn operations
        if (from == address(0) || to == address(0)) {
            super._update(from, to, amount);
            return;
        }

        // No tax if sender or receiver is excluded
        if (isExcludedFromTax[from] || isExcludedFromTax[to]) {
            super._update(from, to, amount);
            return;
        }

        // Apply transfer tax (burn tokens to increase floor price)
        if (transferTaxBps > 0) {
            uint256 taxAmount = (amount * transferTaxBps) / 10000;
            uint256 netAmount = amount - taxAmount;

            // Burn the tax portion (send to address(0))
            if (taxAmount > 0) {
                super._update(from, address(0), taxAmount);
                emit TransferTaxBurned(from, to, taxAmount);
            }

            // Transfer the net amount
            super._update(from, to, netAmount);
        } else {
            super._update(from, to, amount);
        }
    }

    // ============ Tax Exclusion Management ============

    /**
     * @notice Set tax exclusion status for an address
     * @param account Address to set exclusion for
     * @param excluded Whether the address should be excluded from tax
     * @dev Only callable by launchpad (for excluding Uniswap pair after graduation)
     *
     * Security: Only launchpad can call this to prevent abuse
     * Use case: Exclude Uniswap pair after graduation for efficient trading
     */
    function setTaxExclusion(address account, bool excluded) external {
        require(msg.sender == launchpad, "Only launchpad");
        isExcludedFromTax[account] = excluded;
        emit TaxExclusionSet(account, excluded);
    }

    // ============ Vesting View Functions ============

    /**
     * @notice Get amount of creator tokens still locked
     * @return Amount of tokens locked (cannot be transferred by creator)
     *
     * Linear vesting: unlocks proportionally over vestingDuration
     * If vestingDuration is 0 or fully elapsed, returns 0
     */
    function creatorLockedAmount() public view returns (uint256) {
        if (vestingDuration == 0) return 0;
        if (block.timestamp >= vestingStart + vestingDuration) return 0;

        uint256 elapsed = block.timestamp - vestingStart;
        uint256 unlocked = (creatorInitialAllocation * elapsed) / vestingDuration;
        return creatorInitialAllocation - unlocked;
    }

    /**
     * @notice Get amount of creator tokens unlocked (available to transfer)
     * @return Amount of tokens unlocked from initial allocation
     */
    function creatorUnlockedAmount() public view returns (uint256) {
        return creatorInitialAllocation - creatorLockedAmount();
    }

    /**
     * @notice Get comprehensive vesting information for frontend
     * @return totalAllocation Creator's initial token allocation
     * @return locked Tokens currently locked
     * @return unlocked Tokens currently unlocked
     * @return vestingEndTime Timestamp when vesting completes
     * @return fullyVested Whether all tokens are vested
     */
    function getVestingInfo() external view returns (
        uint256 totalAllocation,
        uint256 locked,
        uint256 unlocked,
        uint256 vestingEndTime,
        bool fullyVested
    ) {
        totalAllocation = creatorInitialAllocation;
        locked = creatorLockedAmount();
        unlocked = creatorUnlockedAmount();
        vestingEndTime = vestingStart + vestingDuration;
        fullyVested = block.timestamp >= vestingEndTime || vestingDuration == 0;
    }

    // ============ Glue Protocol Hooks ============

    /**
     * @notice Calculate the collateral hook size (2% platform fee)
     * @dev Called by Glue during unglue to determine fee amount
     * @param amount The collateral amount being withdrawn
     * @return size The hook fee amount (2% of amount)
     *
     * Why: Platform takes 2% of all collateral withdrawn during unglue
     * This creates sustainable revenue for the platform
     */
    function _calculateCollateralHookSize(
        address, // asset - unused, same fee for all collaterals
        uint256 amount
    ) internal pure override returns (uint256 size) {
        return _md512(amount, PLATFORM_HOOK_FEE, PRECISION);
    }

    /**
     * @notice Process the collateral hook by sending fee to treasury
     * @dev Called by Glue after calculating hook size
     * @param asset The collateral token address (address(0) for ETH)
     * @param hookAmount The fee amount to send to treasury
     * @param isETH Whether the collateral is ETH
     *
     * Security: Only callable by the GLUE contract (enforced by StickyAsset)
     *
     * Why: Routes the 2% platform fee to the treasury address
     * Handles both ETH and ERC20 collaterals safely
     */
    function _processCollateralHook(
        address asset,
        uint256 hookAmount,
        bool isETH,
        address // recipient - unused
    ) internal override {
        if (isETH) {
            // For ETH: use low-level call with value
            (bool success, ) = payable(platformTreasury).call{value: hookAmount}("");
            require(success, "ETH transfer failed");
        } else {
            // For ERC20: use Glue's safe transfer helper
            _transferAsset(asset, platformTreasury, hookAmount, new uint256[](0), true);
        }
    }

    // ============ View Functions ============

    /**
     * @notice Get the Glue contract address for this token
     * @return The Glue contract address
     */
    function glueAddress() external view returns (address) {
        return GLUE;
    }

    /**
     * @notice Required to receive ETH for hook processing
     */
    receive() external payable {}
}
