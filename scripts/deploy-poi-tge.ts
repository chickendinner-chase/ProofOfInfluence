import fs from "fs";
import path from "path";
import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";

import { saleConfig } from "./config/poiSaleConfig";

async function main() {
  const [deployer] = await ethers.getSigners();

  if (!ethers.utils.isAddress(saleConfig.usdcAddress)) {
    throw new Error("Invalid USDC address in saleConfig");
  }
  if (saleConfig.usdcAddress === ethers.constants.AddressZero) {
    throw new Error("USDC address cannot be zero");
  }
  if (!ethers.utils.isAddress(saleConfig.treasury)) {
    throw new Error("Invalid treasury address in saleConfig");
  }
  if (saleConfig.treasury === ethers.constants.AddressZero) {
    throw new Error("Treasury address cannot be zero");
  }

  const saleOwner = saleConfig.saleOwner ?? deployer.address;
  if (!ethers.utils.isAddress(saleOwner)) {
    throw new Error("Invalid sale owner address in saleConfig");
  }

  const tokenAdmin = saleConfig.tokenAdmin ?? deployer.address;
  if (!ethers.utils.isAddress(tokenAdmin)) {
    throw new Error("Invalid token admin address in saleConfig");
  }

  const poiInitialRecipient = saleConfig.initialPoiRecipient ?? deployer.address;
  if (!ethers.utils.isAddress(poiInitialRecipient)) {
    throw new Error("Invalid initial POI recipient address in saleConfig");
  }
  if (poiInitialRecipient === ethers.constants.AddressZero) {
    throw new Error("Initial POI recipient cannot be zero");
  }

  if (saleConfig.whitelistEnabled) {
    if (!ethers.utils.isHexString(saleConfig.merkleRoot, 32)) {
      throw new Error("Invalid merkleRoot for whitelist configuration");
    }
  }

  if (!saleConfig.tiers.length) {
    throw new Error("At least one tier is required");
  }

  const initialPoiSupply = BigNumber.from(saleConfig.initialPoiSupply ?? "0");

  console.log(`Deploying with signer ${deployer.address}`);

  const Poi = await ethers.getContractFactory("POI");
  const poi = await Poi.deploy(tokenAdmin, poiInitialRecipient, initialPoiSupply);
  await poi.deployed();
  console.log(`POI deployed at ${poi.address}`);

  const totalTierAllocation = saleConfig.tiers.reduce((acc, tier) => {
    return acc.add(BigNumber.from(tier.allocation));
  }, BigNumber.from(0));

  const Sale = await ethers.getContractFactory("TGESale");
  const sale = await Sale.deploy(poi.address, saleConfig.usdcAddress, saleOwner, saleConfig.treasury);
  await sale.deployed();
  console.log(`TGESale deployed at ${sale.address}`);

  if (totalTierAllocation.gt(0)) {
    const tx = await poi.mint(sale.address, totalTierAllocation);
    await tx.wait();
    console.log(`Funded sale with ${totalTierAllocation.toString()} POI`);
  }

  const tierPrices = saleConfig.tiers.map((tier) => {
    if (!tier.price) {
      throw new Error("Tier price must be provided");
    }
    return BigNumber.from(tier.price);
  });
  const tierSupplies = saleConfig.tiers.map((tier) => {
    if (!tier.allocation) {
      throw new Error("Tier allocation must be provided");
    }
    return BigNumber.from(tier.allocation);
  });
  const configureTx = await sale.configureTiers(tierPrices, tierSupplies);
  await configureTx.wait();
  console.log(`Configured ${saleConfig.tiers.length} sale tiers`);

  const boundsTx = await sale.setContributionBounds(
    BigNumber.from(saleConfig.minContribution),
    BigNumber.from(saleConfig.maxContribution)
  );
  await boundsTx.wait();
  console.log("Contribution bounds set");

  const windowTx = await sale.setSaleWindow(saleConfig.startTime, saleConfig.endTime);
  await windowTx.wait();
  console.log("Sale window configured");

  const whitelistTx = await sale.setWhitelistConfig(
    saleConfig.whitelistEnabled,
    saleConfig.whitelistEnabled
      ? (saleConfig.merkleRoot as `0x${string}`)
      : ethers.constants.HashZero
  );
  await whitelistTx.wait();
  console.log("Whitelist configuration applied");

  const networkInfo = await deployer.provider!.getNetwork();

  const output = {
    network: network.name,
    chainId: networkInfo.chainId.toString(),
    poiToken: poi.address,
    tgeSale: sale.address,
    usdc: saleConfig.usdcAddress,
    treasury: saleConfig.treasury,
    whitelistEnabled: saleConfig.whitelistEnabled,
    merkleRoot: saleConfig.whitelistEnabled ? saleConfig.merkleRoot : ethers.constants.HashZero,
    minContribution: saleConfig.minContribution,
    maxContribution: saleConfig.maxContribution,
    startTime: saleConfig.startTime,
    endTime: saleConfig.endTime,
    tiers: saleConfig.tiers
  };

  const outputPath = path.resolve(__dirname, "../shared/contracts/poi_tge.json");
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Deployment config written to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
