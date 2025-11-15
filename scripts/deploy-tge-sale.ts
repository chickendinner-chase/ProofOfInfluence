import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { BigNumber } from "ethers";
import { artifacts, ethers, network } from "hardhat";

type TierConfig = {
  price: string; // USDC price per POI (6 decimals)
  amount: string; // POI allocation per tier (18 decimals)
};

type DeploymentConfig = {
  tiers: TierConfig[];
  minContribution: string;
  maxContribution: string;
  saleStart: number;
  saleEnd: number;
  whitelistEnabled: boolean;
  merkleRoot: string;
};

function loadDeploymentConfig(): DeploymentConfig {
  const defaultConfig: DeploymentConfig = {
    tiers: [
      { price: "2", amount: "500000" },
      { price: "3", amount: "250000" },
    ],
    minContribution: "0",
    maxContribution: "0",
    saleStart: 0,
    saleEnd: 0,
    whitelistEnabled: false,
    merkleRoot: ethers.constants.HashZero,
  };

  const tiersEnv = process.env.SALE_TIERS;
  const tiers: TierConfig[] = tiersEnv ? JSON.parse(tiersEnv) : defaultConfig.tiers;

  return {
    tiers,
    minContribution: process.env.SALE_MIN_CONTRIBUTION ?? defaultConfig.minContribution,
    maxContribution: process.env.SALE_MAX_CONTRIBUTION ?? defaultConfig.maxContribution,
    saleStart: process.env.SALE_START_TIMESTAMP ? Number(process.env.SALE_START_TIMESTAMP) : defaultConfig.saleStart,
    saleEnd: process.env.SALE_END_TIMESTAMP ? Number(process.env.SALE_END_TIMESTAMP) : defaultConfig.saleEnd,
    whitelistEnabled:
      process.env.SALE_WHITELIST_ENABLED !== undefined
        ? process.env.SALE_WHITELIST_ENABLED === "true"
        : defaultConfig.whitelistEnabled,
    merkleRoot: process.env.SALE_MERKLE_ROOT ?? defaultConfig.merkleRoot,
  };
}

function parseTierAmounts(tiers: TierConfig[]): { prices: BigNumber[]; supplies: BigNumber[]; total: BigNumber } {
  const prices: BigNumber[] = [];
  const supplies: BigNumber[] = [];
  let total = BigNumber.from(0);

  if (tiers.length === 0) {
    throw new Error("At least one sale tier must be configured");
  }

  for (const tier of tiers) {
    prices.push(ethers.utils.parseUnits(tier.price, 6));
    const supply = ethers.utils.parseUnits(tier.amount, 18);
    supplies.push(supply);
    total = total.add(supply);
  }

  return { prices, supplies, total };
}

async function main() {
  const usdcAddress = process.env.USDC_TOKEN_ADDRESS;
  const treasury = process.env.SALE_TREASURY_ADDRESS;

  if (!usdcAddress || !treasury) {
    throw new Error("USDC_TOKEN_ADDRESS and SALE_TREASURY_ADDRESS env vars are required");
  }

  const config = loadDeploymentConfig();
  const { prices, supplies, total } = parseTierAmounts(config.tiers);
  const minContribution = ethers.utils.parseUnits(config.minContribution, 6);
  const maxContribution = ethers.utils.parseUnits(config.maxContribution, 6);
  const merkleRoot = ethers.utils.hexZeroPad(config.merkleRoot as `0x${string}`, 32);

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with ${deployer.address} on ${network.name}`);

  const Poi = await ethers.getContractFactory("POI");
  const poi = await Poi.deploy(deployer.address, deployer.address, 0);
  await poi.deployed();
  console.log(`POI deployed at ${poi.address}`);

  const Sale = await ethers.getContractFactory("TGESale");
  const sale = await Sale.deploy(poi.address, usdcAddress, deployer.address, treasury);
  await sale.deployed();
  console.log(`TGESale deployed at ${sale.address}`);

  const configureTx = await sale.connect(deployer).configureTiers(prices, supplies);
  await configureTx.wait();

  const mintTx = await poi.connect(deployer).mint(sale.address, total);
  await mintTx.wait();

  if (!minContribution.isZero() || !maxContribution.isZero()) {
    const boundsTx = await sale.connect(deployer).setContributionBounds(minContribution, maxContribution);
    await boundsTx.wait();
  }

  if (config.saleStart !== 0 || config.saleEnd !== 0) {
    const windowTx = await sale.connect(deployer).setSaleWindow(config.saleStart, config.saleEnd);
    await windowTx.wait();
  }

  const whitelistTx = await sale.connect(deployer).setWhitelistConfig(config.whitelistEnabled, merkleRoot);
  await whitelistTx.wait();

  const outputDir = path.join(__dirname, "..", "shared", "contracts");
  mkdirSync(outputDir, { recursive: true });

  const tgeArtifact = await artifacts.readArtifact("TGESale");
  const artifactPath = path.join(outputDir, "poi_tge.json");
  const artifact = {
    name: "TGESale",
    address: sale.address,
    chainId: network.config.chainId ?? null,
    network: network.name,
    abi: tgeArtifact.abi,
    related: {
      poi: poi.address,
      usdc: usdcAddress,
      treasury,
    },
    sale: {
      whitelistEnabled: config.whitelistEnabled,
      merkleRoot,
      minContribution: minContribution.toString(),
      maxContribution: maxContribution.toString(),
      saleStart: config.saleStart,
      saleEnd: config.saleEnd,
      tiers: prices.map((price, index) => ({
        index,
        pricePerToken: price.toString(),
        remainingTokens: supplies[index].toString(),
      })),
    },
  };

  writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
  console.log(`Saved deployment artifact to ${artifactPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
