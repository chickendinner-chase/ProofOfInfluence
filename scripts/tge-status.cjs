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
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  const wallet = new hre.ethers.Wallet(pk, hre.ethers.provider);

  const tge = process.env.TGE_SALE_ADDRESS;
  if (!tge) throw new Error("Missing TGE_SALE_ADDRESS");

  const sale = await hre.ethers.getContractAt("TGESale", tge, wallet);
  const owner = await sale.owner();
  const saleStart = await sale.saleStart();
  const saleEnd = await sale.saleEnd();
  const active = await sale.isSaleActive();
  const tiers = await sale.tierCount();
  const view = await sale.getSaleView(wallet.address);

  console.log(`TGESale: ${tge}`);
  console.log(`Owner: ${owner}`);
  console.log(`Sale window: start=${saleStart.toString()} end=${saleEnd.toString()}`);
  console.log(`isActive: ${active}`);
  console.log(`tierCount: ${tiers.toString()}`);
  console.log(`SaleView:`, {
    currentTier: view.currentTier.toString(),
    tierPrice: hre.ethers.utils.formatUnits(view.tierPrice, 6),
    tierRemaining: hre.ethers.utils.formatUnits(view.tierRemaining, 18),
    minContribution: hre.ethers.utils.formatUnits(view.minContribution, 6),
    maxContribution: hre.ethers.utils.formatUnits(view.maxContribution, 6),
    userContributed: hre.ethers.utils.formatUnits(view.userContributed, 6),
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


