import { useAccount, useBalance } from "wagmi";
import { useMemo } from "react";
import { formatUnits } from "viem";
import { POI_TOKEN_ADDRESS, BASE_CHAIN_ID } from "@/lib/baseConfig";

const POI_UNIT = 18;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export interface UsePoiTokenResult {
  balance: bigint;
  formattedBalance: string;
  isLoading: boolean;
  refetch: () => void;
  address: `0x${string}`;
  isConfigured: boolean;
}

/**
 * Hook to interact with POI Token contract
 * Provides balance, formatted balance, and loading state
 */
export function usePoiToken(): UsePoiTokenResult {
  const { address } = useAccount();
  const poiAddress = POI_TOKEN_ADDRESS !== ZERO_ADDRESS ? POI_TOKEN_ADDRESS : ZERO_ADDRESS;
  const enabled = poiAddress !== ZERO_ADDRESS && Boolean(address);

  const { data: balance, refetch: refetchBalance, isFetching } = useBalance({
    address,
    token: poiAddress,
    chainId: BASE_CHAIN_ID,
    query: { enabled },
  });

  const formattedBalance = useMemo(() => {
    if (!balance) return "0.00";
    return Number(formatUnits(balance.value, POI_UNIT)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [balance]);

  return {
    balance: balance?.value ?? 0n,
    formattedBalance,
    isLoading: isFetching,
    refetch: refetchBalance,
    address: poiAddress,
    isConfigured: poiAddress !== ZERO_ADDRESS,
  };
}

