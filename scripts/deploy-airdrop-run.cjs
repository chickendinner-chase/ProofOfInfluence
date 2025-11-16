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

  const token = process.env.POI_TOKEN_ADDRESS || process.env.POI_ADDRESS;
  const treasury = process.env.TREASURY_ADDRESS || wallet.address; // Use deployer as treasury if not set
  if (!token) {
    throw new Error("POI_TOKEN_ADDRESS or POI_ADDRESS env var is required");
  }

  console.log(`Deploying MerkleAirdropDistributor with ${wallet.address}`);
  console.log(`Token address: ${token}`);
  console.log(`Treasury address: ${treasury}`);
  console.log(`RPC: ${rpcUrl}`);

  // Load contract ABI and bytecode
  const fs = require("fs");
  const artifactPath = path.join(__dirname, "../artifacts/contracts/MerkleAirdropDistributor.sol/MerkleAirdropDistributor.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  const Distributor = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const distributor = await Distributor.deploy(wallet.address);
  await distributor.deployed();

  console.log(`✅ MerkleAirdropDistributor deployed to ${distributor.address}`);

  // Set token and treasury
  console.log(`Setting token and treasury...`);
  const txs = [];
  txs.push(await distributor.connect(wallet).setToken(token));
  txs.push(await distributor.connect(wallet).setTreasury(treasury));
  await Promise.all(txs.map((tx) => tx.wait()));

  console.log(`✅ Token and treasury configured`);
  console.log(`Set in .env: MERKLE_AIRDROP_ADDRESS=${distributor.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

