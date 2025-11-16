const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const hre = require("hardhat");

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  const wallet = new hre.ethers.Wallet(pk, hre.ethers.provider);

  const poi = process.env.POI_ADDRESS;
  if (!poi) throw new Error("Missing POI_ADDRESS");

  const token = new hre.ethers.Contract(poi, ERC20_ABI, wallet);
  const [name, symbol, decimals, supply, bal] = await Promise.all([
    token.name(),
    token.symbol(),
    token.decimals(),
    token.totalSupply(),
    token.balanceOf(wallet.address),
  ]);

  console.log(`POI @ ${poi}`);
  console.log(`Name: ${name} (${symbol}), Decimals: ${decimals}`);
  console.log(`Total Supply: ${hre.ethers.utils.formatUnits(supply, decimals)}`);
  console.log(`Deployer Balance: ${hre.ethers.utils.formatUnits(bal, decimals)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


