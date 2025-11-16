import { ethers } from "hardhat";
import { persistContract } from "./utils/deployment";

async function main() {
  const name = process.env.BADGES_NAME ?? "AchievementBadges";
  const symbol = process.env.BADGES_SYMBOL ?? "POIAB";
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying AchievementBadges with ${deployer.address}`);

  const Badges = await ethers.getContractFactory("AchievementBadges");
  const badges = await Badges.deploy(name, symbol, deployer.address);
  await badges.deployed();

  console.log(`AchievementBadges deployed to ${badges.address}`);
  await persistContract("AchievementBadges", badges.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
