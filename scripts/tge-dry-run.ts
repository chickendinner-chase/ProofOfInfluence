import { ethers, network } from "hardhat";

const erc20Abi = [
  "function approve(address spender, uint256 value) external returns (bool)",
  "function balanceOf(address owner) external view returns (uint256)",
];

async function main() {
  const saleAddress = process.env.POI_TGE_ADDRESS;
  const usdcAddress = process.env.USDC_TOKEN_ADDRESS;
  const amount = process.env.TGE_DRY_RUN_AMOUNT ?? "1";
  const proofEnv = process.env.TGE_DRY_RUN_PROOF;

  if (!saleAddress || !usdcAddress) {
    throw new Error("POI_TGE_ADDRESS and USDC_TOKEN_ADDRESS env vars are required");
  }

  const [caller] = await ethers.getSigners();
  const sale = await ethers.getContractAt("TGESale", saleAddress);
  const usdc = new ethers.Contract(usdcAddress, erc20Abi, caller);
  const usdcAmount = ethers.utils.parseUnits(amount, 6);
  const proof = proofEnv ? (JSON.parse(proofEnv) as string[]) : [];

  console.log(`Running TGE dry run on ${network.name} as ${caller.address}`);
  console.log(`Sale active: ${await sale.isSaleActive()}`);
  console.log(`Remaining allowance: ${await sale["maxContribution(address)"](caller.address)}`);

  const balance = await usdc.balanceOf(caller.address);
  if (balance.lt(usdcAmount)) {
    throw new Error("Caller balance is insufficient for the requested contribution");
  }

  await usdc.approve(saleAddress, usdcAmount);
  const tx = await sale.buyWithBaseToken(usdcAmount, proof);
  const receipt = await tx.wait();
  console.log(`Dry run purchase confirmed in tx ${receipt.transactionHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
