/**
 * Configure ImmortalityBadgeV2 Roles
 * 
 * This script:
 * 1. Checks current role configuration
 * 2. Grants MINTER_ROLE to AgentKit wallet (if needed)
 * 3. Verifies roles are set correctly
 */

require("dotenv").config({ override: true });
const { ethers } = require("hardhat");

const BADGE_CONTRACT_ADDRESS = process.env.IMMORTALITY_BADGE_ADDRESS || process.env.VITE_IMMORTALITY_BADGE_ADDRESS;
const ADMIN_ADDRESS = process.env.IMMORTALITY_BADGE_ADMIN || process.env.DEPLOYER_PRIVATE_KEY ? 
  new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, ethers.provider).address : null;
const AGENTKIT_WALLET_ADDRESS = process.env.CDP_WALLET_ADDRESS;

async function main() {
  console.log("🔧 ImmortalityBadgeV2 Role Configuration\n");

  if (!BADGE_CONTRACT_ADDRESS) {
    throw new Error("IMMORTALITY_BADGE_ADDRESS not configured");
  }

  const deployerPk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!deployerPk) {
    throw new Error("PRIVATE_KEY or DEPLOYER_PRIVATE_KEY not configured");
  }

  const deployer = new ethers.Wallet(deployerPk, ethers.provider);
  const deployerAddress = deployer.address;

  console.log(`📋 Configuration:`);
  console.log(`   Badge Contract: ${BADGE_CONTRACT_ADDRESS}`);
  console.log(`   Deployer: ${deployerAddress}`);
  console.log(`   AgentKit Wallet: ${AGENTKIT_WALLET_ADDRESS || "Not configured"}`);
  console.log();

  // Load contract
  const badgeConfig = require("../shared/contracts/immortality_badge.json");
  const badge = new ethers.Contract(BADGE_CONTRACT_ADDRESS, badgeConfig.abi, deployer);

  // Check DEFAULT_ADMIN_ROLE
  const DEFAULT_ADMIN_ROLE = await badge.DEFAULT_ADMIN_ROLE();
  const deployerIsAdmin = await badge.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress);
  
  console.log("🔐 Role Status:");
  console.log(`   Deployer has DEFAULT_ADMIN_ROLE: ${deployerIsAdmin ? "✅ Yes" : "❌ No"}`);

  if (!deployerIsAdmin) {
    console.warn("⚠️  WARNING: Deployer does not have DEFAULT_ADMIN_ROLE!");
    console.warn("   Cannot grant MINTER_ROLE without admin access.");
    console.warn(`   Current admin must grant role or transfer admin to: ${deployerAddress}`);
    return;
  }

  // Check MINTER_ROLE
  const MINTER_ROLE = await badge.MINTER_ROLE();
  console.log(`   MINTER_ROLE: ${MINTER_ROLE}`);

  if (!AGENTKIT_WALLET_ADDRESS) {
    console.warn("⚠️  CDP_WALLET_ADDRESS not configured. Cannot grant MINTER_ROLE.");
    console.warn("   Please set CDP_WALLET_ADDRESS in environment variables.");
    return;
  }

  const agentKitHasMinterRole = await badge.hasRole(MINTER_ROLE, AGENTKIT_WALLET_ADDRESS);
  console.log(`   AgentKit has MINTER_ROLE: ${agentKitHasMinterRole ? "✅ Yes" : "❌ No"}`);
  console.log();

  // Grant MINTER_ROLE if needed
  if (!agentKitHasMinterRole) {
    console.log("🔨 Granting MINTER_ROLE to AgentKit wallet...");
    try {
      const tx = await badge.grantRole(MINTER_ROLE, AGENTKIT_WALLET_ADDRESS);
      console.log(`   Transaction: ${tx.hash}`);
      await tx.wait();
      console.log("✅ MINTER_ROLE granted successfully!");
    } catch (error) {
      console.error("❌ Failed to grant MINTER_ROLE:", error.message);
      throw error;
    }
  } else {
    console.log("✅ AgentKit wallet already has MINTER_ROLE");
  }

  // Verify final state
  console.log("\n✅ Verification:");
  const finalCheck = await badge.hasRole(MINTER_ROLE, AGENTKIT_WALLET_ADDRESS);
  console.log(`   AgentKit has MINTER_ROLE: ${finalCheck ? "✅ Yes" : "❌ No"}`);

  // Check contract state
  const isPaused = await badge.paused();
  const badgeType1 = await badge.badgeTypes(1);
  console.log(`   Contract paused: ${isPaused ? "❌ Yes" : "✅ No"}`);
  console.log(`   Badge type 1 enabled: ${badgeType1.enabled ? "✅ Yes" : "❌ No"}`);

  console.log("\n🎉 Role configuration complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

