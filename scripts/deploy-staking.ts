import { ethers } from "hardhat";

async function main() {
  const poi = process.env.POI_TOKEN_ADDRESS;
  if (!poi) {
    throw new Error("POI_TOKEN_ADDRESS env var is required");
  }

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying StakingRewards with ${deployer.address}`);

  const Staking = await ethers.getContractFactory("StakingRewards");
  const staking = await Staking.deploy(poi, poi, deployer.address);
  await staking.deployed();

  console.log(`StakingRewards deployed to ${staking.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
