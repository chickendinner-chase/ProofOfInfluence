import { ethers } from "hardhat";

async function main() {
  const poi = process.env.POI_TOKEN_ADDRESS;
  const usdc = process.env.USDC_TOKEN_ADDRESS;
  const treasury = process.env.SALE_TREASURY_ADDRESS;

  if (!poi || !usdc || !treasury) {
    throw new Error("POI_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS and SALE_TREASURY_ADDRESS env vars are required");
  }

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying TGESale with ${deployer.address}`);

  const Sale = await ethers.getContractFactory("TGESale");
  const sale = await Sale.deploy(poi, usdc, deployer.address, treasury);
  await sale.deployed();

  console.log(`TGESale deployed to ${sale.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
