const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const hre = require("hardhat");

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
];

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  const wallet = new hre.ethers.Wallet(pk, hre.ethers.provider);

  const staking = process.env.STAKING_REWARDS_ADDRESS;
  const rewardsToken = process.env.REWARD_TOKEN_ADDRESS || process.env.POI_ADDRESS;
  if (!staking || !rewardsToken) throw new Error("Missing STAKING_REWARDS_ADDRESS or REWARD_TOKEN_ADDRESS/POI_ADDRESS");

  // Amount: CLI argument (human) or ENV NOTIFY_REWARD (human), default 5_000_000
  const [, , humanAmountArg] = process.argv;
  const humanAmount = humanAmountArg || process.env.NOTIFY_REWARD || "5000000";

  const token = new hre.ethers.Contract(rewardsToken, ERC20_ABI, wallet);
  const decimals = await token.decimals();
  const amount = hre.ethers.utils.parseUnits(humanAmount, decimals);

  const stakingC = await hre.ethers.getContractAt("StakingRewards", staking, wallet);

  console.log("Notifier:", wallet.address);
  console.log("StakingRewards:", staking);
  console.log("Rewards token:", rewardsToken);
  console.log(`Notify amount: ${humanAmount}`);

  const bal = await token.balanceOf(wallet.address);
  if (bal.lt(amount)) throw new Error("Insufficient reward token balance");

  const alw = await token.allowance(wallet.address, staking);
  if (alw.lt(amount)) {
    console.log("Setting allowance (reset then set) ...");
    let tx = await token.approve(staking, 0);
    await tx.wait();
    tx = await token.approve(staking, amount);
    console.log("Approve tx:", tx.hash);
    await tx.wait();
  }

  console.log("Calling notifyRewardAmount ...");
  const tx2 = await stakingC.notifyRewardAmount(amount);
  console.log("notify tx:", tx2.hash);
  const rcpt = await tx2.wait();
  console.log("Confirmed in block", rcpt.blockNumber);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


