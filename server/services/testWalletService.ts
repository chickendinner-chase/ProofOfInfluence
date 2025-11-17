import { ImmortalityAgentKitService } from "./agentkit";
import { createTestWallet, listTestWallets, type TestWallet } from "../storage";

export class TestWalletService {
  constructor(private agentKit: ImmortalityAgentKitService) {}

  async createTestWallet(label: string): Promise<TestWallet> {
    const { agentWalletId, address } = await this.agentKit.createWallet();
    return createTestWallet({ agentWalletId, address, label });
  }

  async createManyTestWallets(label: string, count: number): Promise<TestWallet[]> {
    const wallets: TestWallet[] = [];
    for (let i = 0; i < count; i++) {
      const wallet = await this.createTestWallet(label);
      wallets.push(wallet);
    }
    return wallets;
  }

  async listTestWallets(label?: string, limit?: number): Promise<TestWallet[]> {
    return listTestWallets({ label, limit });
  }
}
