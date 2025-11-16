const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
const dotenvResult = require("dotenv").config({ path: envPath });
if (dotenvResult.error) {
  console.warn("Warning: Failed to load .env:", dotenvResult.error.message);
} else {
  console.log("Loaded .env from:", envPath);
}
const hre = require("hardhat");

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) {
    throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  }
  // Use Hardhat's configured provider (already set up via --network flag)
  const wallet = new hre.ethers.Wallet(pk, hre.ethers.provider);

  const usdc = process.env.USDC_TOKEN_ADDRESS;
  const poi = process.env.POI_ADDRESS;
  const treasury = (process.env.TGE_TREASURY || wallet.address).replace(/^["']|["']$/g, "");
  if (!usdc || !poi) {
    throw new Error("USDC_TOKEN_ADDRESS and POI_ADDRESS are required");
  }
  console.log(`Deploying TGESale with USDC=${usdc}, POI=${poi}, treasury=${treasury}`);

  const TGE = await hre.ethers.getContractFactory("TGESale", wallet);
  const now = Math.floor(Date.now() / 1000);
  const start = now + 60;
  const end = now + 86400;
  const sale = await TGE.deploy(poi, usdc, wallet.address, treasury);
  await sale.deployed();
  console.log(`TGESale deployed to ${sale.address}`);
  console.log(`Deployer address: ${wallet.address}`);

  // Sanity check: ensure contract code exists at address
  const code = await hre.ethers.provider.getCode(sale.address);
  console.log(`Code size at ${sale.address}: ${code.length / 2 - 1} bytes`);
  if (!code || code === "0x" || code === "0X") {
    throw new Error(`No contract code at ${sale.address}. Deployment likely failed.`);
  }
  
  // Verify owner is set correctly
  const owner = await sale.owner();
  console.log(`Contract owner: ${owner}`);
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(`Owner mismatch! Expected ${wallet.address}, got ${owner}`);
  }
  
  // Reconnect contract instance to wallet to ensure correct signer
  const saleWithSigner = sale.connect(wallet);
  
  // Optionally configure basic sale window; tiers should be configured later via scripts/ops
  try {
    const tx = await saleWithSigner.setSaleWindow(start, end);
    await tx.wait();
    console.log(`Sale window set: start=${start}, end=${end}`);
  } catch (error) {
    console.warn(`Warning: Failed to set sale window: ${error.message}`);
    console.log(`You can set it later using: sale.setSaleWindow(${start}, ${end})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


