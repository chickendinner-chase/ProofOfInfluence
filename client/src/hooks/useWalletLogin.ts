import { useAccount, useWalletClient } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export function useWalletLogin() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!isConnected || !address) {
        throw new Error("请先连接钱包");
      }

      if (!walletClient) {
        throw new Error("钱包客户端未就绪");
      }

      // 1) Get nonce and message
      const nonceRes = await fetch(`/api/auth/wallet/nonce?address=${address}`, {
        credentials: "include",
      });
      if (!nonceRes.ok) {
        const err = await nonceRes.json().catch(() => ({}));
        throw new Error(err.message || "获取登录 nonce 失败");
      }
      const { message } = await nonceRes.json();

      // 2) Sign message
      const signature = await walletClient.signMessage({
        account: address as `0x${string}`,
        message,
      });

      // 3) Login with signature
      const loginRes = await fetch("/api/auth/wallet/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ walletAddress: address, signature, message }),
      });

      if (!loginRes.ok) {
        const err = await loginRes.json().catch(() => ({}));
        throw new Error(err.message || "钱包登录失败");
      }

      return await loginRes.json();
    },
    onSuccess: async () => {
      // 先 invalidate，然后 refetch 确保数据更新
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "登录成功",
        description: "已通过钱包登录",
      });
    },
    onError: (error: any) => {
      toast({
        title: "登录失败",
        description: error?.message ?? "请稍后再试",
        variant: "destructive",
      });
    },
  });

  return {
    loginWithWallet: async () => {
      return mutation.mutateAsync();
    },
    isConnected,
    isPending: mutation.isPending,
    ...mutation,
  };
}

