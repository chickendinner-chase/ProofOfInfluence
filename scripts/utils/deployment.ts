import fs from "fs";
import path from "path";
import { artifacts, ethers } from "hardhat";

const OUTPUT_FILES: Record<string, string> = {
  POIToken: "poi.json",
  VestingVault: "vesting_vault.json",
  MerkleAirdropDistributor: "merkle_airdrop.json",
  EarlyBirdAllowlist: "early_bird_allowlist.json",
  ReferralRegistry: "referral_registry.json",
  AchievementBadges: "achievement_badges.json",
};

export async function persistContract(contractName: keyof typeof OUTPUT_FILES, address: string) {
  const artifact = await artifacts.readArtifact(contractName);
  const network = await ethers.provider.getNetwork();
  const payload = {
    name: contractName,
    address,
    chainId: Number(network.chainId),
    network: network.name,
    abi: artifact.abi,
  };

  const outputPath = path.join(process.cwd(), "shared", "contracts", OUTPUT_FILES[contractName]);
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.promises.writeFile(outputPath, JSON.stringify(payload, null, 2));
  console.log(`Saved deployment metadata to ${outputPath}`);
}
