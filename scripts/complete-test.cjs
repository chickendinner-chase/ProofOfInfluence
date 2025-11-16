const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const { ethers } = require("ethers");

// Helper to build Merkle leaf (double hash)
function buildLeaf(index, account, amount) {
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["uint256", "address", "uint256"],
    [index, account, amount]
  );
  const firstHash = ethers.utils.keccak256(encoded);
  return ethers.utils.keccak256(ethers.utils.hexConcat([firstHash]));
}

// Helper to compute Merkle leaf (double hash)
function computeLeaf(account, allocation) {
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["address", "uint256"],
    [account, allocation]
  );
  const firstHash = ethers.utils.keccak256(encoded);
  return ethers.utils.keccak256(ethers.utils.hexConcat([firstHash]));
}

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);

  const poiTokenAddr = process.env.POI_TOKEN_ADDRESS || process.env.POI_ADDRESS;
  const vaultAddr = process.env.VESTING_VAULT_ADDRESS;
  const airdropAddr = process.env.MERKLE_AIRDROP_ADDRESS;
  const allowlistAddr = process.env.EARLY_BIRD_ALLOWLIST_ADDRESS;

  console.log(`=== Complete Test Suite ===\n`);
  console.log(`Deployer: ${wallet.address}`);
  console.log(`RPC: ${rpcUrl}\n`);

  // Load contract ABIs
  const fs = require("fs");
  const poiAbi = ["function balanceOf(address) view returns (uint256)", "function transfer(address, uint256) returns (bool)"];
  const vaultArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/VestingVault.sol/VestingVault.json"), "utf8"));
  const airdropArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/MerkleAirdropDistributor.sol/MerkleAirdropDistributor.json"), "utf8"));
  const allowlistArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/EarlyBirdAllowlist.sol/EarlyBirdAllowlist.json"), "utf8"));

  const poiToken = new ethers.Contract(poiTokenAddr, poiAbi, wallet);
  const vault = new ethers.Contract(vaultAddr, vaultArtifact.abi, wallet);
  const airdrop = new ethers.Contract(airdropAddr, airdropArtifact.abi, wallet);
  const allowlist = new ethers.Contract(allowlistAddr, allowlistArtifact.abi, wallet);

  const userAddr = wallet.address;

  // ============================================
  // Test 1: VestingVault - Release tokens
  // ============================================
  console.log(`\n=== Test 1: VestingVault Release ===`);
  try {
    const schedules = await vault.schedulesOf(userAddr);
    console.log(`  Found ${schedules.length} schedule(s)`);
    
    if (schedules.length > 0) {
      const scheduleId = schedules[0];
      const schedule = await vault.getSchedule(scheduleId);
      const releasable = await vault.releasableAmount(scheduleId);
      
      console.log(`  Schedule ${scheduleId}:`);
      console.log(`    Total: ${ethers.utils.formatUnits(schedule.totalAmount, 18)} POI`);
      console.log(`    Released: ${ethers.utils.formatUnits(schedule.released, 18)} POI`);
      console.log(`    Releasable: ${ethers.utils.formatUnits(releasable, 18)} POI`);
      
      if (releasable.gt(0)) {
        const balanceBefore = await poiToken.balanceOf(userAddr);
        console.log(`  Releasing ${ethers.utils.formatUnits(releasable, 18)} POI...`);
        const tx = await vault.release(scheduleId);
        await tx.wait();
        const balanceAfter = await poiToken.balanceOf(userAddr);
        console.log(`  ✓ Released successfully! Balance increased by ${ethers.utils.formatUnits(balanceAfter.sub(balanceBefore), 18)} POI`);
      } else {
        console.log(`  ⚠️  No releasable amount yet (cliff period or already released)`);
      }
    } else {
      console.log(`  ⚠️  No schedules found`);
    }
  } catch (e) {
    console.error(`  ✗ Error: ${e.message || e}`);
  }

  // ============================================
  // Test 2: MerkleAirdropDistributor - Set root and claim
  // ============================================
  console.log(`\n=== Test 2: MerkleAirdropDistributor Claim ===`);
  try {
    // Check if paused
    let paused = false;
    try {
      paused = await airdrop.paused();
    } catch (e) {
      // Pausable might not be available
    }
    
    if (paused) {
      console.log(`  Unpausing...`);
      await (await airdrop.unpause()).wait();
      console.log(`  ✓ Unpaused`);
    }

    // Set root for testing (single leaf)
    const testIndex = 0;
    const testAmount = ethers.utils.parseEther("100");
    const testLeaf = buildLeaf(testIndex, userAddr, testAmount);
    
    const currentRound = await airdrop.currentRound();
    const currentRoot = await airdrop.rootOf(currentRound);
    
    if (currentRoot === ethers.constants.HashZero || currentRoot.toLowerCase() !== testLeaf.toLowerCase()) {
      console.log(`  Setting root for round ${currentRound.toString()}...`);
      const tx = await airdrop.setRoot(testLeaf);
      await tx.wait();
      console.log(`  ✓ Root set: ${testLeaf}`);
    } else {
      console.log(`  ✓ Root already set`);
    }

    // Check if already claimed
    const isClaimed = await airdrop.isClaimed(currentRound, testIndex);
    if (isClaimed) {
      console.log(`  ⚠️  Already claimed for index ${testIndex}`);
    } else {
      // Check contract balance
      const contractBalance = await poiToken.balanceOf(airdropAddr);
      console.log(`  Contract balance: ${ethers.utils.formatUnits(contractBalance, 18)} POI`);
      
      if (contractBalance.gte(testAmount)) {
        const balanceBefore = await poiToken.balanceOf(userAddr);
        console.log(`  Claiming ${ethers.utils.formatUnits(testAmount, 18)} POI...`);
        const tx = await airdrop.claim(testIndex, userAddr, testAmount, []);
        await tx.wait();
        const balanceAfter = await poiToken.balanceOf(userAddr);
        console.log(`  ✓ Claimed successfully! Balance increased by ${ethers.utils.formatUnits(balanceAfter.sub(balanceBefore), 18)} POI`);
      } else {
        console.log(`  ⚠️  Insufficient contract balance. Need to fund first.`);
      }
    }
  } catch (e) {
    console.error(`  ✗ Error: ${e.message || e}`);
  }

  // ============================================
  // Test 3: EarlyBirdAllowlist - Consume allocation
  // ============================================
  console.log(`\n=== Test 3: EarlyBirdAllowlist Consume ===`);
  try {
    const testAllocation = ethers.utils.parseEther("1000");
    const testLeaf = computeLeaf(userAddr, testAllocation);
    
    // Check current root
    const currentRoot = await allowlist.merkleRoot();
    const rootVersion = await allowlist.rootVersion();
    
    if (currentRoot.toLowerCase() !== testLeaf.toLowerCase()) {
      console.log(`  Setting root...`);
      const tx = await allowlist.setRoot(testLeaf);
      await tx.wait();
      console.log(`  ✓ Root set: ${testLeaf}`);
    } else {
      console.log(`  ✓ Root already set (version ${rootVersion.toString()})`);
    }

    // Check remaining
    const remaining = await allowlist.remaining(userAddr);
    console.log(`  Remaining allocation: ${ethers.utils.formatUnits(remaining, 18)} POI`);

    if (remaining.gt(0)) {
      const consumeAmount = ethers.utils.parseEther("100");
      console.log(`  Consuming ${ethers.utils.formatUnits(consumeAmount, 18)} POI...`);
      
      // Owner can consume directly
      const tx = await allowlist.consume(userAddr, testAllocation, consumeAmount, []);
      await tx.wait();
      
      const remainingAfter = await allowlist.remaining(userAddr);
      console.log(`  ✓ Consumed successfully! Remaining: ${ethers.utils.formatUnits(remainingAfter, 18)} POI`);
    } else {
      console.log(`  ⚠️  No remaining allocation (may need to wait for state update or root version mismatch)`);
    }
  } catch (e) {
    console.error(`  ✗ Error: ${e.message || e}`);
  }

  console.log(`\n=== Test Complete ===\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

