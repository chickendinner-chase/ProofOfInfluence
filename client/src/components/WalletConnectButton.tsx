import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Wallet, Copy, ExternalLink, LogOut, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

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
  const [isConnecting, setIsConnecting] = useState(false);
  const [standaloneAddress, setStandaloneAddress] = useState<string | null>(null);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: !standalone,
  });

  // Load standalone wallet address from localStorage
  useEffect(() => {
    if (standalone) {
      const savedAddress = localStorage.getItem("wallet_address");
      if (savedAddress) {
        setStandaloneAddress(savedAddress);
      }
    }
  }, [standalone]);

  const connectWalletMutation = useMutation({
    mutationFn: async (data: { walletAddress: string; signature: string }) => {
      const res = await apiRequest("POST", "/api/wallet/connect", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Wallet connected",
        description: "Your wallet has been connected successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection failed",
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
        title: "Wallet disconnected",
      });
    },
  });

  const handleConnect = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnecting(true);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const walletAddress = accounts[0];

      if (standalone) {
        // Standalone mode: only connect wallet, no backend call
        localStorage.setItem("wallet_address", walletAddress);
        setStandaloneAddress(walletAddress);
        onConnect?.(walletAddress);
        toast({
          title: "钱包已连接",
          description: truncateAddress(walletAddress),
        });
        setIsConnecting(false);
        return;
      }

      // Web2 integration mode: call backend API
      const message = `Sign this message to connect your wallet to LinkTree Web3.\n\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;

      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, walletAddress],
      });

      await connectWalletMutation.mutateAsync({ walletAddress, signature });
    } catch (error: any) {
      if (error.code === 4001) {
        toast({
          title: "Connection cancelled",
          description: "You rejected the connection request",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to connect wallet",
          variant: "destructive",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (standalone) {
      localStorage.removeItem("wallet_address");
      setStandaloneAddress(null);
      onDisconnect?.();
      toast({ title: "钱包已断开" });
      return;
    }
    
    disconnectWalletMutation.mutate();
  };

  const walletAddress = standalone ? standaloneAddress : user?.walletAddress;

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  if (!walletAddress) {
    return (
      <Button 
        onClick={handleConnect} 
        variant="default" 
        disabled={isConnecting}
        data-testid="button-connect-wallet"
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="font-mono" data-testid="button-wallet-menu">
          <Wallet className="mr-2 h-4 w-4" />
          {truncateAddress(walletAddress)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={copyAddress} data-testid="button-copy-address">
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`https://etherscan.io/address/${walletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-etherscan"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Etherscan
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleDisconnect}
          disabled={disconnectWalletMutation.isPending}
          data-testid="button-disconnect-wallet"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
