/**
 * Merchant Dashboard Component
 * Complete merchant backend management interface
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMerchantAccess } from "@/hooks/useMerchantAccess";
import {
  Package,
  ShoppingBag,
  FileText,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Download,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { merchantApi } from "@/lib/api";
import type { Product, MerchantOrder } from "@/lib/api/types";

export default function MerchantDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isMerchant, merchantId } = useMerchantAccess();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    title: "",
    sku: "",
    description: "",
    price: "",
  });

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["merchant-products"],
    queryFn: () => merchantApi.getProducts(),
    refetchInterval: 10000,
  });

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["merchant-orders"],
    queryFn: () => merchantApi.getOrders(),
    refetchInterval: 5000,
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ["merchant-analytics"],
    queryFn: () => merchantApi.getAnalytics(),
  });

  // Fetch tax reports
  const { data: taxReports } = useQuery({
    queryKey: ["merchant-tax-reports"],
    queryFn: () => merchantApi.getTaxReports(),
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: merchantApi.createProduct,
    onSuccess: () => {
      toast({ title: "商品已创建", description: "新商品已成功添加" });
      queryClient.invalidateQueries({ queryKey: ["merchant-products"] });
      setShowAddProduct(false);
      setNewProduct({ title: "", sku: "", description: "", price: "" });
    },
    onError: (error: Error) => {
      toast({ title: "创建失败", description: error.message, variant: "destructive" });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => merchantApi.updateProduct(id, data),
    onSuccess: () => {
      toast({ title: "商品已更新", description: "商品信息已成功更新" });
      queryClient.invalidateQueries({ queryKey: ["merchant-products"] });
      setEditingProduct(null);
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: merchantApi.deleteProduct,
    onSuccess: () => {
      toast({ title: "商品已删除", description: "商品已成功删除" });
      queryClient.invalidateQueries({ queryKey: ["merchant-products"] });
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MerchantOrder['status'] }) => 
      merchantApi.updateOrderStatus(id, status),
    onSuccess: () => {
      toast({ title: "订单已更新", description: "订单状态已更新" });
      queryClient.invalidateQueries({ queryKey: ["merchant-orders"] });
    },
  });

  // Generate tax report mutation
  const generateTaxReportMutation = useMutation({
    mutationFn: merchantApi.generateTaxReport,
    onSuccess: () => {
      toast({ title: "报表已生成", description: "税务报表已成功生成" });
      queryClient.invalidateQueries({ queryKey: ["merchant-tax-reports"] });
    },
  });

  const handleCreateProduct = () => {
    if (!newProduct.title || !newProduct.price) {
      toast({ title: "输入错误", description: "请填写商品名称和价格", variant: "destructive" });
      return;
    }

    const idempotencyKey = `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    createProductMutation.mutate({
      title: newProduct.title,
      sku: newProduct.sku,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      idempotencyKey,
      merchantId,  // Use merchantId from hook
    });
  };

  const handleUpdateProduct = (id: string, field: string, value: any) => {
    updateProductMutation.mutate({ id, data: { [field]: value } });
  };

  const handleGenerateTaxReport = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const idempotencyKey = `tax-report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    generateTaxReportMutation.mutate({
      periodStart: startOfMonth.toISOString().split('T')[0],
      periodEnd: endOfMonth.toISOString().split('T')[0],
      idempotencyKey,
      merchantId,  // Use merchantId from hook
    });
  };

  const handleDownloadTaxReport = async (reportId: string) => {
    try {
      const result = await merchantApi.downloadTaxReport(reportId);
      // Codex returns { url: string }, open in new tab
      window.open(result.url, '_blank');
      toast({ title: "下载已启动", description: "报表将在新标签页中打开" });
    } catch (error: any) {
      toast({ title: "下载失败", description: error.message, variant: "destructive" });
    }
  };

  // Show merchant access warning if not merchant
  if (!isMerchant) {
    return (
      <div className="space-y-6">
        <Card className="p-12 text-center bg-slate-800/50 border-slate-700">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white mb-4">
            需要商家权限
          </h2>
          <p className="text-slate-400 mb-6">
            商家后台功能仅限商家账户访问。<br />
            如需访问，请联系管理员申请商家权限。
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Card className="p-6 bg-gradient-to-r from-purple-900/20 to-purple-800/10 border-purple-700/30">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">商家后台</h3>
        </div>
        <p className="text-slate-300 text-sm">
          完整的商家管理系统 - 商品管理、订单处理、税务报表
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-green-300 font-semibold">✓ 商家权限已验证</span>
          <span className="text-slate-400">(Merchant ID: {merchantId?.slice(0, 8)}...)</span>
        </div>
      </Card>

      {/* Analytics Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-400" />
            <h4 className="font-semibold text-slate-300">本周销售</h4>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            ${analytics?.thisWeek.sales || "0"}
          </div>
          <div className="text-sm text-slate-400">
            {analytics?.thisWeek.orders || 0} 笔订单
          </div>
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h4 className="font-semibold text-slate-300">本月销售</h4>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            ${analytics?.thisMonth.sales || "0"}
          </div>
          <div className="text-sm text-slate-400">
            {analytics?.thisMonth.orders || 0} 笔订单
          </div>
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-purple-400" />
            <h4 className="font-semibold text-slate-300">商品总数</h4>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {products?.length || 0}
          </div>
          <div className="text-sm text-slate-400">活跃商品</div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="products">商品管理</TabsTrigger>
          <TabsTrigger value="orders">订单管理</TabsTrigger>
          <TabsTrigger value="reports">税务报表</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6 mt-6">
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">商品列表</h3>
              <Button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加商品
              </Button>
            </div>

            {showAddProduct && (
              <div className="mb-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                <h4 className="font-semibold text-white mb-4">新建商品</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">商品名称 *</Label>
                    <Input
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="输入商品名称"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">SKU</Label>
                    <Input
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="商品编号"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">价格 (USDC) *</Label>
                    <Input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">描述</Label>
                    <Input
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="商品描述"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleCreateProduct}
                    disabled={createProductMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {createProductMutation.isPending ? "创建中..." : "创建商品"}
                  </Button>
                  <Button
                    onClick={() => setShowAddProduct(false)}
                    variant="outline"
                    className="border-slate-600"
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {productsLoading ? (
                <>
                  <Skeleton className="h-20 w-full bg-slate-700" />
                  <Skeleton className="h-20 w-full bg-slate-700" />
                </>
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {editingProduct?.id === product.id ? (
                          <Input
                            value={editingProduct.title}
                            onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                            onBlur={() => {
                              handleUpdateProduct(product.id, 'title', editingProduct.title);
                            }}
                            className="mb-2 bg-slate-700 border-slate-600 text-white"
                          />
                        ) : (
                          <h4 className="font-semibold text-white mb-1">{product.title}</h4>
                        )}
                        <p className="text-sm text-slate-400 mb-2">
                          {product.description || '无描述'}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-400">SKU: {product.sku || 'N/A'}</span>
                          <span className="text-green-400 font-semibold">
                            ${product.price} {product.currency}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            product.status === 'ACTIVE'
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-slate-700 text-slate-400'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProduct(product)}
                          className="border-slate-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteProductMutation.mutate(product.id)}
                          disabled={deleteProductMutation.isPending}
                          className="border-slate-600 text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无商品</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6 mt-6">
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-6">订单列表</h3>
            <div className="space-y-3">
              {ordersLoading ? (
                <>
                  <Skeleton className="h-16 w-full bg-slate-700" />
                  <Skeleton className="h-16 w-full bg-slate-700" />
                </>
              ) : orders && orders.length > 0 ? (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">订单 #{order.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            order.status === 'COMPLETED'
                              ? 'bg-green-900/30 text-green-400'
                              : order.status === 'PENDING'
                                ? 'bg-yellow-900/30 text-yellow-400'
                                : 'bg-blue-900/30 text-blue-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400">
                          金额: ${order.amount} | 手续费: ${order.fee} | 净收入: ${(order.amount - order.fee).toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {order.status === 'PAID' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: 'SHIPPED' })}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          标记已发货
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无订单</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Tax Reports Tab */}
        <TabsContent value="reports" className="space-y-6 mt-6">
          <Card className="p-6 bg-slate-800/50 border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">税务报表</h3>
              <Button
                onClick={handleGenerateTaxReport}
                disabled={generateTaxReportMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                {generateTaxReportMutation.isPending ? "生成中..." : "生成本月报表"}
              </Button>
            </div>
            <div className="space-y-3">
              {taxReports && taxReports.length > 0 ? (
                taxReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">
                          期间: {report.periodStart} 至 {report.periodEnd}
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">总销售额:</span>
                            <span className="text-white ml-2 font-semibold">${report.grossSales}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">平台手续费:</span>
                            <span className="text-white ml-2 font-semibold">${report.platformFees}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">净收入:</span>
                            <span className="text-green-400 ml-2 font-semibold">${report.netAmount}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">应纳税额:</span>
                            <span className="text-white ml-2 font-semibold">${report.taxableAmount}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadTaxReport(report.id)}
                        className="border-slate-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        下载
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无税务报表</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

