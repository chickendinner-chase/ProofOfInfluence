import { ethers } from "hardhat";
import { persistContract } from "./utils/deployment";

async function main() {
  const token = process.env.POI_TOKEN_ADDRESS;
  const treasury = process.env.TREASURY_ADDRESS;
  if (!token) {
    throw new Error("POI_TOKEN_ADDRESS env var is required");
  }
  if (!treasury) {
    throw new Error("TREASURY_ADDRESS env var is required");
  }

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying MerkleAirdropDistributor with ${deployer.address}`);

  const Distributor = await ethers.getContractFactory("MerkleAirdropDistributor");
  const distributor = await Distributor.deploy(deployer.address);
  await distributor.deployed();

  const txs = [];
  txs.push(await distributor.connect(deployer).setToken(token));
  txs.push(await distributor.connect(deployer).setTreasury(treasury));
  await Promise.all(txs.map((tx) => tx.wait()));

  console.log(`MerkleAirdropDistributor deployed to ${distributor.address}`);
  await persistContract("MerkleAirdropDistributor", distributor.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
