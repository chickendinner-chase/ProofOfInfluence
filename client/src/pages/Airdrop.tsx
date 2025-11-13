import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useConnect } from "wagmi";
import WalletConnectButton from "@/components/WalletConnectButton";
import {
  Gift,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wallet,
  Search,
  Shield,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface AirdropEligibility {
  eligible: boolean;
  amount: number;
  claimed: boolean;
  claimDate?: string;
  vestingInfo?: string;
}

export default function Airdrop() {
  const { isAuthenticated } = useAuth();
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [manualAddress, setManualAddress] = useState("");
  const [checkingManual, setCheckingManual] = useState(false);
  const [manualResult, setManualResult] = useState<AirdropEligibility | null>(null);

  // Fetch user's airdrop eligibility (auto-check for logged-in users)
  const { data: eligibility, isLoading } = useQuery<AirdropEligibility>({
    queryKey: ["/api/airdrop/check"],
    enabled: isAuthenticated,
    staleTime: 1000 * 60, // 1 minute
  });

  // Claim mutation
  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!address) {
        throw new Error("请先连接钱包");
      }

      const response = await fetch("/api/airdrop/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ walletAddress: address }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "领取失败");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "领取成功！",
        description: "您的空投代币已发送到钱包，请稍后查看。",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "领取失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleManualCheck = async () => {
    if (!manualAddress || manualAddress.length < 40) {
      toast({
        title: "无效地址",
        description: "请输入有效的钱包地址",
        variant: "destructive",
      });
      return;
    }

    setCheckingManual(true);
    try {
      const response = await fetch(`/api/airdrop/check?address=${manualAddress}`);
      if (!response.ok) throw new Error("查询失败");
      const result = await response.json();
      setManualResult(result);
    } catch (error) {
      toast({
        title: "查询失败",
        description: "请检查地址格式并重试",
        variant: "destructive",
      });
    } finally {
      setCheckingManual(false);
    }
  };

  const handleClaim = () => {
    if (!isConnected) {
      toast({
        title: "请先连接钱包",
        description: "您需要连接钱包才能领取空投",
        variant: "destructive",
      });
      return;
    }

    claimMutation.mutate();
  };

  // Check if claim period is active
  const isClaimPeriodActive = true; // TODO: Get from backend config
  const tgeDate = new Date("2025-12-31T00:00:00Z"); // TODO: Get from backend

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header lang="zh" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-semibold">
            <Gift className="w-4 h-4" />
            <span>空投计划</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
            POI Airdrop
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
            检查您的空投资格并领取您的 POI 代币
          </p>
        </div>
      </section>

      {/* Security Warning */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <Alert className="bg-red-900/20 border-red-500/50">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <AlertDescription className="text-red-200">
            <strong className="font-bold text-lg block mb-2">🚨 安全警告</strong>
            <ul className="space-y-1 text-sm">
              <li>✓ 我们永远不会要求您的私钥或助记词</li>
              <li>✓ 唯一官方领取渠道是本网站</li>
              <li>✓ 警惕假冒网站和钓鱼链接</li>
              <li>✓ 官方网站：<strong>proof.in</strong></li>
              <li>✓ 我们不会通过私信联系您要求提供任何信息</li>
            </ul>
          </AlertDescription>
        </Alert>
      </section>

      {/* Eligibility Check - Logged In */}
      {isAuthenticated && eligibility && (
        <section className="max-w-4xl mx-auto px-4 py-8">
          <Card className={`p-8 ${
            eligibility.eligible
              ? "bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-700/50"
              : "bg-slate-800/50 border-slate-700"
          }`}>
            {eligibility.eligible ? (
              <div className="space-y-6">
                {/* Eligible */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      恭喜！您有资格领取空投
                    </h2>
                    <p className="text-slate-300">
                      您的账户已验证为早期支持者，可以领取 POI 代币空投
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="p-6 bg-slate-800/50 rounded-lg">
                  <div className="text-sm text-slate-400 mb-2">可领取金额</div>
                  <div className="text-5xl font-bold text-green-400 mb-2">
                    {eligibility.amount.toLocaleString()}
                    <span className="text-2xl text-slate-400 ml-2">POI</span>
                  </div>
                  {eligibility.vestingInfo && (
                    <p className="text-sm text-slate-400 mt-2">
                      {eligibility.vestingInfo}
                    </p>
                  )}
                </div>

                {/* Claim Status */}
                {eligibility.claimed ? (
                  <div className="p-6 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-blue-400" />
                      <div>
                        <div className="font-semibold text-white">已领取</div>
                        <div className="text-sm text-slate-400">
                          领取时间：{eligibility.claimDate ? new Date(eligibility.claimDate).toLocaleString("zh-CN") : "未知"}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : isClaimPeriodActive ? (
                  <div className="space-y-4">
                    {!isConnected && (
                      <Alert className="bg-yellow-900/20 border-yellow-700/50">
                        <Wallet className="h-5 w-5 text-yellow-400" />
                        <AlertDescription className="text-yellow-200">
                          请先连接您的 Web3 钱包以领取空投
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <WalletConnectButton />
                      <Button
                        onClick={handleClaim}
                        disabled={!isConnected || claimMutation.isPending}
                        size="lg"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {claimMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                            领取中...
                          </>
                        ) : (
                          <>
                            <Gift className="mr-2 w-5 h-5" />
                            立即领取
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-blue-400" />
                      <div>
                        <div className="font-semibold text-white">领取尚未开放</div>
                        <div className="text-sm text-slate-400">
                          空投将在 TGE 启动时开放领取：
                          {tgeDate.toLocaleDateString("zh-CN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not Eligible */
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      您当前不符合空投资格
                    </h2>
                    <p className="text-slate-300 mb-4">
                      此空投面向早期测试者和社区贡献者。如果您认为这是错误，请联系支持团队。
                    </p>
                  </div>
                </div>

                {/* Alternative Ways to Earn */}
                <div className="p-6 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                  <h3 className="font-semibold text-white mb-3">其他获取 POI 的方式</h3>
                  <div className="space-y-3">
                    <Link href="/early-bird">
                      <Button variant="outline" className="w-full justify-start border-blue-600 text-blue-400 hover:bg-blue-900/20">
                        <Gift className="mr-2 w-5 h-5" />
                        参与早鸟计划 - 完成任务赚取 POI
                      </Button>
                    </Link>
                    <Link href="/referral">
                      <Button variant="outline" className="w-full justify-start border-purple-600 text-purple-400 hover:bg-purple-900/20">
                        <Gift className="mr-2 w-5 h-5" />
                        推荐好友 - 邀请好友获得奖励
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </section>
      )}

      {/* Manual Address Check */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8 bg-slate-800/50 border-slate-700">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                查询钱包地址资格
              </h2>
              <p className="text-slate-400">
                输入任意钱包地址查询其空投资格和金额
              </p>
            </div>

            <div className="flex gap-3">
              <Input
                placeholder="输入钱包地址 (0x...)"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white font-mono"
              />
              <Button
                onClick={handleManualCheck}
                disabled={checkingManual}
                className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
              >
                {checkingManual ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="mr-2 w-5 h-5" />
                    查询
                  </>
                )}
              </Button>
            </div>

            {manualResult && (
              <div className={`p-6 rounded-lg border ${
                manualResult.eligible
                  ? "bg-green-900/20 border-green-700/50"
                  : "bg-slate-700/30 border-slate-600"
              }`}>
                {manualResult.eligible ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-white mb-1">
                        此地址有资格领取空投
                      </div>
                      <div className="text-2xl font-bold text-green-400">
                        {manualResult.amount.toLocaleString()} POI
                      </div>
                      {manualResult.claimed && (
                        <div className="text-sm text-slate-400 mt-2">
                          已于 {manualResult.claimDate ? new Date(manualResult.claimDate).toLocaleDateString("zh-CN") : "未知时间"} 领取
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-slate-400 flex-shrink-0 mt-1" />
                    <div className="text-slate-300">
                      此地址不符合空投资格
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Airdrop Info */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">关于此次空投</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-slate-800/50 border-slate-700 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">面向对象</h3>
            <p className="text-slate-400">
              早期测试者、社区贡献者和活跃参与者
            </p>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700 text-center">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">领取时间</h3>
            <p className="text-slate-400">
              {isClaimPeriodActive ? "现在即可领取" : `TGE 启动时开放（${tgeDate.toLocaleDateString("zh-CN")}）`}
            </p>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700 text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">安全保障</h3>
            <p className="text-slate-400">
              基于智能合约的透明分发机制
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-gradient-to-r from-green-900 to-blue-900 border-green-700 text-center">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {isAuthenticated && eligibility?.eligible
              ? eligibility.claimed
                ? "感谢您的支持！"
                : "立即领取您的空投"
              : "成为早期支持者"}
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            {isAuthenticated && eligibility?.eligible
              ? eligibility.claimed
                ? "您已成功领取空投。继续参与我们的活动，赚取更多 POI！"
                : "连接钱包即可领取您的 POI 代币空投"
              : "虽然您错过了这次空投，但仍然有很多机会获得 POI 代币！"}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated && eligibility?.eligible && !eligibility.claimed ? (
              <>
                <WalletConnectButton />
                <Button
                  onClick={handleClaim}
                  disabled={!isConnected || claimMutation.isPending}
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 px-8 text-lg"
                >
                  {claimMutation.isPending ? "领取中..." : "立即领取"}
                </Button>
              </>
            ) : (
              <>
                <Link href="/early-bird">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 text-lg">
                    <Gift className="mr-2 w-5 h-5" />
                    参与早鸟计划
                  </Button>
                </Link>
                <Link href="/referral">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 px-8 text-lg"
                  >
                    邀请好友赚取
                  </Button>
                </Link>
              </>
            )}
          </div>
        </Card>
      </section>

      <Footer lang="zh" />
    </div>
  );
}

