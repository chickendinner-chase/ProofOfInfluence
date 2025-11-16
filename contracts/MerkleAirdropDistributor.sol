// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title MerkleAirdropDistributor
 * @notice Manages POI token airdrops using Merkle proofs with support for multiple rounds.
 */
contract MerkleAirdropDistributor is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public poiToken;
    address public treasury;
    uint64 public currentRound;

    mapping(uint64 => bytes32) private _roots;
    mapping(uint64 => mapping(uint256 => uint256)) private _claimedBitMap;

    event RootUpdated(uint64 indexed roundId, bytes32 newRoot);
    event Claimed(uint64 indexed roundId, uint256 indexed index, address indexed account, uint256 amount);
    event TokenUpdated(address indexed newToken);
    event TreasuryUpdated(address indexed newTreasury);
    event TokensRecovered(address indexed to, uint256 amount);

    error InvalidProof();
    error AlreadyClaimed();
    error ClaimClosed();
    error TokenNotSet();

    constructor(address owner_) Ownable(owner_) {}

    function setToken(address token) external onlyOwner {
        require(token != address(0), "Airdrop: zero token");
        poiToken = IERC20(token);
        emit TokenUpdated(token);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Airdrop: zero treasury");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    function setRoot(bytes32 root) external onlyOwner {
        require(root != bytes32(0), "Airdrop: empty root");
        currentRound += 1;
        _roots[currentRound] = root;
        emit RootUpdated(currentRound, root);
    }

    function updateRoot(uint64 roundId, bytes32 root) external onlyOwner {
        require(roundId > 0 && roundId <= currentRound, "Airdrop: invalid round");
        require(root != bytes32(0), "Airdrop: empty root");
        _roots[roundId] = root;
        emit RootUpdated(roundId, root);
    }

    function rootOf(uint64 roundId) external view returns (bytes32) {
        return _roots[roundId];
    }

    function isClaimed(uint64 roundId, uint256 index) public view returns (bool) {
        uint256 wordIndex = index / 256;
        uint256 bitIndex = index % 256;
        uint256 word = _claimedBitMap[roundId][wordIndex];
        uint256 mask = (1 << bitIndex);
        return word & mask == mask;
    }

    function claim(uint256 index, address account, uint256 amount, bytes32[] calldata merkleProof) external {
        claimFromRound(currentRound, index, account, amount, merkleProof);
    }

    function claimFromRound(
        uint64 roundId,
        uint256 index,
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) public whenNotPaused nonReentrant {
        if (address(poiToken) == address(0)) revert TokenNotSet();
        bytes32 root = _roots[roundId];
        if (root == bytes32(0)) revert ClaimClosed();
        if (isClaimed(roundId, index)) revert AlreadyClaimed();

        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(index, account, amount))));
        bool valid = MerkleProof.verify(merkleProof, root, leaf);
        if (!valid) revert InvalidProof();

        _setClaimed(roundId, index);
        poiToken.safeTransfer(account, amount);

        emit Claimed(roundId, index, account, amount);
    }

    function withdrawRemaining(uint256 amount) external onlyOwner {
        address to = treasury;
        require(to != address(0), "Airdrop: treasury zero");
        poiToken.safeTransfer(to, amount);
        emit TokensRecovered(to, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _setClaimed(uint64 roundId, uint256 index) internal {
        uint256 wordIndex = index / 256;
        uint256 bitIndex = index % 256;
        _claimedBitMap[roundId][wordIndex] |= (1 << bitIndex);
    }
}
