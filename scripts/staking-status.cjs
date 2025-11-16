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

  const staking = await hre.ethers.getContractAt("StakingRewards", stakingAddr);
  const rewardToken = await hre.ethers.getContractAt("IERC20", rewardTokenAddr);

  const userAddr = wallet.address;
  
  const [
    periodFinish,
    rewardRate,
    rewardsDuration,
    lastUpdateTime,
    totalSupply,
    userStaked,
    userEarned,
    rewardPoolBalance,
    currentTime
  ] = await Promise.all([
    staking.periodFinish(),
    staking.rewardRate(),
    staking.rewardsDuration(),
    staking.lastUpdateTime(),
    staking.totalSupply(),
    staking.balanceOf(userAddr),
    staking.earned(userAddr),
    rewardToken.balanceOf(stakingAddr),
    hre.ethers.provider.getBlock("latest").then(b => b.timestamp)
  ]);

  const periodFinishDate = new Date(periodFinish.toNumber() * 1000).toISOString();
  const lastUpdateDate = new Date(lastUpdateTime.toNumber() * 1000).toISOString();
  const nowDate = new Date(currentTime * 1000).toISOString();
  const timeRemaining = periodFinish.toNumber() > currentTime ? periodFinish.toNumber() - currentTime : 0;

  console.log(`StakingRewards @ ${stakingAddr}`);
  console.log(`Reward Token @ ${rewardTokenAddr}`);
  console.log(`User: ${userAddr}`);
  console.log(`---`);
  console.log(`Reward Pool Balance: ${hre.ethers.utils.formatUnits(rewardPoolBalance, 18)} POI`);
  console.log(`User Earned (claimed): ${hre.ethers.utils.formatUnits(userEarned, 18)} POI`);
  console.log(`User Staked: ${hre.ethers.utils.formatUnits(userStaked, 18)} POI`);
  console.log(`Total Staked: ${hre.ethers.utils.formatUnits(totalSupply, 18)} POI`);
  console.log(`---`);
  console.log(`Current Time: ${currentTime} (${nowDate})`);
  console.log(`Period Finish: ${periodFinish.toString()} (${periodFinishDate})`);
  console.log(`Time Remaining: ${timeRemaining} seconds (${Math.floor(timeRemaining / 86400)} days)`);
  console.log(`Last Update: ${lastUpdateTime.toString()} (${lastUpdateDate})`);
  console.log(`Rewards Duration: ${rewardsDuration.toString()} seconds (${rewardsDuration.toNumber() / 86400} days)`);
  console.log(`Reward Rate: ${hre.ethers.utils.formatUnits(rewardRate, 18)} POI/second`);
  console.log(`---`);

  if (periodFinish.toNumber() <= currentTime) {
    console.log(`⚠️  Reward period has ended! Need to call notifyRewardAmount to start a new period.`);
  } else {
    console.log(`✓ Reward period is active`);
  }

  if (rewardPoolBalance.lt(userEarned)) {
    console.log(`⚠️  Warning: Reward pool balance (${hre.ethers.utils.formatUnits(rewardPoolBalance, 18)}) is less than user earned (${hre.ethers.utils.formatUnits(userEarned, 18)})!`);
    console.log(`   getReward() will fail due to insufficient balance.`);
  } else {
    console.log(`✓ Reward pool has sufficient balance for claim`);
  }

  // Calculate estimated remaining rewards in pool
  if (periodFinish.toNumber() > currentTime) {
    const remainingTime = periodFinish.toNumber() - currentTime;
    const remainingRewards = rewardRate.mul(remainingTime);
    console.log(`Estimated remaining rewards: ${hre.ethers.utils.formatUnits(remainingRewards, 18)} POI`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

