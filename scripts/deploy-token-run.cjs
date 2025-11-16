const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const hre = require("hardhat");

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) {
    throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  }
  // Use Hardhat's configured provider (already set up via --network flag)
  const wallet = new hre.ethers.Wallet(pk, hre.ethers.provider);
  console.log(`Deploying POI token with ${wallet.address}`);

  const initialSupply = hre.ethers.utils.parseUnits(process.env.POI_INITIAL_SUPPLY || "1000000000", 18);
  const Token = await hre.ethers.getContractFactory("POIToken", wallet);
  // admin = deployer, treasury = deployer by default; override via env if needed
  const admin = process.env.POI_ADMIN || wallet.address;
  const treasury = process.env.POI_TREASURY || wallet.address;
  const token = await Token.deploy(admin, treasury, initialSupply);
  await token.deployed();
  console.log(`POI deployed to ${token.address}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


