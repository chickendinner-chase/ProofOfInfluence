/**
 * Deploy ImmortalityBadge contract
 * Run with: node scripts/deploy-immortality-badge-run.cjs
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

  const baseUri = process.env.IMMORTALITY_BADGE_BASE_URI || "";
  const admin = process.env.IMMORTALITY_BADGE_ADMIN || wallet.address;

  console.log(`Deploying ImmortalityBadge with ${wallet.address}`);
  console.log(`Base URI: ${baseUri || "(empty)"}`);
  console.log(`Admin: ${admin}`);
  console.log(`RPC: ${rpcUrl}`);

  const fs = require("fs");
  const artifactPath = path.join(__dirname, "../artifacts/contracts/ImmortalityBadge.sol/ImmortalityBadge.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const Badge = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const badge = await Badge.deploy(baseUri, admin);
  console.log(`Deployment transaction: ${badge.deployTransaction.hash}`);
  console.log(`Waiting for deployment confirmation...`);
  
  // 等待部署交易被确认
  const deployReceipt = await badge.deployTransaction.wait();
  console.log(`✓ Deployment confirmed in block ${deployReceipt.blockNumber}`);
  
  // 确保合约完全部署
  await badge.deployed();
  console.log(`✅ ImmortalityBadge deployed to ${badge.address}`);
  console.log(`Set in .env: IMMORTALITY_BADGE_ADDRESS=${badge.address}`);

  // 验证合约代码存在（带重试机制）
  let code = await provider.getCode(badge.address);
  let retries = 0;
  const maxRetries = 5;

  while ((!code || code === "0x" || code === "0X") && retries < maxRetries) {
    retries++;
    console.log(`Waiting for contract code... (retry ${retries}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 等待 2 秒
    code = await provider.getCode(badge.address);
  }

  console.log(`Code size at ${badge.address}: ${code.length / 2 - 1} bytes`);
  if (!code || code === "0x" || code === "0X") {
    throw new Error(`No contract code at ${badge.address} after ${maxRetries} retries. Deployment may have failed. Transaction: ${badge.deployTransaction.hash}`);
  }

  // Get network info
  const network = await provider.getNetwork();
  const chainId = network.chainId;

  // Persist contract address
  persistContract(
    "ImmortalityBadge",
    badge.address,
    chainId,
    network.name,
    {
      metadata: {
        baseUri,
        admin,
      },
    }
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

