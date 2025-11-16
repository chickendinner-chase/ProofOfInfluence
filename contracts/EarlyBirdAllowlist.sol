// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title EarlyBirdAllowlist
 * @notice Manages a Merkle based allowlist with allocation tracking for trusted consumers such as the TGE sale.
 */
contract EarlyBirdAllowlist is Ownable {
    struct AllocationData {
        uint256 total;
        uint256 consumed;
        uint64 version;
    }

    bytes32 public merkleRoot;
    uint64 public rootVersion;

    mapping(address => bool) public trustedConsumers;
    mapping(address => AllocationData) private _allocations;

    event RootUpdated(bytes32 newRoot, uint64 version);
    event ConsumerUpdated(address indexed consumer, bool allowed);
    event Consumed(address indexed account, uint256 amount, uint256 remaining);

    error InvalidProof();
    error ExceedsAllocation();
    error NotAuthorized();

constructor(address owner_) Ownable(owner_) {}

    function setRoot(bytes32 root) external onlyOwner {
        require(root != bytes32(0), "Allowlist: empty root");
        merkleRoot = root;
        rootVersion += 1;
        emit RootUpdated(root, rootVersion);
    }

    function setTrustedConsumer(address consumer, bool allowed) external onlyOwner {
        trustedConsumers[consumer] = allowed;
        emit ConsumerUpdated(consumer, allowed);
    }

    function verify(address account, uint256 allocation, bytes32[] calldata proof) public view returns (bool) {
        if (merkleRoot == bytes32(0)) {
            return false;
        }
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(account, allocation))));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

    function remaining(address account) external view returns (uint256) {
        AllocationData memory data = _allocations[account];
        if (data.version != rootVersion || data.total == 0) {
            return 0;
        }
        return data.total - data.consumed;
    }

    function consume(
        address account,
        uint256 allocation,
        uint256 amount,
        bytes32[] calldata proof
    ) external onlyTrusted {
        if (!verify(account, allocation, proof)) revert InvalidProof();
        if (amount == 0) revert ExceedsAllocation();

        AllocationData storage data = _allocations[account];
        if (data.version != rootVersion) {
            data.total = 0;
            data.consumed = 0;
            data.version = rootVersion;
        }

        if (data.total == 0) {
            data.total = allocation;
        } else {
            require(data.total == allocation, "Allowlist: allocation mismatch");
        }

        if (data.consumed + amount > data.total) revert ExceedsAllocation();

        data.consumed += amount;
        emit Consumed(account, amount, data.total - data.consumed);
    }

    modifier onlyTrusted() {
        if (msg.sender != owner() && !trustedConsumers[msg.sender]) {
            revert NotAuthorized();
        }
        _;
    }
}
