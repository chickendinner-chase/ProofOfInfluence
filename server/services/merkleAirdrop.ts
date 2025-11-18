import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";

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
 * Build MerkleTree from leaves using merkletreejs
 * Supports MerkleAirdropDistributor format only
 */
export function buildMerkleTree(leaves: string[]): MerkleTree {
  if (leaves.length === 0) {
    throw new Error("Cannot build Merkle tree from empty leaves array");
  }

  // merkletreejs uses keccak256 by default, which matches our double-hashed leaves
  // Create tree with sorted leaves (OpenZeppelin MerkleProof standard)
  return new MerkleTree(leaves, ethers.utils.keccak256, { sortPairs: true });
}

/**
 * Generate Merkle proof for a given leaf using merkletreejs
 */
export function generateMerkleProof(
  tree: MerkleTree,
  leaf: string
): string[] {
  const proof = tree.getProof(leaf);
  // Convert Buffer[] to string[]
  return proof.map((p) => "0x" + p.data.toString("hex"));
}

/**
 * Verify Merkle proof against root using merkletreejs
 */
export function verifyMerkleProof(
  tree: MerkleTree,
  leaf: string,
  proof: string[]
): boolean {
  // Convert string[] proof back to Buffer[]
  const proofBuffers = proof.map((p) => Buffer.from(p.slice(2), "hex"));
  return tree.verify(proofBuffers, leaf, tree.getRoot());
}

/**
 * Build MerkleTree from airdrop eligibility records
 * Each record becomes a leaf using buildLeaf(index, walletAddress, amountWei)
 */
export function buildMerkleTreeFromEligibilities(
  eligibilities: Array<{ walletAddress: string; amount: number }>
): { tree: MerkleTree; root: string; leaves: string[] } {
  if (eligibilities.length === 0) {
    throw new Error("Cannot build tree from empty eligibilities");
  }

  const leaves: string[] = [];
  
  for (let i = 0; i < eligibilities.length; i++) {
    const eligibility = eligibilities[i];
    const amountWei = formatAmountToWei(eligibility.amount);
    const leaf = buildLeaf(i, eligibility.walletAddress, amountWei);
    leaves.push(leaf);
  }

  const tree = buildMerkleTree(leaves);
  const root = "0x" + tree.getRoot().toString("hex");

  return { tree, root, leaves };
}

/**
 * Generate Merkle proofs for all eligibilities in a batch
 */
export function generateProofsForBatch(
  tree: MerkleTree,
  eligibilities: Array<{ walletAddress: string; amount: number }>
): Array<{ index: number; proof: string[]; amountWei: string }> {
  const results: Array<{ index: number; proof: string[]; amountWei: string }> = [];

  for (let i = 0; i < eligibilities.length; i++) {
    const eligibility = eligibilities[i];
    const amountWei = formatAmountToWei(eligibility.amount);
    const leaf = buildLeaf(i, eligibility.walletAddress, amountWei);
    const proof = generateMerkleProof(tree, leaf);

    results.push({
      index: i,
      proof,
      amountWei,
    });
  }

  return results;
}

/**
 * Validate that tree root matches expected root
 */
export function validateRoot(tree: MerkleTree, expectedRoot: string): boolean {
  const actualRoot = "0x" + tree.getRoot().toString("hex");
  return actualRoot.toLowerCase() === expectedRoot.toLowerCase();
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

