import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, baseSepolia, mainnet, arbitrum, polygon, type Chain } from 'wagmi/chains'
import { http } from 'wagmi'
import { BASE_RPC_URL } from './baseConfig'

// WalletConnect Project ID - 需要在 Replit Secrets 中配置 VITE_WALLETCONNECT_PROJECT_ID
// 获取地址: https://cloud.walletconnect.com/
// Fallback to real projectId if env is not set (for development)
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '63df30366341120f8b918fe61420d5f0'

// HTTP RPC URL fallback for Base Sepolia
const BASE_SEPOLIA_RPC = import.meta.env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org'

// Metadata for AppKit
const metadata = {
  name: 'ProofOfInfluence',
  description: 'Proof of Influence - Web3 Influence Platform',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Define networks with custom RPC URLs for fallback
// If projectId is missing or invalid, HTTP transport will be used
const networksWithRpc = [
  base,
  {
    ...baseSepolia,
    rpcUrls: {
      default: {
        http: [BASE_SEPOLIA_RPC],
      },
    },
  },
  mainnet,
  arbitrum,
  polygon,
]

// Create Wagmi Adapter
// If projectId is missing, WagmiAdapter will fallback to HTTP transport
export const wagmiAdapter = new WagmiAdapter({
  networks: networksWithRpc as any, // Type assertion for compatibility
  projectId: projectId || undefined, // Only set if projectId exists
  // Note: WagmiAdapter will automatically use HTTP transport if projectId is invalid/missing
})

// Export wagmi config for WagmiProvider
export const config = wagmiAdapter.wagmiConfig

// Create AppKit instance with featured wallets
createAppKit({
  adapters: [wagmiAdapter as any], // Type assertion for compatibility
  networks: networksWithRpc as any,
  projectId: projectId || undefined, // Only set if projectId exists
  metadata,
  features: {
    analytics: true,
  },
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
    'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
    '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4', // Binance Web3 Wallet
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX Wallet
  ],
})

