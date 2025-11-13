import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Copy,
  CheckCircle2,
  Gift,
  Trophy,
  TrendingUp,
  Share2,
  LogIn,
  Zap,
} from "lucide-react";

interface ReferralStats {
  totalInvites: number;
  successfulReferrals: number;
  totalEarned: number;
  pendingRewards: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  referralCount: number;
}

const REWARD_RULES = {
  inviterReward: 10,
  inviteeReward: 5,
  bonusTiers: [
    { threshold: 5, bonus: 25, label: "5人奖励" },
    { threshold: 10, bonus: 100, label: "10人奖励" },
    { threshold: 25, bonus: 300, label: "25人奖励" },
  ],
};

export default function Referral() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Fetch user's referral link
  const { data: referralData } = useQuery<{ referralCode: string; referralLink: string }>({
    queryKey: ["/api/referral/link"],
    enabled: isAuthenticated,
    staleTime: Infinity, // Referral link doesn't change
  });

  // Fetch user's referral stats
  const { data: stats } = useQuery<ReferralStats>({
    queryKey: ["/api/referral/stats"],
    enabled: isAuthenticated,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Fetch leaderboard
  const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/referral/leaderboard"],
    staleTime: 1000 * 60, // 1 minute
  });

  const handleCopyLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      toast({
        title: "复制成功！",
        description: "推荐链接已复制到剪贴板",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = (platform: string) => {
    if (!referralData?.referralLink) return;

    const text = `加入 ProofOfInfluence，一起赚取 POI 代币！使用我的推荐链接注册：`;
    const url = referralData.referralLink;

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
          "_blank"
        );
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header lang="zh" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-semibold">
            <Users className="w-4 h-4" />
            <span>推荐计划</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
            邀请好友，共享奖励
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
            推荐好友注册，你和好友都能获得 POI 代币奖励
          </p>
        </div>
      </section>

      {/* Reward Rules */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">奖励规则</h2>
          <p className="text-lg text-slate-400">简单、透明、双赢</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-8 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-700/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Gift className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">推荐人奖励</h3>
                <p className="text-slate-300 mb-3">
                  每成功推荐一位好友注册并验证邮箱
                </p>
                <div className="text-3xl font-bold text-blue-400">
                  +{REWARD_RULES.inviterReward} POI
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-700/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">新用户奖励</h3>
                <p className="text-slate-300 mb-3">
                  通过推荐链接注册的新用户也能获得
                </p>
                <div className="text-3xl font-bold text-green-400">
                  +{REWARD_RULES.inviteeReward} POI
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bonus Tiers */}
        <Card className="p-8 bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-700/50">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">额外奖励</h3>
              <p className="text-slate-300">
                推荐越多，奖励越丰厚！达到以下里程碑可获得额外奖励：
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REWARD_RULES.bonusTiers.map((tier, index) => (
              <div
                key={index}
                className="p-4 bg-slate-800/50 rounded-lg border border-purple-700/30 text-center"
              >
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {tier.threshold}人
                </div>
                <div className="text-sm text-slate-400 mb-2">{tier.label}</div>
                <div className="text-xl font-bold text-white">
                  +{tier.bonus} POI
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Referral Link Section */}
      {isAuthenticated ? (
        <>
          {/* User Stats */}
          {stats && (
            <section className="max-w-7xl mx-auto px-4 py-8">
              <Card className="p-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-400">
                      {stats.totalInvites}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">总邀请数</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400">
                      {stats.successfulReferrals}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">成功推荐</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-400">
                      {stats.totalEarned}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">已获得 POI</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-400">
                      {stats.pendingRewards}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">待领取 POI</div>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Referral Link */}
          <section className="max-w-4xl mx-auto px-4 py-8">
            <Card className="p-8 bg-slate-800/50 border-slate-700">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  您的专属推荐链接
                </h2>
                <p className="text-slate-400">
                  分享给好友，一起赚取 POI 代币
                </p>
              </div>

              {referralData && (
                <>
                  <div className="flex gap-3 mb-6">
                    <Input
                      value={referralData.referralLink}
                      readOnly
                      className="bg-slate-700 border-slate-600 text-white font-mono"
                    />
                    <Button
                      onClick={handleCopyLink}
                      className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="mr-2 w-4 h-4" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 w-4 h-4" />
                          复制链接
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      onClick={() => handleShare("twitter")}
                      variant="outline"
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      <Share2 className="mr-2 w-4 h-4" />
                      分享到 Twitter
                    </Button>
                    <Button
                      onClick={() => handleShare("telegram")}
                      variant="outline"
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      <Share2 className="mr-2 w-4 h-4" />
                      分享到 Telegram
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </section>
        </>
      ) : (
        /* Login Prompt */
        <section className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-12 text-center bg-slate-800/50 border-slate-700">
            <LogIn className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h2 className="text-2xl font-bold text-white mb-3">
              登录获取您的推荐链接
            </h2>
            <p className="text-slate-400 mb-6 max-w-lg mx-auto">
              注册或登录账户，立即获取专属推荐链接，开始邀请好友赚取奖励
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <LogIn className="mr-2 w-5 h-5" />
                登录 / 注册
              </Button>
            </Link>
          </Card>
        </section>
      )}

      {/* Leaderboard */}
      {leaderboard && leaderboard.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">推荐排行榜</h2>
            <p className="text-slate-400">本月推荐之星</p>
          </div>

          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1
                          ? "bg-yellow-500/20 text-yellow-400"
                          : entry.rank === 2
                          ? "bg-gray-400/20 text-gray-300"
                          : entry.rank === 3
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-slate-600 text-slate-300"
                      }`}
                    >
                      {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {entry.username || `用户 #${entry.rank}`}
                      </div>
                      <div className="text-sm text-slate-400">
                        {entry.referralCount} 次成功推荐
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="font-bold text-green-400">
                      +{entry.referralCount * REWARD_RULES.inviterReward} POI
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700 text-center">
          <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {isAuthenticated ? "开始推荐好友" : "立即加入推荐计划"}
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            {isAuthenticated
              ? "复制您的推荐链接，分享给好友，一起赚取 POI 代币奖励！"
              : "注册账户，获取专属推荐链接，邀请好友注册即可获得丰厚奖励！"}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={handleCopyLink}
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 px-8 text-lg"
                >
                  <Copy className="mr-2 w-5 h-5" />
                  复制推荐链接
                </Button>
                <Link href="/early-bird">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 px-8 text-lg"
                  >
                    赚取更多奖励
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    size="lg"
                    className="bg-white text-slate-900 hover:bg-slate-100 px-8 text-lg"
                  >
                    立即注册
                  </Button>
                </Link>
                <Link href="/tge">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 px-8 text-lg"
                  >
                    了解 TGE
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

