import { ethers } from "hardhat";

async function main() {
  const token = process.env.POI_TOKEN_ADDRESS;
  if (!token) {
    throw new Error("POI_TOKEN_ADDRESS env var is required");
  }

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying MerkleAirdropDistributor with ${deployer.address}`);

  const Distributor = await ethers.getContractFactory("MerkleAirdropDistributor");
  const distributor = await Distributor.deploy(token, deployer.address);
  await distributor.deployed();

  console.log(`MerkleAirdropDistributor deployed to ${distributor.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
