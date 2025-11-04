import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Users,
  Building2,
  Briefcase,
  Award,
  Linkedin,
  Mail,
  Globe,
} from "lucide-react";

export default function Profile() {
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
            <Users className="w-10 h-10 text-slate-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            团队与顾问
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            由资深行业专家组成的核心团队，致力于推动非金融资产通证化
          </p>
        </div>

        {/* Core Team Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-white flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            核心团队
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Chase Shi */}
            <Card className="p-8 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  CS
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Chase Shi
                  </h3>
                  <p className="text-slate-400 text-sm">
                    CEO · 产品 / 代币经济学 / 战略
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">职责</h4>
                    <p className="text-sm text-slate-400">
                      负责产品战略规划、代币经济模型设计、商业发展与合作伙伴关系管理
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">背景</h4>
                    <p className="text-sm text-slate-400">
                      拥有10+年Web3行业经验，曾参与多个DeFi和RWA项目的孵化与投资。深度理解代币经济学设计与区块链治理机制。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">专长</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>• 代币经济学模型设计与优化</li>
                      <li>• Web3产品战略与市场拓展</li>
                      <li>• RWA资产通证化方案设计</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 hover:bg-slate-800"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 hover:bg-slate-800"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  联系
                </Button>
              </div>
            </Card>

            {/* Annie An */}
            <Card className="p-8 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-2xl font-bold">
                  AA
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    Annie An
                  </h3>
                  <p className="text-slate-400 text-sm">
                    CMO / 股东 / Voting Trust Holder
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">职责</h4>
                    <p className="text-sm text-slate-400">
                      负责品牌营销、市场推广、社区运营与公关传播，同时作为核心股东参与公司战略决策
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">背景</h4>
                    <p className="text-sm text-slate-400">
                      拥有8+年市场营销与品牌管理经验，曾服务于多家知名Web3项目。擅长社区建设与全球市场拓展。
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">专长</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>• Web3品牌营销与市场推广</li>
                      <li>• 社区运营与用户增长策略</li>
                      <li>• 全球市场拓展与合作伙伴关系</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 hover:bg-slate-800"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 hover:bg-slate-800"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  联系
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Advisors Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-white flex items-center gap-2">
            <Award className="w-6 h-6" />
            技术顾问
          </h2>

          <div className="grid md:grid-cols-1 gap-6">
            {/* Simon Zheng */}
            <Card className="p-8 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  SZ
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Simon Zheng
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Coinbase 工程师 / 技术顾问
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Briefcase className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white mb-1">
                            职责
                          </h4>
                          <p className="text-sm text-slate-400">
                            为项目提供技术架构咨询、智能合约审核、安全性评估等技术指导
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white mb-1">
                            背景
                          </h4>
                          <p className="text-sm text-slate-400">
                            Coinbase现任软件工程师，专注于区块链底层技术与智能合约开发。拥有5+年Web3技术研发经验。
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white mb-1">
                            专长
                          </h4>
                          <ul className="text-sm text-slate-400 space-y-1">
                            <li>• 智能合约开发与审计</li>
                            <li>• 区块链架构设计</li>
                            <li>• DeFi协议与安全性</li>
                            <li>• 跨链技术与互操作性</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-slate-700 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-700 hover:bg-slate-800"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-700 hover:bg-slate-800"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      联系
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Why This Team */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-white">为什么选择我们</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-900/30 border border-blue-800/30 flex items-center justify-center">
                <Award className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                行业经验丰富
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                团队核心成员拥有10+年Web3行业经验，深度理解DeFi、RWA与代币经济学
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-green-900/30 border border-green-800/30 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">技术实力强</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Coinbase工程师提供技术支持，确保智能合约安全性与系统稳定性
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-900/30 border border-purple-800/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">全球化视野</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                团队具备国际化背景与全球市场拓展能力，致力于打造世界级产品
              </p>
            </div>
          </div>
        </Card>

        {/* Join Us */}
        <Card className="p-8 bg-slate-800/50 border-slate-700 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-white">加入我们</h2>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            我们正在寻找对Web3充满热情的优秀人才，包括区块链工程师、产品经理、市场专家等。如果你想参与构建下一代资产通证化平台，欢迎联系我们。
          </p>
          <div className="flex justify-center gap-4">
            <Button className="bg-white text-slate-900 hover:bg-slate-100">
              <Mail className="w-4 h-4 mr-2" />
              发送简历
            </Button>
            <Button
              variant="outline"
              className="border-slate-700 hover:bg-slate-800"
            >
              了解更多职位
            </Button>
          </div>
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

