const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const hre = require("hardhat");

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
];

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  const wallet = new hre.ethers.Wallet(pk, hre.ethers.provider);

  const tge = process.env.TGE_SALE_ADDRESS;
  const usdc = process.env.USDC_TOKEN_ADDRESS;
  if (!tge || !usdc) throw new Error("Missing TGE_SALE_ADDRESS or USDC_TOKEN_ADDRESS");

  const sale = await hre.ethers.getContractAt("TGESale", tge, wallet);
  const usdcToken = new hre.ethers.Contract(usdc, ERC20_ABI, wallet);

  const [active, start, end] = await Promise.all([sale.isSaleActive(), sale.saleStart(), sale.saleEnd()]);
  const [name, symbol, d, bal, alw] = await Promise.all([
    usdcToken.name(),
    usdcToken.symbol(),
    usdcToken.decimals(),
    usdcToken.balanceOf(wallet.address),
    usdcToken.allowance(wallet.address, tge),
  ]);

  console.log(`Sale @ ${tge} active=${active} window=[${start},${end}]`);
  console.log(`USDC @ ${usdc} ${name} (${symbol}) d=${d}`);
  console.log(`Deployer USDC balance: ${hre.ethers.utils.formatUnits(bal, d)}`);
  console.log(`Allowance to sale: ${hre.ethers.utils.formatUnits(alw, d)}`);

  if (bal.eq(0)) {
    console.log("No USDC balance. Skipping purchase. Obtain Base Sepolia USDC and re-run.");
    return;
  }

  const amount = hre.ethers.utils.parseUnits("1", d);
  if (alw.lt(amount)) {
    console.log("Approving 1 USDC to sale (reset to 0 then set)...");
    let tx = await usdcToken.approve(tge, 0);
    console.log(`Approve(0) tx: ${tx.hash}`);
    await tx.wait();
    tx = await usdcToken.approve(tge, amount);
    console.log(`Approve(1 USDC) tx: ${tx.hash}`);
    await tx.wait();
  }

  console.log("Attempting buyWithBaseToken(1 USDC) with empty proof...");
  const proof = [];
  const tx2 = await sale.buyWithBaseToken(amount, proof);
  console.log(`Purchase tx: ${tx2.hash}`);
  const rcpt = await tx2.wait();
  console.log(`Purchased in block ${rcpt.blockNumber}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


