import { BigNumber, Contract, providers, utils } from "ethers";
import stakingConfig from "@shared/contracts/staking_rewards.json";
import { getAgentKitContext } from "./agentkitClient";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const POI_DECIMALS = 18;
const DEFAULT_RPC_URL =
  process.env.AGENTKIT_CHAIN_RPC_URL ||
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

function getStakingAddress(): `0x${string}` {
  const address = (process.env.AGENTKIT_STAKING_ADDRESS || stakingConfig.address) as string | undefined;
  if (!address || address === ZERO_ADDRESS) {
    throw new Error("StakingRewards contract address is not configured");
  }
  return address as `0x${string}`;
}

function getStakingContract(): Contract {
  return new Contract(getStakingAddress(), stakingConfig.abi, getProvider());
}

function parsePoiAmount(amountPoi: string): BigNumber {
  if (!amountPoi || !amountPoi.trim()) {
    throw new Error("请输入要操作的 POI 数量");
  }
  const parsed = utils.parseUnits(amountPoi.trim(), POI_DECIMALS);
  if (parsed.lte(0)) {
    throw new Error("POI 数量必须大于 0");
  }
  return parsed;
}

export async function stakePoi(
  userAddress: string,
  amountPoi: string,
): Promise<{ txHash: string; amountWei: string }> {
  const amountWei = parsePoiAmount(amountPoi);
  const { walletProvider } = await getAgentKitContext();
  const iface = new utils.Interface(stakingConfig.abi as any);
  const data = iface.encodeFunctionData("stake", [amountWei]);
  const txHash = await walletProvider.sendTransaction({
    to: getStakingAddress(),
    data: data as `0x${string}`,
    value: 0n,
  });
  await walletProvider.waitForTransactionReceipt(txHash as `0x${string}`);
  return { txHash, amountWei: amountWei.toString() };
}

export async function unstakePoi(
  userAddress: string,
  amountPoi: string,
): Promise<{ txHash: string; amountWei: string }> {
  const amountWei = parsePoiAmount(amountPoi);
  const contract = getStakingContract();
  const balance: BigNumber = await contract.balanceOf(userAddress);

  if (balance.lt(amountWei)) {
    throw new Error("可用的质押余额不足");
  }

  const { walletProvider } = await getAgentKitContext();
  const iface = new utils.Interface(stakingConfig.abi as any);
  const data = iface.encodeFunctionData("withdraw", [amountWei]);
  const txHash = await walletProvider.sendTransaction({
    to: getStakingAddress(),
    data: data as `0x${string}`,
    value: 0n,
  });
  await walletProvider.waitForTransactionReceipt(txHash as `0x${string}`);
  return { txHash, amountWei: amountWei.toString() };
}

export async function claimPoiRewards(
  userAddress: string,
): Promise<{ txHash: string; rewardWei: string }> {
  const contract = getStakingContract();
  const pending: BigNumber = await contract.earned(userAddress);

  if (pending.lte(0)) {
    throw new Error("暂无可领取的奖励");
  }

  const { walletProvider } = await getAgentKitContext();
  const iface = new utils.Interface(stakingConfig.abi as any);
  const data = iface.encodeFunctionData("getReward", []);
  const txHash = await walletProvider.sendTransaction({
    to: getStakingAddress(),
    data: data as `0x${string}`,
    value: 0n,
  });
  await walletProvider.waitForTransactionReceipt(txHash as `0x${string}`);
  return { txHash, rewardWei: pending.toString() };
}
