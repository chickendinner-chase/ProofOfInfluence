import { utils } from "ethers";
import { getAgentKitContext } from "./agentkitClient";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() view returns (uint8)",
];

export async function getAllowance(token: string, owner: string, spender: string): Promise<string> {
  const { walletProvider } = await getAgentKitContext();
  const iface = new utils.Interface(ERC20_ABI as any);
  const data = iface.encodeFunctionData("allowance", [owner, spender]);
  const result = (await walletProvider.request({
    method: "eth_call",
    params: [{ to: token, data }, "latest"],
  })) as string;
  return iface.decodeFunctionResult("allowance", result)[0].toString();
}

export async function approveSpender(token: string, spender: string, amount: string): Promise<string> {
  const { walletProvider } = await getAgentKitContext();
  const iface = new utils.Interface(ERC20_ABI as any);
  const data = iface.encodeFunctionData("approve", [spender, amount]);
  const txHash = await walletProvider.sendTransaction({
    to: token as `0x${string}`,
    data: data as `0x${string}`,
    value: 0n,
  });
  await walletProvider.waitForTransactionReceipt(txHash as `0x${string}`);
  return txHash;
}


