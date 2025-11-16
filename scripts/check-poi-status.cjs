const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const hre = require("hardhat");

async function main() {
  const poiAddress = process.env.POI_ADDRESS || "0x737869142C93078Dae4d78D4E8c5dbD45160565a";
  const deployer = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!deployer) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  const wallet = new hre.ethers.Wallet(deployer, hre.ethers.provider);
  const deployerAddr = wallet.address;
  const stakingAddr = "0xe23f7688303768BB1CE2e2a98540A0C1ba63ec2d";

  const poi = await hre.ethers.getContractAt("POIToken", poiAddress, wallet);

  console.log(`Checking POI @ ${poiAddress}`);
  console.log(`Deployer: ${deployerAddr}`);
  console.log(`Staking: ${stakingAddr}`);

  try {
    const paused = await poi.paused();
    console.log(`POI paused: ${paused}`);
    if (paused) {
      console.log("⚠️  Token is paused - all transfers will fail!");
    }
  } catch (e) {
    console.log(`paused() check failed: ${e.message}`);
  }

  try {
    const deployerBlacklisted = await poi.blacklist(deployerAddr);
    console.log(`Deployer blacklisted: ${deployerBlacklisted}`);
    if (deployerBlacklisted) {
      console.log("⚠️  Deployer is blacklisted - transfers will fail!");
    }
  } catch (e) {
    console.log(`blacklist(deployer) failed: ${e.message}`);
  }

  try {
    const stakingBlacklisted = await poi.blacklist(stakingAddr);
    console.log(`Staking contract blacklisted: ${stakingBlacklisted}`);
    if (stakingBlacklisted) {
      console.log("⚠️  Staking contract is blacklisted - transfers will fail!");
    }
  } catch (e) {
    console.log(`blacklist(staking) failed: ${e.message}`);
  }

  // Check balances
  const deployerBal = await poi.balanceOf(deployerAddr);
  const stakingBal = await poi.balanceOf(stakingAddr);
  console.log(`Deployer balance: ${hre.ethers.utils.formatUnits(deployerBal, 18)} POI`);
  console.log(`Staking balance: ${hre.ethers.utils.formatUnits(stakingBal, 18)} POI`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

