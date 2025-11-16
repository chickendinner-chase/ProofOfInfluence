import { ethers } from "hardhat";
import { persistContract } from "./utils/deployment";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying POI token with ${deployer.address}`);

  const initialSupply = ethers.utils.parseUnits(process.env.POI_INITIAL_SUPPLY ?? "1000000000", 18);
  const Token = await ethers.getContractFactory("POIToken");
  const token = await Token.deploy(deployer.address, deployer.address, initialSupply);
  await token.deployed();

  console.log(`POI deployed to ${token.address}`);
  await persistContract("POIToken", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
