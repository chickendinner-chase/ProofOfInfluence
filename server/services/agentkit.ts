import { randomBytes, randomUUID } from "node:crypto";
import { getAgentKitContext } from "../agentkit/agentkitClient";

export type WalletExecutionFn<T = unknown> = (walletClient: any) => Promise<T>;

export class ImmortalityAgentKitService {
  async createWallet(): Promise<{ agentWalletId: string; address: string }> {
    const { walletProvider } = await getAgentKitContext();
    const provider: any = walletProvider as any;

    if (typeof provider.createWallet === "function") {
      const wallet = await provider.createWallet();
      const agentWalletId =
        wallet?.id || wallet?.walletId || wallet?.cdpWallet?.id || wallet?.wallet?.id;
      const address =
        wallet?.defaultAddress || wallet?.address || wallet?.cdpWallet?.defaultAddress;

      if (agentWalletId && address) {
        return { agentWalletId, address };
      }
    }

    // Fallback mock implementation for environments without CDP wallet APIs configured
    return {
      agentWalletId: randomUUID(),
      address: `0x${randomBytes(20).toString("hex")}`,
    };
  }

  async executeWithWallet<T>(agentWalletId: string, fn: WalletExecutionFn<T>): Promise<T> {
    const { walletProvider } = await getAgentKitContext();
    const provider: any = walletProvider as any;
    let walletClient: any = { agentWalletId };

    if (typeof provider.getWalletClient === "function") {
      walletClient = await provider.getWalletClient(agentWalletId);
    } else if (typeof provider.useWallet === "function") {
      walletClient = await provider.useWallet(agentWalletId);
    }

    return fn(walletClient);
  }
}

let singleton: ImmortalityAgentKitService | null = null;

export function getImmortalityAgentKitService(): ImmortalityAgentKitService {
  if (!singleton) {
    singleton = new ImmortalityAgentKitService();
  }
  return singleton;
}
