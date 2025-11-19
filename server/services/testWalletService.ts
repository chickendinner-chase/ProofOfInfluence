import { Wallet } from "ethers";
import type { IStorage } from "../storage";
import type { TestWallet, User } from "@shared/schema";

export interface TestWalletContext {
  wallet: TestWallet;
  user: User;
  privateKey?: string;
}

export class TestWalletService {
  constructor(private readonly storage: IStorage) {}

  async createWallet(params: { label?: string; agentWalletId?: string | null } = {}): Promise<TestWalletContext> {
    const generatedWallet = Wallet.createRandom();
    const label = params.label ?? `test-wallet-${new Date().toISOString()}`;

    const record = await this.storage.createTestWallet({
      agentWalletId: params.agentWalletId ?? null,
      address: generatedWallet.address.toLowerCase(),
      label,
    });

    const user = await this.storage.findOrCreateUserByWallet(record.address);

    return {
      wallet: record,
      user,
      privateKey: generatedWallet.privateKey,
    };
  }

  async getOrCreateWallet(label: string): Promise<TestWalletContext> {
    const existing = await this.storage.getTestWalletByLabel(label);
    if (existing) {
      return this.hydrate(existing);
    }
    return this.createWallet({ label });
  }

  async listWallets(): Promise<TestWalletContext[]> {
    const wallets = await this.storage.listTestWallets();
    return Promise.all(wallets.map((wallet) => this.hydrate(wallet)));
  }

  private async hydrate(wallet: TestWallet): Promise<TestWalletContext> {
    let user = wallet.address ? await this.storage.getUserByWallet(wallet.address) : undefined;
    if (!user) {
      user = await this.storage.findOrCreateUserByWallet(wallet.address);
    }

    return {
      wallet,
      user,
    };
  }
}
