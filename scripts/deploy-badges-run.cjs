/**
 * Deploy AchievementBadges contract
 * Run with: node scripts/deploy-badges-run.cjs
 */

const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const { ethers } = require("ethers");
const { persistContract } = require("./utils/persist-contract.cjs");

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");

  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);

  const name = process.env.BADGES_NAME || "POI Achievement Badges";
  const symbol = process.env.BADGES_SYMBOL || "POIAB";

  console.log(`Deploying AchievementBadges with ${wallet.address}`);
  console.log(`Name: ${name}, Symbol: ${symbol}`);
  console.log(`RPC: ${rpcUrl}`);

  const fs = require("fs");
  const artifactPath = path.join(__dirname, "../artifacts/contracts/AchievementBadges.sol/AchievementBadges.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const Badges = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const badges = await Badges.deploy(name, symbol, wallet.address);
  console.log(`Deployment transaction: ${badges.deployTransaction.hash}`);
  console.log(`Waiting for deployment confirmation...`);
  
  // 等待部署交易被确认
  const deployReceipt = await badges.deployTransaction.wait();
  console.log(`✓ Deployment confirmed in block ${deployReceipt.blockNumber}`);
  
  // 确保合约完全部署
  await badges.deployed();
  console.log(`✅ AchievementBadges deployed to ${badges.address}`);
  console.log(`Set in .env: ACHIEVEMENT_BADGES_ADDRESS=${badges.address}`);

  // 验证合约代码存在（带重试机制）
  let code = await provider.getCode(badges.address);
  let retries = 0;
  const maxRetries = 5;

  while ((!code || code === "0x" || code === "0X") && retries < maxRetries) {
    retries++;
    console.log(`Waiting for contract code... (retry ${retries}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 等待 2 秒
    code = await provider.getCode(badges.address);
  }

  console.log(`Code size at ${badges.address}: ${code.length / 2 - 1} bytes`);
  if (!code || code === "0x" || code === "0X") {
    throw new Error(`No contract code at ${badges.address} after ${maxRetries} retries. Deployment may have failed. Transaction: ${badges.deployTransaction.hash}`);
  }

  // Persist contract address
  const network = await provider.getNetwork();
  persistContract(
    "AchievementBadges",
    badges.address,
    network.chainId,
    network.name,
    {
      metadata: {
        name,
        symbol,
        admin: wallet.address,
      },
    }
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

