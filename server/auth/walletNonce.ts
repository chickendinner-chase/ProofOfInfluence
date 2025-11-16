import crypto from "crypto";

type NonceRecord = {
  nonce: string;
  createdAt: number; // ms
};

const NONCE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const addressToNonce = new Map<string, NonceRecord>();

export function createWalletNonce(address: string): string {
  const normalized = address.toLowerCase();
  const nonce = crypto.randomBytes(16).toString("hex");
  addressToNonce.set(normalized, { nonce, createdAt: Date.now() });
  return nonce;
}

export function getWalletNonce(address: string): string | null {
  const rec = addressToNonce.get(address.toLowerCase());
  if (!rec) return null;
  if (Date.now() - rec.createdAt > NONCE_TTL_MS) {
    addressToNonce.delete(address.toLowerCase());
    return null;
  }
  return rec.nonce;
}

export function consumeWalletNonce(address: string, nonce: string): boolean {
  const current = getWalletNonce(address);
  if (!current) return false;
  if (current !== nonce) return false;
  addressToNonce.delete(address.toLowerCase());
  return true;
}


