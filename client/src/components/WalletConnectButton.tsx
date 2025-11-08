import { useEffect } from "react";
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useDisconnect } from 'wagmi';
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface WalletConnectButtonProps {
  standalone?: boolean;
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export default function WalletConnectButton({ 
  standalone = false,
  onConnect,
  onDisconnect 
}: WalletConnectButtonProps = {}) {
  const { toast } = useToast();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  // Mutation for connecting wallet to backend (Web2 integration)
  const connectWalletMutation = useMutation({
    mutationFn: async (data: { walletAddress: string }) => {
      // For Web2 integration mode, call backend API
      const res = await apiRequest("POST", "/api/wallet/connect", {
        walletAddress: data.walletAddress,
        signature: "appkit-auto-signed" // AppKit handles signature internally
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "钱包已连接",
        description: "您的钱包已成功连接到账户",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "连接失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectWalletMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/wallet/disconnect", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "钱包已断开",
      });
    },
  });

  // Handle connection changes
  useEffect(() => {
    if (isConnected && address) {
      if (standalone) {
        // Standalone mode: just notify parent component
        localStorage.setItem("wallet_address", address);
        onConnect?.(address);
      } else {
        // Web2 integration mode: connect to backend
        const savedAddress = localStorage.getItem("last_connected_wallet");
        if (savedAddress !== address) {
          connectWalletMutation.mutate({ walletAddress: address });
          localStorage.setItem("last_connected_wallet", address);
        }
      }
    } else if (!isConnected) {
      if (standalone) {
        localStorage.removeItem("wallet_address");
        onDisconnect?.();
      } else {
        const savedAddress = localStorage.getItem("last_connected_wallet");
        if (savedAddress) {
          disconnectWalletMutation.mutate();
          localStorage.removeItem("last_connected_wallet");
        }
      }
    }
  }, [isConnected, address, standalone]);

  // Disconnected state - show connect button
  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
        type="button"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        data-testid="button-connect-wallet"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Connect Wallet
      </button>
    );
  }

  // Connected state - show chain and account buttons
  return (
    <div className="flex gap-2">
      <button
        onClick={() => open({ view: 'Networks' })}
        type="button"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3"
      >
        {chain?.name || 'Unknown Chain'}
      </button>

      <button
        onClick={() => open()}
        type="button"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3 font-mono"
        data-testid="button-wallet-menu"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Account'}
      </button>
    </div>
  );
}
