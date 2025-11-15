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
        uint8 currentTier;
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

    bytes32 public merkleRoot;
    bool public whitelistEnabled;

    uint256 public minContribution;
    uint256 private _maxContribution;

    mapping(address => uint256) public contributedUSDC;
    mapping(address => bool) public blacklist;

    address public treasury;
    bool public paused;
    uint64 public saleStart;
    uint64 public saleEnd;
    uint256 public totalRaised;

    event TierConfigured(uint256 indexed tierId, uint256 pricePerToken, uint256 tokenAmount);
    event StageAdvanced(uint256 indexed newTierId);
    event Purchased(address indexed buyer, uint256 usdcAmount, uint256 poiAmount, uint8 tier);
    event TGEPurchased(address indexed buyer, uint256 baseAmount, uint256 poiAmount);
    event Withdraw(address indexed to, uint256 amount);
    event TreasuryUpdated(address indexed newTreasury);
    event Paused(bool status);
    event SaleWindowUpdated(uint64 start, uint64 end);
    event WhitelistConfigUpdated(bool enabled, bytes32 root);
    event BlacklistUpdated(address indexed account, bool status);

    error SalePaused();
    error ZeroAddress();
    error InvalidTier();
    error InvalidProof();
    error AllocationExceeded();
    error Blacklisted();
    error SaleNotStarted();
    error SaleEnded();
    error InvalidSaleWindow();
    error WhitelistNotConfigured();

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
        require(prices.length <= type(uint8).max + 1, "Sale: too many tiers");

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
     * @param proof Merkle proof with the last element containing the encoded allocation cap.
     */
    function purchase(uint256 usdcAmount, bytes32[] calldata proof) public {
        if (paused) revert SalePaused();
        if (saleStart != 0 && block.timestamp < saleStart) revert SaleNotStarted();
        if (saleEnd != 0 && block.timestamp > saleEnd) revert SaleEnded();
        if (blacklist[msg.sender]) revert Blacklisted();
        require(usdcAmount > 0, "Sale: zero amount");
        require(currentTier < tiers.length, "Sale: no active tier");
        if (minContribution > 0) {
            require(usdcAmount >= minContribution, "Sale: below minimum");
        }
        if (_maxContribution > 0) {
            require(contributedUSDC[msg.sender] + usdcAmount <= _maxContribution, "Sale: above maximum");
        }

        if (whitelistEnabled) {
            if (merkleRoot == bytes32(0)) revert WhitelistNotConfigured();
            (uint256 allocation, bytes32[] memory merkleProof) = _extractAllocationAndProof(proof);
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

        emit Purchased(msg.sender, usdcAmount, poiAmount, uint8(currentTier));
        emit TGEPurchased(msg.sender, usdcAmount, poiAmount);

        if (tier.remainingTokens == 0 && currentTier + 1 < tiers.length) {
            currentTier += 1;
            emit StageAdvanced(currentTier);
        }
    }

    /**
     * @notice Convenience helper that forwards to {purchase} for AgentKit usage.
     */
    function buyWithBaseToken(uint256 usdcAmount, bytes32[] calldata proof) external {
        purchase(usdcAmount, proof);
    }

    /**
     * @notice Sets the minimum and maximum contribution per purchase.
     */
    function setContributionBounds(uint256 minAmount, uint256 maxAmount) external onlyOwner {
        require(maxAmount == 0 || maxAmount >= minAmount, "Sale: invalid bounds");
        minContribution = minAmount;
        _maxContribution = maxAmount;
    }

    /**
     * @notice Updates the sale pause status.
     */
    function setPaused(bool status) external onlyOwner {
        paused = status;
        emit Paused(status);
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
     * @notice Updates the whitelist configuration.
     */
    function setWhitelistConfig(bool enabled, bytes32 root) external onlyOwner {
        whitelistEnabled = enabled;
        merkleRoot = root;
        emit WhitelistConfigUpdated(enabled, root);
    }

    /**
     * @notice Adds or removes an address from the blacklist.
     */
    function setBlacklist(address account, bool status) external onlyOwner {
        blacklist[account] = status;
        emit BlacklistUpdated(account, status);
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
     * @notice Updates the allowed sale window.
     */
    function setSaleWindow(uint64 start, uint64 end) external onlyOwner {
        if (end != 0 && end <= start) revert InvalidSaleWindow();
        saleStart = start;
        saleEnd = end;
        emit SaleWindowUpdated(start, end);
    }

    /**
     * @notice Returns an aggregate view of the current sale configuration for a user.
     */
    function getSaleView(address user) external view returns (SaleView memory) {
        uint8 tierIndex = 0;
        uint256 tierPrice = 0;
        uint256 tierRemaining = 0;

        if (tiers.length != 0) {
            if (currentTier < tiers.length) {
                tierIndex = uint8(currentTier);
                Tier storage tier = tiers[currentTier];
                tierPrice = tier.pricePerToken;
                tierRemaining = tier.remainingTokens;
            } else {
                tierIndex = uint8(tiers.length - 1);
            }
        }

        return SaleView({
            currentTier: tierIndex,
            tierPrice: tierPrice,
            tierRemaining: tierRemaining,
            minContribution: minContribution,
            maxContribution: _maxContribution,
            userContributed: contributedUSDC[user]
        });
    }

    /**
     * @notice Returns the configured global max contribution.
     */
    function maxContribution() public view returns (uint256) {
        return _maxContribution;
    }

    /**
     * @notice Returns whether a purchase can succeed right now.
     */
    function isSaleActive() public view returns (bool) {
        if (paused) {
            return false;
        }
        if (saleStart != 0 && block.timestamp < saleStart) {
            return false;
        }
        if (saleEnd != 0 && block.timestamp > saleEnd) {
            return false;
        }
        if (currentTier >= tiers.length) {
            return false;
        }
        return true;
    }

    /**
     * @notice Returns the remaining allowable contribution for a user.
     */
    function maxContribution(address user) external view returns (uint256) {
        if (_maxContribution == 0) {
            return type(uint256).max;
        }
        uint256 contributed = contributedUSDC[user];
        if (contributed >= _maxContribution) {
            return 0;
        }
        return _maxContribution - contributed;
    }

    /**
     * @notice Returns the contributed USDC for a user.
     */
    function contributionOf(address user) external view returns (uint256) {
        return contributedUSDC[user];
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
            return (type(uint256).max, new bytes32[](0));
        }

        allocation = uint256(proof[proof.length - 1]);
        merkleProof = new bytes32[](proof.length - 1);
        for (uint256 i = 0; i < proof.length - 1; i++) {
            merkleProof[i] = proof[i];
        }
    }
}
