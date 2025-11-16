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
            ACEE – About Us（对外安全版）
          </h1>
          <p className={cn(
            'text-lg opacity-80',
            theme === 'cyberpunk' ? 'text-slate-300' : 'text-slate-600'
          )}>
            构建下一代价值基础设施
          </p>
        </div>
      </Section>

      {/* 我们是谁 */}
      <Section title="我们是谁">
        <ThemedCard className="p-6 space-y-3 max-w-4xl mx-auto">
          <p className="text-sm opacity-90">
            Acee 是一家位于美国的技术与合规公司，专注于为新一代数字经济提供<strong>价值基础设施</strong>。
          </p>
          <p className="text-sm opacity-90">
            在今天的互联网中，影响力、内容、身份、AI 行为以及现实世界资产（RWA）被分散在不同平台和系统之中，难以统一记录和协同使用。
          </p>
          <p className="text-sm opacity-90">
            我们的目标，是为这些新型价值要素，建立一套<strong>标准化、可验证、可协作</strong>的技术底层。
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
            <h3 className="font-bold mb-2">2. ProjectEX – 资产与行为的网络化平台</h3>
            <ul className="text-sm opacity-90 list-disc pl-5 space-y-1">
              <li>将多种资产（如 RWA、IP、品牌权益、创作者影响力等）统一数字化；</li>
              <li>为这些资产提供交易、流动性与金融工具（如兑换、质押、抵押等）；</li>
              <li>通过任务、邀请、空投、徽章等机制，连接用户行为与价值分配；</li>
              <li>在链上建立身份与基础声望体系，为长期关系提供记录。</li>
            </ul>
            <p className="text-sm opacity-80 mt-2">
              我们的目标，是让<strong>更多真实的价值</strong>能在开放网络中被记录和使用。
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
            在价值网络中，激励与协调机制至关重要。Acee 正在设计统一的激励与治理机制（包括 POI 在内），用于连接：平台使用、不同项目的价值分配、长期参与者的权益与治理权。
          </p>
          <p className="text-sm opacity-90">
            相关细节会以<strong>单独文档（如 Token 与技术白皮书）</strong>的形式向社区与合作伙伴公开，About 页面不做具体参数和规则描述。
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
              <li>Acee 希望为这一层，提供最早的一块底座。</li>
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
