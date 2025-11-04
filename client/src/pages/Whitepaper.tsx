import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  BookText,
  CheckCircle2,
  ShieldCheck,
  Target,
  Sparkles,
  Lock,
  Network,
} from "lucide-react";

export default function Whitepaper() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <Link href="/">
            <Button
              variant="ghost"
              className="hover:bg-slate-800"
              data-testid="back-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          <div className="font-semibold text-lg text-white">ACEE Ventures</div>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700">
            <BookText className="w-10 h-10 text-slate-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            $POI 白皮书
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Proof of Influence（POI）：非金融资产通证化基础设施
          </p>
        </div>

        {/* Background */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
            <Target className="w-6 h-6" />
            项目背景
          </h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            在数字经济时代，非金融资产需要在链上被有效标记与流通。POI
            以通证为载体，让资产可追溯、可交易、可治理。
          </p>
          <p className="text-slate-300 leading-relaxed">
            传统的资产流通存在诸多痛点：信息不透明、交易成本高、流动性受限、确权困难。POI
            通过区块链技术，为非金融资产提供了一个去中心化、透明、高效的通证化解决方案。
          </p>
        </Card>

        {/* Positioning */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            项目定位
          </h2>
          <p className="text-slate-300 leading-relaxed text-lg">
            面向短剧/艺术与奢侈品/住宅商业不动产等非金融资产的通证化基础设施。
          </p>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">影视剧版权</h4>
              <p className="text-sm text-slate-400">
                短剧、电影、电视剧等影视作品的版权通证化，实现收益权分配与交易
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">艺术与奢侈品</h4>
              <p className="text-sm text-slate-400">
                艺术品、名表、珠宝等高价值奢侈品的所有权通证化与溯源认证
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">不动产</h4>
              <p className="text-sm text-slate-400">
                住宅、商业地产等不动产的份额化通证，降低投资门槛
              </p>
            </div>
          </div>
        </Card>

        {/* Core Values */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" />
            核心价值
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">原创设计</h3>
                <p className="text-slate-400">
                  以'影响力即价值'为经济内核，强调可审计与激励闭环。POI
                  不仅是资产的数字化，更是价值创造与分配的新范式。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">结构优势</h3>
                <p className="text-slate-400">
                  RWA 发行 + DEX 交易 +
                  治理/激励。三位一体的架构设计，确保从资产上链、流通交易到社区治理的完整闭环。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">合规意识</h3>
                <p className="text-slate-400">
                  KYC/AML、确权认证、上链审计与金库披露。严格遵循监管要求，确保项目的合法合规运营。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">生态扩展</h3>
                <p className="text-slate-400">
                  忠诚度系统、NFT 成就、跨链互联、DeFi
                  扩展。构建开放的生态系统，与更多项目和协议实现互联互通。
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Technical Architecture */}
        <Card className="p-8 mb-8 bg-slate-800/50 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
            <Network className="w-6 h-6" />
            技术架构
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">链上资产层</h4>
              <p className="text-sm text-slate-400">
                智能合约管理资产通证发行、转移、销毁等核心功能，确保资产的链上映射与确权
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">交易协议层</h4>
              <p className="text-sm text-slate-400">
                DEX 协议支持资产通证的自由交易、流动性池管理、价格发现机制
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">治理与激励层</h4>
              <p className="text-sm text-slate-400">
                DAO 治理框架、质押挖矿机制、影响力评分系统，激励生态参与者
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <h4 className="font-semibold text-white mb-2">应用与接口层</h4>
              <p className="text-sm text-slate-400">
                Web/移动端应用、API 接口、钱包集成，为用户提供便捷的访问入口
              </p>
            </div>
          </div>
        </Card>

        {/* Vision */}
        <Card className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <h2 className="text-2xl font-semibold mb-4 text-white">愿景</h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-4">
            成为全球领先的非金融资产通证化基础设施，让每一个有价值的资产都能在链上流通。
          </p>
          <p className="text-slate-400 leading-relaxed">
            我们相信，在 Web3
            时代，资产的流动性将不再受限于地理边界和传统金融体系。POI
            致力于构建一个开放、透明、高效的资产通证化生态，让价值自由流动，让每个人都能参与到优质资产的投资与收益分享中。
          </p>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-slate-500">
          © 2025 ACEE Ventures. 保留所有权利。
        </div>
      </footer>
    </div>
  );
}
