import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying EarlyBirdAllowlist with ${deployer.address}`);

  const Allowlist = await ethers.getContractFactory("EarlyBirdAllowlist");
  const allowlist = await Allowlist.deploy(deployer.address);
  await allowlist.deployed();

  console.log(`EarlyBirdAllowlist deployed to ${allowlist.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
