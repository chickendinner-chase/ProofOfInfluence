import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Rocket,
  Clock,
  Gift,
  Users,
  Trophy,
  Mail,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";

// TGE Config Interface
interface TGEConfig {
  launchDate: string;
  chain: string;
  dex: string;
  initialPrice: string;
}

// Fallback config
const DEFAULT_TGE_CONFIG: TGEConfig = {
  launchDate: "2025-12-31T00:00:00Z",
  chain: "Base",
  dex: "Uniswap V2",
  initialPrice: "TBD",
};

// Social Links
const SOCIAL_LINKS = {
  discord: "https://discord.gg/proofofinfluence",
  telegram: "https://t.me/proofofinfluence",
  twitter: "https://twitter.com/proofofinfluence",
};

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function TGE() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  // Fetch TGE Config from backend
  const { data: tgeConfig } = useQuery<TGEConfig>({
    queryKey: ["/api/tge/config"],
    queryFn: async () => {
      const response = await fetch("/api/tge/config");
      if (!response.ok) throw new Error("Failed to fetch TGE config");
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const config = tgeConfig || DEFAULT_TGE_CONFIG;
  const launchDate = new Date(config.launchDate);

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (emailAddress: string) => {
      const response = await fetch("/api/tge/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailAddress, source: "tge_page" }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to subscribe");
      }
      return response.json();
    },
    onSuccess: () => {
      setIsSubscribed(true);
      toast({
        title: "订阅成功！",
        description: "我们将在 TGE 启动时通知您。",
      });
      setEmail("");
    },
    onError: (error: Error) => {
      toast({
        title: "订阅失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      });
    },
  });

  // Countdown Timer Logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = launchDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "无效的邮箱地址",
        description: "请输入有效的邮箱地址",
        variant: "destructive",
      });
      return;
    }

    subscribeMutation.mutate(email);
  };

  const participationSteps = [
    {
      number: 1,
      title: "注册账户",
      description: "创建您的 ProofOfInfluence 账户并完成基础任务",
      icon: CheckCircle2,
    },
    {
      number: 2,
      title: "赚取早鸟奖励",
      description: "完成任务获得空投资格，或参与推荐计划",
      icon: Gift,
    },
    {
      number: 3,
      title: "参与 TGE",
      description: "在启动当天交易 $POI 代币",
      icon: Rocket,
    },
  ];

  const campaignCards = [
    {
      title: "早鸟空投",
      description: "完成简单任务，赚取免费 POI 代币奖励",
      icon: Gift,
      link: "/early-bird",
      color: "from-blue-900/50 to-blue-800/30 border-blue-700/50",
    },
    {
      title: "推荐奖励",
      description: "邀请好友注册，您和好友都能获得 POI 奖励",
      icon: Users,
      link: "/referral",
      color: "from-purple-900/50 to-purple-800/30 border-purple-700/50",
    },
    {
      title: "空投领取",
      description: "检查您的空投资格并领取您的 POI 代币",
      icon: Trophy,
      link: "/airdrop",
      color: "from-green-900/50 to-green-800/30 border-green-700/50",
    },
  ];

  const faqs = [
    {
      question: "什么是 TGE（Token Generation Event）？",
      answer: "TGE 是代币生成事件，标志着 $POI 代币正式发行并开始在去中心化交易所上市交易。这是项目从开发阶段进入公开市场的重要里程碑。",
    },
    {
      question: "如何参与 TGE？",
      answer: "首先注册账户，然后参与早鸟计划赚取代币。在 TGE 当天，您可以在指定的 DEX（如 Uniswap）上交易 $POI 代币。确保您已经设置好钱包并准备好交易资金。",
    },
    {
      question: "早鸟奖励何时可以领取？",
      answer: "早鸟任务奖励将在您完成任务后记录，实际代币将在 TGE 之后分发到您的钱包。部分奖励可能有锁定期或线性释放机制。",
    },
    {
      question: "$POI 代币的初始价格是多少？",
      answer: "初始价格将在 TGE 前公布。价格将由市场供需决定，初始流动性池的设置将确保公平的价格发现机制。",
    },
    {
      question: "有哪些风险需要注意？",
      answer: "加密货币投资存在风险，代币价格可能大幅波动。请只投资您能承受损失的金额。此外，请警惕诈骗网站和虚假空投，只信任官方渠道。",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header lang="zh" />

      {/* Hero Section with Countdown */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8">
          {/* Main Title */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-semibold">
              <Rocket className="w-4 h-4" />
              <span>TGE 即将启动</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-white">
              $POI Token Launch
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
              ProofOfInfluence 代币生成事件
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Clock className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">距离 TGE 启动还有</h2>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "天", value: timeLeft.days },
                  { label: "小时", value: timeLeft.hours },
                  { label: "分钟", value: timeLeft.minutes },
                  { label: "秒", value: timeLeft.seconds },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-slate-700/50 rounded-lg p-4 mb-2">
                      <span className="text-4xl md:text-5xl font-bold text-blue-400">
                        {String(item.value).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="text-sm text-slate-400">{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* TGE Details */}
          <div className="max-w-2xl mx-auto space-y-4 text-slate-300">
            <p className="text-lg">
              <strong className="text-white">启动日期：</strong> {launchDate.toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
              })}
            </p>
            <p className="text-lg">
              <strong className="text-white">区块链：</strong> {config.chain}
            </p>
            <p className="text-lg">
              <strong className="text-white">交易所：</strong> {config.dex}
            </p>
            <p className="text-lg">
              <strong className="text-white">初始价格：</strong> {config.initialPrice}
            </p>
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 text-xl py-7"
              >
                <CheckCircle2 className="mr-2 h-6 w-6" />
                立即注册
              </Button>
            </Link>
            <Link href="/early-bird">
              <Button
                size="lg"
                variant="outline"
                className="border-blue-500 text-blue-400 hover:bg-blue-500/10 px-10 text-xl py-7"
              >
                <Gift className="mr-2 h-6 w-6" />
                加入早鸟计划
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How to Participate */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">如何参与</h2>
          <p className="text-xl text-slate-400">
            三个简单步骤，开始您的 ProofOfInfluence 之旅
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {participationSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className="p-8 bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-4xl font-bold text-blue-400">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Campaign Cards */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">参与活动</h2>
          <p className="text-xl text-slate-400">
            选择您感兴趣的活动，立即开始赚取 POI 代币
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {campaignCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Link key={index} href={card.link}>
                <Card
                  className={`p-8 bg-gradient-to-br ${card.color} hover:scale-105 transition-all duration-300 cursor-pointer h-full`}
                >
                  <div className="space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {card.title}
                      </h3>
                      <p className="text-slate-300 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-blue-400 pt-4">
                      了解更多 <ExternalLink className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Email Subscription & Community */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="p-12 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Email Subscription */}
            <div className="text-center space-y-4">
              <Mail className="w-12 h-12 text-blue-400 mx-auto" />
              <h2 className="text-3xl font-bold text-white">
                订阅 TGE 更新
              </h2>
              <p className="text-lg text-slate-400">
                第一时间获取 TGE 启动通知和最新消息
              </p>
            </div>

            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="flex gap-4 max-w-xl mx-auto">
                <Input
                  type="email"
                  placeholder="输入您的邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                >
                  订阅
                </Button>
              </form>
            ) : (
              <Alert className="bg-green-500/10 border-green-500/20 max-w-xl mx-auto">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-400">
                  感谢订阅！我们会在 TGE 启动时通知您。
                </AlertDescription>
              </Alert>
            )}

            {/* Social Links */}
            <div className="text-center space-y-4 pt-8">
              <h3 className="text-xl font-bold text-white">加入我们的社区</h3>
              <div className="flex justify-center gap-4">
                <a
                  href={SOCIAL_LINKS.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Discord
                </a>
                <a
                  href={SOCIAL_LINKS.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Telegram
                </a>
                <a
                  href={SOCIAL_LINKS.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Twitter
                </a>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* FAQ & Security Warning */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        {/* Security Warning */}
        <Alert className="mb-12 bg-red-900/20 border-red-500/50">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <AlertDescription className="text-red-200">
            <strong className="font-bold">安全警告：</strong> 请警惕诈骗！
            我们永远不会要求您的私钥或助记词。只信任官方网站和社交媒体渠道。
            <br />
            <strong className="mt-2 block">官方网站：</strong> proof.in
            <br />
            <strong>官方社交媒体：</strong> 请通过上方链接访问
          </AlertDescription>
        </Alert>

        {/* FAQ */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">常见问题</h2>
            <p className="text-xl text-slate-400">
              关于 TGE 和参与活动的常见问题解答
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-slate-800/50 border-slate-700 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left text-white hover:text-blue-400">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer lang="zh" />
    </div>
  );
}

