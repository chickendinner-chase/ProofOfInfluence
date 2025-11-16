const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const hre = require("hardhat");

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  const wallet = new hre.ethers.Wallet(pk, hre.ethers.provider);

  const stakingToken = process.env.STAKED_TOKEN_ADDRESS || process.env.POI_ADDRESS;
  const rewardsToken = process.env.REWARD_TOKEN_ADDRESS || process.env.POI_ADDRESS;
  if (!stakingToken || !rewardsToken) throw new Error("Missing STAKED_TOKEN_ADDRESS/REWARD_TOKEN_ADDRESS/POI_ADDRESS");

  console.log("Deployer:", wallet.address);
  console.log("Staking token:", stakingToken);
  console.log("Rewards token:", rewardsToken);

  const Factory = await hre.ethers.getContractFactory("StakingRewards", wallet);
  const staking = await Factory.deploy(stakingToken, rewardsToken, wallet.address);
  await staking.deployed();

  console.log("StakingRewards deployed to", staking.address);
  console.log("Set in .env: STAKING_REWARDS_ADDRESS=" + staking.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


