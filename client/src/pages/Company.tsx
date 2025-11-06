import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Users,
  Target,
  Award,
  Briefcase,
  Mail,
  Linkedin,
  Twitter,
  Github,
  MapPin,
} from "lucide-react";

export default function Company() {
  const lang = "zh";

  const mission = {
    title: "使命与愿景",
    mission:
      "让 Web3 技术触手可及，帮助每个人和组织轻松进入加密世界，实现数字资产的自由创建、管理和流通。",
    vision:
      "成为全球领先的 Web3 产品发行平台，连接传统世界与去中心化未来，构建一个更加开放、透明和包容的数字经济生态。",
    values: [
      {
        title: "用户至上",
        description: "始终将用户体验放在首位，提供简单易用的产品",
      },
      {
        title: "安全合规",
        description: "严格遵守监管要求，保护用户资产安全",
      },
      {
        title: "开放透明",
        description: "拥抱开源文化，所有核心代码和数据公开透明",
      },
      {
        title: "持续创新",
        description: "不断探索 Web3 前沿技术，推动行业发展",
      },
    ],
  };

  const team = [
    {
      name: "张伟",
      role: "创始人 & CEO",
      bio: "前阿里巴巴区块链技术负责人，10 年 Web3 行业经验",
      avatar: "/avatars/team-1.jpg",
    },
    {
      name: "李明",
      role: "CTO",
      bio: "前以太坊核心开发者，智能合约安全专家",
      avatar: "/avatars/team-2.jpg",
    },
    {
      name: "王芳",
      role: "CPO",
      bio: "前腾讯产品总监，擅长 Web3 产品设计和用户增长",
      avatar: "/avatars/team-3.jpg",
    },
    {
      name: "陈杰",
      role: "合规官",
      bio: "前新加坡金融管理局合规顾问，加密货币监管专家",
      avatar: "/avatars/team-4.jpg",
    },
  ];

  const advisors = [
    {
      name: "Dr. Sarah Chen",
      title: "技术顾问",
      bio: "斯坦福大学计算机系教授，区块链技术研究专家",
    },
    {
      name: "Michael Zhang",
      title: "战略顾问",
      bio: "某知名 Web3 基金合伙人，成功投资 50+ 区块链项目",
    },
  ];

  const openPositions = [
    {
      title: "高级智能合约工程师",
      department: "技术",
      location: "远程 / 新加坡",
      type: "全职",
    },
    {
      title: "前端工程师（React/Web3）",
      department: "技术",
      location: "远程 / 深圳",
      type: "全职",
    },
    {
      title: "产品经理（Web3）",
      department: "产品",
      location: "远程 / 上海",
      type: "全职",
    },
    {
      title: "社区运营经理",
      department: "市场",
      location: "远程",
      type: "全职",
    },
  ];

  const pressReleases = [
    {
      date: "2025-10-15",
      title: "ACEE Ventures 完成 500 万美元 A 轮融资",
      source: "TechCrunch",
      link: "#",
    },
    {
      date: "2025-09-20",
      title: "ACEE 平台正式上线，首月用户突破 10 万",
      source: "CoinDesk",
      link: "#",
    },
    {
      date: "2025-08-10",
      title: "ACEE 获得新加坡 MAS DPT 牌照申请批准",
      source: "The Block",
      link: "#",
    },
  ];

  const stats = [
    { label: "团队成员", value: "50+" },
    { label: "服务用户", value: "100K+" },
    { label: "代币发行", value: "500+" },
    { label: "处理交易", value: "$50M+" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header lang={lang} />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            关于 ACEE Ventures
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            我们是一群对 Web3 充满热情的建设者，致力于构建安全可扩展的去中心化产品发行平台。
            通过技术创新和用户体验优化，让更多人享受 Web3 的力量。
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="p-6 bg-slate-800/50 border-slate-700 text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-slate-800/30 border-slate-700">
          <div className="space-y-12">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-slate-300 mb-6">
                <Target className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {mission.title}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">使命</h3>
                <p className="text-slate-400 leading-relaxed">
                  {mission.mission}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">愿景</h3>
                <p className="text-slate-400 leading-relaxed">
                  {mission.vision}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-6 text-center">
                核心价值观
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mission.values.map((value) => (
                  <div
                    key={value.title}
                    className="p-6 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {value.title}
                    </h4>
                    <p className="text-sm text-slate-400">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-slate-300 mb-4">
            <Users className="w-4 h-4" />
            <span className="text-sm font-semibold">核心团队</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            认识我们的团队
          </h2>
          <p className="text-slate-400">
            拥有丰富的区块链与金融背景，致力于构建安全可扩展的 Web3 平台
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {team.map((member) => (
            <Card
              key={member.name}
              className="p-6 bg-slate-800/50 border-slate-700 text-center"
            >
              <div className="space-y-4">
                <div className="w-24 h-24 rounded-full bg-slate-700 mx-auto flex items-center justify-center">
                  <Users className="w-12 h-12 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {member.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-2">{member.role}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Advisors */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            顾问团队
          </h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {advisors.map((advisor) => (
              <Card
                key={advisor.name}
                className="p-6 bg-slate-800/50 border-slate-700"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Award className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {advisor.name}
                    </h4>
                    <p className="text-sm text-slate-500 mb-2">
                      {advisor.title}
                    </p>
                    <p className="text-sm text-slate-400">{advisor.bio}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Careers */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 text-slate-300 mb-4">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm font-semibold">加入我们</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">招聘岗位</h2>
          <p className="text-slate-400">
            我们正在寻找优秀的人才加入 ACEE 团队
          </p>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {openPositions.map((position) => (
            <Card
              key={position.title}
              className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white group-hover:text-slate-100">
                    {position.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                    <span>{position.department}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {position.location}
                    </span>
                    <span>•</span>
                    <span>{position.type}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="text-slate-400 hover:text-white self-start md:self-center"
                >
                  申请职位 →
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-400 mb-4">
            没有找到合适的岗位？欢迎发送简历至
          </p>
          <a
            href="mailto:careers@acee.ventures"
            className="text-white font-semibold hover:text-slate-300 transition-colors"
          >
            careers@acee.ventures
          </a>
        </div>
      </section>

      {/* Press */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">媒体报道</h2>
          <p className="text-slate-400">最新新闻和媒体发布</p>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {pressReleases.map((press) => (
            <Card
              key={press.title}
              className="p-6 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-slate-500">{press.date}</div>
                  <h3 className="text-lg font-semibold text-white">
                    {press.title}
                  </h3>
                  <div className="text-sm text-slate-400">{press.source}</div>
                </div>
                <a
                  href={press.link}
                  className="text-slate-400 hover:text-white transition-colors self-start md:self-center"
                >
                  阅读更多 →
                </a>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-slate-800/30 border-slate-700">
          <div className="text-center space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                联系我们
              </h2>
              <p className="text-slate-400">
                有任何问题或合作需求？欢迎与我们取得联系
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="space-y-2">
                <Mail className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-sm text-slate-500">商务合作</div>
                <a
                  href="mailto:business@acee.ventures"
                  className="text-white hover:text-slate-300 transition-colors"
                >
                  business@acee.ventures
                </a>
              </div>
              <div className="space-y-2">
                <Mail className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-sm text-slate-500">技术支持</div>
                <a
                  href="mailto:support@acee.ventures"
                  className="text-white hover:text-slate-300 transition-colors"
                >
                  support@acee.ventures
                </a>
              </div>
              <div className="space-y-2">
                <Mail className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-sm text-slate-500">媒体咨询</div>
                <a
                  href="mailto:press@acee.ventures"
                  className="text-white hover:text-slate-300 transition-colors"
                >
                  press@acee.ventures
                </a>
              </div>
            </div>

            <div className="flex justify-center gap-6 pt-8">
              {[
                { icon: Twitter, link: "#" },
                { icon: Linkedin, link: "#" },
                { icon: Github, link: "#" },
              ].map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.link}
                    className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="w-5 h-5 text-slate-400" />
                  </a>
                );
              })}
            </div>
          </div>
        </Card>
      </section>

      <Footer lang={lang} />
    </div>
  );
}
