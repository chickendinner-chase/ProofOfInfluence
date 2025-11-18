const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
const dotenvResult = require("dotenv").config({ path: envPath });
if (dotenvResult.error) {
  console.warn("Warning: Failed to load .env:", dotenvResult.error.message);
} else {
  console.log("Loaded .env from:", envPath);
}
const hre = require("hardhat");

function parseCommaSeparatedNumbers(input, decimals) {
  const { utils } = hre.ethers;
  if (!input || typeof input !== "string") return [];
  return input
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((n) => utils.parseUnits(n, decimals));
}

function parseArgsOrEnv() {
  // Priority: CLI args → ENV
  // CLI usage:
  //   node scripts/configure-tge-tiers.cjs "0.5,0.75,1" "100000,200000,300000"
  // ENV usage:
  //   TGE_TIER_PRICES=0.5,0.75,1
  //   TGE_TIER_SUPPLIES=100000,200000,300000
  const [, , pricesArg, suppliesArg] = process.argv;
  const prices =
    pricesArg
      ? parseCommaSeparatedNumbers(pricesArg, 6)
      : parseCommaSeparatedNumbers(process.env.TGE_TIER_PRICES || "", 6);
  const supplies =
    suppliesArg
      ? parseCommaSeparatedNumbers(suppliesArg, 18)
      : parseCommaSeparatedNumbers(process.env.TGE_TIER_SUPPLIES || "", 18);
  return { prices, supplies, pricesRaw: pricesArg || process.env.TGE_TIER_PRICES, suppliesRaw: suppliesArg || process.env.TGE_TIER_SUPPLIES };
}

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) {
    throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  }
  const wallet = new hre.ethers.Wallet(pk, hre.ethers.provider);

  const tgeAddress = process.env.TGE_SALE_ADDRESS;
  if (!tgeAddress) {
    throw new Error("Missing TGE_SALE_ADDRESS in .env");
  }

  const { prices, supplies, pricesRaw, suppliesRaw } = parseArgsOrEnv();
  if (prices.length === 0 || supplies.length === 0) {
    throw new Error("Provide TGE tier data. CLI: \"pricesCSV\" \"suppliesCSV\" or ENV: TGE_TIER_PRICES, TGE_TIER_SUPPLIES");
  }
  if (prices.length !== supplies.length) {
    throw new Error(`Tier arrays length mismatch: prices=${prices.length}, supplies=${supplies.length}`);
  }

  console.log(`Using wallet: ${wallet.address}`);
  console.log(`TGESale: ${tgeAddress}`);
  console.log(`Tier prices (USDC 6dp): ${pricesRaw || "(parsed via ENV)"}`);
  console.log(`Tier supplies (POI 18dp): ${suppliesRaw || "(parsed via ENV)"}`);
  console.log(`Parsed prices:`, prices.map(p => p.toString()));
  console.log(`Parsed supplies:`, supplies.map(s => s.toString()));

  const sale = await hre.ethers.getContractAt("TGESale", tgeAddress, wallet);

  // Quick sanity: contract code exists
  const code = await hre.ethers.provider.getCode(tgeAddress);
  if (!code || code === "0x") {
    throw new Error(`No contract code at ${tgeAddress}`);
  }

  // Ensure owner
  const owner = await sale.owner();
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(`Owner mismatch. Contract owner=${owner}, wallet=${wallet.address}`);
  }

  // Debug: Try static call first to see if it would succeed
  console.log("Testing configureTiers with static call...");
  try {
    await sale.callStatic.configureTiers(prices, supplies);
    console.log("✓ Static call succeeded, proceeding with transaction...");
  } catch (e) {
    console.error("✗ Static call failed:");
    console.error(`  Error: ${e.message || e}`);
    if (e.error && e.error.data) {
      console.error(`  Revert data: ${e.error.data}`);
      // Try to decode revert reason
      try {
        const reason = hre.ethers.utils.toUtf8String("0x" + e.error.data.slice(138));
        console.error(`  Revert reason: ${reason}`);
      } catch (e2) {
        // Ignore decode errors
      }
    }
    throw new Error("Static call failed, aborting transaction");
  }

  console.log("Sending configureTiers transaction...");
  let tx;
  try {
    tx = await sale.configureTiers(prices, supplies);
  } catch (e) {
    console.warn("Gas estimation failed, retrying with manual gasLimit=500000 ...");
    tx = await sale.configureTiers(prices, supplies, { gasLimit: 500000 });
  }
  console.log(`Tx sent: ${tx.hash}`);
  const receipt = await tx.wait();
  
  if (receipt.status === 0) {
    throw new Error(`Transaction reverted (status: ${receipt.status})`);
  }
  
  console.log(`✓ configureTiers confirmed in block ${receipt.blockNumber}`);

  // Display resulting tier count
  const count = await sale.tierCount();
  console.log(`Tier count: ${count.toString()}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


