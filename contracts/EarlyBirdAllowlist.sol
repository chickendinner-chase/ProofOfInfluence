// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title EarlyBirdAllowlist
 * @notice Simple allowlist contract using a Merkle tree for verification.
 */
contract EarlyBirdAllowlist is Ownable {
    bytes32 public merkleRoot;

    event MerkleRootUpdated(bytes32 newRoot);

    constructor(address owner_) Ownable(owner_) {}

    /**
     * @notice Checks whether an account is eligible using a Merkle proof.
     * @param account Address being queried.
     * @param proof Merkle proof.
     */
    function isEligible(address account, bytes32[] calldata proof) public view returns (bool) {
        if (merkleRoot == bytes32(0)) {
            return false;
        }
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(account))));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

    /**
     * @notice Updates the Merkle root.
     */
    function setMerkleRoot(bytes32 root) external onlyOwner {
        merkleRoot = root;
        emit MerkleRootUpdated(root);
    }
}
