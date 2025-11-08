import { providers } from 'ethers';
import type { PublicClient, WalletClient } from 'viem';

/**
 * Adapter to convert viem clients to ethers.js providers/signers
 * This allows us to use AppKit/wagmi with existing ethers.js code
 */

/**
 * Convert viem PublicClient to ethers Provider
 * Used for read-only operations (quotes, balances, etc.)
 */
export function publicClientToProvider(publicClient: PublicClient) {
  const { chain, transport } = publicClient;
  const network = {
    chainId: chain!.id,
    name: chain!.name,
    ensAddress: chain!.contracts?.ensRegistry?.address,
  };
  
  if (transport.type === 'fallback') {
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<any>[]).map(
        ({ value }: any) => new providers.JsonRpcProvider(value?.url, network),
      ),
    );
  }
  
  return new providers.JsonRpcProvider(transport.url, network);
}

/**
 * Convert viem WalletClient to ethers Signer
 * Used for write operations (swaps, approvals, etc.)
 */
export function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain!.id,
    name: chain!.name,
    ensAddress: chain!.contracts?.ensRegistry?.address,
  };
  
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account!.address);
  return signer;
}

