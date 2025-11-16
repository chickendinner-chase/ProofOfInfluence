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

  // CLI: min max (USDC 6 decimals); max=0 means no cap
  const [, , minArg, maxArg] = process.argv;
  const minStr = minArg ?? process.env.TGE_MIN_CONTRIB ?? "0";
  const maxStr = maxArg ?? process.env.TGE_MAX_CONTRIB ?? "0";

  const min = hre.ethers.utils.parseUnits(minStr, 6);
  const max = hre.ethers.utils.parseUnits(maxStr, 6);

  console.log(`Wallet: ${wallet.address}`);
  console.log(`TGESale: ${tge}`);
  console.log(`Setting contribution bounds: min=${minStr} USDC, max=${maxStr} USDC`);

  const sale = await hre.ethers.getContractAt("TGESale", tge, wallet);
  const owner = await sale.owner();
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(`Owner mismatch. Contract owner=${owner}, wallet=${wallet.address}`);
  }

  const tx = await sale.setContributionBounds(min, max);
  console.log(`Tx: ${tx.hash}`);
  const rcpt = await tx.wait();
  console.log(`Bounds set in block ${rcpt.blockNumber}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


