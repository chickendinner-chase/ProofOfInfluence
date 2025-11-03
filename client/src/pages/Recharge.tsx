import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, Info, Coins, CreditCard, ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import StripePayment from "@/components/StripePayment";
import type { PoiTier } from "@shared/schema";

export default function Recharge() {
  const [, setLocation] = useLocation();
  const [tiers, setTiers] = useState<PoiTier[]>([]);
  const [region, setRegion] = useState("US");
  const [feeCreditEnabled, setFeeCreditEnabled] = useState(false);

  useEffect(() => {
    // Fetch configuration data
    Promise.all([
      fetch("/api/poi/tiers").then(r => r.json()),
      fetch("/api/region").then(r => r.json()),
      fetch("/api/features").then(r => r.json())
    ]).then(([tierRes, regionRes, featureRes]) => {
      setTiers(tierRes);
      setRegion(regionRes.region);
      setFeeCreditEnabled(!!featureRes.FEATURE_POI_FEE_CREDIT);
    }).catch(error => {
      console.error("Error fetching configuration:", error);
    });
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col items-center space-y-8">
          {/* Header */}
          <div className="space-y-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              充值 $POI Token
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              $POI 是平台功能型代币，用于会员等级与平台费用优惠。购买 RWA 名表请使用 Visa / Crypto；$POI 不直接作为商品价款的支付工具。
            </p>
          </div>

          {/* Compliance Notice */}
          <Alert className="bg-muted/40 max-w-3xl">
            <ShieldCheck className="h-5 w-5" />
            <AlertTitle>合规与使用范围</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4 space-y-1 mt-2">
                <li>$POI 为功能型代币，符合平台合规要求</li>
                <li><strong>会员等级折扣（全局）</strong>：持有/质押 $POI 可获得平台费用/物流补贴优惠</li>
                {feeCreditEnabled ? (
                  <li><strong>费用抵扣积分（本地区开放）</strong>：燃烧 $POI 兑换 Fee Credits，仅抵平台相关费用（不抵商品价款），抵扣上限 15-20%</li>
                ) : (
                  <li>费用抵扣积分在您所在地区暂未开放</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>

          {/* Stripe Payment Component */}
          <StripePayment />

          {/* Alternative Payment Methods */}
          <Card className="p-6 space-y-4 max-w-3xl w-full">
            <h2 className="text-2xl font-semibold text-center">其他支付方式</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline"><CreditCard className="mr-2 h-4 w-4" /> 使用 Visa 购买</Button>
              <Button variant="outline"><Coins className="mr-2 h-4 w-4" /> 使用 Crypto 购买</Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              购买即表示您理解 $POI 为平台功能型代币；价格或有波动；不同地区功能可能有所差异。
            </p>
          </Card>

          {/* Tier Benefits */}
          <Card className="p-6 space-y-4 max-w-3xl w-full">
            <h3 className="text-xl font-semibold text-center">会员等级权益</h3>
            {tiers.length > 0 ? (
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2">
                {tiers.map((tier) => {
                  const discountPercent = (parseFloat(tier.feeDiscountRate) * 100).toFixed(0);
                  const shippingCap = (tier.shippingCreditCapCents / 100).toFixed(0);
                  return (
                    <li key={tier.id}>
                      {tier.name}（≥{tier.minPoi.toLocaleString()} POI）：
                      平台费 -{discountPercent}%，物流补贴封顶 ${shippingCap}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2">
                <li>Lv1（≥5,000 POI）：平台费 -5%，物流补贴封顶 $50</li>
                <li>Lv2（≥25,000 POI）：平台费 -10%，物流补贴封顶 $150</li>
                <li>Lv3（≥100,000 POI）：平台费 -15%，物流补贴封顶 $300</li>
              </ul>
            )}
          </Card>

          {/* Fee Credits Feature */}
          {feeCreditEnabled && (
            <Card className="p-6 space-y-4 max-w-3xl w-full">
              <h3 className="text-xl font-semibold">费用抵扣积分（Fee Credits）</h3>
              <p className="text-sm text-muted-foreground">
                通过燃烧 $POI 可兑换 Fee Credits，仅用于抵扣平台服务费/保真/托管/物流补贴，单笔抵扣不超过相应费用的 20%。
                （可用性与上限以结算页展示为准）
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button disabled>烧毁 $POI 兑换积分</Button>
                <Button variant="outline" onClick={() => setLocation("/dashboard")}>查看我的积分余额</Button>
              </div>
            </Card>
          )}

          {/* RWA Information */}
          <Alert variant="default" className="max-w-3xl">
            <Info className="h-5 w-5" />
            <AlertTitle>名贵手表 RWA 说明</AlertTitle>
            <AlertDescription className="space-y-2 text-sm">
              <p>
                <strong>可溯源：</strong>出厂/购入/鉴定/维保/过户链上备案（哈希+时间戳）。
              </p>
              <p>
                <strong>匿名传递：</strong>仅限"库内过户或仅转凭证"。一旦发货，需完成 KYC 且物流信息会暴露身份。
              </p>
            </AlertDescription>
          </Alert>

          {/* Terms and Conditions */}
          <p className="text-xs text-center text-muted-foreground max-w-2xl">
            $POI 代币的购买与使用需遵守平台服务条款和适用法律法规。代币价格可能波动，不构成投资建议。
            不同地区的功能和优惠可能存在差异，具体以当地规则为准。
          </p>
        </div>
      </div>
    </div>
  );
}

