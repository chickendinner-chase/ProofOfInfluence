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
  const wallet = new hre.ethers.Wallet(pk, hre.ethers.provider);
  
  const tgeAddress = process.env.TGE_SALE_ADDRESS || "0x14A192B261AE05A85539f0e87eb4E77274636a45";
  console.log(`Connecting to TGESale at ${tgeAddress}`);
  
  const sale = await hre.ethers.getContractAt("TGESale", tgeAddress, wallet);
  
  // Check owner
  const owner = await sale.owner();
  console.log(`Contract owner: ${owner}`);
  console.log(`Wallet address: ${wallet.address}`);
  
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(`Owner mismatch! Expected ${wallet.address}, got ${owner}`);
  }
  
  // Get current sale window
  const currentStart = await sale.saleStart();
  const currentEnd = await sale.saleEnd();
  console.log(`Current sale window: start=${currentStart}, end=${currentEnd}`);
  
  // Set new sale window
  const now = Math.floor(Date.now() / 1000);
  const start = now + 60;
  const end = now + 86400;
  
  console.log(`Setting sale window: start=${start} (${new Date(start * 1000).toISOString()}), end=${end} (${new Date(end * 1000).toISOString()})`);
  
  try {
    const tx = await sale.setSaleWindow(start, end);
    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`Sale window updated successfully!`);
  } catch (error) {
    console.error(`Error setting sale window:`, error);
    if (error.reason) {
      console.error(`Reason: ${error.reason}`);
    }
    if (error.data) {
      console.error(`Data: ${error.data}`);
    }
    throw error;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

