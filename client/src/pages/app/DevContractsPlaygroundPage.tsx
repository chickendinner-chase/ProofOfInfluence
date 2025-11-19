import React, { useState, useMemo } from "react";
import { useAccount, useChainId, useReadContract, useWriteContract, usePublicClient, useWaitForTransactionReceipt, useSimulateContract } from "wagmi";
import { parseUnits, formatUnits, decodeErrorResult } from "viem";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton, ThemedInput } from "@/components/themed";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { BASE_CHAIN_ID, BASE_EXPLORER, USDC_ADDRESS, ERC20_ABI } from "@/lib/baseConfig";
import { AlertCircle, Wallet, CheckCircle2, Loader2 } from "lucide-react";
import WalletConnectButton from "@/components/WalletConnectButton";
import { ContractCard } from "@/components/dev/ContractCard";
import { TransactionStatus } from "@/components/dev/TransactionStatus";
import { CONTRACTS_CONFIG } from "@/config/contractsPlaygroundConfig";
import { logOnce } from "@/lib/logOnce";

const BASE_SEPOLIA_CHAIN_ID = 84532;
const POI_DECIMALS = 18;
const USDC_DECIMALS = 6;

function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

type TxStatus = "idle" | "pending" | "success" | "error";

// Tier Configuration Types
interface TierConfigItem {
  price: string;  // USDC per POI (human readable, e.g., "2")
  amount: string; // POI supply (human readable, e.g., "500000")
}

// Generic Fund Contract Component - Transfer tokens to any contract
function FundContractCard({ 
  tokenAddress, 
  tokenSymbol = "POI", 
  decimals = 18,
  targetContractAddress,
  targetContractName 
}: { 
  tokenAddress: `0x${string}` | undefined;
  tokenSymbol?: string;
  decimals?: number;
  targetContractAddress: `0x${string}`;
  targetContractName: string;
}) {
  const { theme } = useTheme();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });
  
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [txError, setTxError] = useState<string>("");

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!tokenAddress && !!address },
  });

  const { data: contractBalance, refetch: refetchContractBalance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [targetContractAddress],
    query: { enabled: !!tokenAddress },
  });

  const handleTransfer = async () => {
    if (!amount || !tokenAddress || !address) return;
    
    let parsedAmount: bigint;
    try {
      parsedAmount = parseUnits(amount, decimals);
    } catch (error) {
      setTxStatus("error");
      setTxError("Invalid amount format");
      return;
    }
    
    setTxStatus("pending");
    setTxError("");
    
    try {
      if (balance && typeof balance === "bigint" && balance < parsedAmount) {
        setTxStatus("error");
        setTxError(`Insufficient balance. You have ${formatUnits(balance, decimals)} ${tokenSymbol}, but need ${amount} ${tokenSymbol}.`);
        return;
      }

      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [targetContractAddress, parsedAmount],
      });
      
      setTxHash(hash);
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      
      setTxStatus("success");
      setAmount("");
      await refetchBalance();
      await refetchContractBalance();
    } catch (error: any) {
      setTxStatus("error");
      let errorMessage = error?.message || "Transfer failed";
      if (error?.shortMessage) {
        errorMessage = error.shortMessage;
      } else if (error?.cause?.data) {
        errorMessage = `Contract revert: ${error.cause.data}`;
      } else if (error?.cause?.message) {
        errorMessage = error.cause.message;
      }
      setTxError(errorMessage);
    }
  };

  if (!tokenAddress) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className={cn("text-xs font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-slate-600")}>
        Fund {targetContractName} with {tokenSymbol}
      </h4>
      <div className="space-y-2 p-2 rounded border">
        <div>
          <label className="text-xs opacity-70 mb-1 block">{tokenSymbol} Amount</label>
          <ThemedInput
            type="number"
            step="0.000001"
            placeholder={`e.g., 1000000`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="opacity-70">Your {tokenSymbol} Balance:</span>
            <span className={cn(
              "font-semibold",
              balance && typeof balance === "bigint" && balance > 0n
                ? theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                : theme === "cyberpunk" ? "text-red-400" : "text-red-600"
            )}>
              {balance && typeof balance === "bigint" 
                ? `${formatUnits(balance, decimals)} ${tokenSymbol}`
                : "--"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="opacity-70">Contract {tokenSymbol} Balance:</span>
            <span className={cn(
              "font-semibold",
              contractBalance && typeof contractBalance === "bigint" && contractBalance > 0n
                ? theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                : theme === "cyberpunk" ? "text-red-400" : "text-red-600"
            )}>
              {contractBalance && typeof contractBalance === "bigint"
                ? `${formatUnits(contractBalance, decimals)} ${tokenSymbol}`
                : "--"}
            </span>
          </div>
        </div>
        <ThemedButton
          onClick={handleTransfer}
          disabled={!amount || txStatus === "pending" || !address}
          variant="default"
          size="sm"
          emphasis
          className="w-full"
        >
          {txStatus === "pending" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Transferring...
            </>
          ) : (
            `💸 Transfer ${tokenSymbol} to Contract`
          )}
        </ThemedButton>
        <TransactionStatus status={txStatus} hash={txHash} error={txError} />
      </div>
    </div>
  );
}

export default function DevContractsPlaygroundPage() {
  const { theme } = useTheme();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const isCorrectNetwork = chainId === BASE_SEPOLIA_CHAIN_ID;

  // Check for RPC/auth errors across all contracts
  const hasRpcError = React.useMemo(() => {
    // This will be set by individual contract cards if they detect RPC errors
    return false; // Placeholder - individual cards will show their own errors
  }, []);

  return (
    <PageLayout>
      <Section title="智能合约操场 (Contracts Playground)" subtitle="调试和验证所有已部署合约的链上集成">
        {/* Connection Status */}
        <div className="space-y-4 mb-6">
          {!isConnected ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                请先在右上角连接钱包以使用合约功能
              </AlertDescription>
            </Alert>
          ) : (
            <ThemedCard className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Wallet className={cn(
                    "w-5 h-5",
                    theme === "cyberpunk" ? "text-cyan-400" : "text-blue-600"
                  )} />
                  <div>
                    <div className={cn(
                      "text-sm opacity-70",
                      theme === "cyberpunk" ? "font-rajdhani" : "font-poppins"
                    )}>
                      连接地址
                    </div>
                    <div className={cn(
                      "text-base font-mono font-semibold",
                      theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600"
                    )}>
                      {formatAddress(address || "")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <div className={cn(
                      "text-sm opacity-70",
                      theme === "cyberpunk" ? "font-rajdhani" : "font-poppins"
                    )}>
                      Chain ID
                    </div>
                    <div className={cn(
                      "text-base font-mono font-semibold",
                      theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600"
                    )}>
                      {chainId}
                    </div>
                  </div>
                  {isCorrectNetwork ? (
                    <div className={cn(
                      "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold",
                      theme === "cyberpunk"
                        ? "bg-green-400/20 text-green-400"
                        : "bg-green-100 text-green-600"
                    )}>
                      <CheckCircle2 className="w-3 h-3" />
                      Base Sepolia
                    </div>
                  ) : (
                    <div className={cn(
                      "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold",
                      theme === "cyberpunk"
                        ? "bg-red-400/20 text-red-400"
                        : "bg-red-100 text-red-600"
                    )}>
                      <AlertCircle className="w-3 h-3" />
                      错误网络
                    </div>
                  )}
                </div>
              </div>
            </ThemedCard>
          )}

          {isConnected && !isCorrectNetwork && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                请切换到 Base Sepolia (Chain ID: {BASE_SEPOLIA_CHAIN_ID}) 网络
              </AlertDescription>
            </Alert>
          )}

          {!isConnected && (
            <div className="flex justify-center">
              <WalletConnectButton />
            </div>
          )}
        </div>

        {/* Contract Cards */}
        {isConnected && isCorrectNetwork && (
          <div className="space-y-6">
            {/* POI Token */}
            <POITokenCard address={address} />

            {/* TGE Sale */}
            <TGESaleCard address={address} />

            {/* Staking Rewards */}
            <StakingRewardsCard address={address} />

            {/* Vesting Vault */}
            <VestingVaultCard address={address} />

            {/* Merkle Airdrop */}
            <MerkleAirdropCard address={address} />

            {/* Early Bird Allowlist */}
            <EarlyBirdAllowlistCard address={address} />

            {/* Referral Registry */}
            <ReferralRegistryCard address={address} />

            {/* Achievement Badges */}
            <AchievementBadgesCard address={address} />

            {/* Immortality Badge */}
            <ImmortalityBadgeCard address={address} />
          </div>
        )}
      </Section>
    </PageLayout>
  );
}

