import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TradingChart from "@/components/TradingChart";
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
  AlertTriangle,
  Info,
  Gift,
  Rocket,
} from "lucide-react";
import type { User } from "@shared/schema";
import { marketApi } from "@/lib/api";
import type { MarketOrder } from "@/lib/api/types";

export default function Market() {
  const { isAuthenticated } = useAuth();
  const { canTrade } = useAccessControl();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  // 从 URL 参数读取预设金额
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const buyAmount = params.get('buy');
    if (buyAmount && !isNaN(parseFloat(buyAmount))) {
      setAmount(buyAmount);
      setOrderType('buy');
      // 滚动到订单表单
      setTimeout(() => {
        document.getElementById('order-form')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 500);
    }
  }, []);

  // Fetch current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  // Fetch market stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["market-stats", "USDC-POI"],
    queryFn: () => marketApi.getStats("USDC-POI"),
    enabled: isAuthenticated,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Fetch user orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["market-orders"],
    queryFn: () => marketApi.getOrders({ limit: 20 }),
    enabled: isAuthenticated,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Fetch recent trades
  const { data: tradesData } = useQuery({
    queryKey: ["market-trades", "USDC-POI"],
    queryFn: () => marketApi.getTrades("USDC-POI", 20),
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: marketApi.createOrder,
    onSuccess: (order) => {
      toast({
        title: "订单已创建",
        description: `${orderType === "buy" ? "买入" : "卖出"} 订单 #${order.id.slice(0, 8)} 已提交`,
      });
      queryClient.invalidateQueries({ queryKey: ["market-orders"] });
      setAmount("");
      setPrice("");
    },
    onError: (error: Error) => {
      toast({
        title: "订单创建失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: marketApi.cancelOrder,
    onSuccess: () => {
      toast({
        title: "订单已取消",
        description: "订单已成功取消",
      });
      queryClient.invalidateQueries({ queryKey: ["market-orders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "取消失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePlaceOrder = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "输入错误",
        description: "请输入有效的数量",
        variant: "destructive",
      });
      return;
    }

    // Generate idempotencyKey for preventing duplicate orders
    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    createOrderMutation.mutate({
      side: orderType,
      tokenIn: orderType === "buy" ? "USDC" : "POI",
      tokenOut: orderType === "buy" ? "POI" : "USDC",
      amountIn: amount,
      idempotencyKey,
    });
  };

  const handleCancelOrder = (orderId: string) => {
    cancelOrderMutation.mutate(orderId);
  };

  const orders = ordersData?.orders || [];
  const isLoading = ordersLoading;

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

  // Check if user has zero balance
  const userBalance = parseFloat(user?.poiBalance || "0");
  const hasZeroBalance = userBalance === 0;

  // Check if TGE is active (can be controlled via env or config)
  const isTGEActive = process.env.NODE_ENV === 'production' && process.env.TGE_ACTIVE === 'true';
  const isPreTGE = !isTGEActive;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Pre-TGE Notice Banner */}
        {isPreTGE && (
          <Alert className="mb-6 bg-blue-900/20 border-blue-500/50">
            <Info className="h-5 w-5 text-blue-400" />
            <AlertDescription className="text-blue-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <strong className="font-semibold">注意：</strong> 当前为测试环境。
                  $POI 代币将在 TGE 启动后正式上市交易。
                  <Link href="/tge">
                    <span className="ml-2 underline cursor-pointer hover:text-blue-300">
                      了解 TGE 详情 →
                    </span>
                  </Link>
                </div>
                <Badge variant="outline" className="border-blue-500 text-blue-400 flex-shrink-0">
                  <Clock className="w-3 h-3 mr-1" />
                  测试环境
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Zero Balance Guidance */}
        {hasZeroBalance && (
          <Card className="mb-6 p-6 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-700/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  您还没有 POI 代币
                </h3>
                <p className="text-slate-300 mb-4">
                  参与我们的早鸟空投计划，完成简单任务即可免费获得 POI 代币。
                  或者等待 TGE 启动后在市场上购买。
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/early-bird">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Gift className="mr-2 w-4 h-4" />
                      获取免费 POI
                    </Button>
                  </Link>
                  <Link href="/tge">
                    <Button variant="outline" className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/20">
                      <Rocket className="mr-2 w-4 h-4" />
                      了解 TGE
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              交易市场
            </h1>
            {isPreTGE && (
              <Badge variant="outline" className="border-slate-600 text-slate-400">
                测试版
              </Badge>
            )}
          </div>
          <p className="text-slate-400">
            去中心化的 $POI 代币交易平台，支持实时报价和低手续费交易
            {isPreTGE && " • 当前为测试环境，所有数据将在 TGE 后重置"}
          </p>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="text-sm text-slate-400 mb-1">24h 交易量</div>
            {statsLoading ? (
              <Skeleton className="h-8 w-24 bg-slate-700" />
            ) : (
              <>
                <div className="text-2xl font-bold text-white">
                  ${stats?.volume24h || "0"}
                </div>
                <div className={`text-xs flex items-center mt-1 ${
                  stats?.change24h?.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stats?.change24h?.startsWith('+') ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {stats?.change24h || "0%"}
                </div>
              </>
            )}
          </Card>
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="text-sm text-slate-400 mb-1">当前价格</div>
            {statsLoading ? (
              <Skeleton className="h-8 w-20 bg-slate-700" />
            ) : (
              <>
                <div className="text-2xl font-bold text-white">
                  ${stats?.price || "0"}
                </div>
                <div className="text-xs text-slate-400 mt-1">POI/USDC</div>
              </>
            )}
          </Card>
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="text-sm text-slate-400 mb-1">流动性池</div>
            {statsLoading ? (
              <Skeleton className="h-8 w-24 bg-slate-700" />
            ) : (
              <>
                <div className="text-2xl font-bold text-white">
                  ${stats?.tvl || "0"}
                </div>
                <div className="text-xs text-slate-400 mt-1">TVL</div>
              </>
            )}
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
                        使用右侧面板创建新订单
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
                                order.side === "buy"
                                  ? "bg-green-900/50 text-green-400"
                                  : "bg-red-900/50 text-red-400"
                              }`}
                            >
                              {order.side === "buy" ? "买入" : "卖出"}
                            </div>
                            <div>
                              <div className="text-white font-semibold">
                                {order.amountIn} {order.tokenIn}
                              </div>
                              <div className="text-xs text-slate-400">
                                {order.amountOut ? `→ ${order.amountOut} ${order.tokenOut}` : "处理中..."}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div
                                className={`text-sm font-semibold ${
                                  order.status === "FILLED"
                                    ? "text-green-400"
                                    : order.status === "PENDING"
                                      ? "text-yellow-400"
                                      : "text-red-400"
                                }`}
                              >
                                {order.status === "FILLED"
                                  ? "已完成"
                                  : order.status === "PENDING"
                                    ? "处理中"
                                    : order.status === "CANCELED"
                                      ? "已取消"
                                      : order.status}
                              </div>
                              <div className="text-xs text-slate-400">
                                {new Date(order.createdAt).toLocaleString()}
                              </div>
                            </div>
                            {order.status === "PENDING" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={cancelOrderMutation.isPending}
                                className="border-slate-600 text-red-400 hover:bg-red-900/20"
                              >
                                取消
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                  {tradesData?.trades.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>暂无交易历史</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {tradesData?.trades.map((trade, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 hover:bg-slate-700/20 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                trade.side === "buy"
                                  ? "bg-green-900/50 text-green-400"
                                  : "bg-red-900/50 text-red-400"
                              }`}
                            >
                              {trade.side === "buy" ? "买" : "卖"}
                            </div>
                            <div className="text-sm">
                              <span className="text-white font-semibold">
                                ${trade.price}
                              </span>
                              <span className="text-slate-400 text-xs ml-1">
                                × {trade.amount}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(trade.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
          {/* Order Placement Form */}
          <Card id="order-form" className="p-6 bg-slate-800/50 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              市价订单
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
                  <Label htmlFor="amount" className="text-slate-300">
                    数量 ({orderType === "buy" ? "USDC" : "POI"})
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <p className="text-xs text-slate-400">
                    {orderType === "buy" 
                      ? "输入要花费的 USDC 数量" 
                      : "输入要卖出的 POI 数量"}
                  </p>
                </div>

                {stats && amount && parseFloat(amount) > 0 && (
                  <div className="p-3 bg-slate-700/30 rounded-lg text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">当前价格:</span>
                      <span className="text-white">${stats.price}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">预估获得:</span>
                      <span className="text-white">
                        {orderType === "buy" 
                          ? `~${(parseFloat(amount) * parseFloat(stats.price)).toFixed(2)} POI`
                          : `~${(parseFloat(amount) / parseFloat(stats.price)).toFixed(2)} USDC`}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">手续费 (0.3%):</span>
                      <span className="text-slate-400">
                        ~${(parseFloat(amount) * 0.003).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePlaceOrder}
                  className={`w-full ${
                    orderType === "buy"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  disabled={createOrderMutation.isPending || !amount || parseFloat(amount) <= 0}
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    `${orderType === "buy" ? "买入" : "卖出"} ${orderType === "buy" ? "POI" : "换 USDC"}`
                  )}
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

