import { ethers } from "hardhat";

async function main() {
  const badgeAddress = process.env.IMMORTALITY_BADGE_ADDRESS;
  const recipient = process.env.BADGE_RECIPIENT_ADDRESS;
  const badgeType = process.env.BADGE_TYPE ? Number(process.env.BADGE_TYPE) : 1;

  if (!badgeAddress || !recipient) {
    throw new Error("IMMORTALITY_BADGE_ADDRESS and BADGE_RECIPIENT_ADDRESS env vars are required");
  }

  const badge = await ethers.getContractAt("ImmortalityBadge", badgeAddress);
  const tx = await badge.mintBadge(recipient, badgeType);
  const receipt = await tx.wait();
  console.log(`Minted badge type ${badgeType} to ${recipient}. Tx: ${receipt.transactionHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
