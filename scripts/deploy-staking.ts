import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { artifacts, ethers, network } from "hardhat";

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

  const stakingArtifact = await artifacts.readArtifact("StakingRewards");
  const outputDir = path.join(__dirname, "..", "shared", "contracts");
  mkdirSync(outputDir, { recursive: true });
  const artifactPath = path.join(outputDir, "staking_rewards.json");
  writeFileSync(
    artifactPath,
    JSON.stringify(
      {
        name: "StakingRewards",
        address: staking.address,
        chainId: network.config.chainId ?? null,
        network: network.name,
        abi: stakingArtifact.abi,
        tokens: {
          staking: poi,
          rewards: poi,
        },
      },
      null,
      2
    )
  );
  console.log(`Saved staking artifact to ${artifactPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
