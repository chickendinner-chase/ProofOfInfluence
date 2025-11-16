const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const hre = require("hardhat");

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  const wallet = new hre.ethers.Wallet(pk, hre.ethers.provider);

  const stakingAddr = process.env.STAKING_REWARDS_ADDRESS || "0xe23f7688303768BB1CE2e2a98540A0C1ba63ec2d";
  const rewardTokenAddr = process.env.REWARD_TOKEN_ADDRESS || process.env.POI_ADDRESS || "0x737869142C93078Dae4d78D4E8c5dbD45160565a";

  const staking = await hre.ethers.getContractAt("StakingRewards", stakingAddr, wallet);
  const rewardToken = await hre.ethers.getContractAt("IERC20", rewardTokenAddr);

  const userAddr = wallet.address;

  console.log(`Testing getReward() for ${userAddr}`);
  console.log(`StakingRewards: ${stakingAddr}`);
  console.log(`Reward Token: ${rewardTokenAddr}`);
  console.log(`---`);

  // Check before state
  const [
    earnedBefore,
    userRewardBalBefore,
    poolBalanceBefore,
    userStaked,
    periodFinish,
    currentTime
  ] = await Promise.all([
    staking.earned(userAddr),
    rewardToken.balanceOf(userAddr),
    rewardToken.balanceOf(stakingAddr),
    staking.balanceOf(userAddr),
    staking.periodFinish(),
    hre.ethers.provider.getBlock("latest").then(b => b.timestamp)
  ]);

  console.log(`Before claim:`);
  console.log(`  Earned rewards: ${hre.ethers.utils.formatUnits(earnedBefore, 18)} POI`);
  console.log(`  User reward balance: ${hre.ethers.utils.formatUnits(userRewardBalBefore, 18)} POI`);
  console.log(`  Pool balance: ${hre.ethers.utils.formatUnits(poolBalanceBefore, 18)} POI`);
  console.log(`  User staked: ${hre.ethers.utils.formatUnits(userStaked, 18)} POI`);
  console.log(`  Period finish: ${periodFinish.toString()} (${new Date(periodFinish.toNumber() * 1000).toISOString()})`);
  console.log(`  Current time: ${currentTime} (${new Date(currentTime * 1000).toISOString()})`);
  console.log(`  Period active: ${periodFinish.toNumber() > currentTime ? "YES" : "NO"}`);
  console.log(`---`);

  if (earnedBefore.eq(0)) {
    console.log("⚠️  No rewards to claim. Exiting.");
    return;
  }

  if (poolBalanceBefore.lt(earnedBefore)) {
    console.error(`❌ Pool balance (${hre.ethers.utils.formatUnits(poolBalanceBefore, 18)}) < earned (${hre.ethers.utils.formatUnits(earnedBefore, 18)})`);
    console.error("This will cause getReward() to fail!");
    return;
  }

  // Try getReward with different gas limits
  console.log("Attempting getReward()...");
  
  let tx;
  let receipt;
  let success = false;

  // Try 1: Normal call
  try {
    console.log("\n[1/4] Trying getReward() with auto gas estimation...");
    tx = await staking.getReward();
    console.log(`  Transaction sent: ${tx.hash}`);
    receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log(`  ✓ Success! Confirmed in block ${receipt.blockNumber}`);
      success = true;
    } else {
      console.error(`  ✗ Transaction reverted (status: ${receipt.status})`);
    }
  } catch (e) {
    console.error(`  ✗ Failed: ${e.message || e}`);
    
    // Try 2: With manual gas limit 200k
    try {
      console.log("\n[2/4] Retrying with gasLimit=200000...");
      tx = await staking.getReward({ gasLimit: 200000 });
      console.log(`  Transaction sent: ${tx.hash}`);
      receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log(`  ✓ Success! Confirmed in block ${receipt.blockNumber}`);
        success = true;
      } else {
        console.error(`  ✗ Transaction reverted (status: ${receipt.status})`);
      }
    } catch (e2) {
      console.error(`  ✗ Failed: ${e2.message || e2}`);
      
      // Try 3: With manual gas limit 300k
      try {
        console.log("\n[3/4] Retrying with gasLimit=300000...");
        tx = await staking.getReward({ gasLimit: 300000 });
        console.log(`  Transaction sent: ${tx.hash}`);
        receipt = await tx.wait();
        
        if (receipt.status === 1) {
          console.log(`  ✓ Success! Confirmed in block ${receipt.blockNumber}`);
          success = true;
        } else {
          console.error(`  ✗ Transaction reverted (status: ${receipt.status})`);
        }
      } catch (e3) {
        console.error(`  ✗ Failed: ${e3.message || e3}`);
        
        // Try 4: Static call to see what happens
        try {
          console.log("\n[4/4] Trying static call to getReward()...");
          const result = await staking.callStatic.getReward();
          console.log(`  Static call result: ${result}`);
        } catch (e4) {
          console.error(`  ✗ Static call failed: ${e4.message || e4}`);
          
          // Try to decode the revert reason
          if (e4.error && e4.error.data) {
            console.log(`  Revert data: ${e4.error.data}`);
          }
        }
      }
    }
  }

  if (!success) {
    console.log("\n---");
    console.log("All attempts failed. Checking contract state...");
    
    // Check if there's an issue with the rewards mapping
    try {
      const rewardPerTokenStored = await staking.rewardPerTokenStored();
      const userRewardPerTokenPaid = await staking.userRewardPerTokenPaid(userAddr);
      const rewardsMapping = await staking.rewards(userAddr);
      
      console.log(`rewardPerTokenStored: ${rewardPerTokenStored.toString()}`);
      console.log(`userRewardPerTokenPaid: ${userRewardPerTokenPaid.toString()}`);
      console.log(`rewards[user]: ${rewardsMapping.toString()}`);
      
      const rewardPerToken = await staking.rewardPerToken();
      console.log(`rewardPerToken(): ${rewardPerToken.toString()}`);
      console.log(`earned(): ${earnedBefore.toString()}`);
    } catch (e) {
      console.error(`Failed to read contract state: ${e.message}`);
    }
    
    return;
  }

  // Wait a bit for state to settle
  console.log("\nWaiting 3 seconds for state to settle...");
  await new Promise(r => setTimeout(r, 3000));

  // Check after state
  const [
    earnedAfter,
    userRewardBalAfter,
    poolBalanceAfter
  ] = await Promise.all([
    staking.earned(userAddr),
    rewardToken.balanceOf(userAddr),
    rewardToken.balanceOf(stakingAddr)
  ]);

  console.log(`\n---`);
  console.log(`After claim:`);
  console.log(`  Earned rewards: ${hre.ethers.utils.formatUnits(earnedAfter, 18)} POI`);
  console.log(`  User reward balance: ${hre.ethers.utils.formatUnits(userRewardBalAfter, 18)} POI`);
  console.log(`  Pool balance: ${hre.ethers.utils.formatUnits(poolBalanceAfter, 18)} POI`);
  console.log(`---`);
  console.log(`Rewards claimed: ${hre.ethers.utils.formatUnits(earnedBefore.sub(earnedAfter), 18)} POI`);
  console.log(`User balance increased: ${hre.ethers.utils.formatUnits(userRewardBalAfter.sub(userRewardBalBefore), 18)} POI`);
  
  // Check rewards mapping after
  const rewardsAfter = await staking.rewards(userAddr);
  console.log(`rewards[user] after: ${rewardsAfter.toString()} (${hre.ethers.utils.formatUnits(rewardsAfter, 18)} POI)`);
  
  if (userRewardBalAfter.sub(userRewardBalBefore).eq(0)) {
    console.log(`\n⚠️  Warning: User balance did not increase despite successful transaction!`);
    console.log(`  This suggests rewards[user] was 0 even after updateReward modifier.`);
    console.log(`  Checking if there was a transfer event in the transaction...`);
    
    if (receipt && receipt.logs) {
      console.log(`  Transaction had ${receipt.logs.length} logs`);
      // Try to decode RewardPaid event
      const stakingInterface = staking.interface;
      for (const log of receipt.logs) {
        try {
          const parsed = stakingInterface.parseLog(log);
          if (parsed.name === "RewardPaid") {
            console.log(`  ✓ Found RewardPaid event: ${hre.ethers.utils.formatUnits(parsed.args.reward, 18)} POI to ${parsed.args.user}`);
          }
        } catch (e) {
          // Not a matching log
        }
      }
    }
  } else {
    console.log(`\n✓ Success! Rewards claimed successfully.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

