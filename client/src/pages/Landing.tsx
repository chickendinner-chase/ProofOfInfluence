import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ShieldCheck,
  Layers,
  Scale,
  Network,
  CheckCircle2,
  Building2,
  BookText,
  Coins,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";

// i18n/config (ZH only for now; extendable to EN)
const zh = {
  brand: "ACEE Ventures",
  nav: {
    poi: "POI 白皮书",
    features: "核心功能",
    tokenomics: "代币经济学",
    roadmap: "路线图",
    about: "关于我们",
    contact: "进入 APP",
  },
  hero: {
    title: "雇佣 AI 交易员：智能 ETH/USDC 交易平台",
    subtitle:
      "基于 Uniswap 的去中心化交易，实时图表监控 Base 网络，一键完成代币兑换，无需注册账户。",
    primaryCTA: "立即开始交易",
    secondaryCTA: "查看实时行情",
    badges: ["Uniswap V2", "Base 网络", "MetaMask"],
  },
  sections: {
    whitepaper: {
      title: "$POI 白皮书",
      desc: "深入了解 POI 的项目背景、定位与核心价值体系，以及如何构建非金融资产通证化基础设施。",
      icon: BookText,
    },
    services: {
      title: "核心功能",
      desc: "探索资产代币发行、DEX 平台交易、现实世界消费三大核心功能模块的详细实现方案。",
      icon: Layers,
    },
    tokenomics: {
      title: "$POI 代币经济学",
      desc: "了解代币总量、分配机制、挖矿模型、治理体系等完整的经济模型设计。",
      icon: Coins,
    },
    roadmap: {
      title: "三年路线图",
      desc: "从 TGE 到生态成熟的五个阶段详细规划，涵盖技术开发、市场拓展与治理升级。",
      icon: MapPin,
    },
    profile: {
      title: "团队与顾问",
      desc: "认识推动 POI 项目的核心团队成员与技术顾问，了解我们的背景与专业能力。",
      icon: Users,
    },
  },
  trading: {
    title: "雇佣 AI 交易员",
    monitoring: {
      title: "实时市场监控",
      desc: "24/7 监控 Base 链 ETH/USDC 交易对价格变动，基于 Uniswap V2 提供最优兑换路径。",
      cta: "进入交易平台",
    },
    swap: {
      title: "一键智能兑换",
      desc: "连接 MetaMask 钱包即可开始交易，无需注册，所有交易在链上完成。",
      cta: "了解更多",
    },
  },
};

export default function Landing() {
  const [lang, setLang] = useState("zh");
  const t = useMemo(() => zh, [lang]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          <div className="font-semibold text-lg text-white">{t.brand}</div>
          <nav className="hidden md:flex gap-6 text-sm">
            <a href="#whitepaper" className="hover:text-white transition-colors">
              {t.nav.poi}
            </a>
            <a href="#services" className="hover:text-white transition-colors">
              {t.nav.features}
            </a>
            <a href="#tokenomics" className="hover:text-white transition-colors">
              {t.nav.tokenomics}
            </a>
            <a href="#roadmap" className="hover:text-white transition-colors">
              {t.nav.roadmap}
            </a>
            <a href="#profile" className="hover:text-white transition-colors">
              {t.nav.about}
            </a>
          </nav>
          <Link href="/app">
            <div className="border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
              {t.nav.contact}
            </div>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
              {t.hero.title}
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/app">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100"
                >
                  {t.hero.primaryCTA}
                </Button>
              </Link>
              <Link href="/app">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800"
                >
                  {t.hero.secondaryCTA}
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {t.hero.badges.map((badge) => (
                <span
                  key={badge}
                  className="text-xs px-3 py-1 rounded-full border border-slate-700 bg-slate-800/50"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="border border-slate-700 rounded-2xl p-4 bg-slate-800/30 backdrop-blur overflow-hidden">
            <div className="aspect-video">
              <iframe
                src="https://www.tradingview.com/embed-widget/symbol-overview/?locale=zh_CN&symbol=COINBASE%3AETHUSD&interval=15&theme=dark&style=1&height=100%&width=100%"
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="ETH/USDC Live Chart"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">ETH/USDC 实时行情</p>
          </div>
        </div>
      </section>

      {/* Main Sections Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Whitepaper */}
          <Link href="/whitepaper">
            <Card
              id="whitepaper"
              className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all cursor-pointer group h-full"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                  <BookText className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {t.sections.whitepaper.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {t.sections.whitepaper.desc}
                </p>
                <div className="flex items-center text-sm text-slate-400 group-hover:text-white transition-colors pt-2">
                  了解更多 <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Card>
          </Link>

          {/* Services */}
          <Link href="/services">
            <Card
              id="services"
              className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all cursor-pointer group h-full"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {t.sections.services.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {t.sections.services.desc}
                </p>
                <div className="flex items-center text-sm text-slate-400 group-hover:text-white transition-colors pt-2">
                  了解更多 <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Card>
          </Link>

          {/* Tokenomics */}
          <Link href="/tokenomics">
            <Card
              id="tokenomics"
              className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all cursor-pointer group h-full"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {t.sections.tokenomics.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {t.sections.tokenomics.desc}
                </p>
                <div className="flex items-center text-sm text-slate-400 group-hover:text-white transition-colors pt-2">
                  了解更多 <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Card>
          </Link>

          {/* Roadmap */}
          <Link href="/roadmap">
            <Card
              id="roadmap"
              className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all cursor-pointer group h-full"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {t.sections.roadmap.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {t.sections.roadmap.desc}
                </p>
                <div className="flex items-center text-sm text-slate-400 group-hover:text-white transition-colors pt-2">
                  了解更多 <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Card>
          </Link>

          {/* Profile */}
          <Link href="/profile">
            <Card
              id="profile"
              className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all cursor-pointer group h-full"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {t.sections.profile.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {t.sections.profile.desc}
                </p>
                <div className="flex items-center text-sm text-slate-400 group-hover:text-white transition-colors pt-2">
                  了解更多 <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Trading Section */}
      <section id="trading" className="max-w-7xl mx-auto px-4 py-16">
        <div className="border-t border-slate-800 pt-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">
            {t.trading.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Real-time Monitoring Card */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  {t.trading.monitoring.title}
                </h3>
                <p className="text-sm text-slate-400">
                  {t.trading.monitoring.desc}
                </p>
                <Link href="/app">
                  <Button className="bg-white text-slate-900 hover:bg-slate-100">
                    {t.trading.monitoring.cta}
                  </Button>
                </Link>
              </div>
            </Card>

            {/* One-click Swap Card */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  {t.trading.swap.title}
                </h3>
                <p className="text-sm text-slate-400">
                  {t.trading.swap.desc}
                </p>
                <Link href="/app">
                  <Button
                    variant="outline"
                    className="border-slate-700 hover:bg-slate-800 w-full md:w-auto"
                  >
                    {t.trading.swap.cta}
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
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
