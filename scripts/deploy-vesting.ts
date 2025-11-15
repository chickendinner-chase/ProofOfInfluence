import { ethers } from "hardhat";

async function main() {
  const tokenAddress = process.env.POI_TOKEN_ADDRESS;
  if (!tokenAddress) {
    throw new Error("POI_TOKEN_ADDRESS env var is required");
  }

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying VestingVault with ${deployer.address}`);

  const Vault = await ethers.getContractFactory("VestingVault");
  const vault = await Vault.deploy(tokenAddress, deployer.address);
  await vault.deployed();

  console.log(`VestingVault deployed to ${vault.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
