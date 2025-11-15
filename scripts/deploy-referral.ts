import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying ReferralRegistry with ${deployer.address}`);

  const Registry = await ethers.getContractFactory("ReferralRegistry");
  const registry = await Registry.deploy(deployer.address);
  await registry.deployed();

  console.log(`ReferralRegistry deployed to ${registry.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
