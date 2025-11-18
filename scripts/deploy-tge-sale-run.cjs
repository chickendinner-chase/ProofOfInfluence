const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
const dotenvResult = require("dotenv").config({ path: envPath });
if (dotenvResult.error) {
  console.warn("Warning: Failed to load .env:", dotenvResult.error.message);
} else {
  console.log("Loaded .env from:", envPath);
}
const hre = require("hardhat");
const { persistContract } = require("./utils/persist-contract.cjs");

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

  // Load TGE config from tokenomics.config.json (with env override)
  const { getTGESaleConfig } = require("./utils/tokenomics.cjs");
  const tgeConfig = getTGESaleConfig();
  
  const TGE = await hre.ethers.getContractFactory("TGESale", wallet);
  const now = Math.floor(Date.now() / 1000);
  const start = tgeConfig.saleStart > 0 ? tgeConfig.saleStart : now + 60;
  const end = tgeConfig.saleEnd > 0 ? tgeConfig.saleEnd : now + 86400;
  
  console.log(`TGE Config from tokenomics.config.json:`);
  console.log(`  Tiers: ${tgeConfig.tiers.length} tier(s)`);
  console.log(`  Sale window: ${start} - ${end} (0 = disabled)`);
  
  const sale = await TGE.deploy(poi, usdc, wallet.address, treasury);
  console.log(`Deployment transaction: ${sale.deployTransaction.hash}`);
  console.log(`Waiting for deployment confirmation...`);
  
  // 等待部署交易被确认
  const deployReceipt = await sale.deployTransaction.wait();
  console.log(`✓ Deployment confirmed in block ${deployReceipt.blockNumber}`);
  
  // 确保合约完全部署
  await sale.deployed();
  console.log(`TGESale deployed to ${sale.address}`);
  console.log(`Deployer address: ${wallet.address}`);

  // 验证合约代码存在（带重试机制）
  let code = await hre.ethers.provider.getCode(sale.address);
  let retries = 0;
  const maxRetries = 5;

  while ((!code || code === "0x" || code === "0X") && retries < maxRetries) {
    retries++;
    console.log(`Waiting for contract code... (retry ${retries}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 等待 2 秒
    code = await hre.ethers.provider.getCode(sale.address);
  }

  console.log(`Code size at ${sale.address}: ${code.length / 2 - 1} bytes`);
  if (!code || code === "0x" || code === "0X") {
    throw new Error(`No contract code at ${sale.address} after ${maxRetries} retries. Deployment may have failed. Transaction: ${sale.deployTransaction.hash}`);
  }
  
  // Verify owner is set correctly
  const owner = await sale.owner();
  console.log(`Contract owner: ${owner}`);
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(`Owner mismatch! Expected ${wallet.address}, got ${owner}`);
  }
  
  // Reconnect contract instance to wallet to ensure correct signer
  const saleWithSigner = sale.connect(wallet);
  
  // Configure tiers and sale window from config
  if (tgeConfig.tiers && tgeConfig.tiers.length > 0) {
    const { utils } = hre.ethers;
    const prices = tgeConfig.tiers.map((t) => utils.parseUnits(t.price, 6));
    const supplies = tgeConfig.tiers.map((t) => utils.parseUnits(t.amount, 18));
    
    console.log(`\nConfiguring tiers...`);
    try {
      const configureTx = await saleWithSigner.configureTiers(prices, supplies, { gasLimit: 500000 });
      await configureTx.wait();
      console.log(`✓ Tiers configured: ${tgeConfig.tiers.length} tier(s)`);
    } catch (error) {
      console.warn(`⚠️  Failed to configure tiers: ${error.message}`);
      console.log(`   You can configure tiers later using: scripts/configure-tge-tiers.cjs`);
    }
  }

  // Set sale window
  if (start > 0 || end > 0) {
    try {
      const tx = await saleWithSigner.setSaleWindow(start, end);
      await tx.wait();
      console.log(`✓ Sale window set: start=${start}, end=${end}`);
    } catch (error) {
      console.warn(`⚠️  Failed to set sale window: ${error.message}`);
      console.log(`   You can set it later using: sale.setSaleWindow(${start}, ${end})`);
    }
  }

  // Set contribution bounds
  const minContribution = hre.ethers.utils.parseUnits(tgeConfig.minContribution, 6);
  const maxContribution = hre.ethers.utils.parseUnits(tgeConfig.maxContribution, 6);
  if (!minContribution.isZero() || !maxContribution.isZero()) {
    try {
      const boundsTx = await saleWithSigner.setContributionBounds(minContribution, maxContribution);
      await boundsTx.wait();
      console.log(`✓ Contribution bounds set: min=${tgeConfig.minContribution}, max=${tgeConfig.maxContribution} USDC`);
    } catch (error) {
      console.warn(`⚠️  Failed to set contribution bounds: ${error.message}`);
    }
  }

  // Set whitelist config
  if (tgeConfig.whitelistEnabled && tgeConfig.merkleRoot) {
    try {
      const whitelistTx = await saleWithSigner.setWhitelistConfig(true, tgeConfig.merkleRoot);
      await whitelistTx.wait();
      console.log(`✓ Whitelist enabled with root: ${tgeConfig.merkleRoot}`);
    } catch (error) {
      console.warn(`⚠️  Failed to set whitelist: ${error.message}`);
    }
  }

  // Persist contract address
  const network = await hre.ethers.provider.getNetwork();
  const { utils } = hre.ethers;
  const prices = tgeConfig.tiers.map((t) => utils.parseUnits(t.price, 6));
  const supplies = tgeConfig.tiers.map((t) => utils.parseUnits(t.amount, 18));
  
  persistContract(
    "TGESale",
    sale.address,
    network.chainId,
    hre.network.name,
    {
      related: {
        poi: poi,
        usdc: usdc,
        treasury: treasury,
      },
      sale: {
        whitelistEnabled: tgeConfig.whitelistEnabled,
        merkleRoot: tgeConfig.merkleRoot,
        minContribution: tgeConfig.minContribution,
        maxContribution: tgeConfig.maxContribution,
        saleStart: start,
        saleEnd: end,
        tiers: prices.map((price, index) => ({
          index,
          pricePerToken: price.toString(),
          remainingTokens: supplies[index].toString(),
        })),
      },
    }
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


