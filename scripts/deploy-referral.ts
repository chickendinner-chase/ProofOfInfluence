import { ethers } from "hardhat";
import { persistContract } from "./utils/deployment";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying ReferralRegistry with ${deployer.address}`);

  const Registry = await ethers.getContractFactory("ReferralRegistry");
  const registry = await Registry.deploy(deployer.address);
  await registry.deployed();

  console.log(`ReferralRegistry deployed to ${registry.address}`);
  await persistContract("ReferralRegistry", registry.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
