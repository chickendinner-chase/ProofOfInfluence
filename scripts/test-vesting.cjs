const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const { ethers } = require("ethers");

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");

  const vaultAddr = process.env.VESTING_VAULT_ADDRESS;
  if (!vaultAddr) {
    throw new Error("Missing VESTING_VAULT_ADDRESS environment variable");
  }

  const tokenAddr = process.env.POI_TOKEN_ADDRESS || process.env.POI_ADDRESS;
  if (!tokenAddr) {
    throw new Error("Missing POI_TOKEN_ADDRESS or POI_ADDRESS environment variable");
  }

  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);
  
  // Load contract ABIs
  const fs = require("fs");
  const vaultArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/contracts/VestingVault.sol/VestingVault.json"), "utf8"));
  const erc20Abi = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address, uint256) returns (bool)",
    "function approve(address, uint256) returns (bool)",
    "function allowance(address, address) view returns (uint256)"
  ];
  
  const vault = new ethers.Contract(vaultAddr, vaultArtifact.abi, wallet);
  const token = new ethers.Contract(tokenAddr, erc20Abi, wallet);
  const userAddr = wallet.address;

  console.log(`Testing VestingVault for ${userAddr}`);
  console.log(`VestingVault: ${vaultAddr}`);
  console.log(`Token: ${tokenAddr}`);
  console.log(`---`);

  // Check if user is owner
  const owner = await vault.owner();
  const isOwner = owner.toLowerCase() === userAddr.toLowerCase();
  console.log(`Owner: ${owner}`);
  console.log(`Is caller owner: ${isOwner}`);
  console.log(`---`);

  // Get user's schedules
  const scheduleIds = await vault.schedulesOf(userAddr);
  console.log(`User has ${scheduleIds.length} schedule(s)`);

  if (scheduleIds.length === 0) {
    console.log("⚠️  No schedules found for user. Testing schedule creation...");
    
    if (!isOwner) {
      console.log("❌ Cannot create schedule: caller is not owner");
      return;
    }

    // Test creating a schedule
    const now = Math.floor(Date.now() / 1000);
    const totalAmount = ethers.utils.parseEther("1000");
    const start = now;
    const cliff = 30; // 30 seconds
    const duration = 300; // 5 minutes
    const slicePeriod = 30; // 30 seconds
    const revocable = true;

    console.log(`\nCreating test schedule:`);
    console.log(`  Beneficiary: ${userAddr}`);
    console.log(`  Total amount: ${ethers.utils.formatUnits(totalAmount, 18)} POI`);
    console.log(`  Start: ${start} (${new Date(start * 1000).toISOString()})`);
    console.log(`  Cliff: ${cliff} seconds`);
    console.log(`  Duration: ${duration} seconds`);
    console.log(`  Slice period: ${slicePeriod} seconds`);
    console.log(`  Revocable: ${revocable}`);

    try {
      // Check if vault has enough tokens
      const vaultBalance = await token.balanceOf(vaultAddr);
      if (vaultBalance.lt(totalAmount)) {
        console.log(`⚠️  Warning: Vault balance (${ethers.utils.formatUnits(vaultBalance, 18)} POI) < total amount (${ethers.utils.formatUnits(totalAmount, 18)} POI)`);
        console.log(`   Need to fund vault first!`);
        return;
      }

      const tx = await vault.createSchedule(
        userAddr,
        totalAmount,
        start,
        cliff,
        duration,
        slicePeriod,
        revocable
      );
      console.log(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log(`✓ Schedule created! Confirmed in block ${receipt.blockNumber}`);
        
        // Find the schedule ID from event
        const vaultInterface = vault.interface;
        for (const log of receipt.logs) {
          try {
            const parsed = vaultInterface.parseLog(log);
            if (parsed.name === "ScheduleCreated") {
              console.log(`  ✓ Schedule ID: ${parsed.args.scheduleId.toString()}`);
              console.log(`  ✓ Beneficiary: ${parsed.args.beneficiary}`);
              console.log(`  ✓ Total amount: ${ethers.utils.formatUnits(parsed.args.totalAmount, 18)} POI`);
              scheduleIds.push(parsed.args.scheduleId.toString());
            }
          } catch (e) {
            // Not a matching log
          }
        }
      }
    } catch (e) {
      console.error(`✗ Failed to create schedule: ${e.message || e}`);
      return;
    }
  }

  // Test each schedule
  for (const scheduleIdStr of scheduleIds) {
    const scheduleId = parseInt(scheduleIdStr);
    console.log(`\n=== Testing Schedule ${scheduleId} ===`);

    try {
      const schedule = await vault.getSchedule(scheduleId);
      console.log(`Schedule details:`);
      console.log(`  Beneficiary: ${schedule.beneficiary}`);
      console.log(`  Total amount: ${ethers.utils.formatUnits(schedule.totalAmount, 18)} POI`);
      console.log(`  Released: ${ethers.utils.formatUnits(schedule.released, 18)} POI`);
      console.log(`  Start: ${schedule.start.toString()} (${new Date(schedule.start.toNumber() * 1000).toISOString()})`);
      console.log(`  Cliff: ${schedule.cliff.toString()} seconds`);
      console.log(`  Duration: ${schedule.duration.toString()} seconds`);
      console.log(`  Slice period: ${schedule.slicePeriodSeconds.toString()} seconds`);
      console.log(`  Revocable: ${schedule.revocable}`);
      console.log(`  Revoked: ${schedule.revoked}`);

      if (schedule.revoked) {
        console.log(`  ⚠️  Schedule is revoked`);
        continue;
      }

      // Check releasable amount
      const releasable = await vault.releasableAmount(scheduleId);
      console.log(`  Releasable: ${ethers.utils.formatUnits(releasable, 18)} POI`);

      // Check user token balance before
      const userBalanceBefore = await token.balanceOf(userAddr);
      console.log(`  User token balance before: ${ethers.utils.formatUnits(userBalanceBefore, 18)} POI`);

      if (releasable.gt(0)) {
        console.log(`\n  Attempting to release ${ethers.utils.formatUnits(releasable, 18)} POI...`);
        
        try {
          const tx = await vault.release(scheduleId);
          console.log(`  Transaction sent: ${tx.hash}`);
          const receipt = await tx.wait();

          if (receipt.status === 1) {
            console.log(`  ✓ Release successful! Confirmed in block ${receipt.blockNumber}`);
            console.log(`  Gas used: ${receipt.gasUsed.toString()}`);

            // Check for Released event
            const vaultInterface = vault.interface;
            for (const log of receipt.logs) {
              try {
                const parsed = vaultInterface.parseLog(log);
                if (parsed.name === "Released") {
                  console.log(`  ✓ Found Released event:`);
                  console.log(`    Schedule ID: ${parsed.args.scheduleId.toString()}`);
                  console.log(`    Beneficiary: ${parsed.args.beneficiary}`);
                  console.log(`    Amount: ${ethers.utils.formatUnits(parsed.args.amount, 18)} POI`);
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
            console.log(`  User token balance after: ${ethers.utils.formatUnits(userBalanceAfter, 18)} POI`);
            console.log(`  Balance increased: ${ethers.utils.formatUnits(balanceIncrease, 18)} POI`);

            if (balanceIncrease.eq(releasable)) {
              console.log(`  ✓ Balance increase matches releasable amount`);
            } else {
              console.log(`  ⚠️  Balance increase (${ethers.utils.formatUnits(balanceIncrease, 18)}) != releasable (${ethers.utils.formatUnits(releasable, 18)})`);
            }

            // Check updated schedule
            const scheduleAfter = await vault.getSchedule(scheduleId);
            console.log(`  Updated released: ${ethers.utils.formatUnits(scheduleAfter.released, 18)} POI`);
          }
        } catch (e) {
          console.error(`  ✗ Release failed: ${e.message || e}`);
          
          // Try static call to see revert reason
          try {
            await vault.callStatic.release(scheduleId);
            console.log(`  ✓ Static call succeeded (unexpected)`);
          } catch (e2) {
            console.error(`  Static call failed: ${e2.message || e2}`);
          }
        }
      } else {
        console.log(`  ⚠️  No releasable amount. Schedule may be:`);
        console.log(`    - Before cliff period`);
        console.log(`    - Already fully released`);
        console.log(`    - Revoked`);
      }
    } catch (e) {
      console.error(`  ✗ Failed to get schedule: ${e.message || e}`);
    }
  }

  console.log(`\n---`);
  console.log(`VestingVault testing complete.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

