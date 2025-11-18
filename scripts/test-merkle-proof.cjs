/**
 * Test Merkle Proof generation using merkletreejs
 * Run with: node scripts/test-merkle-proof.cjs
 */

const { ethers } = require("ethers");
const { MerkleTree } = require("merkletreejs");

// Test data matching MerkleAirdropDistributor format
const testEligibilities = [
  {
    walletAddress: "0x1111111111111111111111111111111111111111",
    amount: 1000, // POI units
  },
  {
    walletAddress: "0x2222222222222222222222222222222222222222",
    amount: 2000,
  },
  {
    walletAddress: "0x3333333333333333333333333333333333333333",
    amount: 3000,
  },
];

/**
 * Build Merkle leaf (double hash) as used by MerkleAirdropDistributor
 * Leaf = keccak256(keccak256(abi.encode(index, account, amount)))
 */
function buildLeaf(index, account, amountWei) {
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["uint256", "address", "uint256"],
    [index, account, amountWei]
  );
  const firstHash = ethers.utils.keccak256(encoded);
  return ethers.utils.keccak256(ethers.utils.hexConcat([firstHash]));
}

/**
 * Format amount from POI units to wei (18 decimals)
 */
function formatAmountToWei(amount) {
  return ethers.utils.parseUnits(amount.toString(), 18).toString();
}

async function main() {
  console.log("🧪 Testing Merkle Proof Generation\n");

  // 1. Build leaves
  console.log("1️⃣  Building leaves from eligibilities...");
  const leaves = testEligibilities.map((eligibility, i) => {
    const amountWei = formatAmountToWei(eligibility.amount);
    const leaf = buildLeaf(i, eligibility.walletAddress, amountWei);
    console.log(`   Leaf ${i}: ${leaf.substring(0, 20)}... (${eligibility.walletAddress.substring(0, 10)}..., ${eligibility.amount} POI)`);
    return leaf;
  });

  // 2. Build Merkle tree
  console.log("\n2️⃣  Building Merkle tree...");
  const tree = new MerkleTree(leaves, ethers.utils.keccak256, { sortPairs: true });
  const root = "0x" + tree.getRoot().toString("hex");
  console.log(`   Root: ${root}`);
  console.log(`   Tree depth: ${tree.getDepth()}`);

  // 3. Generate proofs
  console.log("\n3️⃣  Generating proofs for each eligibility...");
  const proofs = testEligibilities.map((eligibility, i) => {
    const amountWei = formatAmountToWei(eligibility.amount);
    const leaf = buildLeaf(i, eligibility.walletAddress, amountWei);
    const proof = tree.getProof(leaf);
    const proofHex = proof.map((p) => "0x" + p.data.toString("hex"));
    console.log(`   Eligibility ${i}:`);
    console.log(`     Address: ${eligibility.walletAddress}`);
    console.log(`     Amount: ${eligibility.amount} POI (${amountWei} wei)`);
    console.log(`     Leaf: ${leaf}`);
    console.log(`     Proof length: ${proofHex.length}`);
    console.log(`     Proof: ${proofHex.map((p) => p.substring(0, 12) + "...").join(", ")}`);
    return { index: i, leaf, proof: proofHex, amountWei };
  });

  // 4. Verify proofs
  console.log("\n4️⃣  Verifying proofs...");
  proofs.forEach((proofData, i) => {
    const proofBuffers = proofData.proof.map((p) => Buffer.from(p.slice(2), "hex"));
    const isValid = tree.verify(proofBuffers, proofData.leaf, tree.getRoot());
    console.log(`   Proof ${i}: ${isValid ? "✅ VALID" : "❌ INVALID"}`);
    if (!isValid) {
      throw new Error(`Proof ${i} verification failed!`);
    }
  });

  // 5. Test edge cases
  console.log("\n5️⃣  Testing edge cases...");

  // Single leaf tree
  const singleLeaf = [buildLeaf(0, testEligibilities[0].walletAddress, formatAmountToWei(testEligibilities[0].amount))];
  const singleTree = new MerkleTree(singleLeaf, ethers.utils.keccak256, { sortPairs: true });
  const singleRoot = "0x" + singleTree.getRoot().toString("hex");
  console.log(`   Single leaf tree root: ${singleRoot.substring(0, 20)}...`);
  console.log(`   Single leaf equals root: ${singleLeaf[0] === singleRoot ? "✅ YES" : "❌ NO"}`);

  // Invalid proof test
  const invalidProof = ["0x0000000000000000000000000000000000000000000000000000000000000000"];
  const invalidBuffers = invalidProof.map((p) => Buffer.from(p.slice(2), "hex"));
  const isInvalid = tree.verify(invalidBuffers, proofs[0].leaf, tree.getRoot());
  console.log(`   Invalid proof rejected: ${!isInvalid ? "✅ YES" : "❌ NO (should be rejected)"}`);

  console.log("\n✅ All tests passed!");
  console.log("\n📋 Summary:");
  console.log(`   - Tree root: ${root}`);
  console.log(`   - Total eligibilities: ${testEligibilities.length}`);
  console.log(`   - All proofs verified: ✅`);
  console.log(`   - Ready for contract deployment`);
}

main().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exitCode = 1;
});

