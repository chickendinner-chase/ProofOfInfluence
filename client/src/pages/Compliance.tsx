import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Shield,
  FileCheck,
  AlertTriangle,
  Lock,
  Scale,
  Users,
  Globe,
  CheckCircle2,
} from "lucide-react";

export default function Compliance() {
  const lang = "zh";

  const complianceItems = [
    {
      icon: FileCheck,
      title: "KYC/AML 流程",
      description: "用户身份验证和反洗钱合规",
      details: [
        "所有用户需完成身份验证（KYC）方可使用提现功能",
        "采用第三方认证服务提供商（如 Jumio、Onfido）",
        "持续监控交易行为，识别可疑活动",
        "遵守 FATF（金融行动特别工作组）标准",
      ],
      process: "注册 → 基础认证 → 高级认证（大额交易） → 持续监控",
    },
    {
      icon: Lock,
      title: "资金安全",
      description: "用户资产保护机制",
      details: [
        "用户资产通过多签钱包和冷钱包存储",
        "智能合约经过第三方安全审计（CertiK、SlowMist）",
        "实施风险隔离和资产保险计划",
        "定期安全审计和漏洞修复",
      ],
      process: "多签管理 → 冷热钱包分离 → 定期审计 → 保险保障",
    },
    {
      icon: Scale,
      title: "费用与销毁规则",
      description: "平台交易费用和代币销毁机制",
      details: [
        "交易手续费：0.3%（其中 0.1% 用于 $POI 回购销毁）",
        "提现手续费：根据网络 Gas 费浮动，最低 5 USDC",
        "所有销毁记录可在链上公开查询验证",
        "每季度发布销毁报告，透明披露销毁数量",
      ],
      process: "收取费用 → 定期回购 → 智能合约销毁 → 公开记录",
    },
    {
      icon: Globe,
      title: "地域限制",
      description: "服务可用地区和限制说明",
      details: [
        "目前不向以下地区提供服务：美国、中国大陆、朝鲜、伊朗",
        "部分功能受当地法律法规限制（如法币出入金）",
        "用户需确认所在地区法律允许使用加密货币服务",
        "我们保留根据合规要求随时调整服务地区的权利",
      ],
      process: "IP 检测 → 地区验证 → 功能限制 → 持续监控",
    },
  ];

  const riskWarnings = [
    "加密货币投资具有高风险，可能导致全部本金损失",
    "代币价格波动剧烈，请勿投资超过您承受能力的资金",
    "智能合约存在潜在技术风险，虽已审计但不能保证绝对安全",
    "平台不提供投资建议，所有投资决策由用户自行承担",
    "请妥善保管钱包私钥，私钥丢失将导致资产永久损失",
    "警惕钓鱼网站和诈骗，ACEE 官方不会主动索要私钥或密码",
  ];

  const regulatoryCompliance = [
    {
      region: "欧盟",
      status: "准备中",
      standard: "MiCA（加密资产市场监管法规）",
      description: "我们正在准备符合欧盟 MiCA 框架的合规要求",
    },
    {
      region: "新加坡",
      status: "已申请",
      standard: "MAS DPT 牌照",
      description: "已向新加坡金融管理局（MAS）提交数字支付代币服务牌照申请",
    },
    {
      region: "香港",
      status: "计划中",
      standard: "SFC 虚拟资产服务提供者牌照",
      description: "计划申请香港证监会（SFC）VASP 牌照",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header lang={lang} />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-slate-300">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-semibold">合规与安全</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            合规信息披露
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            ACEE 平台严格遵守监管要求。请查看我们的 KYC/AML 指南、费用销毁规则和地域限制政策。
            所有提现和退出操作都需符合相关合规流程。
          </p>
        </div>
      </section>

      {/* Compliance Items */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {complianceItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="p-8 bg-slate-800/50 border-slate-700"
              >
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-slate-300" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-white mb-2">
                        {item.title}
                      </h2>
                      <p className="text-slate-400">{item.description}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="pl-[72px] space-y-4">
                    <ul className="space-y-3">
                      {item.details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300 leading-relaxed">
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Process */}
                    <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-700">
                      <div className="text-sm font-semibold text-slate-300 mb-2">
                        流程概览
                      </div>
                      <div className="text-sm text-slate-400 font-mono">
                        {item.process}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Risk Warnings */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-8 bg-amber-900/20 border-amber-700/50">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-700/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <h2 className="text-2xl font-semibold text-white">
                风险提示
              </h2>
            </div>

            <div className="pl-16 space-y-3">
              {riskWarnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">⚠</span>
                  <p className="text-slate-300 leading-relaxed">{warning}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* Regulatory Compliance */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            监管合规进展
          </h2>
          <p className="text-slate-400">
            我们致力于在主要司法管辖区获得合法合规运营许可
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {regulatoryCompliance.map((item) => (
            <Card
              key={item.region}
              className="p-6 bg-slate-800/50 border-slate-700"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    {item.region}
                  </h3>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      item.status === "已申请"
                        ? "bg-blue-900/50 text-blue-300"
                        : item.status === "准备中"
                        ? "bg-amber-900/50 text-amber-300"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">监管标准</div>
                  <div className="text-slate-300 font-semibold">
                    {item.standard}
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-slate-800/30 border-slate-700 text-center">
          <div className="space-y-6 max-w-2xl mx-auto">
            <Users className="w-12 h-12 text-slate-400 mx-auto" />
            <h2 className="text-3xl font-bold text-white">
              合规相关问题？
            </h2>
            <p className="text-lg text-slate-400">
              如有合规、安全或监管相关问题，请联系我们的合规团队
            </p>
            <div className="space-y-2">
              <p className="text-slate-300">
                合规邮箱：<span className="text-white font-semibold">compliance@acee.ventures</span>
              </p>
              <p className="text-sm text-slate-500">
                我们将在 48 小时内回复您的问询
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Legal Links */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
          <a href="#" className="hover:text-white transition-colors">
            服务条款
          </a>
          <span>|</span>
          <a href="#" className="hover:text-white transition-colors">
            隐私政策
          </a>
          <span>|</span>
          <a href="#" className="hover:text-white transition-colors">
            反洗钱政策
          </a>
          <span>|</span>
          <a href="#" className="hover:text-white transition-colors">
            Cookie 政策
          </a>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  );
}
