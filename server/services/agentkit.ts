import { mintTestBadge } from "../agentkit";
import type { IStorage } from "../storage";

export class ImmortalityAgentKitService {
  constructor(private readonly storage: IStorage) {}

  async mintTestBadgeForUser(userId: string): Promise<{ actionId: string; status: "success"; txHash: string }> {
    const user = await this.storage.getUser(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    if (!user.walletAddress) {
      throw new Error("User wallet not linked");
    }

    const action = await this.storage.createAgentkitAction({
      userId,
      actionType: "MINT_TEST_BADGE",
      status: "pending",
      requestPayload: { badgeId: 1 },
      metadata: {
        network: process.env.AGENTKIT_DEFAULT_CHAIN || "base-sepolia",
      },
    });

    try {
      const txHash = await mintTestBadge(user.walletAddress);
      await this.storage.updateAgentkitAction(action.id, {
        status: "success",
        txHash,
      });
      return { actionId: action.id, status: "success", txHash };
    } catch (error: any) {
      await this.storage.updateAgentkitAction(action.id, {
        status: "failed",
        errorMessage: error?.message ?? "Unknown error",
      });
      throw error;
    }
  }
}
