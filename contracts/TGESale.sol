// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title TGESale
 * @notice Token Generation Event sale contract that accepts USDC contributions in exchange for POI tokens.
 */
contract TGESale is Ownable {
    using SafeERC20 for IERC20;

    struct Tier {
        uint256 pricePerToken; // USDC (6 decimals) required per 1 POI token (18 decimals)
        uint256 remainingTokens; // Remaining POI tokens for this tier (18 decimals)
    }

    struct SaleView {
        uint256 currentTier;
        uint256 tierPrice;
        uint256 tierRemaining;
        uint256 minContribution;
        uint256 maxContribution;
        uint256 userContributed;
    }

    IERC20 public immutable poiToken;
    IERC20 public immutable usdcToken;

    Tier[] public tiers;
    uint256 public currentTier;

    bool public whitelistEnabled;
    bytes32 public merkleRoot;

    uint256 public minContribution;
    uint256 public maxContribution;

    uint256 public startTime;
    uint256 public endTime;

    mapping(address => uint256) public contributedUSDC;
    mapping(address => bool) public blacklist;

    address public treasury;
    bool public paused;
    uint256 public totalRaised;

    event TierConfigured(uint256 indexed tierId, uint256 pricePerToken, uint256 tokenAmount);
    event StageAdvanced(uint256 indexed newTierId);
    event Purchased(address indexed buyer, uint256 indexed tierId, uint256 usdcAmount, uint256 poiAmount);
    event Withdraw(address indexed to, uint256 amount);
    event TreasuryUpdated(address indexed newTreasury);
    event Paused(bool status);
    event WhitelistConfigUpdated(bool enabled, bytes32 root);
    event BlacklistUpdated(address indexed account, bool status);
    event SaleWindowUpdated(uint256 startTime, uint256 endTime);
    event TierUpdated(uint256 indexed tierId, uint256 pricePerToken, uint256 remainingTokens);

    error SalePaused();
    error SaleNotStarted();
    error SaleEnded();
    error ZeroAddress();
    error InvalidTier();
    error InvalidProof();
    error AllocationExceeded();
    error Blacklisted();
    error InvalidWhitelistConfig();

    constructor(address poi, address usdc, address owner_, address treasury_) Ownable(owner_) {
        if (poi == address(0) || usdc == address(0) || treasury_ == address(0)) revert ZeroAddress();
        poiToken = IERC20(poi);
        usdcToken = IERC20(usdc);
        treasury = treasury_;
    }

    /**
     * @notice Configures sale tiers.
     * @param prices Array of USDC prices per POI token (6 decimals).
     * @param supplies Array of POI token allocations per tier (18 decimals).
     */
    function configureTiers(uint256[] calldata prices, uint256[] calldata supplies) external onlyOwner {
        require(prices.length == supplies.length && prices.length > 0, "Sale: invalid tier config");

        delete tiers;
        for (uint256 i = 0; i < prices.length; i++) {
            require(prices[i] > 0 && supplies[i] > 0, "Sale: invalid tier");
            tiers.push(Tier({pricePerToken: prices[i], remainingTokens: supplies[i]}));
            emit TierConfigured(i, prices[i], supplies[i]);
        }
        currentTier = 0;
    }

    /**
     * @notice Purchases POI tokens using USDC.
     * @param usdcAmount Amount of USDC (6 decimals) contributed.
     * @param proof Merkle proof (with final element encoding the allocation cap) when whitelist is enabled.
     */
    function purchase(uint256 usdcAmount, bytes32[] calldata proof) external {
        if (paused) revert SalePaused();
        if (startTime != 0 && block.timestamp < startTime) revert SaleNotStarted();
        if (endTime != 0 && block.timestamp > endTime) revert SaleEnded();
        if (blacklist[msg.sender]) revert Blacklisted();
        require(usdcAmount > 0, "Sale: zero amount");
        require(currentTier < tiers.length, "Sale: no active tier");
        if (minContribution > 0) {
            require(usdcAmount >= minContribution, "Sale: below minimum");
        }
        if (maxContribution > 0) {
            require(usdcAmount <= maxContribution, "Sale: above maximum");
        }

        uint256 allocation = type(uint256).max;
        bytes32[] memory merkleProof;
        if (whitelistEnabled) {
            (allocation, merkleProof) = _extractAllocationAndProof(proof);
            bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, allocation))));
            bool valid = MerkleProof.verify(merkleProof, merkleRoot, leaf);
            if (!valid) revert InvalidProof();
            if (contributedUSDC[msg.sender] + usdcAmount > allocation) revert AllocationExceeded();
        }

        Tier storage tier = tiers[currentTier];
        if (tier.pricePerToken == 0) revert InvalidTier();

        uint256 poiAmount = _tokensForContribution(usdcAmount, tier.pricePerToken);
        require(poiAmount > 0, "Sale: zero POI");
        require(poiAmount <= tier.remainingTokens, "Sale: tier sold out");

        contributedUSDC[msg.sender] += usdcAmount;
        tier.remainingTokens -= poiAmount;
        totalRaised += usdcAmount;

        usdcToken.safeTransferFrom(msg.sender, address(this), usdcAmount);
        poiToken.safeTransfer(msg.sender, poiAmount);

        emit Purchased(msg.sender, currentTier, usdcAmount, poiAmount);

        if (tier.remainingTokens == 0 && currentTier + 1 < tiers.length) {
            currentTier += 1;
            emit StageAdvanced(currentTier);
        }
    }

    /**
     * @notice Sets the minimum and maximum contribution per purchase.
     */
    function setContributionBounds(uint256 minAmount, uint256 maxAmount) external onlyOwner {
        require(maxAmount == 0 || maxAmount >= minAmount, "Sale: invalid bounds");
        minContribution = minAmount;
        maxContribution = maxAmount;
    }

    /**
     * @notice Updates the whitelist configuration.
     */
    function setWhitelistConfig(bool enabled, bytes32 root) external onlyOwner {
        if (enabled && root == bytes32(0)) revert InvalidWhitelistConfig();
        whitelistEnabled = enabled;
        merkleRoot = root;
        emit WhitelistConfigUpdated(enabled, root);
    }

    /**
     * @notice Updates the sale pause status.
     */
    function setPaused(bool status) external onlyOwner {
        paused = status;
        emit Paused(status);
    }

    /**
     * @notice Updates the sale window timestamps.
     */
    function setSaleWindow(uint256 startTimestamp, uint256 endTimestamp) external onlyOwner {
        require(endTimestamp == 0 || endTimestamp >= startTimestamp, "Sale: invalid window");
        startTime = startTimestamp;
        endTime = endTimestamp;
        emit SaleWindowUpdated(startTimestamp, endTimestamp);
    }

    /**
     * @notice Updates the treasury address.
     */
    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    /**
     * @notice Updates the whitelist Merkle root.
     */
    /**
     * @notice Adds or removes an address from the blacklist.
     */
    function setBlacklist(address account, bool status) external onlyOwner {
        blacklist[account] = status;
        emit BlacklistUpdated(account, status);
    }

    /**
     * @notice Updates an existing tier's price and remaining allocation.
     */
    function updateTier(uint256 tierId, uint256 pricePerToken, uint256 remainingTokens) external onlyOwner {
        require(tierId < tiers.length, "Sale: invalid tier");
        require(pricePerToken > 0, "Sale: invalid price");
        Tier storage tier = tiers[tierId];
        tier.pricePerToken = pricePerToken;
        tier.remainingTokens = remainingTokens;
        emit TierUpdated(tierId, pricePerToken, remainingTokens);
    }

    /**
     * @notice Withdraws collected USDC to the treasury.
     */
    function withdraw() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        usdcToken.safeTransfer(treasury, balance);
        emit Withdraw(treasury, balance);
    }

    /**
     * @notice Withdraws remaining POI tokens.
     */
    function withdrawPOI(uint256 amount) external onlyOwner {
        poiToken.safeTransfer(treasury, amount);
    }

    /**
     * @notice Returns the number of configured tiers.
     */
    function tierCount() external view returns (uint256) {
        return tiers.length;
    }

    /**
     * @notice Returns a consolidated view of the sale and a user's contribution.
     */
    function getSaleView(address user) external view returns (SaleView memory) {
        Tier memory tier;
        if (tiers.length > currentTier) {
            tier = tiers[currentTier];
        } else {
            tier = Tier({pricePerToken: 0, remainingTokens: 0});
        }
        return
            SaleView({
                currentTier: currentTier,
                tierPrice: tier.pricePerToken,
                tierRemaining: tier.remainingTokens,
                minContribution: minContribution,
                maxContribution: maxContribution,
                userContributed: contributedUSDC[user]
            });
    }

    function _tokensForContribution(uint256 usdcAmount, uint256 pricePerToken) private pure returns (uint256) {
        // pricePerToken is denominated in 6 decimals, POI has 18 decimals
        return (usdcAmount * 1e12) / pricePerToken;
    }

    function _extractAllocationAndProof(bytes32[] calldata proof)
        private
        pure
        returns (uint256 allocation, bytes32[] memory merkleProof)
    {
        if (proof.length == 0) {
            revert InvalidProof();
        }

        allocation = uint256(proof[proof.length - 1]);
        merkleProof = new bytes32[](proof.length - 1);
        for (uint256 i = 0; i < proof.length - 1; i++) {
            merkleProof[i] = proof[i];
        }
    }
}
