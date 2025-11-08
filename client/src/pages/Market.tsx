import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TradingChart from "@/components/TradingChart";
import UniswapSwapCard from "@/components/UniswapSwapCard";
import { useAuth } from "@/hooks/useAuth";
import { useAccessControl } from "@/hooks/useAccessControl";
import {
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import type { User } from "@shared/schema";

// Placeholder types for Market data (will be replaced with actual backend types)
interface MarketOrder {
  id: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
}

export default function Market() {
  const { isAuthenticated } = useAuth();
  const { canTrade } = useAccessControl();
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  // Fetch current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  // TODO: Replace with actual Market API endpoint from Codex
  // const { data: orders, isLoading } = useQuery<MarketOrder[]>({
  //   queryKey: ["/api/market/orders"],
  //   enabled: isAuthenticated,
  // });

  // Placeholder data for UI demonstration
  const orders: MarketOrder[] = [];
  const isLoading = false;

  const handlePlaceOrder = () => {
    // TODO: Implement order placement with Codex backend API
    console.log("Place order:", { orderType, amount, price });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <Card className="p-12 text-center bg-slate-800/50 border-slate-700">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h2 className="text-2xl font-bold text-white mb-4">
              连接钱包以访问交易市场
            </h2>
            <p className="text-slate-400 mb-6">
              请先连接您的 Web3 钱包以开始交易 $POI 代币
            </p>
            <Button
              onClick={() => (window.location.href = "/login")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              连接钱包
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!canTrade) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <Card className="p-12 text-center bg-slate-800/50 border-slate-700">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h2 className="text-2xl font-bold text-white mb-4">
              交易权限受限
            </h2>
            <p className="text-slate-400">
              您需要完成 KYC 验证才能访问交易功能
            </p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            交易市场
          </h1>
          <p className="text-slate-400">
            去中心化的 $POI 代币交易平台，支持实时报价和低手续费交易
          </p>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="text-sm text-slate-400 mb-1">24h 交易量</div>
            <div className="text-2xl font-bold text-white">待接入</div>
            <div className="text-xs text-green-400 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              待统计
            </div>
          </Card>
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="text-sm text-slate-400 mb-1">当前价格</div>
            <div className="text-2xl font-bold text-white">待接入</div>
            <div className="text-xs text-slate-400 mt-1">参考价格</div>
          </Card>
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="text-sm text-slate-400 mb-1">流动性池</div>
            <div className="text-2xl font-bold text-white">待接入</div>
            <div className="text-xs text-slate-400 mt-1">TVL</div>
          </Card>
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="text-sm text-slate-400 mb-1">手续费</div>
            <div className="text-2xl font-bold text-white">0.3%</div>
            <div className="text-xs text-blue-400 mt-1">低手续费通道</div>
          </Card>
        </div>

        {/* Main Trading Interface */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Trading Chart */}
          <div className="lg:col-span-2 space-y-6">
            <TradingChart pair="POI/USDC" network="Base" />

            {/* Order Book / Recent Trades */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <Tabs defaultValue="orders" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                  <TabsTrigger value="orders">我的订单</TabsTrigger>
                  <TabsTrigger value="history">交易历史</TabsTrigger>
                </TabsList>
                <TabsContent value="orders" className="mt-4">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full bg-slate-700" />
                      <Skeleton className="h-12 w-full bg-slate-700" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>暂无活跃订单</p>
                      <p className="text-sm mt-1">
                        后端 API 接口对接中（等待 Codex）
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                order.type === "buy"
                                  ? "bg-green-900/50 text-green-400"
                                  : "bg-red-900/50 text-red-400"
                              }`}
                            >
                              {order.type === "buy" ? "买入" : "卖出"}
                            </div>
                            <div>
                              <div className="text-white font-semibold">
                                {order.amount} POI
                              </div>
                              <div className="text-xs text-slate-400">
                                @ ${order.price}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-sm font-semibold ${
                                order.status === "completed"
                                  ? "text-green-400"
                                  : order.status === "pending"
                                    ? "text-yellow-400"
                                    : "text-red-400"
                              }`}
                            >
                              {order.status === "completed"
                                ? "已完成"
                                : order.status === "pending"
                                  ? "处理中"
                                  : "已取消"}
                            </div>
                            <div className="text-xs text-slate-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                  <div className="text-center py-8 text-slate-400">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无交易历史</p>
                    <p className="text-sm mt-1">
                      后端 API 接口对接中（等待 Codex）
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            {/* Uniswap Integration */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                即时交易
              </h3>
              <UniswapSwapCard />
            </Card>

            {/* Order Placement Form (Placeholder for Codex backend) */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                限价订单
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setOrderType("buy")}
                    variant={orderType === "buy" ? "default" : "outline"}
                    className={
                      orderType === "buy"
                        ? "bg-green-600 hover:bg-green-700"
                        : "border-slate-600"
                    }
                  >
                    买入
                  </Button>
                  <Button
                    onClick={() => setOrderType("sell")}
                    variant={orderType === "sell" ? "default" : "outline"}
                    className={
                      orderType === "sell"
                        ? "bg-red-600 hover:bg-red-700"
                        : "border-slate-600"
                    }
                  >
                    卖出
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-slate-300">
                    价格 (USDC)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-slate-300">
                    数量 (POI)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled
                  />
                </div>

                <div className="pt-2 text-center">
                  <p className="text-sm text-yellow-400 mb-3">
                    ⏳ 限价订单功能开发中
                  </p>
                  <p className="text-xs text-slate-400">
                    等待 Codex 后端接口完成
                  </p>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  className={`w-full ${
                    orderType === "buy"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  disabled
                >
                  {orderType === "buy" ? "买入" : "卖出"} POI
                </Button>
              </div>
            </Card>

            {/* Market Info */}
            <Card className="p-4 bg-slate-800/30 border-slate-700">
              <h4 className="text-sm font-semibold text-white mb-2">
                市场信息
              </h4>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>交易对:</span>
                  <span className="text-white">POI/USDC</span>
                </div>
                <div className="flex justify-between">
                  <span>网络:</span>
                  <span className="text-blue-400">Base</span>
                </div>
                <div className="flex justify-between">
                  <span>协议:</span>
                  <span className="text-white">Uniswap V2</span>
                </div>
                <div className="flex justify-between">
                  <span>手续费:</span>
                  <span className="text-green-400">0.3%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

