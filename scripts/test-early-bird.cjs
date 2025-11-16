const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const { ethers } = require("ethers");

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

  const allowlistAddr = process.env.EARLY_BIRD_ALLOWLIST_ADDRESS;
  if (!allowlistAddr) {
    throw new Error("Missing EARLY_BIRD_ALLOWLIST_ADDRESS environment variable");
  }

  // Load contract ABI
  const fs = require("fs");
  const allowlistArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/EarlyBirdAllowlist.sol/EarlyBirdAllowlist.json"), "utf8"));
  const allowlist = new ethers.Contract(allowlistAddr, allowlistArtifact.abi, wallet);
  const userAddr = wallet.address;

  console.log(`Testing EarlyBirdAllowlist for ${userAddr}`);
  console.log(`Allowlist: ${allowlistAddr}`);
  console.log(`---`);

  // Check if user is owner
  const owner = await allowlist.owner();
  const isOwner = owner.toLowerCase() === userAddr.toLowerCase();
  console.log(`Owner: ${owner}`);
  console.log(`Is caller owner: ${isOwner}`);
  console.log(`---`);

  // Check current root
  const merkleRoot = await allowlist.merkleRoot();
  const rootVersion = await allowlist.rootVersion();
  console.log(`Merkle root: ${merkleRoot}`);
  console.log(`Root version: ${rootVersion.toString()}`);

  if (merkleRoot === ethers.constants.HashZero) {
    console.log("⚠️  No Merkle root set. Setting a test root...");
    if (!isOwner) {
      console.log("❌ Cannot set root: caller is not owner");
      return;
    }

    // Create a test root (single leaf)
    const testAllocation = ethers.utils.parseEther("1000");
    const testLeaf = computeLeaf(userAddr, testAllocation);
    console.log(`Setting test root (single leaf): ${testLeaf}`);
    console.log(`  Account: ${userAddr}`);
    console.log(`  Allocation: ${ethers.utils.formatUnits(testAllocation, 18)} POI`);

    try {
      const tx = await allowlist.setRoot(testLeaf);
      await tx.wait();
      console.log(`✓ Root set successfully`);
    } catch (e) {
      console.error(`✗ Failed to set root: ${e.message || e}`);
      return;
    }
  }

  // Test verification
  console.log(`\n=== Testing Verification ===`);
  const testAllocation = ethers.utils.parseEther("1000");
  const testProof = []; // Empty proof for single leaf
  const testLeaf = computeLeaf(userAddr, testAllocation);

  console.log(`Test verification:`);
  console.log(`  Account: ${userAddr}`);
  console.log(`  Allocation: ${ethers.utils.formatUnits(testAllocation, 18)} POI`);
  console.log(`  Proof: [] (single leaf)`);
  console.log(`  Leaf: ${testLeaf}`);

  // Check if root matches
  const currentRoot = await allowlist.merkleRoot();
  if (currentRoot.toLowerCase() !== testLeaf.toLowerCase()) {
    console.log(`⚠️  Root does not match test leaf!`);
    console.log(`   Root: ${currentRoot}`);
    console.log(`   Leaf: ${testLeaf}`);
    console.log(`   Verification will fail.`);
    console.log(`\n   To set matching root:`);
    console.log(`   await allowlist.setRoot("${testLeaf}")`);
  } else {
    const isValid = await allowlist.verify(userAddr, testAllocation, testProof);
    console.log(`Verification result: ${isValid ? "✓ Valid" : "✗ Invalid"}`);
  }

  // Check remaining allocation
  console.log(`\n=== Testing Remaining Allocation ===`);
  const remaining = await allowlist.remaining(userAddr);
  console.log(`Remaining allocation: ${ethers.utils.formatUnits(remaining, 18)} POI`);

  if (remaining.eq(0)) {
    console.log(`⚠️  No remaining allocation. This could mean:`);
    console.log(`    - Account not in allowlist`);
    console.log(`    - Root version mismatch`);
    console.log(`    - Already fully consumed`);
  }

  // Test consumption (requires trusted consumer)
  console.log(`\n=== Testing Consumption ===`);
  
  // Check if user is trusted consumer
  const isTrusted = await allowlist.trustedConsumers(userAddr);
  console.log(`Is caller trusted consumer: ${isTrusted}`);

  if (!isTrusted && !isOwner) {
    console.log(`⚠️  Caller is not a trusted consumer or owner`);
    console.log(`   To test consumption, you need to:`);
    console.log(`   1. Set caller as trusted consumer (as owner)`);
    console.log(`   2. Or use owner account to consume`);
    
    if (isOwner) {
      console.log(`\n   Since caller is owner, owner can consume directly`);
    } else {
      console.log(`\n   Setting caller as trusted consumer...`);
      // Note: This would require owner to call setTrustedConsumer
      console.log(`   (This requires owner to call: allowlist.setTrustedConsumer("${userAddr}", true))`);
      return;
    }
  }

  // Test consuming a portion
  const consumeAmount = ethers.utils.parseEther("100");
  console.log(`Attempting to consume: ${ethers.utils.formatUnits(consumeAmount, 18)} POI`);

  // Check if we have enough remaining
  const remainingBefore = await allowlist.remaining(userAddr);
  if (remainingBefore.lt(consumeAmount)) {
    console.log(`⚠️  Remaining (${ethers.utils.formatUnits(remainingBefore, 18)} POI) < consume amount (${ethers.utils.formatUnits(consumeAmount, 18)} POI)`);
    console.log(`   Cannot consume more than remaining`);
    return;
  }

  try {
    console.log(`Calling consume()...`);
    let tx;
    try {
      tx = await allowlist.consume(userAddr, testAllocation, consumeAmount, testProof);
    } catch (e1) {
      console.log(`Auto gas estimation failed, retrying with gasLimit=200000...`);
      try {
        tx = await allowlist.consume(userAddr, testAllocation, consumeAmount, testProof, { gasLimit: 200000 });
      } catch (e2) {
        console.log(`Retry failed, trying with gasLimit=300000...`);
        tx = await allowlist.consume(userAddr, testAllocation, consumeAmount, testProof, { gasLimit: 300000 });
      }
    }

    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      console.log(`✓ Consume successful! Confirmed in block ${receipt.blockNumber}`);
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);

      // Check for Consumed event
      const allowlistInterface = allowlist.interface;
      for (const log of receipt.logs) {
        try {
          const parsed = allowlistInterface.parseLog(log);
          if (parsed.name === "Consumed") {
            console.log(`✓ Found Consumed event:`);
            console.log(`  Account: ${parsed.args.account}`);
            console.log(`  Amount: ${ethers.utils.formatUnits(parsed.args.amount, 18)} POI`);
            console.log(`  Remaining: ${ethers.utils.formatUnits(parsed.args.remaining, 18)} POI`);
          }
        } catch (e) {
          // Not a matching log
        }
      }

      // Wait for state update
      await new Promise(r => setTimeout(r, 2000));

      // Check remaining after
      const remainingAfter = await allowlist.remaining(userAddr);
      const expectedRemaining = remainingBefore.sub(consumeAmount);
      console.log(`\nRemaining after: ${ethers.utils.formatUnits(remainingAfter, 18)} POI`);
      console.log(`Expected remaining: ${ethers.utils.formatUnits(expectedRemaining, 18)} POI`);

      if (remainingAfter.eq(expectedRemaining)) {
        console.log(`✓ Remaining amount matches expected`);
      } else {
        console.log(`⚠️  Remaining (${ethers.utils.formatUnits(remainingAfter, 18)}) != expected (${ethers.utils.formatUnits(expectedRemaining, 18)})`);
      }

      // Test consuming more than remaining (should fail)
      console.log(`\nTesting over-consumption (should fail)...`);
      const overConsume = remainingAfter.add(1);
      try {
        await allowlist.callStatic.consume(userAddr, testAllocation, overConsume, testProof);
        console.log(`⚠️  Over-consumption did not revert (unexpected)`);
      } catch (e2) {
        if (e2.message && (e2.message.includes("ExceedsAllocation") || e2.message.includes("exceeds"))) {
          console.log(`✓ Over-consumption correctly rejected`);
        } else {
          console.log(`⚠️  Over-consumption failed with different error: ${e2.message || e2}`);
        }
      }
    }
  } catch (e) {
    console.error(`✗ Consume failed: ${e.message || e}`);
    
    // Try static call to see revert reason
    try {
      await allowlist.callStatic.consume(userAddr, testAllocation, consumeAmount, testProof);
      console.log(`✓ Static call succeeded (unexpected - transaction should have failed)`);
    } catch (e2) {
      console.error(`Static call failed: ${e2.message || e2}`);
      if (e2.error && e2.error.data) {
        console.error(`Revert data: ${e2.error.data}`);
      }
    }
  }

  console.log(`\n---`);
  console.log(`EarlyBirdAllowlist testing complete.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

