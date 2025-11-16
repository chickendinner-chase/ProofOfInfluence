const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const { ethers } = require("ethers");

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY");
  
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);

  console.log(`Deploying EarlyBirdAllowlist with ${wallet.address}`);
  console.log(`RPC: ${rpcUrl}`);

  // Load contract ABI and bytecode
  const fs = require("fs");
  const artifactPath = path.join(__dirname, "../artifacts/contracts/EarlyBirdAllowlist.sol/EarlyBirdAllowlist.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  const Allowlist = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const allowlist = await Allowlist.deploy(wallet.address);
  await allowlist.deployed();

  console.log(`✅ EarlyBirdAllowlist deployed to ${allowlist.address}`);
  console.log(`Set in .env: EARLY_BIRD_ALLOWLIST_ADDRESS=${allowlist.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

