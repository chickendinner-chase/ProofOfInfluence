import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/routes";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Trophy,
  Loader2,
} from "lucide-react";

interface TaskProgress {
  taskId: string;
  completed: boolean;
  completedAt?: string;
  claimed: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  actionLink?: string;
  actionText?: string;
}

interface UserRewardsSummary {
  totalEarned: number;
  totalPotential: number;
  tasksCompleted: number;
  totalTasks: number;
}

const DEFAULT_TASKS: Task[] = [
  {
    id: "register_verify_email",
    title: "注册并验证邮箱",
    description: "创建账户并验证您的邮箱地址",
    reward: 10,
  },
  {
    id: "complete_profile",
    title: "完善个人资料",
    description: "设置用户名、头像和个人简介",
    reward: 5,
    actionLink: "/app",
    actionText: "完善资料",
  },
  {
    id: "connect_wallet",
    title: "连接钱包",
    description: "连接您的 Web3 钱包地址",
    reward: 10,
    actionLink: "/app",
    actionText: "连接钱包",
  },
  {
    id: "first_trade",
    title: "首次交易",
    description: "在市场上完成第一笔 POI 代币交易",
    reward: 20,
    actionLink: ROUTES.APP_TRADE,
    actionText: "开始交易",
  },
  {
    id: "join_community",
    title: "加入社区",
    description: "加入我们的 Discord 或 Telegram 社区",
    reward: 5,
    actionLink: "/tge#community",
    actionText: "加入社区",
  },
];

export default function TaskCenterWidget() {
  // Fetch user task progress
  const { data: userProgress, isLoading: progressLoading } = useQuery<TaskProgress[]>({
    queryKey: ["/api/early-bird/user/progress"],
    staleTime: 1000 * 30, // 30 seconds
  });

  // Fetch user rewards summary
  const { data: rewardsSummary, isLoading: rewardsLoading } = useQuery<UserRewardsSummary>({
    queryKey: ["/api/early-bird/user/rewards"],
    staleTime: 1000 * 30,
  });

  const isTaskCompleted = (taskId: string): boolean => {
    if (!userProgress) return false;
    const progress = userProgress.find(p => p.taskId === taskId);
    return progress?.completed || false;
  };

  const completionPercentage = rewardsSummary
    ? Math.round((rewardsSummary.tasksCompleted / rewardsSummary.totalTasks) * 100)
    : 0;

  if (progressLoading || rewardsLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border-blue-200 dark:border-slate-700">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                任务中心
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              完成任务，赚取 POI 代币奖励
            </p>
          </div>
          <Link href="/early-bird">
            <Button variant="outline" size="sm">
              查看全部
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Progress Overview */}
        {rewardsSummary && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">
                完成进度: {rewardsSummary.tasksCompleted} / {rewardsSummary.totalTasks} 个任务
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {completionPercentage}%
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              已获得 <span className="font-bold text-green-600 dark:text-green-400">{rewardsSummary.totalEarned} POI</span>
              {" / "}
              最多可获得 <span className="font-bold">{rewardsSummary.totalPotential} POI</span>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-3">
          {DEFAULT_TASKS.slice(0, 3).map((task) => {
            const completed = isTaskCompleted(task.id);
            return (
              <div
                key={task.id}
                className={`p-4 rounded-lg border transition-all ${
                  completed
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                      <Badge
                        variant={completed ? "default" : "outline"}
                        className={
                          completed
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700"
                            : "text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                        }
                      >
                        +{task.reward} POI
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {task.description}
                    </p>
                    {!completed && task.actionLink && (
                      <Link href={task.actionLink}>
                        <Button size="sm" variant="ghost" className="h-auto p-0 text-blue-600 dark:text-blue-400">
                          {task.actionText || "开始"}
                          <ArrowRight className="ml-1 w-3 h-3" />
                        </Button>
                      </Link>
                    )}
                    {completed && (
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        ✓ 已完成
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        {DEFAULT_TASKS.length > 3 && (
          <div className="text-center pt-2">
            <Link href="/early-bird">
              <Button variant="ghost" className="text-blue-600 dark:text-blue-400">
                查看所有 {DEFAULT_TASKS.length} 个任务
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}

