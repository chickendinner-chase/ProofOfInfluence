import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  BookOpen,
  FileText,
  Code,
  ExternalLink,
  Download,
  Coins,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function TokenDocs() {
  const lang = "zh";

  const resources = [
    {
      icon: FileText,
      title: "$POI 白皮书",
      description: "深入了解 POI 的项目背景、定位与核心价值体系，以及如何构建非金融资产通证化基础设施。",
      action: "查看白皮书",
      href: "/whitepaper",
      type: "internal",
    },
    {
      icon: BarChart3,
      title: "代币经济学",
      description: "了解代币总量、分配机制、挖矿模型、治理体系等完整的经济模型设计。",
      action: "查看 Tokenomics",
      href: "/tokenomics",
      type: "internal",
    },
    {
      icon: BookOpen,
      title: "GitBook 文档",
      description: "完整的开发者文档、用户指南、API 参考和最佳实践。包含详细的代码示例和集成教程。",
      action: "访问 GitBook",
      href: "https://docs.acee.ventures",
      type: "external",
    },
    {
      icon: Code,
      title: "API 文档",
      description: "RESTful API 和 GraphQL 接口文档，支持程序化访问平台功能和数据。包含 SDK 和示例代码。",
      action: "查看 API Docs",
      href: "https://api-docs.acee.ventures",
      type: "external",
    },
  ];

  const downloads = [
    {
      title: "$POI 白皮书 PDF",
      description: "完整版白皮书（中文）",
      size: "2.5 MB",
      link: "#",
    },
    {
      title: "Tokenomics 报告",
      description: "代币经济模型详解",
      size: "1.8 MB",
      link: "#",
    },
    {
      title: "智能合约审计报告",
      description: "CertiK 安全审计报告",
      size: "3.2 MB",
      link: "#",
    },
    {
      title: "品牌资产包",
      description: "Logo、品牌指南和媒体素材",
      size: "15 MB",
      link: "#",
    },
  ];

  const quickLinks = [
    {
      title: "智能合约地址",
      items: [
        { label: "Ethereum Mainnet", value: "0x..." },
        { label: "Base Mainnet", value: "0x..." },
        { label: "Arbitrum One", value: "0x..." },
      ],
    },
    {
      title: "官方渠道",
      items: [
        { label: "GitHub", value: "github.com/acee-ventures" },
        { label: "Discord", value: "discord.gg/aceeventures" },
        { label: "Telegram", value: "t.me/aceeventures" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header lang={lang} />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-slate-300">
            <Coins className="w-4 h-4" />
            <span className="text-sm font-semibold">$POI Token & Documentation</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Token & 文档
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            查阅 $POI 代币白皮书、Tokenomics 和技术文档。我们的 GitBook 提供全面的开发者指南和 API 文档，
            帮助您快速接入 ACEE 产品生态。
          </p>
        </div>
      </section>

      {/* Main Resources */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Card
                key={resource.title}
                className="p-8 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all group"
              >
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                      <Icon className="w-7 h-7 text-slate-300" />
                    </div>
                    {resource.type === "external" && (
                      <ExternalLink className="w-5 h-5 text-slate-500" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-3">
                      {resource.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {resource.description}
                    </p>
                  </div>

                  {resource.type === "internal" ? (
                    <Link href={resource.href}>
                      <Button
                        variant="ghost"
                        className="text-slate-400 hover:text-white p-0"
                      >
                        {resource.action} <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  ) : (
                    <a
                      href={resource.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                    >
                      {resource.action} <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Downloads */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            资料下载
          </h2>
          <p className="text-slate-400">
            下载完整的技术文档和品牌资产
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {downloads.map((item) => (
            <Card
              key={item.title}
              className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                    <Download className="w-5 h-5 text-slate-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-400 mb-1">
                      {item.description}
                    </p>
                    <p className="text-xs text-slate-500">{item.size}</p>
                  </div>
                </div>
                <a
                  href={item.link}
                  download
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {quickLinks.map((section) => (
            <Card
              key={section.title}
              className="p-8 bg-slate-800/30 border-slate-700"
            >
              <h3 className="text-xl font-semibold text-white mb-6">
                {section.title}
              </h3>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-slate-800/50"
                  >
                    <span className="text-sm text-slate-400">{item.label}</span>
                    <code className="text-sm text-slate-300 font-mono">
                      {item.value}
                    </code>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Developer CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 text-center">
          <div className="space-y-6 max-w-2xl mx-auto">
            <Code className="w-12 h-12 text-slate-300 mx-auto" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              开始集成 ACEE
            </h2>
            <p className="text-lg text-slate-300">
              查看我们的开发者文档和 API 参考，快速将 ACEE 功能集成到您的应用中
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://docs.acee.ventures"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 px-8"
                >
                  查看文档
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <a
                href="https://api-docs.acee.ventures"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-500 hover:bg-slate-800 px-8 text-white"
                >
                  API 文档
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </Card>
      </section>

      <Footer lang={lang} />
    </div>
  );
}
