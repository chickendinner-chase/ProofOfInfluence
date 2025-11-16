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
  const poiAddr = (await sale.poiToken?.().catch(() => null)) || process.env.POI_ADDRESS;
  const poiToken = poiAddr
    ? new hre.ethers.Contract(poiAddr, ["function balanceOf(address) view returns (uint256)"], wallet)
    : null;

  const d = await usdcToken.decimals();
  const amount = hre.ethers.utils.parseUnits(process.env.PURCHASE_USDC_AMOUNT || "1", d);
  const times = parseInt(process.env.PURCHASE_TIMES || "3", 10);

  const [userUSDCBefore, saleUSDCBefore, userPOIBefore, saleViewBefore] = await Promise.all([
    usdcToken.balanceOf(wallet.address),
    usdcToken.balanceOf(tge),
    poiToken ? poiToken.balanceOf(wallet.address) : Promise.resolve(hre.ethers.constants.Zero),
    sale.getSaleView(wallet.address),
  ]);
  console.log(`Before: user USDC=${hre.ethers.utils.formatUnits(userUSDCBefore, d)}, sale USDC=${hre.ethers.utils.formatUnits(saleUSDCBefore, d)}`);
  console.log(`Before: user POI=${hre.ethers.utils.formatUnits(userPOIBefore, 18)}`);
  console.log(`Before: tier=${saleViewBefore.currentTier} price=${hre.ethers.utils.formatUnits(saleViewBefore.tierPrice, 6)} remaining=${hre.ethers.utils.formatUnits(saleViewBefore.tierRemaining, 18)}`);

  // Ensure allowance for N purchases
  const needed = amount.mul(times);
  let alw = await usdcToken.allowance(wallet.address, tge);
  if (alw.lt(needed)) {
    console.log(`Setting allowance to ${hre.ethers.utils.formatUnits(needed, d)} USDC (reset then set)`);
    let tx = await usdcToken.approve(tge, 0);
    await tx.wait();
    tx = await usdcToken.approve(tge, needed);
    await tx.wait();
  }

  for (let i = 0; i < times; i++) {
    const tx = await sale.buyWithBaseToken(amount, []);
    console.log(`Purchase ${i + 1}/${times} tx: ${tx.hash}`);
    await tx.wait();
  }

  const [userUSDCAfter, saleUSDCAfter, userPOIAfter, saleViewAfter] = await Promise.all([
    usdcToken.balanceOf(wallet.address),
    usdcToken.balanceOf(tge),
    poiToken ? poiToken.balanceOf(wallet.address) : Promise.resolve(hre.ethers.constants.Zero),
    sale.getSaleView(wallet.address),
  ]);
  console.log(`After: user USDC=${hre.ethers.utils.formatUnits(userUSDCAfter, d)}, sale USDC=${hre.ethers.utils.formatUnits(saleUSDCAfter, d)}`);
  console.log(`After: user POI=${hre.ethers.utils.formatUnits(userPOIAfter, 18)}`);
  console.log(`After: tier=${saleViewAfter.currentTier} price=${hre.ethers.utils.formatUnits(saleViewAfter.tierPrice, 6)} remaining=${hre.ethers.utils.formatUnits(saleViewAfter.tierRemaining, 18)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


