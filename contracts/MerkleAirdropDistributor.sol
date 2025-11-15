// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title MerkleAirdropDistributor
 * @notice Distributes POI tokens via merkle proofs and supports multiple rounds.
 */
contract MerkleAirdropDistributor is Ownable, Pausable {
    using SafeERC20 for IERC20;

    struct Round {
        bytes32 merkleRoot;
        uint64 startTime;
        uint64 endTime;
        bool allowMultipleClaims;
        bool configured;
    }

    IERC20 public immutable token;

    mapping(uint256 => Round) private _rounds;
    mapping(uint256 => mapping(uint256 => uint256)) private _claimedBitMap;
    mapping(uint256 => mapping(address => bool)) private _addressClaimed;

    uint256 public currentRoundId;

    event RoundConfigured(uint256 indexed roundId, bytes32 merkleRoot, uint64 startTime, uint64 endTime, bool allowMultipleClaims);
    event RoundActivated(uint256 indexed roundId);
    event AirdropClaimed(uint256 indexed roundId, uint256 indexed index, address account, uint256 amount);
    event TokensRecovered(address indexed to, uint256 amount);

    error RoundNotConfigured();
    error AlreadyClaimed();
    error InvalidProof();
    error ClaimNotOpen();

    constructor(address tokenAddress, address owner_) Ownable(owner_) {
        require(tokenAddress != address(0) && owner_ != address(0), "Airdrop: zero address");
        token = IERC20(tokenAddress);
    }

    /**
     * @notice Configures airdrop parameters for a round.
     */
    function configureRound(
        uint256 roundId,
        bytes32 root,
        uint64 startTime,
        uint64 endTime,
        bool allowMultiple
    ) external onlyOwner {
        require(endTime == 0 || endTime > startTime, "Airdrop: invalid window");

        _rounds[roundId] = Round({
            merkleRoot: root,
            startTime: startTime,
            endTime: endTime,
            allowMultipleClaims: allowMultiple,
            configured: true
        });

        emit RoundConfigured(roundId, root, startTime, endTime, allowMultiple);
    }

    /**
     * @notice Updates the merkle root for an existing round.
     */
    function setMerkleRoot(bytes32 root, uint256 roundId) external onlyOwner {
        Round storage round = _rounds[roundId];
        if (!round.configured) revert RoundNotConfigured();
        round.merkleRoot = root;
        emit RoundConfigured(roundId, root, round.startTime, round.endTime, round.allowMultipleClaims);
    }

    /**
     * @notice Activates a configured round.
     */
    function activateRound(uint256 roundId) external onlyOwner {
        if (!_rounds[roundId].configured) revert RoundNotConfigured();
        currentRoundId = roundId;
        emit RoundActivated(roundId);
    }

    /**
     * @notice Checks whether an index has been claimed in the active round.
     */
    function isClaimed(uint256 index) public view returns (bool) {
        return _isClaimed(currentRoundId, index);
    }

    /**
     * @notice Checks whether an index has been claimed in a specific round.
     */
    function isClaimed(uint256 roundId, uint256 index) public view returns (bool) {
        return _isClaimed(roundId, index);
    }

    /**
     * @notice Claims tokens from the active round.
     */
    function claim(uint256 index, address account, uint256 amount, bytes32[] calldata proof) external whenNotPaused {
        Round storage round = _rounds[currentRoundId];
        if (!round.configured) revert RoundNotConfigured();
        if (!_isClaimPeriodOpen(round)) revert ClaimNotOpen();
        if (!round.allowMultipleClaims) {
            if (_addressClaimed[currentRoundId][account]) revert AlreadyClaimed();
            _addressClaimed[currentRoundId][account] = true;
        }
        if (_isClaimed(currentRoundId, index)) revert AlreadyClaimed();

        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(index, account, amount))));
        bool valid = MerkleProof.verify(proof, round.merkleRoot, leaf);
        if (!valid) revert InvalidProof();

        _setClaimed(currentRoundId, index);
        token.safeTransfer(account, amount);

        emit AirdropClaimed(currentRoundId, index, account, amount);
    }

    /**
     * @notice Allows the owner to recover remaining tokens.
     */
    function withdrawRemaining(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Airdrop: zero address");
        token.safeTransfer(to, amount);
        emit TokensRecovered(to, amount);
    }

    /**
     * @notice Pauses claiming.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpauses claiming.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    function _isClaimed(uint256 roundId, uint256 index) internal view returns (bool) {
        uint256 wordIndex = index / 256;
        uint256 bitIndex = index % 256;
        uint256 word = _claimedBitMap[roundId][wordIndex];
        uint256 mask = (1 << bitIndex);
        return word & mask == mask;
    }

    function _setClaimed(uint256 roundId, uint256 index) internal {
        uint256 wordIndex = index / 256;
        uint256 bitIndex = index % 256;
        _claimedBitMap[roundId][wordIndex] |= (1 << bitIndex);
    }

    function _isClaimPeriodOpen(Round memory round) internal view returns (bool) {
        if (round.startTime != 0 && block.timestamp < round.startTime) {
            return false;
        }
        if (round.endTime != 0 && block.timestamp > round.endTime) {
            return false;
        }
        return true;
    }
}
