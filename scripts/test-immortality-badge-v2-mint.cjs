/**
 * Test ImmortalityBadgeV2 Mint Functionality
 * 
 * This script tests:
 * 1. Mint via AgentKit (mintBadge function)
 * 2. Verify token was minted
 * 3. Attempt second mint (should fail with BadgeAlreadyClaimed)
 */

require("dotenv").config({ override: true });
const { ethers } = require("hardhat");

const BADGE_CONTRACT_ADDRESS = process.env.IMMORTALITY_BADGE_ADDRESS || process.env.VITE_IMMORTALITY_BADGE_ADDRESS;
const TEST_RECIPIENT = process.argv[2] || process.env.TEST_RECIPIENT || "0x0000000000000000000000000000000000000000";

async function main() {
  console.log("🧪 Testing ImmortalityBadgeV2 Mint Functionality\n");

  if (!BADGE_CONTRACT_ADDRESS) {
    throw new Error("IMMORTALITY_BADGE_ADDRESS not configured");
  }

  if (TEST_RECIPIENT === "0x0000000000000000000000000000000000000000") {
    throw new Error("Please provide TEST_RECIPIENT address: node scripts/test-immortality-badge-v2-mint.cjs <address>");
  }

  console.log(`📋 Test Configuration:`);
  console.log(`   Badge Contract: ${BADGE_CONTRACT_ADDRESS}`);
  console.log(`   Test Recipient: ${TEST_RECIPIENT}`);
  console.log();

  // Load contract
  const badgeConfig = require("../shared/contracts/immortality_badge.json");
  const [signer] = await ethers.getSigners();
  const badge = new ethers.Contract(BADGE_CONTRACT_ADDRESS, badgeConfig.abi, signer);

  // Check initial state
  console.log("📊 Initial State:");
  const initialBalance = await badge.balanceOf(TEST_RECIPIENT);
  const hasMinted = await badge.hasMinted(TEST_RECIPIENT);
  const isPaused = await badge.paused();
  const badgeType1 = await badge.badgeTypes(1);

  console.log(`   Balance: ${initialBalance.toString()}`);
  console.log(`   Has Minted: ${hasMinted}`);
  console.log(`   Contract Paused: ${isPaused}`);
  console.log(`   Badge Type 1 Enabled: ${badgeType1.enabled}`);
  console.log();

  if (isPaused) {
    console.error("❌ Contract is paused! Cannot mint.");
    return;
  }

  if (!badgeType1.enabled) {
    console.error("❌ Badge type 1 is not enabled! Cannot mint.");
    return;
  }

  // Check MINTER_ROLE
  const MINTER_ROLE = await badge.MINTER_ROLE();
  const signerHasMinterRole = await badge.hasRole(MINTER_ROLE, signer.address);
  console.log(`   Signer has MINTER_ROLE: ${signerHasMinterRole ? "✅ Yes" : "❌ No"}`);
  console.log();

  if (!signerHasMinterRole) {
    console.error("❌ Signer does not have MINTER_ROLE! Cannot mint via mintBadge.");
    console.error("   Run: npm run configure:badge-v2-roles");
    return;
  }

  // Test 1: First mint (should succeed)
  console.log("🧪 Test 1: First Mint");
  if (hasMinted || initialBalance.gt(0)) {
    console.log("⚠️  Address already has a badge. Skipping first mint test.");
  } else {
    try {
      console.log(`   Calling mintBadge(${TEST_RECIPIENT}, 1)...`);
      const tx = await badge.mintBadge(TEST_RECIPIENT, 1);
      console.log(`   Transaction: ${tx.hash}`);
      console.log("   Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log(`   ✅ Mint successful! Block: ${receipt.blockNumber}`);

      // Find token ID from events
      const mintEvent = receipt.logs
        .map(log => {
          try {
            return badge.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find(e => e && e.name === "BadgeMinted");

      if (mintEvent) {
        const tokenId = mintEvent.args.tokenId;
        console.log(`   Token ID: ${tokenId.toString()}`);
        console.log(`   Explorer: https://sepolia.basescan.org/token/${BADGE_CONTRACT_ADDRESS}?a=${tokenId}`);
      }

      // Verify balance
      const newBalance = await badge.balanceOf(TEST_RECIPIENT);
      console.log(`   New Balance: ${newBalance.toString()}`);
    } catch (error) {
      console.error("❌ First mint failed:", error.message);
      return;
    }
  }

  console.log();

  // Test 2: Second mint (should fail)
  console.log("🧪 Test 2: Second Mint (should fail)");
  try {
    console.log(`   Calling mintBadge(${TEST_RECIPIENT}, 1) again...`);
    const tx = await badge.mintBadge(TEST_RECIPIENT, 1);
    console.log(`   Transaction: ${tx.hash}`);
    await tx.wait();
    console.error("❌ Second mint should have failed but succeeded!");
  } catch (error) {
    const errorMsg = error.message || error.toString();
    if (
      errorMsg.includes("BadgeAlreadyClaimed") ||
      errorMsg.includes("already claimed") ||
      errorMsg.includes("already minted")
    ) {
      console.log(`   ✅ Expected error received: ${errorMsg.split("\n")[0]}`);
    } else {
      console.log(`   ⚠️  Unexpected error: ${errorMsg.split("\n")[0]}`);
    }
  }

  console.log("\n✅ Test complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

