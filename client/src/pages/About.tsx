import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Globe, Mail, Twitter, MessageCircle } from "lucide-react";

export default function About() {
  const { theme } = useTheme();

  return (
    <PageLayout>
      <Section>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className={cn(
            'text-3xl md:text-5xl font-extrabold mb-4',
            theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
          )}>
            About Acee
          </h1>
          <p className={cn(
            'text-lg opacity-80',
            theme === 'cyberpunk' ? 'text-slate-300' : 'text-slate-600'
          )}>
            构建价值互联网
          </p>
        </div>
      </Section>

      {/* 我们是谁 */}
      <Section title="我们是谁">
        <ThemedCard className="p-6 space-y-3 max-w-4xl mx-auto">
          <p className="text-sm opacity-90">
            Acee 是一家位于美国的技术与合规公司，专注于为新一代数字经济提供<strong>价值基础设施</strong>。我们正在构建<strong>价值互联网</strong>——一个统一的基础设施，将影响力、身份、AI 行为和现实世界资产（RWA）标准化为可验证、可组合和可激励的价值单元。
          </p>
          <p className="text-sm opacity-90">
            在今天的互联网中，这些价值要素分散在不同的平台和系统中，难以统一记录和协同使用。我们的使命是为这些新型价值要素建立一套<strong>标准化、可验证、可协作</strong>的技术底层。
          </p>
          <p className="text-sm opacity-90">
            通过 ProjectEX 平台和 Cyber Immortality 旗舰项目，我们展示了如何将技术创新与人文关怀相结合，为人类和智能代理（AI/数字人格）构建统一的价值与记忆层。
          </p>
        </ThemedCard>
      </Section>

      {/* 我们在做什么 */}
      <Section title="我们在做什么">
        <div className="grid gap-6 md:grid-cols-3">
          <ThemedCard className="p-6">
            <h3 className="font-bold mb-2">1. 底层基础与合规能力</h3>
            <ul className="text-sm opacity-90 list-disc pl-5 space-y-1">
              <li>美国实体公司与合规框架（牌照、KYC/AML 等）；</li>
              <li>资产与数据的标准设计；</li>
              <li>面向企业与机构的技术与集成服务。</li>
            </ul>
          </ThemedCard>

          <ThemedCard className="p-6">
            <h3 className="font-bold mb-2">2. ProjectEX – 价值互联网的社交金融枢纽</h3>
            <ul className="text-sm opacity-90 list-disc pl-5 space-y-1">
              <li><strong>代币化</strong>：将 RWA、IP、品牌权益、创作者影响力和 AI 资产转换为链上代币；</li>
              <li><strong>链上协调</strong>：提供去中心化交易、流动性池、质押和抵押等金融工具；</li>
              <li><strong>激励机制</strong>：通过任务系统、推荐计划、空投和徽章连接用户行为与价值分配；</li>
              <li><strong>身份与声誉</strong>：在链上建立身份和声誉体系，支持跨平台价值转移。</li>
            </ul>
            <p className="text-sm opacity-80 mt-2">
              ProjectEX 作为价值互联网的应用层，让<strong>更多真实的价值</strong>能在开放网络中被记录、交易和协调。
            </p>
          </ThemedCard>

          <ThemedCard className="p-6">
            <h3 className="font-bold mb-2">3. Cyber Immortality – 赛博永生计划（旗舰项目）</h3>
            <ul className="text-sm opacity-90 list-disc pl-5 space-y-1">
              <li>探索 AI、身份与长期价值记录 的结合；</li>
              <li>将用户的部分行为和贡献，与 AI 数字画像相结合；</li>
              <li>在链上形成可持续更新的“数字档案”；</li>
              <li>通过任务与激励机制，让「影响力」与实际可用的权益挂钩。</li>
            </ul>
            <p className="text-sm opacity-80 mt-2">未来，我们期望这套机制成为更多品牌和资产项目的参考模板。</p>
          </ThemedCard>
        </div>
      </Section>

      {/* 关于激励与代币 */}
      <Section title="关于激励与代币">
        <ThemedCard className="p-6 space-y-2 max-w-4xl mx-auto">
          <p className="text-sm opacity-90">
            在价值互联网中，激励与协调机制至关重要。POI（Proof of Influence）代币作为<strong>统一价值层</strong>，连接平台使用、不同项目的价值分配、长期参与者的权益与治理权。
          </p>
          <p className="text-sm opacity-90">
            POI 不仅仅是代币，更是一种协调机制，它协调不同利益相关者（用户、创作者、品牌、开发者）的激励，支持长期价值捕获和可持续增长。相关细节会以<strong>单独文档（如 Token 与技术白皮书）</strong>的形式向社区与合作伙伴公开。
          </p>
          <p className="text-sm opacity-90">
            详细的白皮书文档请参阅：<strong>docs/whitepaper/</strong> 目录，包含 Value Internet 愿景、ProjectEX 平台、Cyber Immortality 项目等完整说明。
          </p>
        </ThemedCard>
      </Section>

      {/* 长期方向 */}
      <Section title="我们的长期方向">
        <div className="grid gap-6 md:grid-cols-2">
          <ThemedCard className="p-6">
            <h3 className="font-bold mb-2">短期：聚焦落地</h3>
            <ul className="text-sm opacity-90 list-disc pl-5 space-y-1">
              <li>落地可用的产品与平台；</li>
              <li>帮助真实资产与品牌进入新一代价值网络；</li>
              <li>在合规框架下，为用户与合作方提供稳定可靠的基础设施。</li>
            </ul>
          </ThemedCard>
          <ThemedCard className="p-6">
            <h3 className="font-bold mb-2">长期：统一的价值与记忆层</h3>
            <ul className="text-sm opacity-90 list-disc pl-5 space-y-1">
              <li>面向人类与智能体（AI/数字人格）的统一价值与记忆层；</li>
              <li>支持跨代价值转移、遗产保存和长期数字身份；</li>
              <li>Acee 希望为这一层，提供最早的一块底座，成为价值互联网的基础设施。</li>
            </ul>
          </ThemedCard>
        </div>
      </Section>

      {/* Contact */}
      <Section title="联系我们">
        <ThemedCard className="p-8 max-w-2xl mx-auto">
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <a
              href="mailto:contact@proofofinfluence.com"
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg transition-colors',
                theme === 'cyberpunk'
                  ? 'hover:bg-cyan-400/10'
                  : 'hover:bg-blue-50'
              )}
            >
              <Mail className="w-5 h-5" />
              <span className="text-sm">Business & Partnerships</span>
            </a>

            <a
              href="mailto:rwa@proofofinfluence.com"
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg transition-colors',
                theme === 'cyberpunk'
                  ? 'hover:bg-cyan-400/10'
                  : 'hover:bg-blue-50'
              )}
            >
              <Mail className="w-5 h-5" />
              <span className="text-sm">RWA & Brands</span>
            </a>

            <a
              href="mailto:invest@proofofinfluence.com"
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg transition-colors',
                theme === 'cyberpunk'
                  ? 'hover:bg-cyan-400/10'
                  : 'hover:bg-blue-50'
              )}
            >
              <Mail className="w-5 h-5" />
              <span className="text-sm">Investors</span>
            </a>

            <a
              href="https://discord.gg/proofofinfluence"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg transition-colors',
                theme === 'cyberpunk'
                  ? 'hover:bg-cyan-400/10'
                  : 'hover:bg-blue-50'
              )}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">Developers</span>
            </a>
          </div>

          <div className="text-center">
            <Globe className={cn(
              'w-8 h-8 mx-auto mb-2 opacity-50',
              theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
            )} />
            <p className="text-sm opacity-70">
              Based in Los Angeles | Serving the World
            </p>
          </div>
        </ThemedCard>
      </Section>
    </PageLayout>
  );
}
