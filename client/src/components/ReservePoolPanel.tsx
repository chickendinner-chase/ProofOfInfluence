import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Activity,
  RefreshCw,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { reserveApi } from "@/lib/api";

export default function ReservePoolPanel() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAdminAccess();

  // Fetch pool status
  const { data: poolData, isLoading } = useQuery({
    queryKey: ["reserve-pool-status"],
    queryFn: () => reserveApi.getPoolStatus(),
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Fetch history data
  const { data: historyData } = useQuery({
    queryKey: ["reserve-pool-history", timeRange],
    queryFn: () => reserveApi.getHistory(timeRange),
    refetchInterval: 15000,
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ["reserve-pool-analytics"],
    queryFn: () => reserveApi.getAnalytics(),
  });

  // Fetch activities
  const { data: activitiesData } = useQuery({
    queryKey: ["reserve-pool-activities"],
    queryFn: () => reserveApi.getActivities(),
    refetchInterval: 5000,
  });

  // Buyback mutation
  const buybackMutation = useMutation({
    mutationFn: reserveApi.executeBuyback,
    onSuccess: () => {
      toast({
        title: "回购已启动",
        description: "POI 回购操作正在执行中，请稍候...",
      });
      queryClient.invalidateQueries({ queryKey: ["reserve-pool-status"] });
      queryClient.invalidateQueries({ queryKey: ["reserve-pool-activities"] });
    },
    onError: (error: Error) => {
      toast({
        title: "回购失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: reserveApi.withdrawFees,
    onSuccess: () => {
      toast({
        title: "提取已启动",
        description: "手续费提取操作正在处理中...",
      });
      queryClient.invalidateQueries({ queryKey: ["reserve-pool-status"] });
      queryClient.invalidateQueries({ queryKey: ["reserve-pool-activities"] });
    },
    onError: (error: Error) => {
      toast({
        title: "提取失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExecuteBuyback = () => {
    if (!poolData) return;
    if (!isAdmin) {
      toast({
        title: "权限不足",
        description: "仅管理员可以执行回购操作",
        variant: "destructive",
      });
      return;
    }

    const usdcAmount = "1000.00"; // Default amount, could be from a dialog
    const minPOI = "950.00"; // 5% slippage tolerance
    const idempotencyKey = `buyback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    buybackMutation.mutate({
      amountUSDC: usdcAmount,
      minPOI,
      idempotencyKey,
    });
  };

  const handleWithdrawFees = () => {
    if (!poolData) return;
    if (!isAdmin) {
      toast({
        title: "权限不足",
        description: "仅管理员可以提取手续费",
        variant: "destructive",
      });
      return;
    }

    const amount = "5000.00"; // Default amount, could be from a dialog
    const asset = "USDC";
    const to = "0x742d35Cc6634C0532925a3b844Bc9e7595f5b9c";
    const idempotencyKey = `withdraw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    withdrawMutation.mutate({
      amount,
      asset,
      to,
      idempotencyKey,
    });
  };

  const feeHistoryData = historyData?.data || [];

  // Show admin access warning if not admin
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center bg-slate-800/50 border-slate-700">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white mb-4">
            需要管理员权限
          </h2>
          <p className="text-slate-400 mb-6">
            Reserve Pool 功能仅限管理员访问。<br />
            如需访问，请联系系统管理员获取权限。
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card className="p-6 bg-gradient-to-r from-green-900/20 to-green-800/10 border-green-700/30">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-semibold text-white">Reserve Pool 状态</h3>
        </div>
        <p className="text-slate-300 text-sm">
          智能资金池管理系统 - 自动归集手续费、管理金库并执行 $POI 回购策略
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-green-300 font-semibold">✓ 管理员权限已验证</span>
          <span className="text-slate-400">(连接 Codex 真实 API)</span>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <h4 className="font-semibold text-slate-300">30天手续费</h4>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-32 bg-slate-700" />
          ) : (
            <div>
              <div className="text-3xl font-bold text-white mb-1">
                ${poolData?.totalFees30d || "0"}
              </div>
              <div className="text-sm text-slate-400">
                7天: ${poolData?.totalFees7d || "0"}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-400" />
              <h4 className="font-semibold text-slate-300">资金池余额</h4>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-32 bg-slate-700" />
          ) : (
            <div>
              <div className="text-3xl font-bold text-white mb-1">
                ${poolData?.balances.USDC || "0"}
              </div>
              <div className="text-sm text-slate-400">
                POI: {poolData?.balances.POI || "0"}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h4 className="font-semibold text-slate-300">累计回购</h4>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-32 bg-slate-700" />
          ) : (
            <div>
              <div className="text-3xl font-bold text-white mb-1">
                ${poolData?.totalBuyback || "0"}
              </div>
              <div className="text-sm text-slate-400">
                {poolData ? `上次: ${new Date(poolData.lastBuybackDate).toLocaleDateString()}` : "待执行"}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="history">历史记录</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
          <TabsTrigger value="management">管理操作</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6 mt-6">
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">手续费与回购历史</h3>
              <div className="flex gap-2">
                <Button
                  variant={timeRange === "7d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("7d")}
                  className="text-xs"
                >
                  7天
                </Button>
                <Button
                  variant={timeRange === "30d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("30d")}
                  className="text-xs"
                >
                  30天
                </Button>
                <Button
                  variant={timeRange === "90d" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange("90d")}
                  className="text-xs"
                >
                  90天
                </Button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={feeHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="fees"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="手续费"
                  />
                  <Area
                    type="monotone"
                    dataKey="buyback"
                    stackId="2"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.6}
                    name="回购"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-400">
                📊 示例数据 - 真实数据将从 Codex 后端 API 获取
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-6">月度统计分析</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feeHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="fees" fill="#3b82f6" name="手续费" />
                  <Bar dataKey="buyback" fill="#a855f7" name="回购" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-700/30">
                <div className="text-sm text-slate-400 mb-1">平均月度手续费</div>
                <div className="text-2xl font-bold text-white">
                  ${analytics?.avgMonthlyFees.toLocaleString() || "0"}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-700/30">
                <div className="text-sm text-slate-400 mb-1">平均回购比例</div>
                <div className="text-2xl font-bold text-white">
                  {analytics ? `${(analytics.avgBuybackRatio * 100).toFixed(0)}%` : "0%"}
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-700/30">
                <div className="text-sm text-slate-400 mb-1">历史总手续费</div>
                <div className="text-xl font-bold text-white">
                  ${analytics?.totalFeesAllTime.toLocaleString() || "0"}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-700/30">
                <div className="text-sm text-slate-400 mb-1">历史总回购</div>
                <div className="text-xl font-bold text-white">
                  ${analytics?.totalBuybackAllTime.toLocaleString() || "0"}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-6 mt-6">
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">管理操作</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-white mb-1">执行 $POI 回购</h4>
                    <p className="text-sm text-slate-400">
                      使用金库余额回购 $POI 代币，支持生态价值
                    </p>
                  </div>
                  <RefreshCw className="w-5 h-5 text-purple-400" />
                </div>
                <Button
                  onClick={handleExecuteBuyback}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={buybackMutation.isPending || !poolData}
                >
                  {buybackMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      执行中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      执行回购 ($1,000 USDC)
                    </>
                  )}
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-white mb-1">提取手续费</h4>
                    <p className="text-sm text-slate-400">
                      将累积的手续费转移到指定地址
                    </p>
                  </div>
                  <Download className="w-5 h-5 text-blue-400" />
                </div>
                <Button
                  onClick={handleWithdrawFees}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={withdrawMutation.isPending || !poolData}
                >
                  {withdrawMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      提取手续费 ($5,000)
                    </>
                  )}
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-green-900/20 border border-green-700/30">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-300 mb-1">Mock API 已启用</h4>
                    <p className="text-sm text-slate-300">
                      管理功能已可用（模拟环境）。真实功能将在 Codex 完成后端后启用。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activities */}
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">最近活动</h3>
            <div className="space-y-3">
              {!activitiesData || activitiesData.activities.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无活动记录</p>
                </div>
              ) : (
                activitiesData.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg"
                  >
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'buyback' 
                        ? 'bg-purple-900/30' 
                        : activity.type === 'withdraw'
                          ? 'bg-blue-900/30'
                          : 'bg-green-900/30'
                    }`}>
                      {activity.type === 'buyback' ? (
                        <RefreshCw className="w-4 h-4 text-purple-400" />
                      ) : activity.type === 'withdraw' ? (
                        <Download className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Activity className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">
                          {activity.type === 'buyback' 
                            ? 'POI 回购' 
                            : activity.type === 'withdraw'
                              ? '手续费提取'
                              : '资金池重平衡'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          activity.status === 'SUCCESS'
                            ? 'bg-green-900/30 text-green-400'
                            : activity.status === 'PENDING'
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-red-900/30 text-red-400'
                        }`}>
                          {activity.status === 'SUCCESS' ? '成功' : activity.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        {activity.type === 'buyback' && activity.details.amountUSDC && (
                          <>用 ${activity.details.amountUSDC} USDC 回购了 {activity.details.amountPOI} POI</>
                        )}
                        {activity.type === 'withdraw' && activity.details.amount && (
                          <>提取 ${activity.details.amount} {activity.details.asset} 到 {activity.details.to}</>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(activity.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

