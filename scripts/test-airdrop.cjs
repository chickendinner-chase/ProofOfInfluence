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

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);

  const airdropAddr = process.env.MERKLE_AIRDROP_ADDRESS;
  if (!airdropAddr) {
    throw new Error("Missing MERKLE_AIRDROP_ADDRESS environment variable");
  }

  const tokenAddr = process.env.POI_TOKEN_ADDRESS || process.env.POI_ADDRESS;
  if (!tokenAddr) {
    throw new Error("Missing POI_TOKEN_ADDRESS or POI_ADDRESS environment variable");
  }

  // Load contract ABIs
  const fs = require("fs");
  const airdropArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/MerkleAirdropDistributor.sol/MerkleAirdropDistributor.json"), "utf8"));
  const erc20Abi = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address, uint256) returns (bool)"
  ];
  
  const airdrop = new ethers.Contract(airdropAddr, airdropArtifact.abi, wallet);
  const token = new ethers.Contract(tokenAddr, erc20Abi, wallet);
  const userAddr = wallet.address;

  console.log(`Testing MerkleAirdropDistributor for ${userAddr}`);
  console.log(`Airdrop: ${airdropAddr}`);
  console.log(`Token: ${tokenAddr}`);
  console.log(`---`);

  // Check if user is owner
  const owner = await airdrop.owner();
  const isOwner = owner.toLowerCase() === userAddr.toLowerCase();
  console.log(`Owner: ${owner}`);
  console.log(`Is caller owner: ${isOwner}`);
  console.log(`---`);

  // Check current round
  const currentRound = await airdrop.currentRound();
  console.log(`Current round: ${currentRound.toString()}`);

  // Check if token is set
  const poiToken = await airdrop.poiToken();
  if (poiToken === ethers.constants.AddressZero) {
    console.log("⚠️  Token not set. Need to call setToken() first.");
    if (!isOwner) {
      console.log("❌ Cannot set token: caller is not owner");
      return;
    }
    console.log(`Setting token to ${tokenAddr}...`);
    try {
      const tx = await airdrop.setToken(tokenAddr);
      await tx.wait();
      console.log(`✓ Token set successfully`);
    } catch (e) {
      console.error(`✗ Failed to set token: ${e.message || e}`);
      return;
    }
  } else {
    console.log(`Token address: ${poiToken}`);
    if (poiToken.toLowerCase() !== tokenAddr.toLowerCase()) {
      console.log(`⚠️  Warning: Token address mismatch!`);
    }
  }

  // Check if paused
  try {
    const paused = await airdrop.paused();
    if (paused) {
      console.log("⚠️  Airdrop is paused");
      if (isOwner) {
        console.log("Unpausing...");
        const tx = await airdrop.unpause();
        await tx.wait();
        console.log("✓ Unpaused successfully");
      } else {
        console.log("❌ Cannot unpause: caller is not owner");
        return;
      }
    }
  } catch (e) {
    // Pausable might not be available in older versions
    console.log("Note: Pausable check failed (may not be available)");
  }

  // Check root for current round
  const root = await airdrop.rootOf(currentRound);
  if (root === ethers.constants.HashZero) {
    console.log(`⚠️  No root set for round ${currentRound.toString()}`);
    console.log(`   To test claiming, you need to:`);
    console.log(`   1. Create a Merkle tree with eligible addresses`);
    console.log(`   2. Call setRoot(root) as owner`);
    console.log(`   3. Fund the airdrop contract with POI tokens`);
    return;
  }
  console.log(`Root for round ${currentRound.toString()}: ${root}`);

  // Test claim (using a simple single-leaf tree for testing)
  // For a real test, you would need to generate a proper Merkle tree
  console.log(`\n=== Testing Claim ===`);
  
  // Create a test claim (single leaf = root)
  const testIndex = 0;
  const testAmount = ethers.utils.parseEther("100");
  const testLeaf = buildLeaf(testIndex, userAddr, testAmount);
  const testProof = []; // Empty proof for single leaf

  console.log(`Test claim parameters:`);
  console.log(`  Round: ${currentRound.toString()}`);
  console.log(`  Index: ${testIndex}`);
  console.log(`  Account: ${userAddr}`);
  console.log(`  Amount: ${ethers.utils.formatUnits(testAmount, 18)} POI`);
  console.log(`  Leaf: ${testLeaf}`);
  console.log(`  Proof: [] (single leaf)`);

  // Check if already claimed
  const isClaimed = await airdrop.isClaimed(currentRound, testIndex);
  if (isClaimed) {
    console.log(`⚠️  Already claimed for index ${testIndex}`);
    console.log(`   To test again, you need to:`);
    console.log(`   1. Set a new root with a different index`);
    console.log(`   2. Or use a different index`);
    return;
  }

  // Check if root matches (for single leaf, root = leaf)
  if (root.toLowerCase() !== testLeaf.toLowerCase()) {
    console.log(`⚠️  Root does not match test leaf!`);
    console.log(`   Root: ${root}`);
    console.log(`   Leaf: ${testLeaf}`);
    console.log(`   This means the test claim won't work.`);
    console.log(`   You need to set a root that matches your test claim.`);
    console.log(`\n   To set root for testing:`);
    console.log(`   await airdrop.setRoot("${testLeaf}")`);
    return;
  }

  // Check contract balance
  const contractBalance = await token.balanceOf(airdropAddr);
  console.log(`Contract balance: ${ethers.utils.formatUnits(contractBalance, 18)} POI`);
  
  if (contractBalance.lt(testAmount)) {
    console.log(`⚠️  Contract balance (${ethers.utils.formatUnits(contractBalance, 18)} POI) < claim amount (${ethers.utils.formatUnits(testAmount, 18)} POI)`);
    console.log(`   Need to fund the contract first!`);
    return;
  }

  // Check user balance before
  const userBalanceBefore = await token.balanceOf(userAddr);
  console.log(`User balance before: ${ethers.utils.formatUnits(userBalanceBefore, 18)} POI`);

  // Attempt claim
  try {
    console.log(`\nAttempting to claim...`);
    let tx;
    try {
      tx = await airdrop.claim(testIndex, userAddr, testAmount, testProof);
    } catch (e1) {
      console.log(`Auto gas estimation failed, retrying with gasLimit=200000...`);
      try {
        tx = await airdrop.claim(testIndex, userAddr, testAmount, testProof, { gasLimit: 200000 });
      } catch (e2) {
        console.log(`Retry failed, trying with gasLimit=300000...`);
        tx = await airdrop.claim(testIndex, userAddr, testAmount, testProof, { gasLimit: 300000 });
      }
    }

    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      console.log(`✓ Claim successful! Confirmed in block ${receipt.blockNumber}`);
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);

      // Check for Claimed event
      const airdropInterface = airdrop.interface;
      for (const log of receipt.logs) {
        try {
          const parsed = airdropInterface.parseLog(log);
          if (parsed.name === "Claimed") {
            console.log(`✓ Found Claimed event:`);
            console.log(`  Round: ${parsed.args.roundId.toString()}`);
            console.log(`  Index: ${parsed.args.index.toString()}`);
            console.log(`  Account: ${parsed.args.account}`);
            console.log(`  Amount: ${ethers.utils.formatUnits(parsed.args.amount, 18)} POI`);
          }
        } catch (e) {
          // Not a matching log
        }
      }

      // Wait for state update
      await new Promise(r => setTimeout(r, 2000));

      // Check user balance after
      const userBalanceAfter = await token.balanceOf(userAddr);
      const balanceIncrease = userBalanceAfter.sub(userBalanceBefore);
      console.log(`\nUser balance after: ${ethers.utils.formatUnits(userBalanceAfter, 18)} POI`);
      console.log(`Balance increased: ${ethers.utils.formatUnits(balanceIncrease, 18)} POI`);

      if (balanceIncrease.eq(testAmount)) {
        console.log(`✓ Balance increase matches claim amount`);
      } else {
        console.log(`⚠️  Balance increase (${ethers.utils.formatUnits(balanceIncrease, 18)}) != claim amount (${ethers.utils.formatUnits(testAmount, 18)})`);
      }

      // Check if marked as claimed
      const isClaimedAfter = await airdrop.isClaimed(currentRound, testIndex);
      if (isClaimedAfter) {
        console.log(`✓ Index ${testIndex} is now marked as claimed`);
      } else {
        console.log(`⚠️  Index ${testIndex} is not marked as claimed (unexpected)`);
      }

      // Try claiming again (should fail)
      console.log(`\nTesting duplicate claim (should fail)...`);
      try {
        await airdrop.callStatic.claim(testIndex, userAddr, testAmount, testProof);
        console.log(`⚠️  Duplicate claim did not revert (unexpected)`);
      } catch (e2) {
        if (e2.message && e2.message.includes("AlreadyClaimed")) {
          console.log(`✓ Duplicate claim correctly rejected`);
        } else {
          console.log(`⚠️  Duplicate claim failed with different error: ${e2.message || e2}`);
        }
      }
    }
  } catch (e) {
    console.error(`✗ Claim failed: ${e.message || e}`);
    
    // Try static call to see revert reason
    try {
      await airdrop.callStatic.claim(testIndex, userAddr, testAmount, testProof);
      console.log(`✓ Static call succeeded (unexpected - transaction should have failed)`);
    } catch (e2) {
      console.error(`Static call failed: ${e2.message || e2}`);
      if (e2.error && e2.error.data) {
        console.error(`Revert data: ${e2.error.data}`);
      }
    }
  }

  console.log(`\n---`);
  console.log(`MerkleAirdropDistributor testing complete.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

