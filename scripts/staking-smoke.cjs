const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const hre = require("hardhat");

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
];

// Minimal staking interface; adjust names if your contract differs
const STAKING_ABI = [
  "function stakingToken() view returns (address)",
  "function rewardsToken() view returns (address)",
  "function rewardRate() view returns (uint256)",
  "function earned(address) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function stake(uint256 amount) external",
  "function getReward() external",
  "function withdraw(uint256 amount) external",
];

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  const wallet = new hre.ethers.Wallet(pk, hre.ethers.provider);

  const stakingAddr = process.env.STAKING_REWARDS_ADDRESS;
  if (!stakingAddr) throw new Error("Missing STAKING_REWARDS_ADDRESS in .env");

  const staking = new hre.ethers.Contract(stakingAddr, STAKING_ABI, wallet);

  // Resolve tokens
  const stakedTokenAddr = process.env.STAKED_TOKEN_ADDRESS || (await staking.stakingToken().catch(() => null));
  const rewardTokenAddr = process.env.REWARD_TOKEN_ADDRESS || (await staking.rewardsToken().catch(() => null));
  if (!stakedTokenAddr || !rewardTokenAddr) {
    throw new Error("Missing STAKED_TOKEN_ADDRESS/REWARD_TOKEN_ADDRESS and staking contract didn't expose them.");
  }

  const staked = new hre.ethers.Contract(stakedTokenAddr, ERC20_ABI, wallet);
  const reward = new hre.ethers.Contract(rewardTokenAddr, ERC20_ABI, wallet);

  // Read basics
  const [stakedName, stakedSym, stakedDec] = await Promise.all([staked.name(), staked.symbol(), staked.decimals()]);
  const [rewardName, rewardSym, rewardDec] = await Promise.all([reward.name(), reward.symbol(), reward.decimals()]);
  const [rate, userEarnedBefore, userStakeBefore, userStakedBalBefore, userRewardBalBefore] = await Promise.all([
    staking.rewardRate().catch(() => hre.ethers.constants.Zero),
    staking.earned(wallet.address).catch(() => hre.ethers.constants.Zero),
    staking.balanceOf(wallet.address).catch(() => hre.ethers.constants.Zero),
    staked.balanceOf(wallet.address),
    reward.balanceOf(wallet.address),
  ]);

  console.log(`Staking @ ${stakingAddr}`);
  console.log(`Stake token: ${stakedName} (${stakedSym}) d=${stakedDec} at ${stakedTokenAddr}`);
  console.log(`Reward token: ${rewardName} (${rewardSym}) d=${rewardDec} at ${rewardTokenAddr}`);
  console.log(`rewardRate: ${rate.toString()}`);
  console.log(`Before: earned=${hre.ethers.utils.formatUnits(userEarnedBefore, rewardDec)}, stakeBal=${hre.ethers.utils.formatUnits(userStakeBefore, stakedDec)}`);
  console.log(`Before: user stake token bal=${hre.ethers.utils.formatUnits(userStakedBalBefore, stakedDec)}, reward bal=${hre.ethers.utils.formatUnits(userRewardBalBefore, rewardDec)}`);

  // Decide stake amount (default 1 unit)
  const stakeUnits = process.env.STAKE_AMOUNT || "1";
  const stakeAmount = hre.ethers.utils.parseUnits(stakeUnits, stakedDec);
  if (userStakedBalBefore.lt(stakeAmount)) {
    console.log(`Insufficient stake token balance. Need ${stakeUnits} ${stakedSym}. Skipping stake.`);
    return;
  }

  // Approve exact amount if needed (reset then set to avoid non-standard ERC20 issues)
  const allowance = await staked.allowance(wallet.address, stakingAddr);
  if (allowance.lt(stakeAmount)) {
    console.log(`Approving ${stakeUnits} ${stakedSym} to staking...`);
    let tx = await staked.approve(stakingAddr, 0);
    await tx.wait();
    tx = await staked.approve(stakingAddr, stakeAmount);
    console.log(`Approve tx: ${tx.hash}`);
    await tx.wait();
  }

  // Stake
  console.log(`Staking ${stakeUnits} ${stakedSym} ...`);
  let tx;
  try {
    tx = await staking.stake(stakeAmount);
  } catch (e) {
    console.log("Gas estimation failed, retry with manual gasLimit=200000");
    tx = await staking.stake(stakeAmount, { gasLimit: 200000 });
  }
  console.log(`Stake tx: ${tx.hash}`);
  await tx.wait();

  // Optionally wait a bit (some reward mechanics need blocks/time)
  // For testnets, we proceed immediately to getReward/withdraw to verify flows.

  // Wait a bit to accumulate some rewards
  console.log("Waiting 5 seconds to accumulate rewards...");
  await new Promise(r => setTimeout(r, 5000));

  // Check earned rewards before claiming
  const earnedBeforeClaim = await staking.earned(wallet.address);
  console.log(`Earned rewards before claim: ${hre.ethers.utils.formatUnits(earnedBeforeClaim, rewardDec)} ${rewardSym}`);

  // Claim only if there are rewards
  if (earnedBeforeClaim.gt(0)) {
    console.log("Claiming rewards (getReward) ...");
    try {
      tx = await staking.getReward();
    } catch (e) {
      console.log("getReward() failed, retrying with gasLimit=200000...");
      tx = await staking.getReward({ gasLimit: 200000 });
    }
    console.log(`getReward tx: ${tx.hash}`);
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      console.log(`✓ Rewards claimed successfully in block ${receipt.blockNumber}`);
    } else {
      throw new Error(`getReward() transaction reverted (status: ${receipt.status})`);
    }
  } else {
    console.log("No rewards to claim yet (earned = 0)");
  }

  // Withdraw
  console.log(`Withdrawing ${stakeUnits} ${stakedSym} ...`);
  try {
    tx = await staking.withdraw(stakeAmount);
  } catch (e) {
    console.log("withdraw() failed, retrying with gasLimit=200000...");
    tx = await staking.withdraw(stakeAmount, { gasLimit: 200000 });
  }
  console.log(`Withdraw tx: ${tx.hash}`);
  const withdrawReceipt = await tx.wait();
  if (withdrawReceipt.status === 1) {
    console.log(`✓ Withdraw successful in block ${withdrawReceipt.blockNumber}`);
  } else {
    throw new Error(`withdraw() transaction reverted (status: ${withdrawReceipt.status})`);
  }

  const [userEarnedAfter, userStakeAfter, userStakedBalAfter, userRewardBalAfter] = await Promise.all([
    staking.earned(wallet.address).catch(() => hre.ethers.constants.Zero),
    staking.balanceOf(wallet.address).catch(() => hre.ethers.constants.Zero),
    staked.balanceOf(wallet.address),
    reward.balanceOf(wallet.address),
  ]);
  console.log(`After: earned=${hre.ethers.utils.formatUnits(userEarnedAfter, rewardDec)}, stakeBal=${hre.ethers.utils.formatUnits(userStakeAfter, stakedDec)}`);
  console.log(`After: user stake token bal=${hre.ethers.utils.formatUnits(userStakedBalAfter, stakedDec)}, reward bal=${hre.ethers.utils.formatUnits(userRewardBalAfter, rewardDec)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


