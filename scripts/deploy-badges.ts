import { ethers } from "hardhat";

async function main() {
  const baseUri = process.env.BADGES_BASE_URI ?? "https://example.com/{id}.json";
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying AchievementBadges with ${deployer.address}`);

  const Badges = await ethers.getContractFactory("AchievementBadges");
  const badges = await Badges.deploy(baseUri, deployer.address);
  await badges.deployed();

  console.log(`AchievementBadges deployed to ${badges.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
