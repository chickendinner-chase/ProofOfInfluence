/**
 * Deploy ReferralRegistry contract
 * Run with: node scripts/deploy-referral-run.cjs
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

  console.log(`Deploying ReferralRegistry with ${wallet.address}`);
  console.log(`RPC: ${rpcUrl}`);

  const fs = require("fs");
  const artifactPath = path.join(__dirname, "../artifacts/contracts/ReferralRegistry.sol/ReferralRegistry.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const Registry = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const registry = await Registry.deploy(wallet.address);
  await registry.deployed();

  console.log(`✅ ReferralRegistry deployed to ${registry.address}`);
  console.log(`Set in .env: REFERRAL_REGISTRY_ADDRESS=${registry.address}`);

  // Set reward token if POI_TOKEN_ADDRESS is set
  const tokenAddress = process.env.POI_TOKEN_ADDRESS || process.env.POI_ADDRESS;
  if (tokenAddress && tokenAddress !== "0x0000000000000000000000000000000000000000") {
    console.log(`Setting reward token to ${tokenAddress}...`);
    const tx = await registry.setRewardToken(tokenAddress);
    await tx.wait();
    console.log(`✅ Reward token set`);
  }

  // Persist contract address
  const network = await provider.getNetwork();
  persistContract(
    "ReferralRegistry",
    registry.address,
    network.chainId,
    network.name,
    {
      rewardToken: tokenAddress || null,
    }
  );

  // Verify contract code exists
  const code = await provider.getCode(registry.address);
  console.log(`Code size at ${registry.address}: ${code.length / 2 - 1} bytes`);
  if (!code || code === "0x" || code === "0X") {
    throw new Error(`No contract code at ${registry.address}. Deployment likely failed.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