// POI Token Card Component
function POITokenCard({ address }: { address: `0x${string}` | undefined }) {
  const { theme } = useTheme();
  const config = CONTRACTS_CONFIG.poiToken;
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });

  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [txError, setTxError] = useState<string>("");

  // Read contract data
  const { data: name, error: nameError, isFetching: isFetchingName } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "name",
    query: { enabled: config.isConfigured },
  });

  const { data: symbol, error: symbolError, isFetching: isFetchingSymbol } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "symbol",
    query: { enabled: config.isConfigured },
  });

  const { data: decimals, error: decimalsError, isFetching: isFetchingDecimals } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "decimals",
    query: { enabled: config.isConfigured },
  });

  const { data: totalSupply, error: totalSupplyError, isFetching: isFetchingTotalSupply } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "totalSupply",
    query: { enabled: config.isConfigured },
  });

  const { data: balance, error: balanceError, isFetching: isFetchingBalance } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: config.isConfigured && !!address },
  });

  // Log errors only once to prevent console spam
  React.useEffect(() => {
    if (nameError) {
      const errorMsg = nameError instanceof Error ? nameError.message : String(nameError);
      // Check for RPC/auth errors
      if (errorMsg.includes("401") || errorMsg.includes("403") || errorMsg.includes("Unauthorized")) {
        logOnce("poi-token-rpc-auth", "RPC authentication error. Check WalletConnect projectId configuration.", nameError);
      } else {
        logOnce("poi-token-name", `POI Token name read failed: ${errorMsg}`, nameError);
      }
    }
    if (symbolError) logOnce("poi-token-symbol", `POI Token symbol read failed: ${symbolError instanceof Error ? symbolError.message : String(symbolError)}`, symbolError);
    if (decimalsError) logOnce("poi-token-decimals", `POI Token decimals read failed: ${decimalsError instanceof Error ? decimalsError.message : String(decimalsError)}`, decimalsError);
    if (totalSupplyError) logOnce("poi-token-totalSupply", `POI Token totalSupply read failed: ${totalSupplyError instanceof Error ? totalSupplyError.message : String(totalSupplyError)}`, totalSupplyError);
    if (balanceError) logOnce("poi-token-balance", `POI Token balance read failed: ${balanceError instanceof Error ? balanceError.message : String(balanceError)}`, balanceError);
  }, [nameError, symbolError, decimalsError, totalSupplyError, balanceError]);

  const parsedAmount = useMemo(() => {
    if (!transferAmount || !decimals) return null;
    try {
      return parseUnits(transferAmount, decimals);
    } catch {
      return null;
    }
  }, [transferAmount, decimals]);

  const handleTransfer = async () => {
    if (!parsedAmount || !transferTo || !address) return;

    setTxStatus("pending");
    setTxError("");
    try {
      const hash = await writeContractAsync({
        address: config.address,
        abi: config.abi,
        functionName: "transfer",
        args: [transferTo as `0x${string}`, parsedAmount],
      });
      setTxHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setTxStatus("success");
      setTransferTo("");
      setTransferAmount("");
    } catch (error: any) {
      setTxStatus("error");
      setTxError(error?.message || "Transfer failed");
    }
  };

  return (
    <ContractCard title={config.name} address={config.address} explorerBaseUrl={BASE_EXPLORER}>
      {/* Read-only data */}
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="opacity-70">Name</div>
            <div className={cn("font-semibold flex items-center gap-2", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {isFetchingName ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : nameError ? (
                <span className="text-red-400 text-xs">Error</span>
              ) : (
                name || "--"
              )}
            </div>
          </div>
          <div>
            <div className="opacity-70">Symbol</div>
            <div className={cn("font-semibold flex items-center gap-2", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {isFetchingSymbol ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : symbolError ? (
                <span className="text-red-400 text-xs">Error</span>
              ) : (
                symbol || "--"
              )}
            </div>
          </div>
          <div>
            <div className="opacity-70">Decimals</div>
            <div className={cn("font-semibold flex items-center gap-2", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {isFetchingDecimals ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : decimalsError ? (
                <span className="text-red-400 text-xs">Error</span>
              ) : (
                decimals?.toString() || "--"
              )}
            </div>
          </div>
          <div>
            <div className="opacity-70">Total Supply</div>
            <div className={cn("font-semibold flex items-center gap-2", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {isFetchingTotalSupply ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : totalSupplyError ? (
                <span className="text-red-400 text-xs">Error</span>
              ) : (
                totalSupply ? formatUnits(totalSupply, decimals || 18) : "--"
              )}
            </div>
          </div>
          <div className="col-span-2">
            <div className="opacity-70">Your Balance</div>
            <div className={cn("font-semibold text-lg", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {balance && decimals ? formatUnits(balance, decimals) : "0"} {symbol || ""}
            </div>
          </div>
        </div>
      </div>

      {/* Transfer action */}
      <div className="space-y-3 border-t pt-4">
        <h3 className={cn("font-semibold text-sm", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700")}>
          Transfer
        </h3>
        <div className="space-y-2">
          <ThemedInput
            placeholder="To address (0x...)"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
          />
          <ThemedInput
            type="number"
            step="0.000000000000000001"
            placeholder="Amount"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
          <ThemedButton
            onClick={handleTransfer}
            disabled={!parsedAmount || !transferTo || txStatus === "pending"}
            className="w-full"
          >
            {txStatus === "pending" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Transferring...
              </>
            ) : (
              "Transfer"
            )}
          </ThemedButton>
        </div>
        <TransactionStatus status={txStatus} hash={txHash} error={txError} />
      </div>
    </ContractCard>
  );
}

// Tier Display Item Component (for showing current tier info)
function TierDisplayItem({ tierIndex, config }: { tierIndex: number; config: { address: `0x${string}`; abi: readonly unknown[]; isConfigured: boolean } }) {
  const { theme } = useTheme();
  const { data: tierData } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "tiers",
    args: [BigInt(tierIndex)],
    query: { enabled: config.isConfigured },
  });

  if (!tierData || !Array.isArray(tierData) || tierData.length < 2) {
    return (
      <div className="text-xs opacity-50">
        Tier {tierIndex}: Loading...
      </div>
    );
  }

  const pricePerToken = tierData[0] as bigint;
  const remainingTokens = tierData[1] as bigint;

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="opacity-70">Tier {tierIndex}:</span>
      <span className={cn("font-mono", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
        {formatUnits(pricePerToken, USDC_DECIMALS)} USDC/POI · {formatUnits(remainingTokens, POI_DECIMALS)} POI left
      </span>
    </div>
  );
}

// TGE Sale Card Component
function TGESaleCard({ address }: { address: `0x${string}` | undefined }) {
  const { theme } = useTheme();
  const config = CONTRACTS_CONFIG.tgeSale;
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });

  const [usdcAmount, setUsdcAmount] = useState("");
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [txError, setTxError] = useState<string>("");

  // Owner functions state
  const [saleStartInput, setSaleStartInput] = useState("");
  const [saleEndInput, setSaleEndInput] = useState("");
  const [ownerTxStatus, setOwnerTxStatus] = useState<TxStatus>("idle");
  const [ownerTxHash, setOwnerTxHash] = useState<`0x${string}` | undefined>();
  const [ownerTxError, setOwnerTxError] = useState<string>("");

  // Tier configuration state
  const [tierConfigStatus, setTierConfigStatus] = useState<TxStatus>("idle");
  const [tierConfigHash, setTierConfigHash] = useState<`0x${string}` | undefined>();
  const [tierConfigError, setTierConfigError] = useState<string>("");
  const [tierConfigs, setTierConfigs] = useState<TierConfigItem[]>([
    { price: "2", amount: "500000" },
    { price: "3", amount: "250000" },
  ]);

  // Read tier count for configuration display
  const { data: tierCount } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "tierCount",
    query: { enabled: config.isConfigured },
  });

  // Read all tiers data for display
  const allTiersData = useMemo(() => {
    if (!tierCount || typeof tierCount !== "bigint") return [];
    const count = Number(tierCount);
    return Array.from({ length: count }, (_, i) => i);
  }, [tierCount]);

  // Read contract data
  const { data: currentTier } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "currentTier",
    query: { enabled: config.isConfigured },
  });

  const { data: tierData } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "tiers",
    args: currentTier !== undefined ? [currentTier] : undefined,
    query: { enabled: config.isConfigured && currentTier !== undefined },
  });

  const { data: minContribution } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "minContribution",
    query: { enabled: config.isConfigured },
  });

  const { data: maxContribution } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "maxContribution",
    query: { enabled: config.isConfigured },
  });

  const { data: totalRaised } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "totalRaised",
    query: { enabled: config.isConfigured },
  });

  const { data: userContribution } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "contributedUSDC",
    args: address ? [address] : undefined,
    query: { enabled: config.isConfigured && !!address },
  });

  // Read actual USDC token address from TGESale contract
  const { data: usdcTokenAddress } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "usdcToken",
    query: { enabled: config.isConfigured },
  });

  // Read POI token address from TGESale contract
  const { data: poiTokenAddress } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "poiToken",
    query: { enabled: config.isConfigured },
  });

  // Read contract's POI token balance (how much POI the contract has available to sell)
  const { data: contractPoiBalance } = useReadContract({
    address: poiTokenAddress as `0x${string}` | undefined,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: config.isConfigured ? [config.address] : undefined,
    query: { enabled: config.isConfigured && !!poiTokenAddress },
  });

  // USDC allowance - use the actual USDC address from contract
  const { data: usdcAllowance, refetch: refetchUsdcAllowance } = useReadContract({
    address: (usdcTokenAddress || USDC_ADDRESS) as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && config.isConfigured ? [address, config.address] : undefined,
    query: { enabled: config.isConfigured && !!address && !!usdcTokenAddress },
  });

  // USDC balance check
  const { data: usdcBalance } = useReadContract({
    address: (usdcTokenAddress || USDC_ADDRESS) as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: config.isConfigured && !!address && !!usdcTokenAddress },
  });

  // Read sale status for diagnostics
  const { data: paused, refetch: refetchPaused } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "paused",
    query: { 
      enabled: config.isConfigured,
      staleTime: 0, // Always consider data stale, force refetch on each read
      refetchInterval: 5000, // Refetch every 5 seconds to keep state in sync
    },
  });

  const { data: saleStart } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "saleStart",
    query: { enabled: config.isConfigured },
  });

  const { data: saleEnd } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "saleEnd",
    query: { enabled: config.isConfigured },
  });

  const { data: isBlacklisted } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "blacklist",
    args: address ? [address] : undefined,
    query: { enabled: config.isConfigured && !!address },
  });

  const { data: isSaleActive } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "isSaleActive",
    query: { enabled: config.isConfigured },
  });

  // Read whitelist status
  const { data: whitelistEnabled } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "whitelistEnabled",
    query: { enabled: config.isConfigured },
  });

  const { data: merkleRoot } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "merkleRoot",
    query: { enabled: config.isConfigured },
  });

  // Read owner address
  const { data: ownerAddress } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "owner",
    query: { enabled: config.isConfigured },
  });

  // Check if current wallet is owner
  const isOwner = useMemo(() => {
    if (!address || !ownerAddress) return false;
    return address.toLowerCase() === ownerAddress.toLowerCase();
  }, [address, ownerAddress]);

  const parsedUsdcAmount = useMemo(() => {
    if (!usdcAmount) return null;
    try {
      return parseUnits(usdcAmount, USDC_DECIMALS);
    } catch {
      return null;
    }
  }, [usdcAmount]);

  const needsApproval = useMemo(() => {
    if (!parsedUsdcAmount || !usdcAllowance) return true;
    return usdcAllowance < parsedUsdcAmount;
  }, [parsedUsdcAmount, usdcAllowance]);

  const handleApprove = async () => {
    if (!parsedUsdcAmount || !usdcTokenAddress) return;

    setTxStatus("pending");
    setTxError("");
    try {
      const hash = await writeContractAsync({
        address: usdcTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [config.address, parsedUsdcAmount],
      });
      setTxHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setTxStatus("success");
      // Refetch allowance after successful approve
      await refetchUsdcAllowance();
    } catch (error: any) {
      setTxStatus("error");
      setTxError(error?.message || "Approve failed");
    }
  };

  // Error signature to error name mapping (for manual matching when decodeErrorResult fails)
  const errorSignatureMap: Record<string, string> = {
    "0xe450d38c": "SalePaused",
    "0x2d0188f0": "SaleNotStarted", 
    "0x8164f842": "SaleEnded",
    "0xcf479181": "Blacklisted",
    "0xfeaf968c": "InvalidTier",
    "0x2d18a78c": "InvalidProof",
    "0x1f2a2005": "WhitelistNotConfigured",
    "0x3b4da69f": "AllocationExceeded",
  };

  const handlePurchase = async () => {
    if (!parsedUsdcAmount) return;

    setTxStatus("pending");
    setTxError("");
    try {
      // Directly read the latest paused status from contract, don't rely on React state cache
      let currentPausedStatus: boolean = false;
      if (publicClient) {
        try {
          currentPausedStatus = await publicClient.readContract({
            address: config.address,
            abi: config.abi,
            functionName: "paused",
          }) as boolean;
          
          // Also update React state cache for UI display
          await refetchPaused();
        } catch (error) {
          console.error("Failed to read paused status from contract:", error);
          // Fallback to cached state if read fails
          currentPausedStatus = paused === true;
        }
      } else {
        // If no publicClient, use cached state
        currentPausedStatus = paused === true;
      }
      
      // Check paused status before attempting purchase
      if (currentPausedStatus === true) {
        setTxStatus("error");
        setTxError("Sale is currently paused. Please wait for the sale to be unpaused.");
        return;
      }

      // Check if contract has POI tokens available
      if (contractPoiBalance !== undefined && contractPoiBalance === 0n) {
        setTxStatus("error");
        setTxError("Contract has no POI tokens available. Please contact the contract owner to deposit tokens.");
        return;
      }

      // Check if contract has enough POI tokens for the purchase
      if (contractPoiBalance !== undefined && parsedUsdcAmount && tierData && Array.isArray(tierData) && tierData.length >= 1) {
        const pricePerToken = tierData[0] as bigint | undefined;
        if (pricePerToken && pricePerToken > 0n) {
          // Calculate POI amount: (usdcAmount * 10^18) / (pricePerToken * 10^(18-6))
          // pricePerToken is in 6 decimals (USDC), we need to convert to 18 decimals (POI)
          const poiAmount = (parsedUsdcAmount * BigInt(10 ** POI_DECIMALS)) / (pricePerToken * BigInt(10 ** (POI_DECIMALS - USDC_DECIMALS)));
          if (poiAmount > contractPoiBalance) {
            setTxStatus("error");
            setTxError(`Insufficient POI tokens in contract. Contract has ${formatUnits(contractPoiBalance, POI_DECIMALS)} POI, but purchase requires ${formatUnits(poiAmount, POI_DECIMALS)} POI.`);
            return;
          }
        }
      }
      
      // First, try to simulate the transaction to get better error messages
      if (publicClient && address) {
        try {
          await publicClient.simulateContract({
            address: config.address,
            abi: config.abi,
            functionName: "purchase",
            args: [parsedUsdcAmount, []],
            account: address,
          });
        } catch (simulateError: any) {
          // If simulation fails, extract the error
          // Try multiple paths to find error data
          // First check if cause.data is already decoded (object with errorName)
          let simulateErrorData: any = 
            simulateError?.cause?.data || 
            simulateError?.data || 
            simulateError?.cause?.cause?.data ||
            simulateError?.cause?.reason?.data ||
            simulateError?.cause?.cause?.cause?.data;
          
          // If we have a shortMessage with error signature, extract it
          if (!simulateErrorData && simulateError?.shortMessage) {
            const signatureMatch = simulateError.shortMessage.match(/0x[a-fA-F0-9]{8}/);
            if (signatureMatch) {
              simulateErrorData = signatureMatch[0];
            }
          }
          
          // Also try to extract from cause.message or cause.shortMessage
          if (!simulateErrorData && simulateError?.cause) {
            const causeMsg = simulateError.cause.message || simulateError.cause.shortMessage || "";
            const signatureMatch = causeMsg.match(/0x[a-fA-F0-9]{8}/);
            if (signatureMatch) {
              simulateErrorData = signatureMatch[0];
            }
          }
            
          // Log full error for debugging
          console.error("Simulate error details:", {
            simulateError,
            simulateErrorData,
            message: simulateError?.message,
            shortMessage: simulateError?.shortMessage,
            cause: simulateError?.cause,
            causeData: simulateError?.cause?.data,
            causeMessage: simulateError?.cause?.message,
            whitelistEnabled,
            parsedUsdcAmount: parsedUsdcAmount?.toString(),
          });
            
          // Check if error data is already decoded (object with errorName)
          if (simulateErrorData && typeof simulateErrorData === "object" && "errorName" in simulateErrorData) {
            const errorName = (simulateErrorData as { errorName: string }).errorName;
            console.log("Error already decoded:", errorName);
            
            const errorMessages: Record<string, string> = {
              "SalePaused": "Sale is currently paused.",
              "SaleNotStarted": "Sale has not started yet.",
              "SaleEnded": "Sale has ended.",
              "Blacklisted": "Your address is blacklisted from participating in the sale.",
              "InvalidTier": "Invalid tier configuration.",
              "InvalidProof": "Whitelist proof is invalid or missing. Please provide a valid merkle proof.",
              "WhitelistNotConfigured": "Whitelist is enabled but not configured properly.",
              "AllocationExceeded": "Purchase amount exceeds your whitelist allocation.",
            };
            
            const friendlyMessage = errorMessages[errorName] || `Contract Error: ${errorName}`;
            setTxStatus("error");
            setTxError(friendlyMessage);
            return;
          }
          
          // Try to decode if error data is a hex string
          if (simulateErrorData && typeof simulateErrorData === "string" && simulateErrorData.startsWith("0x")) {
            try {
              const decoded = decodeErrorResult({
                abi: config.abi,
                data: simulateErrorData as `0x${string}`,
              });
              
              console.log("Decoded error:", decoded);
              
              const errorMessages: Record<string, string> = {
                "SalePaused": "Sale is currently paused.",
                "SaleNotStarted": "Sale has not started yet.",
                "SaleEnded": "Sale has ended.",
                "Blacklisted": "Your address is blacklisted from participating in the sale.",
                "InvalidTier": "Invalid tier configuration.",
                "InvalidProof": "Whitelist proof is invalid or missing. Please provide a valid merkle proof.",
                "WhitelistNotConfigured": "Whitelist is enabled but not configured properly.",
                "AllocationExceeded": "Purchase amount exceeds your whitelist allocation.",
              };
              
              const friendlyMessage = errorMessages[decoded.errorName] || `Contract Error: ${decoded.errorName}`;
              setTxStatus("error");
              setTxError(friendlyMessage);
              return;
            } catch (decodeError) {
              // If decode fails, try manual signature matching
              console.log("Decode failed, attempting manual signature matching...", {
                simulateErrorData,
                errorSignatureMap,
              });
              
              let errorName: string | undefined;
              
              // Try to match the signature from errorSignatureMap
              if (simulateErrorData && typeof simulateErrorData === "string" && simulateErrorData.length >= 10) {
                const signature = simulateErrorData.slice(0, 10) as `0x${string}`;
                console.log("Extracted signature:", signature, "Looking up in map:", errorSignatureMap[signature]);
                errorName = errorSignatureMap[signature];
                if (errorName) {
                  console.log("✅ Matched error signature manually:", signature, "->", errorName);
                } else {
                  console.warn("❌ Signature not found in map:", signature, "Available keys:", Object.keys(errorSignatureMap));
                }
              }
              
              // If still no match, try to extract from shortMessage
              if (!errorName && simulateError?.shortMessage) {
                const signatureMatch = simulateError.shortMessage.match(/0x[a-fA-F0-9]{8}/);
                if (signatureMatch) {
                  const signature = signatureMatch[0] as `0x${string}`;
                  errorName = errorSignatureMap[signature];
                  if (errorName) {
                    console.log("Matched error signature from shortMessage:", signature, "->", errorName);
                  }
                }
              }
              
              // Use matched error name if available (check before logging)
              if (errorName) {
                const errorMessages: Record<string, string> = {
                  "SalePaused": "Sale is currently paused.",
                  "SaleNotStarted": "Sale has not started yet.",
                  "SaleEnded": "Sale has ended.",
                  "Blacklisted": "Your address is blacklisted from participating in the sale.",
                  "InvalidTier": "Invalid tier configuration.",
                  "InvalidProof": "Whitelist proof is invalid or missing. Please provide a valid merkle proof.",
                  "WhitelistNotConfigured": "Whitelist is enabled but not configured properly.",
                  "AllocationExceeded": "Purchase amount exceeds your whitelist allocation.",
                };
                const friendlyMessage = errorMessages[errorName] || `Contract Error: ${errorName}`;
                setTxStatus("error");
                setTxError(friendlyMessage);
                return;
              }
              
              // Log decode failure only if we couldn't match the error
              console.error("Failed to decode simulate error:", decodeError, {
                errorData: simulateErrorData,
                errorName,
                fullError: simulateError,
              });
              
              // Try to extract error name from the error message
              const errorMessage = simulateError?.message || simulateError?.shortMessage || "";
              let friendlyMessage = "Transaction would fail. ";
              
              // Check for specific error patterns in the message
              if (whitelistEnabled && (errorMessage.includes("proof") || errorMessage.includes("Proof"))) {
                friendlyMessage += "Whitelist is enabled but no valid merkle proof was provided.";
              } else if (errorMessage.includes("SalePaused") || errorMessage.includes("paused")) {
                friendlyMessage += "Sale is currently paused.";
              } else if (errorMessage.includes("SaleNotStarted") || errorMessage.includes("not started")) {
                friendlyMessage += "Sale has not started yet.";
              } else if (errorMessage.includes("SaleEnded") || errorMessage.includes("ended")) {
                friendlyMessage += "Sale has ended.";
              } else if (errorMessage.includes("Blacklisted") || errorMessage.includes("blacklist")) {
                friendlyMessage += "Your address is blacklisted.";
              } else if (errorMessage.includes("below minimum") || errorMessage.includes("minimum")) {
                friendlyMessage += `Purchase amount is below the minimum contribution (${minContribution ? formatUnits(minContribution, USDC_DECIMALS) : "N/A"} USDC).`;
              } else if (errorMessage.includes("above maximum") || errorMessage.includes("maximum")) {
                friendlyMessage += `Purchase amount exceeds the maximum contribution limit.`;
              } else if (errorMessage.includes("tier sold out") || errorMessage.includes("sold out")) {
                friendlyMessage += "This tier is sold out.";
              } else if (errorMessage.includes("zero POI") || errorMessage.includes("zero amount")) {
                friendlyMessage += "Purchase amount is too small to receive any POI tokens.";
              } else if (whitelistEnabled) {
                friendlyMessage += "Whitelist is enabled - you need a valid merkle proof to purchase.";
              } else {
                // Last resort: provide helpful diagnostic info
                friendlyMessage += "Please check: ";
                const checks = [];
                if (minContribution && typeof minContribution === "bigint" && parsedUsdcAmount && parsedUsdcAmount < minContribution) {
                  checks.push(`minimum contribution (${formatUnits(minContribution, USDC_DECIMALS)} USDC)`);
                }
                if (maxContribution && typeof maxContribution === "bigint" && parsedUsdcAmount && parsedUsdcAmount > maxContribution) {
                  checks.push(`maximum contribution limit`);
                }
                if (paused) {
                  checks.push("sale is paused");
                }
                if (saleStart && typeof saleStart === "bigint" && saleStart > 0n) {
                  const now = BigInt(Math.floor(Date.now() / 1000));
                  if (now < saleStart) {
                    checks.push("sale has not started");
                  }
                }
                if (saleEnd && typeof saleEnd === "bigint" && saleEnd > 0n) {
                  const now = BigInt(Math.floor(Date.now() / 1000));
                  if (now > saleEnd) {
                    checks.push("sale has ended");
                  }
                }
                if (whitelistEnabled) {
                  checks.push("whitelist proof is required");
                }
                if (checks.length > 0) {
                  friendlyMessage += checks.join(", ");
                } else {
                  friendlyMessage += "sale conditions (whitelist, time window, contribution limits, etc.)";
                }
                friendlyMessage += ".";
              }
              
              setTxStatus("error");
              setTxError(friendlyMessage);
              return;
            }
          } else {
            // If we can't find error data, try to extract from message
            const simulateMessage = simulateError?.message || simulateError?.shortMessage || simulateError?.cause?.message || "Transaction simulation failed";
            let friendlyMessage = "Transaction would fail. ";
            
            // Check for specific error patterns
            if (whitelistEnabled && (simulateMessage.includes("proof") || simulateMessage.includes("Proof") || simulateMessage.includes("revert"))) {
              friendlyMessage += "Whitelist is enabled but no valid merkle proof was provided.";
            } else if (simulateMessage.includes("SalePaused") || simulateMessage.includes("paused")) {
              friendlyMessage += "Sale is currently paused.";
            } else if (simulateMessage.includes("SaleNotStarted") || simulateMessage.includes("not started")) {
              friendlyMessage += "Sale has not started yet.";
            } else if (simulateMessage.includes("SaleEnded") || simulateMessage.includes("ended")) {
              friendlyMessage += "Sale has ended.";
            } else if (simulateMessage.includes("Blacklisted") || simulateMessage.includes("blacklist")) {
              friendlyMessage += "Your address is blacklisted.";
            } else if (simulateMessage.includes("below minimum") || simulateMessage.includes("minimum")) {
              friendlyMessage += `Purchase amount is below the minimum contribution (${minContribution ? formatUnits(minContribution, USDC_DECIMALS) : "N/A"} USDC).`;
            } else if (simulateMessage.includes("above maximum") || simulateMessage.includes("maximum")) {
              friendlyMessage += `Purchase amount exceeds the maximum contribution limit.`;
            } else if (simulateMessage.includes("tier sold out") || simulateMessage.includes("sold out")) {
              friendlyMessage += "This tier is sold out.";
            } else if (simulateMessage.includes("zero POI") || simulateMessage.includes("zero amount")) {
              friendlyMessage += "Purchase amount is too small to receive any POI tokens.";
            } else if (whitelistEnabled) {
              friendlyMessage += "Whitelist is enabled - you need a valid merkle proof to purchase.";
            } else {
              // Last resort: provide helpful diagnostic info
              friendlyMessage += "Please check: ";
              const checks = [];
              if (minContribution && typeof minContribution === "bigint" && parsedUsdcAmount && parsedUsdcAmount < minContribution) {
                checks.push(`minimum contribution (${formatUnits(minContribution, USDC_DECIMALS)} USDC)`);
              }
              if (maxContribution && typeof maxContribution === "bigint" && parsedUsdcAmount && parsedUsdcAmount > maxContribution) {
                checks.push(`maximum contribution limit`);
              }
              if (paused) {
                checks.push("sale is paused");
              }
              if (saleStart && typeof saleStart === "bigint" && saleStart > 0n) {
                const now = BigInt(Math.floor(Date.now() / 1000));
                if (now < saleStart) {
                  checks.push("sale has not started");
                }
              }
              if (saleEnd && typeof saleEnd === "bigint" && saleEnd > 0n) {
                const now = BigInt(Math.floor(Date.now() / 1000));
                if (now > saleEnd) {
                  checks.push("sale has ended");
                }
              }
              if (whitelistEnabled) {
                checks.push("whitelist proof is required");
              }
              if (checks.length > 0) {
                friendlyMessage += checks.join(", ");
              } else {
                friendlyMessage += "sale conditions (whitelist, time window, contribution limits, etc.)";
              }
              friendlyMessage += ".";
            }
            
            setTxStatus("error");
            setTxError(friendlyMessage);
            return;
          }
        }
      }
      
      const hash = await writeContractAsync({
        address: config.address,
        abi: config.abi,
        functionName: "purchase",
        args: [parsedUsdcAmount, []],
      });
      setTxHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setTxStatus("success");
      setUsdcAmount("");
      // Refetch allowance and user contribution after successful purchase
      await refetchUsdcAllowance();
    } catch (error: any) {
      setTxStatus("error");
      setTxError(error?.message || "Purchase failed");
    }
  };

  const pricePerToken = tierData?.[0];
  const remainingTokens = tierData?.[1];

  // 首先，在组件开头计算可购买的最大数量
  const maxPurchasableTokens = useMemo(() => {
    if (!remainingTokens || !contractPoiBalance) return null;
    
    const remaining = typeof remainingTokens === "bigint" ? remainingTokens : 0n;
    const balance = typeof contractPoiBalance === "bigint" ? contractPoiBalance : 0n;
    
    // 取两者较小值
    return remaining < balance ? remaining : balance;
  }, [remainingTokens, contractPoiBalance]);

  const tokenBalanceDifference = useMemo(() => {
    if (!remainingTokens || !contractPoiBalance) return null;
    
    const remaining = typeof remainingTokens === "bigint" ? remainingTokens : 0n;
    const balance = typeof contractPoiBalance === "bigint" ? contractPoiBalance : 0n;
    
    return remaining - balance; // 正数表示逻辑剩余 > 实际余额，负数表示逻辑剩余 < 实际余额
  }, [remainingTokens, contractPoiBalance]);

  return (
    <ContractCard title={config.name} address={config.address} explorerBaseUrl={BASE_EXPLORER}>
      {/* Read-only data */}
      <div className="space-y-2 text-sm">
        {usdcTokenAddress && (
          <div className="mb-2 p-2 rounded bg-slate-100 dark:bg-slate-800">
            <div className="opacity-70 text-xs">USDC Token Address</div>
            <div className={cn("font-mono text-xs break-all", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {usdcTokenAddress}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="opacity-70">Current Tier</div>
            <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {currentTier !== undefined ? `Tier ${Number(currentTier) + 1}` : "--"}
            </div>
          </div>
          <div>
            <div className="opacity-70">Price per POI</div>
            <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {pricePerToken ? formatUnits(pricePerToken, USDC_DECIMALS) : "--"} USDC
            </div>
          </div>
          <div>
            <div className="opacity-70">Remaining Tokens</div>
            <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {remainingTokens ? formatUnits(remainingTokens, POI_DECIMALS) : "--"} POI
            </div>
          </div>
          <div>
            <div className="opacity-70">Contract POI Balance</div>
            <div className={cn(
              "font-semibold",
              contractPoiBalance && contractPoiBalance > 0n
                ? theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600"
                : theme === "cyberpunk" ? "text-red-400" : "text-red-600"
            )}>
              {contractPoiBalance !== undefined 
                ? `${formatUnits(contractPoiBalance, POI_DECIMALS)} POI`
                : "--"}
              {contractPoiBalance !== undefined && contractPoiBalance === 0n && (
                <span className="ml-2 text-xs">⚠️</span>
              )}
            </div>
          </div>
          <div>
            <div className="opacity-70">Total Raised</div>
            <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {totalRaised ? formatUnits(totalRaised, USDC_DECIMALS) : "--"} USDC
            </div>
          </div>
          <div>
            <div className="opacity-70">Min Contribution</div>
            <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {minContribution ? formatUnits(minContribution, USDC_DECIMALS) : "--"} USDC
            </div>
          </div>
          <div>
            <div className="opacity-70">Max Contribution</div>
            <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {maxContribution ? (maxContribution === 0n ? "∞" : formatUnits(maxContribution, USDC_DECIMALS)) : "--"} USDC
            </div>
          </div>
          <div className="col-span-2">
            <div className="opacity-70">Your Contribution</div>
            <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {userContribution ? formatUnits(userContribution, USDC_DECIMALS) : "0"} USDC
            </div>
          </div>
          {usdcBalance !== undefined && (
            <div className="col-span-2">
              <div className="opacity-70">Your USDC Balance</div>
              <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
                {formatUnits(usdcBalance, USDC_DECIMALS)} USDC
              </div>
            </div>
          )}
          {usdcAllowance !== undefined && (
            <div className="col-span-2">
              <div className="opacity-70">USDC Allowance</div>
              <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
                {formatUnits(usdcAllowance, USDC_DECIMALS)} USDC
              </div>
            </div>
          )}
        </div>

        {/* Sale Status Diagnostics */}
        <div className="mt-4 p-3 rounded border border-yellow-400/30 bg-yellow-50/10 dark:bg-yellow-900/10">
          <div className="text-xs font-semibold mb-2 opacity-70">Sale Status Diagnostics</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="opacity-70">Sale Active:</span>
              <span className={cn(
                "font-semibold",
                isSaleActive
                  ? theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                  : theme === "cyberpunk" ? "text-red-400" : "text-red-600"
              )}>
                {isSaleActive !== undefined ? (isSaleActive ? "✅ Yes" : "❌ No") : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-70">Paused:</span>
              <span className={cn(
                "font-semibold",
                paused
                  ? theme === "cyberpunk" ? "text-red-400" : "text-red-600"
                  : theme === "cyberpunk" ? "text-green-400" : "text-green-600"
              )}>
                {paused !== undefined ? (paused ? "❌ Yes" : "✅ No") : "--"}
              </span>
            </div>
            {saleStart !== undefined && saleStart !== 0n && (
              <div className="flex items-center justify-between">
                <span className="opacity-70">Sale Start:</span>
                <span className="font-mono text-xs">
                  {new Date(Number(saleStart) * 1000).toLocaleString()}
                </span>
              </div>
            )}
            {saleEnd !== undefined && saleEnd !== 0n && (
              <div className="flex items-center justify-between">
                <span className="opacity-70">Sale End:</span>
                <span className="font-mono text-xs">
                  {new Date(Number(saleEnd) * 1000).toLocaleString()}
                </span>
              </div>
            )}
            {isBlacklisted !== undefined && (
              <div className="flex items-center justify-between">
                <span className="opacity-70">Blacklisted:</span>
                <span className={cn(
                  "font-semibold",
                  isBlacklisted
                    ? theme === "cyberpunk" ? "text-red-400" : "text-red-600"
                    : theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                )}>
                  {isBlacklisted ? "❌ Yes" : "✅ No"}
                </span>
              </div>
            )}
            {whitelistEnabled !== undefined && (
              <div className="flex items-center justify-between">
                <span className="opacity-70">Whitelist Enabled:</span>
                <span className={cn(
                  "font-semibold",
                  whitelistEnabled
                    ? theme === "cyberpunk" ? "text-yellow-400" : "text-yellow-600"
                    : theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                )}>
                  {whitelistEnabled ? "⚠️ Yes (Proof Required)" : "✅ No"}
                </span>
              </div>
            )}
            {whitelistEnabled && merkleRoot && (
              <div className="flex items-center justify-between">
                <span className="opacity-70">Merkle Root:</span>
                <span className="font-mono text-xs break-all">
                  {typeof merkleRoot === "string" 
                    ? `${merkleRoot.slice(0, 10)}...${merkleRoot.slice(-8)}`
                    : merkleRoot 
                      ? `${String(merkleRoot).slice(0, 10)}...${String(merkleRoot).slice(-8)}`
                      : "--"}
                </span>
              </div>
            )}
            {parsedUsdcAmount && usdcBalance !== undefined && (
              <div className="flex items-center justify-between">
                <span className="opacity-70">Balance Check:</span>
                <span className={cn(
                  "font-semibold",
                  usdcBalance >= parsedUsdcAmount
                    ? theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                    : theme === "cyberpunk" ? "text-red-400" : "text-red-600"
                )}>
                  {usdcBalance >= parsedUsdcAmount ? "✅ Sufficient" : "❌ Insufficient"}
                </span>
              </div>
            )}
            {parsedUsdcAmount && usdcAllowance !== undefined && (
              <div className="flex items-center justify-between">
                <span className="opacity-70">Allowance Check:</span>
                <span className={cn(
                  "font-semibold",
                  usdcAllowance >= parsedUsdcAmount
                    ? theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                    : theme === "cyberpunk" ? "text-red-400" : "text-red-600"
                )}>
                  {usdcAllowance >= parsedUsdcAmount ? "✅ Sufficient" : "❌ Insufficient"}
                </span>
              </div>
            )}
            {contractPoiBalance !== undefined && (
              <div className="flex items-center justify-between">
                <span className="opacity-70">Contract POI Balance:</span>
                <span className={cn(
                  "font-semibold",
                  contractPoiBalance > 0n
                    ? theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                    : theme === "cyberpunk" ? "text-red-400" : "text-red-600"
                )}>
                  {contractPoiBalance > 0n 
                    ? `✅ ${formatUnits(contractPoiBalance, POI_DECIMALS)} POI available`
                    : "❌ No POI tokens in contract"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 在 "Sale Status Diagnostics" 部分添加以下代码： */}

        <div className="space-y-3 border-t pt-4 mt-4">
          <h3 className={cn("font-semibold text-sm", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700")}>
            Token Balance Diagnostics
          </h3>
          <div className="space-y-2 text-sm">
            <div className="p-3 rounded border bg-slate-50 dark:bg-slate-900/50">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="opacity-70">Remaining Tokens (Logical):</span>
                  <span className={cn(
                    "font-semibold font-mono",
                    remainingTokens && typeof remainingTokens === "bigint" && remainingTokens > 0n
                      ? theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600"
                      : theme === "cyberpunk" ? "text-red-400" : "text-red-600"
                  )}>
                    {remainingTokens && typeof remainingTokens === "bigint"
                      ? `${formatUnits(remainingTokens, POI_DECIMALS)} POI`
                      : "--"}
                  </span>
                </div>
                <div className="text-xs opacity-60 pl-2">
                  📊 Logic limit from tier configuration. Decreases when tokens are purchased.
                </div>
              </div>
            </div>

            <div className="p-3 rounded border bg-slate-50 dark:bg-slate-900/50">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="opacity-70">Contract POI Balance (Actual):</span>
                  <span className={cn(
                    "font-semibold font-mono",
                    contractPoiBalance && typeof contractPoiBalance === "bigint" && contractPoiBalance > 0n
                      ? theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                      : theme === "cyberpunk" ? "text-red-400" : "text-red-600"
                  )}>
                    {contractPoiBalance !== undefined && typeof contractPoiBalance === "bigint"
                      ? `${formatUnits(contractPoiBalance, POI_DECIMALS)} POI`
                      : "--"}
                  </span>
                </div>
                <div className="text-xs opacity-60 pl-2">
                  💰 Actual POI tokens held by the contract address. Increases when you transfer tokens.
                </div>
              </div>
            </div>

            {tokenBalanceDifference !== null && (
              <div className={cn(
                "p-3 rounded border",
                tokenBalanceDifference > 0n
                  ? theme === "cyberpunk" ? "bg-yellow-900/20 border-yellow-500/30" : "bg-yellow-50 border-yellow-200"
                  : tokenBalanceDifference < 0n
                  ? theme === "cyberpunk" ? "bg-blue-900/20 border-blue-500/30" : "bg-blue-50 border-blue-200"
                  : theme === "cyberpunk" ? "bg-green-900/20 border-green-500/30" : "bg-green-50 border-green-200"
              )}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="opacity-70">Difference:</span>
                    <span className={cn(
                      "font-semibold font-mono",
                      tokenBalanceDifference > 0n
                        ? theme === "cyberpunk" ? "text-yellow-400" : "text-yellow-600"
                        : tokenBalanceDifference < 0n
                        ? theme === "cyberpunk" ? "text-blue-400" : "text-blue-600"
                        : theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                    )}>
                      {tokenBalanceDifference > 0n ? "+" : ""}
                      {formatUnits(tokenBalanceDifference, POI_DECIMALS)} POI
                    </span>
                  </div>
                  <div className="text-xs opacity-70 pl-2">
                    {tokenBalanceDifference > 0n && (
                      <span className={theme === "cyberpunk" ? "text-yellow-300" : "text-yellow-700"}>
                        ⚠️ Logical limit is higher than actual balance. You need to transfer more POI tokens to the contract.
                      </span>
                    )}
                    {tokenBalanceDifference < 0n && (
                      <span className={theme === "cyberpunk" ? "text-blue-300" : "text-blue-700"}>
                        ℹ️ Actual balance is higher than logical limit. Consider configuring a new tier or increasing remainingTokens.
                      </span>
                    )}
                    {tokenBalanceDifference === 0n && (
                      <span className={theme === "cyberpunk" ? "text-green-300" : "text-green-700"}>
                        ✅ Perfect match! Logical limit equals actual balance.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {maxPurchasableTokens !== null && (
              <div className="p-3 rounded border bg-slate-50 dark:bg-slate-900/50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="opacity-70">Max Purchasable (Actual Limit):</span>
                    <span className={cn(
                      "font-semibold font-mono",
                      maxPurchasableTokens > 0n
                        ? theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                        : theme === "cyberpunk" ? "text-red-400" : "text-red-600"
                    )}>
                      {formatUnits(maxPurchasableTokens, POI_DECIMALS)} POI
                    </span>
                  </div>
                  <div className="text-xs opacity-60 pl-2">
                    �� The actual maximum you can purchase (min of logical limit and actual balance).
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase action */}
      <div className="space-y-3 border-t pt-4">
        <h3 className={cn("font-semibold text-sm", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700")}>
          Purchase POI
        </h3>
        {isOwner && (
          <div className={cn(
            "p-2 rounded text-xs",
            theme === "cyberpunk" 
              ? "bg-cyan-900/30 border border-cyan-500/30 text-cyan-300"
              : "bg-blue-50 border border-blue-200 text-blue-700"
          )}>
            ℹ️ Owner Note: As the contract owner, you can purchase tokens like any other user. Make sure the sale is not paused.
          </div>
        )}
        <div className="space-y-2">
          {whitelistEnabled && (
            <Alert className={cn(
              "border-yellow-400/50 bg-yellow-50/10 dark:bg-yellow-900/10",
              theme === "cyberpunk" && "border-yellow-400/30"
            )}>
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-xs">
                ⚠️ Whitelist is enabled. You need a valid merkle proof to purchase. 
                {merkleRoot && (
                  <span className="font-mono">
                    {" "}Merkle Root: {typeof merkleRoot === "string" 
                      ? `${merkleRoot.slice(0, 10)}...${merkleRoot.slice(-8)}`
                      : `${String(merkleRoot).slice(0, 10)}...${String(merkleRoot).slice(-8)}`}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
          <ThemedInput
            type="number"
            step="0.000001"
            placeholder="USDC amount"
            value={usdcAmount}
            onChange={(e) => setUsdcAmount(e.target.value)}
          />
          <div className="flex gap-2">
            {needsApproval && parsedUsdcAmount ? (
              <ThemedButton
                onClick={handleApprove}
                disabled={!parsedUsdcAmount || txStatus === "pending"}
                variant="outline"
                className="flex-1"
              >
                {txStatus === "pending" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  "Approve USDC"
                )}
              </ThemedButton>
            ) : null}
            <ThemedButton
              onClick={handlePurchase}
              disabled={!parsedUsdcAmount || needsApproval || txStatus === "pending"}
              className="flex-1"
              emphasis
            >
              {txStatus === "pending" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Purchasing...
                </>
              ) : (
                "Buy POI"
              )}
            </ThemedButton>
          </div>
        </div>
        <TransactionStatus status={txStatus} hash={txHash} error={txError} />
      </div>

      {/* Owner Functions */}
      {isOwner && (
        <div className="space-y-3 border-t pt-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={cn("font-semibold text-sm", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700")}>
              Owner Functions
            </h3>
            <span className={cn("text-xs px-2 py-0.5 rounded", theme === "cyberpunk" ? "bg-cyan-400/20 text-cyan-300" : "bg-blue-100 text-blue-700")}>
              Owner
            </span>
          </div>

          {/* Set Sale Window */}
          <div className="space-y-2">
            <h4 className={cn("text-xs font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-slate-600")}>
              Update Sale Window
            </h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs opacity-70 mb-1 block">Sale Start (Unix Timestamp)</label>
                <ThemedInput
                  type="number"
                  placeholder="e.g., 1734567890"
                  value={saleStartInput}
                  onChange={(e) => setSaleStartInput(e.target.value)}
                />
                {saleStartInput && (
                  <div className="text-xs mt-1 opacity-60">
                    {new Date(Number(saleStartInput) * 1000).toLocaleString()}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs opacity-70 mb-1 block">Sale End (Unix Timestamp, 0 = no end)</label>
                <ThemedInput
                  type="number"
                  placeholder="e.g., 1734654290 or 0"
                  value={saleEndInput}
                  onChange={(e) => setSaleEndInput(e.target.value)}
                />
                {saleEndInput && saleEndInput !== "0" && (
                  <div className="text-xs mt-1 opacity-60">
                    {new Date(Number(saleEndInput) * 1000).toLocaleString()}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <ThemedButton
                  onClick={async () => {
                    const now = Math.floor(Date.now() / 1000);
                    setSaleStartInput(now.toString());
                    setSaleEndInput((now + 86400).toString()); // 24 hours later
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Set 24h Window
                </ThemedButton>
                <ThemedButton
                  onClick={async () => {
                    setSaleStartInput("0");
                    setSaleEndInput("0");
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Clear Window
                </ThemedButton>
              </div>
              <ThemedButton
                onClick={async () => {
                  if (!saleStartInput && !saleEndInput) return;

                  setOwnerTxStatus("pending");
                  setOwnerTxError("");
                  try {
                    const start = saleStartInput ? BigInt(saleStartInput) : 0n;
                    const end = saleEndInput ? BigInt(saleEndInput) : 0n;

                    const hash = await writeContractAsync({
                      address: config.address,
                      abi: config.abi,
                      functionName: "setSaleWindow",
                      args: [start, end],
                    });
                    setOwnerTxHash(hash);

                    if (publicClient) {
                      await publicClient.waitForTransactionReceipt({ hash });
                    }
                    setOwnerTxStatus("success");
                    setSaleStartInput("");
                    setSaleEndInput("");
                    // Refetch sale window data
                    // Note: saleStart and saleEnd don't have refetch, so we reload
                    // In a production app, you'd want to add refetch to those queries
                    setTimeout(() => {
                      window.location.reload();
                    }, 2000);
                  } catch (error: any) {
                    setOwnerTxStatus("error");
                    let errorMessage = error?.message || "Set sale window failed";
                    if (error?.shortMessage) {
                      errorMessage = error.shortMessage;
                    } else if (error?.cause?.data) {
                      errorMessage = `Contract revert: ${error.cause.data}`;
                    } else if (error?.cause?.message) {
                      errorMessage = error.cause.message;
                    }
                    setOwnerTxError(errorMessage);
                  }
                }}
                disabled={(!saleStartInput && !saleEndInput) || ownerTxStatus === "pending"}
                className="w-full"
                emphasis
              >
                {ownerTxStatus === "pending" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Sale Window"
                )}
              </ThemedButton>
            </div>
            <TransactionStatus status={ownerTxStatus} hash={ownerTxHash} error={ownerTxError} />
          </div>

          {/* Pause/Unpause Sale */}
          <div className="space-y-2">
            <h4 className={cn("text-xs font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-slate-600")}>
              Sale Status
            </h4>
            <div className="flex items-center justify-between p-2 rounded border">
              <div>
                <div className="text-xs opacity-70">Current Status</div>
                <div className={cn(
                  "font-semibold text-sm",
                  paused
                    ? theme === "cyberpunk" ? "text-red-400" : "text-red-600"
                    : theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                )}>
                  {paused !== undefined ? (paused ? "⏸️ Paused" : "▶️ Active") : "--"}
                </div>
              </div>
              <ThemedButton
                onClick={async () => {
                  if (paused === undefined) return;

                  setOwnerTxStatus("pending");
                  setOwnerTxError("");
                  try {
                    // If paused is true, we want to unpause (set to false)
                    // If paused is false, we want to pause (set to true)
                    const newPausedStatus = !paused;
                    
                    const hash = await writeContractAsync({
                      address: config.address,
                      abi: config.abi,
                      functionName: "setPaused",
                      args: [newPausedStatus],
                    });
                    setOwnerTxHash(hash);

                    if (publicClient) {
                      await publicClient.waitForTransactionReceipt({ hash });
                    }
                    setOwnerTxStatus("success");
                    // Refetch paused status and other sale data
                    await refetchPaused();
                    // Also refetch other sale status
                    if (publicClient) {
                      // Small delay to ensure block is mined
                      setTimeout(async () => {
                        await refetchPaused();
                      }, 2000);
                    }
                  } catch (error: any) {
                    setOwnerTxStatus("error");
                    let errorMessage = error?.message || "Set paused status failed";
                    if (error?.shortMessage) {
                      errorMessage = error.shortMessage;
                    } else if (error?.cause?.data) {
                      errorMessage = `Contract revert: ${error.cause.data}`;
                    } else if (error?.cause?.message) {
                      errorMessage = error.cause.message;
                    }
                    setOwnerTxError(errorMessage);
                  }
                }}
                disabled={paused === undefined || ownerTxStatus === "pending"}
                variant={paused === true ? "default" : "outline"}
                size="sm"
                emphasis={paused === true}
              >
                {ownerTxStatus === "pending" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {paused ? "Unpausing..." : "Pausing..."}
                  </>
                ) : paused ? (
                  "▶️ Unpause Sale"
                ) : (
                  "⏸️ Pause Sale"
                )}
              </ThemedButton>
            </div>
            <TransactionStatus status={ownerTxStatus} hash={ownerTxHash} error={ownerTxError} />
          </div>

          {/* Configure Tiers */}
          <div className="space-y-2">
            <h4 className={cn("text-xs font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-slate-600")}>
              Configure Tiers
            </h4>
            
            {/* Current Tiers Display */}
            {tierCount !== undefined && typeof tierCount === "bigint" && Number(tierCount) > 0 && (
              <div className="p-2 rounded border bg-slate-50 dark:bg-slate-900/50 mb-2">
                <div className="text-xs opacity-70 mb-1">Current Tiers: {Number(tierCount)}</div>
                <div className="text-xs space-y-1">
                  {allTiersData.map((tierIndex) => (
                    <TierDisplayItem key={tierIndex} tierIndex={tierIndex} config={config} />
                  ))}
                </div>
              </div>
            )}

            {/* Tier Configuration Form */}
            <div className="space-y-2 p-2 rounded border">
              <div className="text-xs opacity-70 mb-2">Configure New Tiers (will replace all existing tiers)</div>
              
              {tierConfigs.map((tier, index) => (
                <div key={index} className="p-2 rounded border bg-slate-50 dark:bg-slate-800 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">Tier {index + 1}</span>
                    {tierConfigs.length > 1 && (
                      <ThemedButton
                        onClick={() => {
                          setTierConfigs(tierConfigs.filter((_, i) => i !== index));
                        }}
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        Remove
                      </ThemedButton>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs opacity-70 mb-1 block">Price (USDC per POI)</label>
                      <ThemedInput
                        type="number"
                        step="0.01"
                        placeholder="e.g., 2"
                        value={tier.price}
                        onChange={(e) => {
                          const newConfigs = [...tierConfigs];
                          newConfigs[index].price = e.target.value;
                          setTierConfigs(newConfigs);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs opacity-70 mb-1 block">Supply (POI tokens)</label>
                      <ThemedInput
                        type="number"
                        step="1"
                        placeholder="e.g., 500000"
                        value={tier.amount}
                        onChange={(e) => {
                          const newConfigs = [...tierConfigs];
                          newConfigs[index].amount = e.target.value;
                          setTierConfigs(newConfigs);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <ThemedButton
                  onClick={() => {
                    setTierConfigs([...tierConfigs, { price: "", amount: "" }]);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  + Add Tier
                </ThemedButton>
                <ThemedButton
                  onClick={() => {
                    setTierConfigs([{ price: "2", amount: "500000" }]);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Reset to Default
                </ThemedButton>
              </div>

              <ThemedButton
                onClick={async () => {
                  // 验证输入
                  const validConfigs = tierConfigs.filter(t => t.price && t.amount && parseFloat(t.price) > 0 && parseFloat(t.amount) > 0);
                  if (validConfigs.length === 0) {
                    setTierConfigError("At least one valid tier is required");
                    setTierConfigStatus("error");
                    return;
                  }

                  setTierConfigStatus("pending");
                  setTierConfigError("");

                  try {
                    // 转换价格和数量
                    const prices = validConfigs.map(t => parseUnits(t.price, USDC_DECIMALS));
                    const supplies = validConfigs.map(t => parseUnits(t.amount, POI_DECIMALS));

                    const hash = await writeContractAsync({
                      address: config.address,
                      abi: config.abi,
                      functionName: "configureTiers",
                      args: [prices, supplies],
                    });

                    setTierConfigHash(hash);

                    if (publicClient) {
                      await publicClient.waitForTransactionReceipt({ hash });
                    }

                    setTierConfigStatus("success");
                    // 刷新页面以更新显示
                    setTimeout(() => {
                      window.location.reload();
                    }, 2000);
                  } catch (error: any) {
                    setTierConfigStatus("error");
                    let errorMessage = error?.message || "Configure tiers failed";
                    if (error?.shortMessage) {
                      errorMessage = error.shortMessage;
                    } else if (error?.cause?.data) {
                      errorMessage = `Contract revert: ${error.cause.data}`;
                    } else if (error?.cause?.message) {
                      errorMessage = error.cause.message;
                    }
                    setTierConfigError(errorMessage);
                  }
                }}
                disabled={tierConfigStatus === "pending" || tierConfigs.length === 0}
                variant="default"
                size="sm"
                emphasis
                className="w-full"
              >
                {tierConfigStatus === "pending" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Configuring...
                  </>
                ) : (
                  "⚙️ Configure Tiers"
                )}
              </ThemedButton>

              <TransactionStatus status={tierConfigStatus} hash={tierConfigHash} error={tierConfigError} />
            </div>
          </div>

          {/* Fund Contract with POI Tokens */}
          {poiTokenAddress && (
            <FundContractCard
              tokenAddress={poiTokenAddress as `0x${string}`}
              tokenSymbol="POI"
              decimals={POI_DECIMALS}
              targetContractAddress={config.address}
              targetContractName="TGESale"
            />
          )}
        </div>
      )}
    </ContractCard>
  );
}

// Staking Rewards Card Component
function StakingRewardsCard({ address }: { address: `0x${string}` | undefined }) {
  const { theme } = useTheme();
  const config = CONTRACTS_CONFIG.stakingRewards;
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });

  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [stakeTxStatus, setStakeTxStatus] = useState<TxStatus>("idle");
  const [withdrawTxStatus, setWithdrawTxStatus] = useState<TxStatus>("idle");
  const [rewardTxStatus, setRewardTxStatus] = useState<TxStatus>("idle");
  const [stakeTxHash, setStakeTxHash] = useState<`0x${string}` | undefined>();
  const [withdrawTxHash, setWithdrawTxHash] = useState<`0x${string}` | undefined>();
  const [rewardTxHash, setRewardTxHash] = useState<`0x${string}` | undefined>();
  const [stakeTxError, setStakeTxError] = useState<string>("");
  const [withdrawTxError, setWithdrawTxError] = useState<string>("");
  const [rewardTxError, setRewardTxError] = useState<string>("");

  // Read contract data
  const { data: stakingToken } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "stakingToken",
    query: { enabled: config.isConfigured },
  });

  const { data: rewardToken } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "rewardToken",
    query: { enabled: config.isConfigured },
  });

  const { data: stakedBalance } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: config.isConfigured && !!address },
  });

  const { data: earned } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "earned",
    args: address ? [address] : undefined,
    query: { enabled: config.isConfigured && !!address },
  });

  const { data: rewardRate } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "rewardRate",
    query: { enabled: config.isConfigured },
  });

  const { data: periodFinish } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "periodFinish",
    query: { enabled: config.isConfigured },
  });

  // POI allowance for staking
  const { data: poiAllowance } = useReadContract({
    address: CONTRACTS_CONFIG.poiToken.address,
    abi: CONTRACTS_CONFIG.poiToken.abi,
    functionName: "allowance",
    args: address && config.isConfigured ? [address, config.address] : undefined,
    query: { enabled: config.isConfigured && !!address },
  });

  const parsedStakeAmount = useMemo(() => {
    if (!stakeAmount) return null;
    try {
      return parseUnits(stakeAmount, POI_DECIMALS);
    } catch {
      return null;
    }
  }, [stakeAmount]);

  const parsedWithdrawAmount = useMemo(() => {
    if (!withdrawAmount) return null;
    try {
      return parseUnits(withdrawAmount, POI_DECIMALS);
    } catch {
      return null;
    }
  }, [withdrawAmount]);

  const needsApproval = useMemo(() => {
    if (!parsedStakeAmount || !poiAllowance) return true;
    return poiAllowance < parsedStakeAmount;
  }, [parsedStakeAmount, poiAllowance]);

  const handleApprove = async () => {
    if (!parsedStakeAmount) return;

    setStakeTxStatus("pending");
    setStakeTxError("");
    try {
      const hash = await writeContractAsync({
        address: CONTRACTS_CONFIG.poiToken.address,
        abi: CONTRACTS_CONFIG.poiToken.abi,
        functionName: "approve",
        args: [config.address, parsedStakeAmount],
      });
      setStakeTxHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setStakeTxStatus("success");
    } catch (error: any) {
      setStakeTxStatus("error");
      setStakeTxError(error?.message || "Approve failed");
    }
  };

  const handleStake = async () => {
    if (!parsedStakeAmount) return;

    setStakeTxStatus("pending");
    setStakeTxError("");
    try {
      const hash = await writeContractAsync({
        address: config.address,
        abi: config.abi,
        functionName: "stake",
        args: [parsedStakeAmount],
      });
      setStakeTxHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setStakeTxStatus("success");
      setStakeAmount("");
    } catch (error: any) {
      setStakeTxStatus("error");
      setStakeTxError(error?.message || "Stake failed");
    }
  };

  const handleWithdraw = async () => {
    if (!parsedWithdrawAmount) return;

    setWithdrawTxStatus("pending");
    setWithdrawTxError("");
    try {
      const hash = await writeContractAsync({
        address: config.address,
        abi: config.abi,
        functionName: "withdraw",
        args: [parsedWithdrawAmount],
      });
      setWithdrawTxHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setWithdrawTxStatus("success");
      setWithdrawAmount("");
    } catch (error: any) {
      setWithdrawTxStatus("error");
      setWithdrawTxError(error?.message || "Withdraw failed");
    }
  };

  const handleGetReward = async () => {
    setRewardTxStatus("pending");
    setRewardTxError("");
    try {
      const hash = await writeContractAsync({
        address: config.address,
        abi: config.abi,
        functionName: "getReward",
      });
      setRewardTxHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setRewardTxStatus("success");
    } catch (error: any) {
      setRewardTxStatus("error");
      setRewardTxError(error?.message || "Get reward failed");
    }
  };

  return (
    <ContractCard title={config.name} address={config.address} explorerBaseUrl={BASE_EXPLORER}>
      {/* Read-only data */}
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="opacity-70">Staking Token</div>
            <div className={cn("font-mono text-xs", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {stakingToken ? formatAddress(stakingToken) : "--"}
            </div>
          </div>
          <div>
            <div className="opacity-70">Reward Token</div>
            <div className={cn("font-mono text-xs", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {rewardToken ? formatAddress(rewardToken) : "--"}
            </div>
          </div>
          <div>
            <div className="opacity-70">Staked Balance</div>
            <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {stakedBalance ? formatUnits(stakedBalance, POI_DECIMALS) : "0"} POI
            </div>
          </div>
          <div>
            <div className="opacity-70">Earned Rewards</div>
            <div className={cn("font-semibold", theme === "cyberpunk" ? "text-green-400" : "text-green-600")}>
              {earned ? formatUnits(earned, POI_DECIMALS) : "0"} POI
            </div>
          </div>
          <div>
            <div className="opacity-70">Reward Rate</div>
            <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {rewardRate ? formatUnits(rewardRate, POI_DECIMALS) : "--"} POI/sec
            </div>
          </div>
          <div>
            <div className="opacity-70">Period Finish</div>
            <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {periodFinish ? new Date(Number(periodFinish) * 1000).toLocaleString() : "--"}
            </div>
          </div>
        </div>
      </div>

      {/* Stake action */}
      <div className="space-y-3 border-t pt-4">
        <h3 className={cn("font-semibold text-sm", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700")}>
          Stake
        </h3>
        <div className="space-y-2">
          <ThemedInput
            type="number"
            step="0.000000000000000001"
            placeholder="POI amount"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
          />
          <div className="flex gap-2">
            {needsApproval && parsedStakeAmount ? (
              <ThemedButton
                onClick={handleApprove}
                disabled={!parsedStakeAmount || stakeTxStatus === "pending"}
                variant="outline"
                className="flex-1"
              >
                {stakeTxStatus === "pending" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  "Approve POI"
                )}
              </ThemedButton>
            ) : null}
            <ThemedButton
              onClick={handleStake}
              disabled={!parsedStakeAmount || needsApproval || stakeTxStatus === "pending"}
              className="flex-1"
              emphasis
            >
              {stakeTxStatus === "pending" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Staking...
                </>
              ) : (
                "Stake"
              )}
            </ThemedButton>
          </div>
        </div>
        <TransactionStatus status={stakeTxStatus} hash={stakeTxHash} error={stakeTxError} />
      </div>

      {/* Withdraw action */}
      <div className="space-y-3 border-t pt-4">
        <h3 className={cn("font-semibold text-sm", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700")}>
          Withdraw
        </h3>
        <div className="space-y-2">
          <ThemedInput
            type="number"
            step="0.000000000000000001"
            placeholder="POI amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <ThemedButton
            onClick={handleWithdraw}
            disabled={!parsedWithdrawAmount || withdrawTxStatus === "pending"}
            variant="outline"
            className="w-full"
          >
            {withdrawTxStatus === "pending" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Withdrawing...
              </>
            ) : (
              "Withdraw"
            )}
          </ThemedButton>
        </div>
        <TransactionStatus status={withdrawTxStatus} hash={withdrawTxHash} error={withdrawTxError} />
      </div>

      {/* Get Reward action */}
      {earned && earned > 0n && (
        <div className="space-y-3 border-t pt-4">
          <h3 className={cn("font-semibold text-sm", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700")}>
            Claim Reward
          </h3>
          <ThemedButton
            onClick={handleGetReward}
            disabled={rewardTxStatus === "pending"}
            className="w-full"
            emphasis
          >
            {rewardTxStatus === "pending" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Claiming...
              </>
            ) : (
              `Claim ${earned ? formatUnits(earned, POI_DECIMALS) : "0"} POI`
            )}
          </ThemedButton>
          <TransactionStatus status={rewardTxStatus} hash={rewardTxHash} error={rewardTxError} />
        </div>
      )}

      {/* Fund Contract with POI Tokens (for Staking Rewards - reward token) */}
      {rewardToken && typeof rewardToken === "string" && rewardToken !== "0x0000000000000000000000000000000000000000" && (
        <div className="space-y-3 border-t pt-4 mt-4">
          <FundContractCard
            tokenAddress={rewardToken as `0x${string}`}
            tokenSymbol="POI"
            decimals={POI_DECIMALS}
            targetContractAddress={config.address}
            targetContractName="StakingRewards"
          />
        </div>
      )}
    </ContractCard>
  );
}

// Vesting Vault Card Component
function VestingVaultCard({ address }: { address: `0x${string}` | undefined }) {
  const { theme } = useTheme();
  const config = CONTRACTS_CONFIG.vestingVault;
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });

  const [releaseTxStatus, setReleaseTxStatus] = useState<Record<number, TxStatus>>({});
  const [releaseTxHash, setReleaseTxHash] = useState<Record<number, `0x${string}` | undefined>>({});
  const [releaseTxError, setReleaseTxError] = useState<Record<number, string>>({});

  // Owner functions state
  const [createScheduleStatus, setCreateScheduleStatus] = useState<TxStatus>("idle");
  const [createScheduleHash, setCreateScheduleHash] = useState<`0x${string}` | undefined>();
  const [createScheduleError, setCreateScheduleError] = useState<string>("");
  
  const [beneficiary, setBeneficiary] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [startTime, setStartTime] = useState("");
  const [cliffDuration, setCliffDuration] = useState("");
  const [vestingDuration, setVestingDuration] = useState("");
  const [slicePeriod, setSlicePeriod] = useState("86400"); // Default: 1 day
  const [revocable, setRevocable] = useState(true);

  // Read owner and token address
  const { data: ownerAddress } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "owner",
    query: { enabled: config.isConfigured },
  });

  const { data: tokenAddress } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "token",
    query: { enabled: config.isConfigured },
  });

  // Check if current user is owner
  const isOwner = useMemo(() => {
    if (!address || !ownerAddress) return false;
    return address.toLowerCase() === (typeof ownerAddress === "string" ? ownerAddress : String(ownerAddress)).toLowerCase();
  }, [address, ownerAddress]);

  // Read contract POI balance
  const { data: contractPoiBalance } = useReadContract({
    address: tokenAddress as `0x${string}` | undefined,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [config.address],
    query: { enabled: config.isConfigured && !!tokenAddress },
  });

  // Get all schedules for the user
  const { data: schedules } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "schedulesOf",
    args: address ? [address] : undefined,
    query: { enabled: config.isConfigured && !!address },
  });

  // For each schedule, get details
  const scheduleDetails = useMemo(() => {
    if (!schedules || !Array.isArray(schedules)) return [];
    return schedules.map((scheduleId) => ({
      id: Number(scheduleId),
    }));
  }, [schedules]);

  const handleRelease = async (scheduleId: number) => {
    setReleaseTxStatus((prev) => ({ ...prev, [scheduleId]: "pending" }));
    setReleaseTxError((prev) => ({ ...prev, [scheduleId]: "" }));
    try {
      const hash = await writeContractAsync({
        address: config.address,
        abi: config.abi,
        functionName: "release",
        args: [BigInt(scheduleId)],
      });
      setReleaseTxHash((prev) => ({ ...prev, [scheduleId]: hash }));

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setReleaseTxStatus((prev) => ({ ...prev, [scheduleId]: "success" }));
    } catch (error: any) {
      setReleaseTxStatus((prev) => ({ ...prev, [scheduleId]: "error" }));
      setReleaseTxError((prev) => ({ ...prev, [scheduleId]: error?.message || "Release failed" }));
    }
  };

  const handleCreateSchedule = async () => {
    if (!beneficiary || !totalAmount || !startTime || !vestingDuration) {
      setCreateScheduleError("Please fill in all required fields");
      setCreateScheduleStatus("error");
      return;
    }

    setCreateScheduleStatus("pending");
    setCreateScheduleError("");

    try {
      const parsedAmount = parseUnits(totalAmount, POI_DECIMALS);
      const parsedStart = BigInt(Math.floor(new Date(startTime).getTime() / 1000));
      const parsedCliff = BigInt(cliffDuration || "0");
      const parsedDuration = BigInt(vestingDuration);
      const parsedSlice = BigInt(slicePeriod || "86400");

      const hash = await writeContractAsync({
        address: config.address,
        abi: config.abi,
        functionName: "createSchedule",
        args: [
          beneficiary as `0x${string}`,
          parsedAmount,
          parsedStart,
          parsedCliff,
          parsedDuration,
          parsedSlice,
          revocable,
        ],
      });

      setCreateScheduleHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }

      setCreateScheduleStatus("success");
      // Reset form
      setBeneficiary("");
      setTotalAmount("");
      setStartTime("");
      setCliffDuration("");
      setVestingDuration("");
      setSlicePeriod("86400");
      setRevocable(true);
      
      // Refresh after a delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      setCreateScheduleStatus("error");
      let errorMessage = error?.message || "Create schedule failed";
      if (error?.shortMessage) {
        errorMessage = error.shortMessage;
      } else if (error?.cause?.data) {
        errorMessage = `Contract revert: ${error.cause.data}`;
      } else if (error?.cause?.message) {
        errorMessage = error.cause.message;
      }
      setCreateScheduleError(errorMessage);
    }
  };

  return (
    <ContractCard title={config.name} address={config.address} explorerBaseUrl={BASE_EXPLORER}>
      {/* Token Balance Diagnostics */}
      {contractPoiBalance !== undefined && (
        <div className="space-y-2 mb-4 p-3 rounded border bg-slate-50 dark:bg-slate-900/50">
          <div className="text-xs font-semibold opacity-70 mb-1">Contract Balance</div>
          <div className={cn(
            "text-sm font-mono font-semibold",
            contractPoiBalance && typeof contractPoiBalance === "bigint" && contractPoiBalance > 0n
              ? theme === "cyberpunk" ? "text-green-400" : "text-green-600"
              : theme === "cyberpunk" ? "text-red-400" : "text-red-600"
          )}>
            {contractPoiBalance && typeof contractPoiBalance === "bigint"
              ? `${formatUnits(contractPoiBalance, POI_DECIMALS)} POI`
              : "0 POI"}
          </div>
          <div className="text-xs opacity-60">
            💰 POI tokens available in the contract for vesting releases
          </div>
        </div>
      )}

      {/* Read-only data */}
      <div className="space-y-2 text-sm">
        <div className="opacity-70 mb-2">Schedules: {scheduleDetails.length}</div>
        {scheduleDetails.length === 0 ? (
          <div className="text-center py-4 opacity-70">No vesting schedules found</div>
        ) : (
          <div className="space-y-3">
            {scheduleDetails.map((schedule) => (
              <ScheduleRow
                key={schedule.id}
                scheduleId={schedule.id}
                address={address}
                config={config}
                onRelease={handleRelease}
                txStatus={releaseTxStatus[schedule.id] || "idle"}
                txHash={releaseTxHash[schedule.id]}
                txError={releaseTxError[schedule.id]}
                isOwner={isOwner}
              />
            ))}
          </div>
        )}
      </div>

      {/* Owner Functions */}
      {isOwner && (
        <div className="space-y-3 border-t pt-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={cn("font-semibold text-sm", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700")}>
              Owner Functions
            </h3>
            <span className={cn("text-xs px-2 py-0.5 rounded", theme === "cyberpunk" ? "bg-cyan-400/20 text-cyan-300" : "bg-blue-100 text-blue-700")}>
              Owner
            </span>
          </div>

          {/* Create Schedule */}
          <div className="space-y-2">
            <h4 className={cn("text-xs font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-slate-600")}>
              Create Vesting Schedule
            </h4>
            <div className="space-y-2 p-2 rounded border">
              <div>
                <label className="text-xs opacity-70 mb-1 block">Beneficiary Address</label>
                <ThemedInput
                  placeholder="0x..."
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs opacity-70 mb-1 block">Total Amount (POI)</label>
                <ThemedInput
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 1000000"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs opacity-70 mb-1 block">Start Time</label>
                  <ThemedInput
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs opacity-70 mb-1 block">Cliff Duration (seconds)</label>
                  <ThemedInput
                    type="number"
                    placeholder="e.g., 0"
                    value={cliffDuration}
                    onChange={(e) => setCliffDuration(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs opacity-70 mb-1 block">Vesting Duration (seconds)</label>
                  <ThemedInput
                    type="number"
                    placeholder="e.g., 2592000 (30 days)"
                    value={vestingDuration}
                    onChange={(e) => setVestingDuration(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs opacity-70 mb-1 block">Slice Period (seconds)</label>
                  <ThemedInput
                    type="number"
                    placeholder="e.g., 86400 (1 day)"
                    value={slicePeriod}
                    onChange={(e) => setSlicePeriod(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={revocable}
                  onChange={(e) => setRevocable(e.target.checked)}
                  className="rounded"
                />
                <label className="text-xs opacity-70">Revocable</label>
              </div>
              <ThemedButton
                onClick={handleCreateSchedule}
                disabled={createScheduleStatus === "pending"}
                variant="default"
                size="sm"
                emphasis
                className="w-full"
              >
                {createScheduleStatus === "pending" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "➕ Create Schedule"
                )}
              </ThemedButton>
              <TransactionStatus status={createScheduleStatus} hash={createScheduleHash} error={createScheduleError} />
            </div>
          </div>

          {/* Fund Contract with POI Tokens */}
          {tokenAddress && (
            <FundContractCard
              tokenAddress={tokenAddress as `0x${string}`}
              tokenSymbol="POI"
              decimals={POI_DECIMALS}
              targetContractAddress={config.address}
              targetContractName="VestingVault"
            />
          )}
        </div>
      )}
    </ContractCard>
  );
}

// Schedule Row Component for Vesting
function ScheduleRow({
  scheduleId,
  address,
  config,
  onRelease,
  txStatus,
  txHash,
  txError,
  isOwner = false,
}: {
  scheduleId: number;
  address: `0x${string}` | undefined;
  config: typeof CONTRACTS_CONFIG.vestingVault;
  onRelease: (id: number) => void;
  txStatus: TxStatus;
  txHash?: `0x${string}`;
  txError?: string;
  isOwner?: boolean;
}) {
  const { theme } = useTheme();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });

  const [revokeTxStatus, setRevokeTxStatus] = useState<TxStatus>("idle");
  const [revokeTxHash, setRevokeTxHash] = useState<`0x${string}` | undefined>();
  const [revokeTxError, setRevokeTxError] = useState<string>("");

  const { data: schedule } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "getSchedule",
    args: [BigInt(scheduleId)],
    query: { enabled: config.isConfigured },
  });

  const { data: releasable } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "releasableAmount",
    args: [BigInt(scheduleId)],
    query: { enabled: config.isConfigured },
  });

  const handleRevoke = async () => {
    setRevokeTxStatus("pending");
    setRevokeTxError("");
    try {
      const hash = await writeContractAsync({
        address: config.address,
        abi: config.abi,
        functionName: "revoke",
        args: [BigInt(scheduleId)],
      });
      setRevokeTxHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setRevokeTxStatus("success");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      setRevokeTxStatus("error");
      let errorMessage = error?.message || "Revoke failed";
      if (error?.shortMessage) {
        errorMessage = error.shortMessage;
      } else if (error?.cause?.data) {
        errorMessage = `Contract revert: ${error.cause.data}`;
      } else if (error?.cause?.message) {
        errorMessage = error.cause.message;
      }
      setRevokeTxError(errorMessage);
    }
  };

  if (!schedule) return null;

  // 修复：schedule 是对象（struct），不是数组
  // 根据 ABI，结构体字段为：beneficiary, totalAmount, released, start, cliff, duration, ...
  // wagmi/viem 返回的结构体可能是对象或数组，需要兼容处理
  const scheduleObj = schedule as any;
  const total = scheduleObj.totalAmount ?? (Array.isArray(schedule) ? schedule[1] : undefined);
  const released = scheduleObj.released ?? (Array.isArray(schedule) ? schedule[2] : undefined);
  const start = scheduleObj.start ?? (Array.isArray(schedule) ? schedule[3] : undefined);
  const duration = scheduleObj.duration ?? (Array.isArray(schedule) ? schedule[5] : undefined);
  const revocable = scheduleObj.revocable ?? (Array.isArray(schedule) ? schedule[6] : undefined);
  const revoked = scheduleObj.revoked ?? (Array.isArray(schedule) ? schedule[7] : undefined);
  
  // 添加空值检查，确保所有必需字段都存在
  if (total === undefined || released === undefined || start === undefined || duration === undefined) {
    return null;
  }

  const end = start + duration;

  return (
    <div className={cn(
      "p-3 rounded-lg border",
      theme === "cyberpunk" ? "bg-slate-900/60 border-cyan-400/20" : "bg-slate-50 border-slate-200"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700")}>
          Schedule #{scheduleId}
          {revoked && (
            <span className={cn("ml-2 text-xs px-1.5 py-0.5 rounded", theme === "cyberpunk" ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-700")}>
              Revoked
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {isOwner && revocable && !revoked && (
            <ThemedButton
              onClick={handleRevoke}
              disabled={revokeTxStatus === "pending"}
              variant="outline"
              size="sm"
            >
              {revokeTxStatus === "pending" ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke"
              )}
            </ThemedButton>
          )}
          <ThemedButton
            onClick={() => onRelease(scheduleId)}
            disabled={!releasable || releasable === 0n || txStatus === "pending" || revoked}
            size="sm"
          >
            {txStatus === "pending" ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Releasing...
              </>
            ) : (
              "Release"
            )}
          </ThemedButton>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="opacity-70">Total</div>
          <div>{total ? formatUnits(total, POI_DECIMALS) : "--"} POI</div>
        </div>
        <div>
          <div className="opacity-70">Released</div>
          <div>{released ? formatUnits(released, POI_DECIMALS) : "--"} POI</div>
        </div>
        <div>
          <div className="opacity-70">Releasable</div>
          <div className={cn(
            "font-semibold",
            releasable && releasable > 0n
              ? theme === "cyberpunk" ? "text-green-400" : "text-green-600"
              : "opacity-50"
          )}>
            {releasable ? formatUnits(releasable, POI_DECIMALS) : "0"} POI
          </div>
        </div>
        <div>
          <div className="opacity-70">End</div>
          <div>{end ? new Date(Number(end) * 1000).toLocaleDateString() : "--"}</div>
        </div>
      </div>
      {txStatus !== "idle" && (
        <div className="mt-2">
          <TransactionStatus status={txStatus} hash={txHash} error={txError} />
        </div>
      )}
      {revokeTxStatus !== "idle" && (
        <div className="mt-2">
          <TransactionStatus status={revokeTxStatus} hash={revokeTxHash} error={revokeTxError} />
        </div>
      )}
    </div>
  );
}

// Merkle Airdrop Card Component
function MerkleAirdropCard({ address }: { address: `0x${string}` | undefined }) {
  const { theme } = useTheme();
  const config = CONTRACTS_CONFIG.merkleAirdrop;
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });

  const [eligibility, setEligibility] = useState<{
    roundId: number;
    index: number;
    amount: bigint;
    proof: `0x${string}`[];
  } | null>(null);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [txError, setTxError] = useState<string>("");

  // Read contract data
  const { data: currentRound } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "currentRound",
    query: { enabled: config.isConfigured },
  });

  const { data: paused } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "paused",
    query: { enabled: config.isConfigured },
  });

  const { data: isClaimed } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "isClaimed",
    args: eligibility ? [BigInt(eligibility.roundId), BigInt(eligibility.index)] : undefined,
    query: { enabled: config.isConfigured && !!eligibility },
  });

  const checkEligibility = async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/airdrop/check?address=${address}`);
      if (!response.ok) {
        throw new Error("Failed to check eligibility");
      }
      const data = await response.json();
      if (data.eligible && data.index !== undefined && data.amount && data.proof) {
        setEligibility({
          roundId: data.roundId || 0,
          index: data.index,
          amount: BigInt(data.amount),
          proof: data.proof,
        });
      } else {
        setEligibility(null);
      }
    } catch (error: any) {
      setTxError(error?.message || "Failed to check eligibility");
    }
  };

  const handleClaim = async () => {
    if (!eligibility) return;

    setTxStatus("pending");
    setTxError("");
    try {
      const hash = await writeContractAsync({
        address: config.address,
        abi: config.abi,
        functionName: "claim",
        args: [
          BigInt(eligibility.roundId),
          BigInt(eligibility.index),
          eligibility.amount,
          eligibility.proof,
        ],
      });
      setTxHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setTxStatus("success");
      setEligibility(null);
    } catch (error: any) {
      setTxStatus("error");
      setTxError(error?.message || "Claim failed");
    }
  };

  return (
    <ContractCard title={config.name} address={config.address} explorerBaseUrl={BASE_EXPLORER}>
      {/* Read-only data */}
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="opacity-70">Current Round</div>
            <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {currentRound !== undefined ? currentRound.toString() : "--"}
            </div>
          </div>
          <div>
            <div className="opacity-70">Paused</div>
            <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {paused !== undefined ? (paused ? "Yes" : "No") : "--"}
            </div>
          </div>
          {eligibility && (
            <>
              <div>
                <div className="opacity-70">Eligible Amount</div>
                <div className={cn("font-semibold", theme === "cyberpunk" ? "text-green-400" : "text-green-600")}>
                  {formatUnits(eligibility.amount, POI_DECIMALS)} POI
                </div>
              </div>
              <div>
                <div className="opacity-70">Index</div>
                <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
                  {eligibility.index}
                </div>
              </div>
              <div>
                <div className="opacity-70">Claimed</div>
                <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
                  {isClaimed !== undefined ? (isClaimed ? "Yes" : "No") : "--"}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Claim action */}
      <div className="space-y-3 border-t pt-4">
        <h3 className={cn("font-semibold text-sm", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700")}>
          Claim Airdrop
        </h3>
        <div className="space-y-2">
          <ThemedButton onClick={checkEligibility} variant="outline" className="w-full">
            Check Eligibility
          </ThemedButton>
          {eligibility && !isClaimed && (
            <ThemedButton
              onClick={handleClaim}
              disabled={txStatus === "pending" || paused}
              className="w-full"
              emphasis
            >
              {txStatus === "pending" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                "Claim Airdrop"
              )}
            </ThemedButton>
          )}
        </div>
        <TransactionStatus status={txStatus} hash={txHash} error={txError} />
      </div>

      {/* Fund Contract with POI Tokens (for MerkleAirdrop) */}
      <div className="space-y-3 border-t pt-4 mt-4">
        <FundContractCard
          tokenAddress={CONTRACTS_CONFIG.poiToken.address}
          tokenSymbol="POI"
          decimals={POI_DECIMALS}
          targetContractAddress={config.address}
          targetContractName="MerkleAirdrop"
        />
      </div>
    </ContractCard>
  );
}

// Early Bird Allowlist Card Component
function EarlyBirdAllowlistCard({ address }: { address: `0x${string}` | undefined }) {
  const { theme } = useTheme();
  const config = CONTRACTS_CONFIG.earlyBirdAllowlist;

  // Read contract data
  const { data: merkleRoot } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "merkleRoot",
    query: { enabled: config.isConfigured },
  });

  const { data: rootVersion } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "rootVersion",
    query: { enabled: config.isConfigured },
  });

  const { data: remaining } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "remaining",
    args: address ? [address] : undefined,
    query: { enabled: config.isConfigured && !!address },
  });

  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [verifyTxStatus, setVerifyTxStatus] = useState<TxStatus>("idle");
  const [verifyArgs, setVerifyArgs] = useState<{
    allocation: bigint;
    proof: `0x${string}`[];
  } | null>(null);

  // Read verification result when args are set
  const { data: verified } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "verify",
    args: address && verifyArgs ? [address, verifyArgs.allocation, verifyArgs.proof] : undefined,
    query: { enabled: config.isConfigured && !!address && !!verifyArgs },
  });

  // Update result when verified changes
  React.useEffect(() => {
    if (verified !== undefined && verifyArgs) {
      setVerifyResult(verified);
      setVerifyTxStatus("success");
    }
  }, [verified, verifyArgs]);

  const checkVerification = async () => {
    if (!address) return;

    setVerifyTxStatus("pending");
    try {
      const response = await fetch(`/api/early-bird/check?address=${address}`);
      if (!response.ok) {
        throw new Error("Failed to check allowlist");
      }
      const data = await response.json();
      if (data.allocation && data.proof) {
        setVerifyArgs({
          allocation: BigInt(data.allocation),
          proof: data.proof,
        });
      } else {
        setVerifyResult(false);
        setVerifyTxStatus("error");
      }
    } catch (error: any) {
      setVerifyTxStatus("error");
      setVerifyResult(false);
    }
  };

  return (
    <ContractCard title={config.name} address={config.address} explorerBaseUrl={BASE_EXPLORER}>
      {/* Read-only data */}
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="opacity-70">Merkle Root</div>
            <div className={cn("font-mono text-xs break-all", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {merkleRoot ? `${merkleRoot.slice(0, 10)}...${merkleRoot.slice(-8)}` : "--"}
            </div>
          </div>
          <div>
            <div className="opacity-70">Root Version</div>
            <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {rootVersion !== undefined ? rootVersion.toString() : "--"}
            </div>
          </div>
          <div className="col-span-2">
            <div className="opacity-70">Your Remaining Allocation</div>
            <div className={cn("font-semibold text-lg", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {remaining ? formatUnits(remaining, POI_DECIMALS) : "0"} POI
            </div>
          </div>
          {verifyResult !== null && (
            <div className="col-span-2">
              <div className="opacity-70">Verification Result</div>
              <div className={cn(
                "font-semibold",
                verifyResult
                  ? theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                  : theme === "cyberpunk" ? "text-red-400" : "text-red-600"
              )}>
                {verifyResult ? "✅ Verified" : "❌ Not Verified"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verify action */}
      <div className="space-y-3 border-t pt-4">
        <h3 className={cn("font-semibold text-sm", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700")}>
          Verify Allowlist
        </h3>
        <ThemedButton onClick={checkVerification} variant="outline" className="w-full">
          Check Verification
        </ThemedButton>
        <TransactionStatus status={verifyTxStatus} error={verifyTxStatus === "error" ? "Verification failed" : undefined} />
      </div>
    </ContractCard>
  );
}

// Referral Registry Card Component
function ReferralRegistryCard({ address }: { address: `0x${string}` | undefined }) {
  const { theme } = useTheme();
  const config = CONTRACTS_CONFIG.referralRegistry;
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });

  const [referrerAddress, setReferrerAddress] = useState("");
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [txError, setTxError] = useState<string>("");

  // Read contract data
  const { data: referral } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "getReferral",
    args: address ? [address] : undefined,
    query: { enabled: config.isConfigured && !!address },
  });

  const { data: referralCount } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "referralCounts",
    args: address ? [address] : undefined,
    query: { enabled: config.isConfigured && !!address },
  });

  const handleRegister = async () => {
    if (!referrerAddress || !address) return;

    setTxStatus("pending");
    setTxError("");
    try {
      // Generate a code (simplified - in production this should be more sophisticated)
      const code = `0x${Math.random().toString(16).slice(2).padStart(64, "0")}` as `0x${string}`;
      const hash = await writeContractAsync({
        address: config.address,
        abi: config.abi,
        functionName: "register",
        args: [referrerAddress as `0x${string}`, address, code],
      });
      setTxHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setTxStatus("success");
      setReferrerAddress("");
    } catch (error: any) {
      setTxStatus("error");
      setTxError(error?.message || "Register failed");
    }
  };

  return (
    <ContractCard title={config.name} address={config.address} explorerBaseUrl={BASE_EXPLORER}>
      {/* Read-only data */}
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="opacity-70">Your Referrer</div>
            <div className={cn("font-mono text-xs", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {referral && referral.exists
                ? formatAddress(referral.inviter)
                : "None"}
            </div>
          </div>
          <div>
            <div className="opacity-70">Your Referrals</div>
            <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
              {referralCount ? referralCount.toString() : "0"}
            </div>
          </div>
        </div>
      </div>

      {/* Register action */}
      <div className="space-y-3 border-t pt-4">
        <h3 className={cn("font-semibold text-sm", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700")}>
          Set Referrer
        </h3>
        <div className="space-y-2">
          <ThemedInput
            placeholder="Referrer address (0x...)"
            value={referrerAddress}
            onChange={(e) => setReferrerAddress(e.target.value)}
          />
          <ThemedButton
            onClick={handleRegister}
            disabled={!referrerAddress || txStatus === "pending"}
            className="w-full"
            emphasis
          >
            {txStatus === "pending" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              "Register Referral"
            )}
          </ThemedButton>
        </div>
        <TransactionStatus status={txStatus} hash={txHash} error={txError} />
      </div>
    </ContractCard>
  );
}

// Achievement Badges Card Component
function AchievementBadgesCard({ address }: { address: `0x${string}` | undefined }) {
  const { theme } = useTheme();
  const config = CONTRACTS_CONFIG.achievementBadges;
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });
  const isDev = import.meta.env.MODE === "development" || import.meta.env.DEV;

  const [badgeId, setBadgeId] = useState("");
  const [mintTxStatus, setMintTxStatus] = useState<TxStatus>("idle");
  const [mintTxHash, setMintTxHash] = useState<`0x${string}` | undefined>();
  const [mintTxError, setMintTxError] = useState<string>("");

  // Check balance for common badge IDs (0-10)
  const badgeBalances = Array.from({ length: 11 }, (_, i) => {
    const { data: balance } = useReadContract({
      address: config.address,
      abi: config.abi,
      functionName: "balanceOf",
      args: address ? [address, BigInt(i)] : undefined,
      query: { enabled: config.isConfigured && !!address },
    });
    return { id: i, balance: balance || 0n };
  });

  const handleMint = async () => {
    if (!badgeId || !address) return;

    setMintTxStatus("pending");
    setMintTxError("");
    try {
      const hash = await writeContractAsync({
        address: config.address,
        abi: config.abi,
        functionName: "mintBadge",
        args: [address, BigInt(badgeId)],
      });
      setMintTxHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setMintTxStatus("success");
      setBadgeId("");
    } catch (error: any) {
      setMintTxStatus("error");
      setMintTxError(error?.message || "Mint failed");
    }
  };

  const ownedBadges = badgeBalances.filter((b) => b.balance > 0n);

  return (
    <ContractCard title={config.name} address={config.address} explorerBaseUrl={BASE_EXPLORER}>
      {/* Read-only data */}
      <div className="space-y-2 text-sm">
        <div className="opacity-70 mb-2">Owned Badges: {ownedBadges.length}</div>
        {ownedBadges.length === 0 ? (
          <div className="text-center py-4 opacity-70">No badges owned</div>
        ) : (
          <div className="space-y-2">
            {ownedBadges.map((badge) => (
              <div
                key={badge.id}
                className={cn(
                  "p-2 rounded border flex items-center justify-between",
                  theme === "cyberpunk" ? "bg-slate-900/60 border-cyan-400/20" : "bg-slate-50 border-slate-200"
                )}
              >
                <div>
                  <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700")}>
                    Badge #{badge.id}
                  </div>
                  <div className="text-xs opacity-70">Balance: {badge.balance.toString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dev Mint action */}
      {isDev && (
        <div className="space-y-3 border-t pt-4">
          <h3 className={cn("font-semibold text-sm", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700")}>
            Dev Mint (Development Only)
          </h3>
          <div className="space-y-2">
            <ThemedInput
              type="number"
              placeholder="Badge ID"
              value={badgeId}
              onChange={(e) => setBadgeId(e.target.value)}
            />
            <ThemedButton
              onClick={handleMint}
              disabled={!badgeId || mintTxStatus === "pending"}
              variant="outline"
              className="w-full"
            >
              {mintTxStatus === "pending" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Minting...
                </>
              ) : (
                "Mint Badge"
              )}
            </ThemedButton>
          </div>
          <TransactionStatus status={mintTxStatus} hash={mintTxHash} error={mintTxError} />
        </div>
      )}
    </ContractCard>
  );
}

// Immortality Badge Card Component
function ImmortalityBadgeCard({ address }: { address: `0x${string}` | undefined }) {
  const { theme } = useTheme();
  const config = CONTRACTS_CONFIG.immortalityBadge;
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });
  const isDev = import.meta.env.MODE === "development" || import.meta.env.DEV;

  const [mintTxStatus, setMintTxStatus] = useState<TxStatus>("idle");
  const [mintTxHash, setMintTxHash] = useState<`0x${string}` | undefined>();
  const [mintTxError, setMintTxError] = useState<string>("");

  // Owner functions state
  const [minterAddressInput, setMinterAddressInput] = useState("");
  const [badgeTypeInput, setBadgeTypeInput] = useState("1");
  const [badgeEnabledInput, setBadgeEnabledInput] = useState("true");
  const [badgeTransferableInput, setBadgeTransferableInput] = useState("false");
  const [badgeUriInput, setBadgeUriInput] = useState("");
  const [ownerTxStatus, setOwnerTxStatus] = useState<TxStatus>("idle");
  const [ownerTxHash, setOwnerTxHash] = useState<`0x${string}` | undefined>();
  const [ownerTxError, setOwnerTxError] = useState<string>("");

  // Read MINTER_ROLE constant
  const { data: minterRole } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "MINTER_ROLE",
    query: { enabled: config.isConfigured },
  });

  // Read DEFAULT_ADMIN_ROLE (0x00...00)
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

  // Check if current wallet is admin (has DEFAULT_ADMIN_ROLE)
  const { data: isAdmin } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "hasRole",
    args: address && config.isConfigured ? [DEFAULT_ADMIN_ROLE as `0x${string}`, address] : undefined,
    query: { enabled: config.isConfigured && !!address },
  });

  // Check if AgentKit wallet (from env or default) has MINTER_ROLE
  const agentKitAddress = (import.meta.env.VITE_CDP_WALLET_ADDRESS || "0xc92B191C896CC8f33bd4d34700965d20491682C4") as `0x${string}`;
  const { data: agentKitHasMinterRole } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "hasRole",
    args: minterRole && config.isConfigured ? [minterRole as `0x${string}`, agentKitAddress] : undefined,
    query: { enabled: config.isConfigured && !!minterRole },
  });

  // Read badge type 1 config
  const { data: badgeType1 } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "badgeTypes",
    args: [1n],
    query: { enabled: config.isConfigured },
  });

  // Check if user owns the badge (tokenId 0 or 1, depending on contract)
  const { data: balance } = useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: config.isConfigured && !!address },
  });

  const handleMint = async () => {
    if (!address) return;

    setMintTxStatus("pending");
    setMintTxError("");
    try {
      // ImmortalityBadge uses mintBadge(address to, uint256 badgeType)
      // Using badgeType 1 (Immortality Badge)
      const hash = await writeContractAsync({
        address: config.address,
        abi: config.abi,
        functionName: "mintBadge",
        args: [address, 1n], // badgeType 1 for Immortality Badge
      });
      setMintTxHash(hash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setMintTxStatus("success");
    } catch (error: any) {
      setMintTxStatus("error");
      setMintTxError(error?.message || "Mint failed");
    }
  };

  return (
    <ContractCard title={config.name} address={config.address} explorerBaseUrl={BASE_EXPLORER}>
      {/* Read-only data */}
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="opacity-70">Owned</div>
            <div className={cn(
              "font-semibold",
              balance && balance > 0n
                ? theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                : theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600"
            )}>
              {balance !== undefined && balance > 0n ? "Yes" : "No"}
            </div>
          </div>
          {badgeType1 && Array.isArray(badgeType1) && (
            <>
              <div>
                <div className="opacity-70">Badge Type 1 Enabled</div>
                <div className={cn(
                  "font-semibold",
                  badgeType1[0]
                    ? theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                    : theme === "cyberpunk" ? "text-red-400" : "text-red-600"
                )}>
                  {badgeType1[0] ? "Yes" : "No"}
                </div>
              </div>
              <div>
                <div className="opacity-70">Badge Type 1 Transferable</div>
                <div className={cn("font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-blue-600")}>
                  {badgeType1[1] ? "Yes" : "No"}
                </div>
              </div>
            </>
          )}
        </div>
        {agentKitHasMinterRole !== undefined && (
          <div className="mt-2 p-2 rounded bg-slate-100 dark:bg-slate-800">
            <div className="opacity-70 text-xs mb-1">AgentKit MINTER_ROLE Status</div>
            <div className={cn(
              "font-semibold text-xs",
              agentKitHasMinterRole
                ? theme === "cyberpunk" ? "text-green-400" : "text-green-600"
                : theme === "cyberpunk" ? "text-red-400" : "text-red-600"
            )}>
              {agentKitHasMinterRole ? "✅ Granted" : "❌ Not Granted"}
            </div>
            <div className="text-xs opacity-60 mt-1 break-all">
              {agentKitAddress}
            </div>
          </div>
        )}
      </div>

      {/* Dev Mint action */}
      {isDev && balance !== undefined && balance === 0n && (
        <div className="space-y-3 border-t pt-4">
          <h3 className={cn("font-semibold text-sm", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700")}>
            Dev Mint (Development Only)
          </h3>
          <ThemedButton
            onClick={handleMint}
            disabled={mintTxStatus === "pending"}
            variant="outline"
            className="w-full"
          >
            {mintTxStatus === "pending" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Minting...
              </>
            ) : (
              "Mint Immortality Badge"
            )}
          </ThemedButton>
          <TransactionStatus status={mintTxStatus} hash={mintTxHash} error={mintTxError} />
        </div>
      )}

      {/* Owner Functions */}
      {isAdmin && (
        <div className="space-y-3 border-t pt-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={cn("font-semibold text-sm", theme === "cyberpunk" ? "text-cyan-200" : "text-slate-700")}>
              Owner Functions
            </h3>
            <span className={cn("text-xs px-2 py-0.5 rounded", theme === "cyberpunk" ? "bg-cyan-400/20 text-cyan-300" : "bg-blue-100 text-blue-700")}>
              Admin
            </span>
          </div>

          {/* Grant MINTER_ROLE */}
          <div className="space-y-2">
            <h4 className={cn("text-xs font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-slate-600")}>
              Manage MINTER_ROLE
            </h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs opacity-70 mb-1 block">Address to Grant/Revoke MINTER_ROLE</label>
                <ThemedInput
                  type="text"
                  placeholder="0x..."
                  value={minterAddressInput}
                  onChange={(e) => setMinterAddressInput(e.target.value)}
                />
                <div className="flex gap-2 mt-1">
                  <ThemedButton
                    onClick={async () => {
                      setMinterAddressInput(agentKitAddress);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Use AgentKit
                  </ThemedButton>
                </div>
              </div>
              <div className="flex gap-2">
                <ThemedButton
                  onClick={async () => {
                    if (!minterAddressInput || !minterRole) return;

                    setOwnerTxStatus("pending");
                    setOwnerTxError("");
                    try {
                      const hash = await writeContractAsync({
                        address: config.address,
                        abi: config.abi,
                        functionName: "grantRole",
                        args: [minterRole as `0x${string}`, minterAddressInput as `0x${string}`],
                      });
                      setOwnerTxHash(hash);

                      if (publicClient) {
                        await publicClient.waitForTransactionReceipt({ hash });
                      }
                      setOwnerTxStatus("success");
                      setMinterAddressInput("");
                      window.location.reload();
                    } catch (error: any) {
                      setOwnerTxStatus("error");
                      let errorMessage = error?.message || "Grant role failed";
                      if (error?.shortMessage) {
                        errorMessage = error.shortMessage;
                      }
                      setOwnerTxError(errorMessage);
                    }
                  }}
                  disabled={!minterAddressInput || !minterRole || ownerTxStatus === "pending"}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Grant MINTER_ROLE
                </ThemedButton>
                <ThemedButton
                  onClick={async () => {
                    if (!minterAddressInput || !minterRole) return;

                    setOwnerTxStatus("pending");
                    setOwnerTxError("");
                    try {
                      const hash = await writeContractAsync({
                        address: config.address,
                        abi: config.abi,
                        functionName: "revokeRole",
                        args: [minterRole as `0x${string}`, minterAddressInput as `0x${string}`],
                      });
                      setOwnerTxHash(hash);

                      if (publicClient) {
                        await publicClient.waitForTransactionReceipt({ hash });
                      }
                      setOwnerTxStatus("success");
                      setMinterAddressInput("");
                      window.location.reload();
                    } catch (error: any) {
                      setOwnerTxStatus("error");
                      let errorMessage = error?.message || "Revoke role failed";
                      if (error?.shortMessage) {
                        errorMessage = error.shortMessage;
                      }
                      setOwnerTxError(errorMessage);
                    }
                  }}
                  disabled={!minterAddressInput || !minterRole || ownerTxStatus === "pending"}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Revoke MINTER_ROLE
                </ThemedButton>
              </div>
            </div>
          </div>

          {/* Configure Badge Type */}
          <div className="space-y-2 border-t pt-3">
            <h4 className={cn("text-xs font-semibold", theme === "cyberpunk" ? "text-cyan-300" : "text-slate-600")}>
              Configure Badge Type
            </h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs opacity-70 mb-1 block">Badge Type ID</label>
                <ThemedInput
                  type="number"
                  placeholder="1"
                  value={badgeTypeInput}
                  onChange={(e) => setBadgeTypeInput(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs opacity-70 mb-1 block">Enabled</label>
                <select
                  value={badgeEnabledInput}
                  onChange={(e) => setBadgeEnabledInput(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded border text-sm",
                    theme === "cyberpunk"
                      ? "bg-slate-900 border-cyan-400/30 text-cyan-200"
                      : "bg-white border-slate-300 text-slate-900"
                  )}
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
              <div>
                <label className="text-xs opacity-70 mb-1 block">Transferable</label>
                <select
                  value={badgeTransferableInput}
                  onChange={(e) => setBadgeTransferableInput(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded border text-sm",
                    theme === "cyberpunk"
                      ? "bg-slate-900 border-cyan-400/30 text-cyan-200"
                      : "bg-white border-slate-300 text-slate-900"
                  )}
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
              <div>
                <label className="text-xs opacity-70 mb-1 block">Token URI (optional)</label>
                <ThemedInput
                  type="text"
                  placeholder="ipfs://... or https://..."
                  value={badgeUriInput}
                  onChange={(e) => setBadgeUriInput(e.target.value)}
                />
              </div>
              <ThemedButton
                onClick={async () => {
                  if (!badgeTypeInput) return;

                  setOwnerTxStatus("pending");
                  setOwnerTxError("");
                  try {
                    const hash = await writeContractAsync({
                      address: config.address,
                      abi: config.abi,
                      functionName: "configureBadgeType",
                      args: [
                        BigInt(badgeTypeInput),
                        {
                          enabled: badgeEnabledInput === "true",
                          transferable: badgeTransferableInput === "true",
                          uri: badgeUriInput || "",
                        },
                      ],
                    });
                    setOwnerTxHash(hash);

                    if (publicClient) {
                      await publicClient.waitForTransactionReceipt({ hash });
                    }
                    setOwnerTxStatus("success");
                    setBadgeTypeInput("1");
                    setBadgeEnabledInput("true");
                    setBadgeTransferableInput("false");
                    setBadgeUriInput("");
                    window.location.reload();
                  } catch (error: any) {
                    setOwnerTxStatus("error");
                    let errorMessage = error?.message || "Configure badge type failed";
                    if (error?.shortMessage) {
                      errorMessage = error.shortMessage;
                    }
                    setOwnerTxError(errorMessage);
                  }
                }}
                disabled={!badgeTypeInput || ownerTxStatus === "pending"}
                className="w-full"
                emphasis
              >
                {ownerTxStatus === "pending" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Configuring...
                  </>
                ) : (
                  "Configure Badge Type"
                )}
              </ThemedButton>
            </div>
          </div>

          <TransactionStatus status={ownerTxStatus} hash={ownerTxHash} error={ownerTxError} />
        </div>
      )}
    </ContractCard>
  );
}

