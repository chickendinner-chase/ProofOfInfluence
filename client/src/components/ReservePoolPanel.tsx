import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Activity,
  RefreshCw,
  Download,
  Clock,
  CheckCircle2,
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

// Placeholder types - will be replaced with actual backend types from Codex
interface ReservePoolData {
  totalFees: number;
  treasuryBalance: number;
  poiBuybackAmount: number;
  lastBuybackDate: string;
}

interface FeeHistoryData {
  date: string;
  fees: number;
  buyback: number;
}

export default function ReservePoolPanel() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  // TODO: Replace with actual Reserve Pool API endpoint from Codex
  // const { data: poolData, isLoading } = useQuery<ReservePoolData>({
  //   queryKey: ["/api/reserve-pool"],
  // });

  // Placeholder data for UI demonstration
  const poolData: ReservePoolData | undefined = undefined;
  const isLoading = false;

  // Placeholder chart data
  const feeHistoryData: FeeHistoryData[] = [
    { date: "2024-01", fees: 1200, buyback: 800 },
    { date: "2024-02", fees: 1800, buyback: 1200 },
    { date: "2024-03", fees: 2400, buyback: 1600 },
    { date: "2024-04", fees: 2100, buyback: 1400 },
    { date: "2024-05", fees: 2800, buyback: 1900 },
    { date: "2024-06", fees: 3200, buyback: 2200 },
  ];

  const handleExecuteBuyback = () => {
    // TODO: Implement buyback execution with Codex backend API
    console.log("Execute buyback");
  };

  const handleWithdrawFees = () => {
    // TODO: Implement fee withdrawal with Codex backend API
    console.log("Withdraw fees");
  };

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
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
          <span className="text-yellow-300 font-semibold">⏳ 后端接口对接中</span>
          <span className="text-slate-400">(等待 Codex 完成 API)</span>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <h4 className="font-semibold text-slate-300">累积手续费</h4>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-32 bg-slate-700" />
          ) : (
            <div>
              <div className="text-3xl font-bold text-white mb-1">
                {poolData ? `$${poolData.totalFees.toLocaleString()}` : "待接入"}
              </div>
              <div className="text-sm text-slate-400">总累积手续费收入</div>
            </div>
          )}
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-400" />
              <h4 className="font-semibold text-slate-300">金库余额</h4>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-32 bg-slate-700" />
          ) : (
            <div>
              <div className="text-3xl font-bold text-white mb-1">
                {poolData ? `$${poolData.treasuryBalance.toLocaleString()}` : "待接入"}
              </div>
              <div className="text-sm text-slate-400">当前可用余额</div>
            </div>
          )}
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h4 className="font-semibold text-slate-300">$POI 回购</h4>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-32 bg-slate-700" />
          ) : (
            <div>
              <div className="text-3xl font-bold text-white mb-1">
                {poolData ? `${poolData.poiBuybackAmount.toLocaleString()} POI` : "待接入"}
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
                <div className="text-2xl font-bold text-white">$2,250</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-700/30">
                <div className="text-sm text-slate-400 mb-1">平均回购比例</div>
                <div className="text-2xl font-bold text-white">68%</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-400">
                📊 示例数据 - 真实数据将从 Codex 后端 API 获取
              </p>
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
                  disabled
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  执行回购 (开发中)
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
                  disabled
                >
                  <Download className="w-4 h-4 mr-2" />
                  提取手续费 (开发中)
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-yellow-900/20 border border-yellow-700/30">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-300 mb-1">功能开发中</h4>
                    <p className="text-sm text-slate-300">
                      Reserve Pool 管理功能正在开发中，等待 Codex 完成后端接口后即可启用。
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
              <div className="text-center py-8 text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无活动记录</p>
                <p className="text-sm mt-1">后端 API 接口对接中（等待 Codex）</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

