const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const hre = require("hardhat");

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  const wallet = new hre.ethers.Wallet(pk, hre.ethers.provider);

  const stakingAddr = process.env.STAKING_REWARDS_ADDRESS || "0xe23f7688303768BB1CE2e2a98540A0C1ba63ec2d";
  const staking = await hre.ethers.getContractAt("StakingRewards", stakingAddr, wallet);
  const userAddr = wallet.address;

  console.log(`Debugging getReward() for ${userAddr}`);
  console.log(`---`);

  // Check all relevant state variables
  const [
    rewardPerTokenStored,
    rewardPerTokenCurrent,
    userRewardPerTokenPaid,
    rewardsMapping,
    earnedValue,
    userBalance,
    totalSupply,
    lastUpdateTime,
    periodFinish,
    rewardRate,
    currentBlockTime
  ] = await Promise.all([
    staking.rewardPerTokenStored(),
    staking.rewardPerToken(),
    staking.userRewardPerTokenPaid(userAddr),
    staking.rewards(userAddr),
    staking.earned(userAddr),
    staking.balanceOf(userAddr),
    staking.totalSupply(),
    staking.lastUpdateTime(),
    staking.periodFinish(),
    staking.rewardRate(),
    hre.ethers.provider.getBlock("latest").then(b => b.timestamp)
  ]);

  console.log(`Contract State:`);
  console.log(`  rewardPerTokenStored: ${rewardPerTokenStored.toString()}`);
  console.log(`  rewardPerToken() [current]: ${rewardPerTokenCurrent.toString()}`);
  console.log(`  userRewardPerTokenPaid[user]: ${userRewardPerTokenPaid.toString()}`);
  console.log(`  rewards[user]: ${rewardsMapping.toString()} (${hre.ethers.utils.formatUnits(rewardsMapping, 18)} POI)`);
  console.log(`  earned(user): ${earnedValue.toString()} (${hre.ethers.utils.formatUnits(earnedValue, 18)} POI)`);
  console.log(`  balanceOf(user): ${userBalance.toString()} (${hre.ethers.utils.formatUnits(userBalance, 18)} POI)`);
  console.log(`  totalSupply(): ${totalSupply.toString()} (${hre.ethers.utils.formatUnits(totalSupply, 18)} POI)`);
  console.log(`  lastUpdateTime: ${lastUpdateTime.toString()} (${new Date(lastUpdateTime.toNumber() * 1000).toISOString()})`);
  console.log(`  periodFinish: ${periodFinish.toString()} (${new Date(periodFinish.toNumber() * 1000).toISOString()})`);
  console.log(`  rewardRate: ${rewardRate.toString()} (${hre.ethers.utils.formatUnits(rewardRate, 18)} POI/second)`);
  console.log(`  currentTime: ${currentBlockTime} (${new Date(currentBlockTime * 1000).toISOString()})`);
  console.log(`---`);

  // Calculate what should happen in updateReward modifier
  const lastTimeRewardApplicable = periodFinish.toNumber() > currentBlockTime ? currentBlockTime : periodFinish.toNumber();
  const timeDelta = lastTimeRewardApplicable - lastUpdateTime.toNumber();
  
  console.log(`updateReward() Logic:`);
  console.log(`  lastTimeRewardApplicable: ${lastTimeRewardApplicable} (${new Date(lastTimeRewardApplicable * 1000).toISOString()})`);
  console.log(`  timeDelta: ${timeDelta} seconds`);
  
  if (totalSupply.gt(0)) {
    const newRewardPerToken = rewardPerTokenStored.add(
      hre.ethers.utils.parseEther("1").mul(timeDelta).mul(rewardRate).div(totalSupply)
    );
    console.log(`  newRewardPerToken (calculated): ${newRewardPerToken.toString()}`);
  }

  const rewardPerTokenDiff = rewardPerTokenCurrent.sub(userRewardPerTokenPaid);
  const pendingFromBalance = userBalance.mul(rewardPerTokenDiff).div(hre.ethers.utils.parseEther("1"));
  const totalPending = pendingFromBalance.add(rewardsMapping);

  console.log(`  rewardPerToken diff: ${rewardPerTokenDiff.toString()}`);
  console.log(`  pending from balance calculation: ${pendingFromBalance.toString()} (${hre.ethers.utils.formatUnits(pendingFromBalance, 18)} POI)`);
  console.log(`  rewards[user] (already accrued): ${rewardsMapping.toString()} (${hre.ethers.utils.formatUnits(rewardsMapping, 18)} POI)`);
  console.log(`  total pending (should match earned): ${totalPending.toString()} (${hre.ethers.utils.formatUnits(totalPending, 18)} POI)`);
  console.log(`---`);

  console.log(`getReward() will:`);
  console.log(`  1. Call updateReward(user)`);
  console.log(`     - Update rewardPerTokenStored to: ${rewardPerTokenCurrent.toString()}`);
  console.log(`     - Update lastUpdateTime to: ${lastTimeRewardApplicable}`);
  console.log(`     - Update rewards[user] = earned(user) = ${earnedValue.toString()} (${hre.ethers.utils.formatUnits(earnedValue, 18)} POI)`);
  console.log(`     - Update userRewardPerTokenPaid[user] = ${rewardPerTokenCurrent.toString()}`);
  console.log(`  2. Get reward = rewards[user] (after update) = ${earnedValue.toString()}`);
  console.log(`  3. If reward > 0, transfer ${hre.ethers.utils.formatUnits(earnedValue, 18)} POI to user`);
  console.log(`  4. Set rewards[user] = 0`);
  console.log(`---`);

  if (rewardsMapping.eq(0)) {
    console.log(`⚠️  Current rewards[user] is 0, but earned() shows ${hre.ethers.utils.formatUnits(earnedValue, 18)} POI`);
    console.log(`   This means rewards need to be updated first via updateReward modifier.`);
    console.log(`   The updateReward modifier should update rewards[user] = earned(user) during getReward() execution.`);
  } else {
    console.log(`✓ rewards[user] is already set to ${hre.ethers.utils.formatUnits(rewardsMapping, 18)} POI`);
    console.log(`  getReward() should transfer this amount.`);
  }

  // Try to simulate the transaction
  console.log(`\n---`);
  console.log(`Simulating getReward() transaction...`);
  try {
    // Use callStatic to see what would happen without executing
    await staking.callStatic.getReward();
    console.log(`✓ Static call succeeded (transaction would execute)`);
  } catch (e) {
    console.error(`✗ Static call failed: ${e.message || e}`);
    if (e.error && e.error.data) {
      console.error(`  Revert data: ${e.error.data}`);
      // Try to decode as a simple revert reason
      try {
        const reason = hre.ethers.utils.toUtf8String("0x" + e.error.data.slice(138));
        console.error(`  Revert reason: ${reason}`);
      } catch (e2) {
        // Ignore decode errors
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

