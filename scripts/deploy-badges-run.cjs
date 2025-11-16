/**
 * Deploy AchievementBadges contract
 * Run with: node scripts/deploy-badges-run.cjs
 */

const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const { ethers } = require("ethers");

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");

  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);

  const name = process.env.BADGES_NAME || "POI Achievement Badges";
  const symbol = process.env.BADGES_SYMBOL || "POIAB";

  console.log(`Deploying AchievementBadges with ${wallet.address}`);
  console.log(`Name: ${name}, Symbol: ${symbol}`);
  console.log(`RPC: ${rpcUrl}`);

  const fs = require("fs");
  const artifactPath = path.join(__dirname, "../artifacts/contracts/AchievementBadges.sol/AchievementBadges.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const Badges = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const badges = await Badges.deploy(name, symbol, wallet.address);
  await badges.deployed();

  console.log(`✅ AchievementBadges deployed to ${badges.address}`);
  console.log(`Set in .env: ACHIEVEMENT_BADGES_ADDRESS=${badges.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

