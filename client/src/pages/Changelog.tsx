import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  GitBranch,
  Plus,
  Wrench,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function Changelog() {
  const lang = "zh";

  const releases = [
    {
      version: "v1.2.0",
      date: "2025-11-05",
      title: "新功能：质押挖矿 2.0",
      type: "major",
      changes: {
        added: [
          "新增灵活质押功能，支持随时取出质押资产",
          "新增质押收益自动复利选项",
          "新增质押池分析仪表盘",
          "支持多币种质押（ETH, USDC, $POI）",
        ],
        improved: [
          "优化质押奖励计算算法，提高精度",
          "改进质押页面 UI，提升用户体验",
          "提升质押合约 Gas 效率 30%",
        ],
        fixed: [
          "修复质押奖励显示延迟问题",
          "修复某些情况下取消质押失败的 bug",
        ],
      },
      githubLink: "https://github.com/acee-ventures/platform/releases/tag/v1.2.0",
    },
    {
      version: "v1.1.0",
      date: "2025-10-20",
      title: "合规功能增强",
      type: "minor",
      changes: {
        added: [
          "新增 KYC 高级认证流程",
          "新增地域限制检测和提示",
          "新增交易限额设置功能",
        ],
        improved: [
          "优化 KYC 审核流程，平均审核时间缩短至 4 小时",
          "改进费用销毁记录展示页面",
        ],
        fixed: [
          "修复部分地区用户无法访问的问题",
          "修复 KYC 文件上传大小限制问题",
        ],
      },
      githubLink: "https://github.com/acee-ventures/platform/releases/tag/v1.1.0",
    },
    {
      version: "v1.0.1",
      date: "2025-10-05",
      title: "安全性更新",
      type: "patch",
      changes: {
        added: [],
        improved: [
          "升级智能合约安全库至最新版本",
          "加强钱包连接安全验证",
        ],
        fixed: [
          "修复钱包断开连接后状态未更新的问题",
          "修复移动端钱包连接兼容性问题",
          "修复某些浏览器下交易确认弹窗不显示的 bug",
        ],
        security: [
          "修复智能合约潜在的重入攻击漏洞（已通过 CertiK 审计确认）",
        ],
      },
      githubLink: "https://github.com/acee-ventures/platform/releases/tag/v1.0.1",
    },
    {
      version: "v1.0.0",
      date: "2025-09-15",
      title: "正式版发布 🎉",
      type: "major",
      changes: {
        added: [
          "代币发行功能上线",
          "NFT 创建和管理功能",
          "质押挖矿基础功能",
          "治理提案系统",
          "统一用户仪表盘",
          "多链钱包支持（Ethereum, Base, Arbitrum）",
        ],
        improved: [],
        fixed: [],
      },
      githubLink: "https://github.com/acee-ventures/platform/releases/tag/v1.0.0",
    },
    {
      version: "v0.9.0-beta",
      date: "2025-08-20",
      title: "公开测试版",
      type: "beta",
      changes: {
        added: [
          "Beta 测试计划启动",
          "测试网代币发行功能",
          "基础钱包连接功能",
        ],
        improved: [
          "完成智能合约安全审计",
          "优化前端性能",
        ],
        fixed: [],
      },
      githubLink: "https://github.com/acee-ventures/platform/releases/tag/v0.9.0",
    },
  ];

  const typeColors = {
    major: "bg-purple-900/50 text-purple-300 border-purple-700",
    minor: "bg-blue-900/50 text-blue-300 border-blue-700",
    patch: "bg-green-900/50 text-green-300 border-green-700",
    beta: "bg-amber-900/50 text-amber-300 border-amber-700",
  };

  const renderChangeSection = (title: string, items: string[], icon: any, color: string) => {
    if (!items || items.length === 0) return null;

    const Icon = icon;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <h4 className={`text-sm font-semibold ${color}`}>{title}</h4>
        </div>
        <ul className="space-y-2 pl-6">
          {items.map((item, index) => (
            <li key={index} className="text-sm text-slate-400 leading-relaxed">
              • {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header lang={lang} />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-slate-300">
            <GitBranch className="w-4 h-4" />
            <span className="text-sm font-semibold">版本更新</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            更新日志
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            查看 ACEE 平台的功能更新记录和版本进展。每次发布后，我们会在此记录新功能、改进和修复内容。
          </p>
          <a
            href="https://github.com/acee-ventures/platform"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-sm">查看 GitHub 仓库</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Changelog Timeline */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-12">
          {releases.map((release, index) => (
            <div key={release.version} className="relative">
              {/* Timeline Line */}
              {index < releases.length - 1 && (
                <div className="absolute left-[23px] top-16 w-0.5 h-full bg-slate-800" />
              )}

              <Card className="p-8 bg-slate-800/50 border-slate-700 relative">
                {/* Version Badge */}
                <div className="absolute -left-2 top-8 w-12 h-12 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-slate-400" />
                </div>

                <div className="pl-12 space-y-6">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-bold text-white">
                          {release.version}
                        </h2>
                        <span
                          className={`text-xs px-3 py-1 rounded-full border ${
                            typeColors[release.type as keyof typeof typeColors]
                          }`}
                        >
                          {release.type === "major"
                            ? "重大更新"
                            : release.type === "minor"
                            ? "功能更新"
                            : release.type === "patch"
                            ? "修复更新"
                            : "测试版"}
                        </span>
                      </div>
                      <h3 className="text-lg text-slate-300">{release.title}</h3>
                      <p className="text-sm text-slate-500">{release.date}</p>
                    </div>
                    {release.githubLink && (
                      <a
                        href={release.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                      >
                        GitHub Release
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Changes */}
                  <div className="space-y-6">
                    {renderChangeSection(
                      "新增功能",
                      release.changes.added,
                      Plus,
                      "text-green-400"
                    )}
                    {renderChangeSection(
                      "优化改进",
                      release.changes.improved,
                      Wrench,
                      "text-blue-400"
                    )}
                    {renderChangeSection(
                      "问题修复",
                      release.changes.fixed,
                      CheckCircle2,
                      "text-slate-400"
                    )}
                    {release.changes.security &&
                      renderChangeSection(
                        "安全更新",
                        release.changes.security,
                        AlertCircle,
                        "text-red-400"
                      )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 text-center">
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              想了解未来规划？
            </h2>
            <p className="text-lg text-slate-300">
              查看我们的产品路线图，了解即将推出的功能和长期发展计划
            </p>
            <Button
              size="lg"
              asChild
              className="bg-white text-slate-900 hover:bg-slate-100 px-8"
            >
              <a href="/roadmap">查看路线图</a>
            </Button>
          </div>
        </Card>
      </section>

      {/* Subscribe Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-8 bg-slate-800/30 border-slate-700">
          <div className="text-center space-y-4 max-w-lg mx-auto">
            <h3 className="text-xl font-semibold text-white">
              订阅更新通知
            </h3>
            <p className="text-slate-400">
              获取最新版本发布通知和重要功能更新
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
              <Button className="bg-white text-slate-900 hover:bg-slate-100">
                订阅
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              我们尊重您的隐私，不会向第三方分享您的邮箱
            </p>
          </div>
        </Card>
      </section>

      <Footer lang={lang} />
    </div>
  );
}
