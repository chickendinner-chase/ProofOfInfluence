import { ethers } from "ethers";
import { storage } from "../storage";
import { InsertTestWallet } from "@shared/schema";
import * as crypto from "crypto";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Get encryption key from environment variable
 * Falls back to a default key in development (NOT SECURE for production)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.TEST_WALLET_ENCRYPTION_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("TEST_WALLET_ENCRYPTION_KEY must be set in production");
    }
    // Default key for development (64 bytes = 32 bytes for AES-256)
    console.warn("[TestWalletService] Using default encryption key - NOT SECURE for production");
    return crypto.scryptSync("default-dev-key-change-in-production", "salt", 32);
  }
  // Key should be a hex string or base64, convert to buffer
  if (key.length === 64) {
    return Buffer.from(key, "hex");
  }
  return Buffer.from(key, "base64");
}

/**
 * Encrypt a private key
 */
export function encryptPrivateKey(privateKey: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  let encrypted = cipher.update(privateKey, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const tag = cipher.getAuthTag();

  // Combine: salt (for key derivation if needed) + iv + tag + encrypted data
  // For simplicity, we'll use: iv (16) + tag (16) + encrypted
  const result = Buffer.concat([iv, tag, encrypted]);
  return result.toString("base64");
}

/**
 * Decrypt a private key
 */
export function decryptPrivateKey(encryptedKey: string): string {
  const key = getEncryptionKey();
  const buffer = Buffer.from(encryptedKey, "base64");

  // Extract components
  const iv = buffer.slice(0, IV_LENGTH);
  const tag = buffer.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.slice(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf8");
}

export class TestWalletService {
  /**
   * Generate a new test wallet
   */
  async generateTestWallet(
    scenario: string,
    label?: string,
    chainId: number = 84532, // Base Sepolia default
    network: string = "base-sepolia"
  ): Promise<{ wallet: ethers.Wallet; testWallet: any }> {
    // Generate random wallet
    const wallet = ethers.Wallet.createRandom();
    const privateKey = wallet.privateKey;
    const encryptedKey = encryptPrivateKey(privateKey);

    // Create test wallet record
    const testWalletData: InsertTestWallet = {
      walletAddress: wallet.address.toLowerCase(),
      privateKey: encryptedKey,
      chainId,
      network,
      label: label || `test-${scenario}-${Date.now()}`,
      scenario,
      status: "idle",
      metadata: null,
    };

    const testWallet = await storage.createTestWallet(testWalletData);

    return { wallet, testWallet };
  }

  /**
   * Allocate a wallet for use (mark as in_use)
   */
  async allocateWallet(scenario: string): Promise<any> {
    // Try to get an available wallet first
    const available = await storage.getAvailableTestWallets(scenario);
    
    if (available.length > 0) {
      // Use the most recently used wallet (or oldest if never used)
      const wallet = available[0];
      await storage.updateTestWalletStatus(wallet.id, "in_use");
      return wallet;
    }

    // No available wallet, generate a new one
    const { testWallet } = await this.generateTestWallet(scenario);
    await storage.updateTestWalletStatus(testWallet.id, "in_use");
    return testWallet;
  }

  /**
   * Release a wallet (mark as idle)
   */
  async releaseWallet(walletId: number): Promise<void> {
    await storage.updateTestWalletStatus(walletId, "idle");
  }

  /**
   * Get an ethers signer for a test wallet
   */
  async getWalletSigner(walletId: number, provider?: ethers.providers.Provider): Promise<ethers.Wallet> {
    try {
      const testWallet = await storage.getTestWallet(walletId);
      if (!testWallet) {
        throw new Error(`Test wallet ${walletId} not found`);
      }

      const decryptedKey = decryptPrivateKey(testWallet.privateKey);
      const wallet = new ethers.Wallet(decryptedKey);

      if (provider) {
        return wallet.connect(provider);
      }

      return wallet;
    } catch (error: any) {
      console.error(`[TestWalletService] Error getting wallet signer for ${walletId}:`, error);
      throw error;
    }
  }

  /**
   * Get wallet signer by address
   */
  async getWalletSignerByAddress(
    address: string,
    provider?: ethers.providers.Provider
  ): Promise<ethers.Wallet> {
    try {
      const testWallet = await storage.getTestWalletByAddress(address);
      if (!testWallet) {
        throw new Error(`Test wallet with address ${address} not found`);
      }

      const decryptedKey = decryptPrivateKey(testWallet.privateKey);
      const wallet = new ethers.Wallet(decryptedKey);

      if (provider) {
        return wallet.connect(provider);
      }

      return wallet;
    } catch (error: any) {
      console.error(`[TestWalletService] Error getting wallet signer for address ${address}:`, error);
      throw error;
    }
  }
}

export const testWalletService = new TestWalletService();
