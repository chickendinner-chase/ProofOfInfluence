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
    contact: "AI 咨询",
  },
  hero: {
    title: "Proof of Influence（POI）：非金融资产通证化基础设施",
    subtitle:
      "让影视剧版权、艺术/奢侈品、房产等非金融资产上链、可验证、可交易。以'影响力即价值'为核心，构建 RWA资产发行 + DEX平台交易 + 现实世界消费 的三合一生态架构。",
    primaryCTA: "AI 免费咨询（立即体验）",
    secondaryCTA: "预约人工专家（付费）",
    badges: ["非金融 RWA", "RWA 发行 + DEX 交易 + 消费闭环", "$POI 原生代币"],
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
  consulting: {
    title: "AI 免费咨询 + 付费人工咨询",
    ai: {
      title: "AI 免费咨询",
      desc: "即时获取代币经济学/合规/架构答疑（演示版）。",
      placeholder: "请输入你的问题，如：如何为短剧版权设计通证模型？",
      cta: "开始对话",
    },
    human: {
      title: "预约人工专家（付费）",
      desc: "由资深顾问一对一提供方案评估与落地建议，含保密协议。",
      cta: "预约 60 分钟咨询",
    },
  },
};

export default function Landing() {
  const [lang, setLang] = useState("zh");
  const [aiQuery, setAiQuery] = useState("");
  const t = useMemo(() => zh, [lang]);

  const handleAiConsult = () => {
    if (aiQuery.trim()) {
      alert(`AI 咨询功能开发中...\n您的问题：${aiQuery}`);
    }
  };

  const handleHumanConsult = () => {
    alert("人工专家预约功能开发中...");
  };

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
          <a
            href="#consulting"
            className="border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {t.nav.contact}
          </a>
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
              <a href="#consulting">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100"
                >
                  {t.hero.primaryCTA}
                </Button>
              </a>
              <a href="#consulting">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800"
                >
                  {t.hero.secondaryCTA}
                </Button>
              </a>
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
          <div className="border border-slate-700 rounded-2xl p-8 bg-slate-800/30 backdrop-blur">
            <div className="aspect-video flex items-center justify-center text-slate-500">
              <div className="text-center space-y-2">
                <ShieldCheck className="w-16 h-16 mx-auto opacity-50" />
                <p>AI 咨询界面预览</p>
              </div>
            </div>
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

      {/* Consulting Section */}
      <section id="consulting" className="max-w-7xl mx-auto px-4 py-16">
        <div className="border-t border-slate-800 pt-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">
            {t.consulting.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* AI Free Consulting */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  {t.consulting.ai.title}
                </h3>
                <p className="text-sm text-slate-400">{t.consulting.ai.desc}</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAiConsult()}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
                    placeholder={t.consulting.ai.placeholder}
                  />
                  <Button
                    onClick={handleAiConsult}
                    className="bg-white text-slate-900 hover:bg-slate-100"
                  >
                    {t.consulting.ai.cta}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Human Paid Consulting */}
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  {t.consulting.human.title}
                </h3>
                <p className="text-sm text-slate-400">
                  {t.consulting.human.desc}
                </p>
                <Button
                  onClick={handleHumanConsult}
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800 w-full md:w-auto"
                >
                  {t.consulting.human.cta}
                </Button>
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
