const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath });
const { ethers } = require("ethers");

function buildLeaf(index, account, amount) {
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["uint256", "address", "uint256"],
    [index, account, amount]
  );
  const firstHash = ethers.utils.keccak256(encoded);
  return ethers.utils.keccak256(ethers.utils.hexConcat([firstHash]));
}

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);

  const fs = require("fs");
  const airdropArtifact = JSON.parse(fs.readFileSync(
    path.join(__dirname, "../artifacts/contracts/MerkleAirdropDistributor.sol/MerkleAirdropDistributor.json"),
    "utf8"
  ));
  const poiAbi = ["function balanceOf(address) view returns (uint256)"];
  
  const poiTokenAddr = process.env.POI_TOKEN_ADDRESS || process.env.POI_ADDRESS;
  const airdropAddr = process.env.MERKLE_AIRDROP_ADDRESS;
  
  if (!poiTokenAddr) throw new Error("Missing POI_TOKEN_ADDRESS");
  if (!airdropAddr) throw new Error("Missing MERKLE_AIRDROP_ADDRESS");
  
  const poiToken = new ethers.Contract(poiTokenAddr, poiAbi, provider);
  const airdrop = new ethers.Contract(airdropAddr, airdropArtifact.abi, wallet);

  const currentRound = await airdrop.currentRound();
  const testIndex = 0;
  const testAmount = ethers.utils.parseEther("100");
  const testLeaf = buildLeaf(testIndex, wallet.address, testAmount);
  const root = await airdrop.rootOf(currentRound);

  console.log("=== Final Airdrop Claim Test ===");
  console.log(`Round: ${currentRound.toString()}`);
  console.log(`Root: ${root}`);
  console.log(`Test leaf: ${testLeaf}`);
  console.log(`Root matches: ${root.toLowerCase() === testLeaf.toLowerCase()}`);

  const isClaimed = await airdrop.isClaimed(currentRound, testIndex);
  console.log(`Already claimed: ${isClaimed}`);

  if (!isClaimed && root.toLowerCase() === testLeaf.toLowerCase()) {
    const balanceBefore = await poiToken.balanceOf(wallet.address);
    console.log(`\nBalance before: ${ethers.utils.formatUnits(balanceBefore, 18)} POI`);
    console.log("Claiming...");
    
    const tx = await airdrop.claim(testIndex, wallet.address, testAmount, []);
    console.log(`Tx sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Claimed! Block: ${receipt.blockNumber}`);
    
    const balanceAfter = await poiToken.balanceOf(wallet.address);
    const increased = balanceAfter.sub(balanceBefore);
    console.log(`Balance after: ${ethers.utils.formatUnits(balanceAfter, 18)} POI`);
    console.log(`Increased: ${ethers.utils.formatUnits(increased, 18)} POI`);
  } else {
    console.log("\n⚠️  Cannot claim (already claimed or root mismatch)");
  }
}

main().catch(console.error);

