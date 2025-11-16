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

  const poi = process.env.POI_ADDRESS;
  const tge = process.env.TGE_SALE_ADDRESS;
  if (!poi || !tge) throw new Error("Missing POI_ADDRESS or TGE_SALE_ADDRESS");

  const [, , amountArg] = process.argv;
  const amountStr = amountArg || process.env.TGE_FUND_POI;
  if (!amountStr) throw new Error('Provide amount: CLI "amountPOI" or ENV TGE_FUND_POI');

  const amount = hre.ethers.utils.parseUnits(amountStr, 18);

  console.log(`Funder: ${wallet.address}`);
  console.log(`POI: ${poi}`);
  console.log(`TGESale: ${tge}`);
  console.log(`Transfer POI amount: ${amountStr}`);

  const code = await hre.ethers.provider.getCode(tge);
  if (!code || code === "0x") throw new Error(`No contract code at ${tge}`);

  const token = await hre.ethers.getContractAt("IERC20", poi, wallet);
  const bal = await token.balanceOf(wallet.address);
  console.log(`Deployer POI balance: ${hre.ethers.utils.formatUnits(bal, 18)}`);
  if (bal.lt(amount)) throw new Error("Insufficient POI balance to fund sale");

  const tx = await token.transfer(tge, amount);
  console.log(`Transfer tx: ${tx.hash}`);
  const rcpt = await tx.wait();
  console.log(`Funded in block ${rcpt.blockNumber}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


