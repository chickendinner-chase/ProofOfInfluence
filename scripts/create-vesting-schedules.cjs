/**
 * Create Vesting Schedules from tokenomics.config.json
 * 
 * Reads vesting schedules from tokenomics.config.json and creates them in VestingVault
 */

const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const { ethers } = require("ethers");
const { getVestingSchedules } = require("./utils/tokenomics.cjs");

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) {
    throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  }

  const vaultAddr = process.env.VESTING_VAULT_ADDRESS;
  if (!vaultAddr) {
    throw new Error("Missing VESTING_VAULT_ADDRESS");
  }

  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);

  // Load VestingVault ABI
  const fs = require("fs");
  const artifactPath = path.join(__dirname, "../artifacts/contracts/VestingVault.sol/VestingVault.json");
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Contract artifact not found: ${artifactPath}`);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const vault = new ethers.Contract(vaultAddr, artifact.abi, wallet);

  // Check if caller is owner
  const owner = await vault.owner();
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(`Caller (${wallet.address}) is not the owner (${owner})`);
  }

  // Load schedules from config
  const schedules = getVestingSchedules();
  
  if (schedules.length === 0) {
    console.log("⚠️  No vesting schedules found in tokenomics.config.json");
    console.log("   Add schedules to scripts/tokenomics.config.json under 'vesting.schedules'");
    return;
  }

  console.log(`Found ${schedules.length} vesting schedule(s) to create`);
  console.log(`VestingVault: ${vaultAddr}`);
  console.log(`---`);

  for (let i = 0; i < schedules.length; i++) {
    const schedule = schedules[i];
    
    // Validate schedule
    if (!schedule.beneficiary || !ethers.utils.isAddress(schedule.beneficiary)) {
      console.log(`⚠️  Schedule ${i + 1}: Invalid beneficiary address, skipping`);
      continue;
    }

    const totalAmount = ethers.utils.parseEther(schedule.totalAmount);
    const start = schedule.start || Math.floor(Date.now() / 1000);
    const cliff = schedule.cliff || 0;
    const duration = schedule.duration || 0;
    const slicePeriodSeconds = schedule.slicePeriodSeconds || 86400;
    const revocable = schedule.revocable !== undefined ? schedule.revocable : true;

    // Validate parameters
    if (duration === 0) {
      console.log(`⚠️  Schedule ${i + 1}: Duration cannot be 0, skipping`);
      continue;
    }
    if (duration < cliff) {
      console.log(`⚠️  Schedule ${i + 1}: Duration (${duration}) < cliff (${cliff}), skipping`);
      continue;
    }

    console.log(`\n[${i + 1}/${schedules.length}] Creating schedule:`);
    console.log(`  Beneficiary: ${schedule.beneficiary}`);
    console.log(`  Total amount: ${schedule.totalAmount} POI`);
    console.log(`  Start: ${start} (${new Date(start * 1000).toISOString()})`);
    console.log(`  Cliff: ${cliff} seconds (${(cliff / 86400).toFixed(1)} days)`);
    console.log(`  Duration: ${duration} seconds (${(duration / 86400).toFixed(1)} days)`);
    console.log(`  Slice period: ${slicePeriodSeconds} seconds (${(slicePeriodSeconds / 86400).toFixed(1)} days)`);
    console.log(`  Revocable: ${revocable}`);

    try {
      // Check if vault has enough tokens
      const tokenAddress = await vault.token();
      const token = new ethers.Contract(
        tokenAddress,
        ["function balanceOf(address) view returns (uint256)"],
        provider
      );
      const vaultBalance = await token.balanceOf(vaultAddr);
      
      if (vaultBalance.lt(totalAmount)) {
        console.log(`  ⚠️  Warning: Vault balance (${ethers.utils.formatEther(vaultBalance)} POI) < required (${schedule.totalAmount} POI)`);
        console.log(`  Continuing anyway (tokens may be transferred later)...`);
      }

      // Create schedule
      const tx = await vault.createSchedule(
        schedule.beneficiary,
        totalAmount,
        start,
        cliff,
        duration,
        slicePeriodSeconds,
        revocable,
        { gasLimit: 300000 }
      );
      
      console.log(`  Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      
      // Get schedule ID from event
      const event = receipt.events?.find((e) => e.event === "ScheduleCreated");
      const scheduleId = event?.args?.scheduleId?.toString();
      
      if (scheduleId) {
        console.log(`  ✓ Schedule created! Schedule ID: ${scheduleId}`);
      } else {
        console.log(`  ✓ Schedule created! (could not extract schedule ID from event)`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to create schedule: ${error.message}`);
      if (error.reason) {
        console.error(`    Reason: ${error.reason}`);
      }
    }
  }

  console.log(`\n---`);
  console.log(`Vesting schedule creation complete.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

