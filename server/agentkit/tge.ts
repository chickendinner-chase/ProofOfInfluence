import { BigNumber, Contract, providers, utils } from "ethers";
import tgeConfig from "@shared/contracts/poi_tge.json";
import { getAgentKitContext } from "./agentkitClient";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const DEFAULT_RPC_URL =
  process.env.AGENTKIT_CHAIN_RPC_URL ||
  process.env.TGE_RPC_URL ||
  process.env.BASE_RPC_URL ||
  process.env.VITE_BASE_RPC_URL ||
  "https://sepolia.base.org";

let rpcProvider: providers.JsonRpcProvider | null = null;

function getProvider(): providers.JsonRpcProvider {
  if (!rpcProvider) {
    if (!DEFAULT_RPC_URL) {
      throw new Error("AgentKit RPC URL is not configured");
    }
    rpcProvider = new providers.JsonRpcProvider(DEFAULT_RPC_URL);
  }
  return rpcProvider;
}

function getSaleAddress(): `0x${string}` {
  const address = (process.env.AGENTKIT_TGE_ADDRESS || tgeConfig.address) as string | undefined;
  if (!address || address === ZERO_ADDRESS) {
    throw new Error("TGESale contract address is not configured");
  }
  return address as `0x${string}`;
}

function getSaleContract(): Contract {
  return new Contract(getSaleAddress(), tgeConfig.abi, getProvider());
}

function parseAllowlistProof(): `0x${string}`[] {
  const proofEnv = process.env.AGENTKIT_TGE_ALLOWLIST_PROOF;
  if (!proofEnv) {
    return [];
  }

  try {
    const parsed = JSON.parse(proofEnv);
    if (!Array.isArray(parsed)) {
      throw new Error("Proof must be an array");
    }
    return parsed.map((value) => {
      if (typeof value !== "string") {
        throw new Error("Proof entries must be strings");
      }
      return value as `0x${string}`;
    });
  } catch (error) {
    throw new Error("Invalid JSON provided via AGENTKIT_TGE_ALLOWLIST_PROOF");
  }
}

function resolveDesiredContribution(minContribution: bigint): bigint {
  const configured = process.env.AGENTKIT_TGE_MIN_USDC_AMOUNT;
  if (configured) {
    const parsed = BigInt(utils.parseUnits(configured, 6).toString());
    if (parsed <= 0n) {
      throw new Error("Configured TGE contribution must be greater than zero");
    }
    return parsed;
  }

  if (minContribution > 0n) {
    return minContribution;
  }

  return BigInt(utils.parseUnits("5", 6).toString());
}

export async function buyMinimalTgeAllocation(
  userAddress: string,
): Promise<{ txHash: string; usdcAmount: string }> {
  const contract = getSaleContract();
  const [saleActive, saleView] = await Promise.all([
    contract.isSaleActive(),
    contract.getSaleView(userAddress),
  ]);

  if (!saleActive) {
    throw new Error("TGE 处于关闭状态，无法执行购买");
  }

  const minContribution = BigInt(saleView.minContribution.toString());
  const maxContribution = BigInt(saleView.maxContribution.toString());
  const userContributed = BigInt(saleView.userContributed.toString());
  const desiredContribution = resolveDesiredContribution(minContribution);

  if (desiredContribution <= 0n) {
    throw new Error("USDC 贡献金额必须大于 0");
  }

  if (maxContribution > 0n && userContributed + desiredContribution > maxContribution) {
    throw new Error("超过允许的最大认购额度");
  }

  const proof = parseAllowlistProof();
  const iface = new utils.Interface(tgeConfig.abi as any);
  const data = iface.encodeFunctionData("buyWithBaseToken", [
    BigNumber.from(desiredContribution.toString()),
    proof,
  ]);

  const { walletProvider } = await getAgentKitContext();
  const txHash = await walletProvider.sendTransaction({
    to: getSaleAddress(),
    data: data as `0x${string}`,
    value: 0n,
  });
  await walletProvider.waitForTransactionReceipt(txHash as `0x${string}`);

  return { txHash, usdcAmount: desiredContribution.toString() };
}
