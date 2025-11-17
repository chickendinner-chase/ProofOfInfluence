import { type TestWallet } from "../storage";
import { ImmortalityAgentKitService } from "./agentkit";

export type ScenarioName = "tge-purchase" | "swap-eth-usdc" | "chat-immortality";

export class TestScenarioRunner {
  constructor(private agentKit: ImmortalityAgentKitService) {}

  async runScenario(
    scenario: ScenarioName,
    wallets: TestWallet[],
    params: Record<string, any> = {},
  ): Promise<{ results: any[] }> {
    if (!wallets.length) {
      throw new Error("No wallets available for scenario");
    }

    const results: any[] = [];
    for (const wallet of wallets) {
      try {
        let result: any;
        switch (scenario) {
          case "tge-purchase":
            result = await this.runTgePurchase(wallet, params);
            break;
          case "swap-eth-usdc":
            result = await this.runSwapEthUsdc(wallet, params);
            break;
          case "chat-immortality":
            result = await this.runChatImmortality(wallet, params);
            break;
          default:
            throw new Error(`Unknown scenario: ${scenario}`);
        }
        results.push({ walletId: wallet.id, address: wallet.address, ok: true, result });
      } catch (error: any) {
        results.push({
          walletId: wallet.id,
          address: wallet.address,
          ok: false,
          error: error?.message || "Unknown error",
        });
      }

      const delay = typeof params.delayMs === "number" ? params.delayMs : 100;
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return { results };
  }

  private async runTgePurchase(wallet: TestWallet, params: { usdcAmount?: string }) {
    const { usdcAmount } = params;
    if (!usdcAmount) {
      throw new Error("usdcAmount is required for tge-purchase scenario");
    }

    return this.agentKit.executeWithWallet(wallet.agentWalletId, async (walletClient: any) => {
      // Placeholder logic - integrate TGESale contract interactions when ready
      return {
        action: "tge-purchase",
        walletClient,
        usdcAmount,
      };
    });
  }

  private async runSwapEthUsdc(
    wallet: TestWallet,
    params: { direction?: "eth-to-usdc" | "usdc-to-eth"; amount?: string },
  ) {
    const direction = params.direction || "eth-to-usdc";
    const amount = params.amount;
    if (!amount) {
      throw new Error("amount is required for swap-eth-usdc scenario");
    }

    return this.agentKit.executeWithWallet(wallet.agentWalletId, async (walletClient: any) => {
      return {
        action: "swap-eth-usdc",
        walletClient,
        direction,
        amount,
      };
    });
  }

  private async runChatImmortality(wallet: TestWallet, params: { messageCount?: number }) {
    const messageCount = params.messageCount ?? 1;
    if (messageCount <= 0) {
      throw new Error("messageCount must be greater than 0");
    }

    const messages: any[] = [];
    for (let i = 0; i < messageCount; i++) {
      const response = await fetch("http://localhost:3001/api/immortality/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: null,
          message: `Test message ${i + 1} from ${wallet.address}`,
          testWalletAddress: wallet.address,
        }),
      });

      if (!response.ok) {
        throw new Error(`Immortality chat API failed with status ${response.status}`);
      }

      messages.push(await response.json());
    }

    return { count: messages.length };
  }
}
