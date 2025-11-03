import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Link as LinkIcon, Sparkles, Github, ShieldCheck, EyeOff, Package } from "lucide-react";
import { SiGoogle, SiX } from "react-icons/si";
import ThemeToggle from "@/components/ThemeToggle";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Your Web3-enabled link-in-bio
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect your social presence with Web3. Share your links, connect your wallet, and become eligible for exclusive airdrops.
            </p>
          </div>

          {/* CTA Button */}
          <Button 
            size="lg"
            onClick={handleLogin}
            data-testid="button-login"
            className="text-lg px-8 py-6"
          >
            <SiGoogle className="mr-2 h-5 w-5" />
            Get Started - Sign in with Google
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl">
            <Card className="p-6 space-y-3 hover-elevate">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <SiGoogle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Social Login</h3>
              <p className="text-sm text-muted-foreground">
                Sign in with your Google account. No complicated setup, just one click to get started.
              </p>
            </Card>

            <Card className="p-6 space-y-3 hover-elevate">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Connect Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Link your crypto wallet to become eligible for exclusive airdrops and Web3 features.
              </p>
            </Card>

            <Card className="p-6 space-y-3 hover-elevate">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <LinkIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Custom Links</h3>
              <p className="text-sm text-muted-foreground">
                Showcase all your important links in one beautiful, customizable page.
              </p>
            </Card>
          </div>

          {/* RWA Section - Luxury Watches */}
          <div className="mt-20 w-full max-w-5xl">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                RWA 链商板块 - 名贵手表
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Real World Assets on Blockchain - 将现实世界的高价值奢侈手表安全、可溯源地在链上传递
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-8 space-y-4 hover-elevate bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-center">可溯源</h3>
                <p className="text-muted-foreground text-center">
                  每块名表都有完整的链上记录：出厂证书、购入凭证、鉴定报告、维保记录、过户历史，所有数据哈希上链，真伪可验
                </p>
              </Card>

              <Card className="p-8 space-y-4 hover-elevate bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
                  <EyeOff className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-center">匿名传递</h3>
                <p className="text-muted-foreground text-center">
                  支持库内过户或仅转移 NFT 凭证，保护买卖双方隐私。注意：一旦发货，需完成 KYC，物流信息将暴露身份
                </p>
              </Card>

              <Card className="p-8 space-y-4 hover-elevate bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-center">高价值藏品</h3>
                <p className="text-muted-foreground text-center">
                  Patek Philippe、Rolex、Audemars Piguet 等顶级腕表上链，解锁全球流动性市场，打破地域限制
                </p>
              </Card>
            </div>

            {/* RWA Use Cases */}
            <Card className="p-8 space-y-6 bg-muted/30 backdrop-blur">
              <h3 className="text-2xl font-bold text-center">名表 RWA 应用场景</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    ⌚ 奢侈腕表交易
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    百达翡丽、劳力士、爱彼等珍贵腕表通过 NFT 形式上链，实现全球范围内的安全交易和所有权转移，突破地域限制
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    🔒 防伪认证
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    每块手表配备独特的链上身份证明，序列号、证书、鉴定记录全部上链，杜绝假货和仿品问题
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    🏛️ 维保溯源
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    官方维保记录、翻新历史、零件更换完整备案，保值增值有据可查，收藏投资更放心
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    🤝 库内托管
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    手表存放在专业金库，买卖双方仅转移 NFT 凭证，实现匿名交易，无需发货，降低风险和费用
                  </p>
                </div>
              </div>
            </Card>

            {/* Privacy & Compliance Notice */}
            <Card className="p-6 bg-muted/20 border-primary/20 mt-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-semibold">隐私与合规说明</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>库内过户</strong>：手表保存在托管金库，买卖双方仅转移 NFT 所有权凭证，全程匿名</li>
                    <li>• <strong>实物提货</strong>：一旦申请发货，买家需完成身份验证（KYC）和物流信息登记，隐私将被部分暴露</li>
                    <li>• <strong>费用优惠</strong>：持有 $POI 可享受平台费用折扣和物流补贴（$POI 不直接支付商品价款）</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-16 space-y-6 w-full max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold">Perfect for</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 text-left">
                <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Content Creators</h4>
                  <p className="text-sm text-muted-foreground">Share all your social links in one place</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <Wallet className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Web3 Enthusiasts</h4>
                  <p className="text-sm text-muted-foreground">Connect wallet for airdrop eligibility</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <Github className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Developers</h4>
                  <p className="text-sm text-muted-foreground">Showcase projects and GitHub profile</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <SiX className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Social Media</h4>
                  <p className="text-sm text-muted-foreground">Connect all your social platforms</p>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-20 text-center">
            <p className="text-sm text-muted-foreground">
              Powered by Replit × Web3
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
