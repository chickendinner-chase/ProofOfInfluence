import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { artifacts, ethers, network } from "hardhat";

async function main() {
  const baseUri = process.env.IMMORTALITY_BADGE_BASE_URI ?? "";
  const [deployer] = await ethers.getSigners();
  const badgeAdmin = process.env.IMMORTALITY_BADGE_ADMIN ?? deployer.address;
  const badgeUri = process.env.IMMORTALITY_BADGE_URI ?? baseUri;
  const transferable = process.env.IMMORTALITY_BADGE_TRANSFERABLE === "true";
  const externalMinter = process.env.IMMORTALITY_BADGE_MINTER;

  if (badgeAdmin !== deployer.address) {
    console.warn(
      "⚠️ Badge admin is not the deployer. The script will deploy using the specified admin but cannot configure badge types."
    );
  }

  const Badge = await ethers.getContractFactory("ImmortalityBadge");
  const badge = await Badge.deploy(baseUri, badgeAdmin);
  await badge.deployed();
  console.log(`ImmortalityBadge deployed at ${badge.address}`);

  if (badgeAdmin === deployer.address) {
    const configTx = await badge.configureBadgeType(1, [true, transferable, badgeUri]);
    await configTx.wait();
    console.log("Initialized badge type 1 (Test Immortality Badge)");
  } else {
    console.log("Please run configureBadgeType and minter role grants from the admin wallet.");
  }

  if (externalMinter && externalMinter !== badgeAdmin) {
    const grantTx = await badge.grantRole(await badge.MINTER_ROLE(), externalMinter);
    await grantTx.wait();
    console.log(`Granted MINTER_ROLE to ${externalMinter}`);
  }

  const badgeArtifact = await artifacts.readArtifact("ImmortalityBadge");
  const outputDir = path.join(__dirname, "..", "shared", "contracts");
  mkdirSync(outputDir, { recursive: true });
  const artifactPath = path.join(outputDir, "immortality_badge.json");
  writeFileSync(
    artifactPath,
    JSON.stringify(
      {
        name: "ImmortalityBadge",
        address: badge.address,
        chainId: network.config.chainId ?? null,
        network: network.name,
        abi: badgeArtifact.abi,
        metadata: {
          baseUri,
          admin: badgeAdmin,
        },
      },
      null,
      2
    )
  );
  console.log(`Saved badge artifact to ${artifactPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
