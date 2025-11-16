import { ethers } from "ethers";

/**
 * Build Merkle leaf (double hash) as used by MerkleAirdropDistributor
 * Leaf = keccak256(keccak256(abi.encode(index, account, amount)))
 */
export function buildLeaf(index: number, account: string, amount: string): string {
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["uint256", "address", "uint256"],
    [index, account, amount]
  );
  const firstHash = ethers.utils.keccak256(encoded);
  return ethers.utils.keccak256(ethers.utils.hexConcat([firstHash]));
}

/**
 * Build Merkle root from leaves (simple case: single leaf)
 * For production, use a proper MerkleTree library like merkletreejs
 */
export function buildRootFromLeaves(leaves: string[]): string {
  if (leaves.length === 0) {
    return ethers.utils.hexZeroPad("0x0", 32);
  }
  
  if (leaves.length === 1) {
    return leaves[0];
  }
  
  // Simple binary tree implementation
  let currentLevel = leaves;
  
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        // Pair exists
        const combined = ethers.utils.keccak256(
          ethers.utils.hexConcat([
            currentLevel[i] < currentLevel[i + 1]
              ? currentLevel[i]
              : currentLevel[i + 1],
            currentLevel[i] < currentLevel[i + 1]
              ? currentLevel[i + 1]
              : currentLevel[i],
          ])
        );
        nextLevel.push(combined);
      } else {
        // Odd one out
        nextLevel.push(currentLevel[i]);
      }
    }
    
    currentLevel = nextLevel;
  }
  
  return currentLevel[0];
}

/**
 * Generate Merkle proof for a given leaf (simplified)
 * Note: For production, use merkletreejs or similar library
 * This is a simplified version for MVP
 */
export function generateMerkleProof(
  leaves: string[],
  targetLeaf: string
): string[] {
  const leafIndex = leaves.indexOf(targetLeaf);
  if (leafIndex === -1) {
    throw new Error("Leaf not found in tree");
  }
  
  // Simplified proof generation
  // For production, implement proper Merkle tree traversal
  // This returns empty array for single leaf (which works with our contract)
  if (leaves.length === 1) {
    return [];
  }
  
  // TODO: Implement proper Merkle proof generation
  // For now, return empty array (works for simple single-leaf trees)
  return [];
}

/**
 * Format amount from POI units (stored as integer) to wei (18 decimals)
 */
export function formatAmountToWei(amount: number): string {
  return ethers.utils.parseUnits(amount.toString(), 18).toString();
}

/**
 * Format amount from wei to POI units
 */
export function formatAmountFromWei(amountWei: string): number {
  return parseFloat(ethers.utils.formatUnits(amountWei, 18));
}

