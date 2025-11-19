import React, { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, CheckCircle2, XCircle, Code } from "lucide-react";
import { isDevEnvironment } from "@/lib/env";

type ScenarioName = "immortality-playable-agent" | "immortality-demo-seed";

interface ScenarioOption {
  value: ScenarioName;
  label: string;
  description: string;
}

const SCENARIOS: ScenarioOption[] = [
  {
    value: "immortality-playable-agent",
    label: "Immortality Playable Agent",
    description: "Full E2E test: Create user, initialize memories, test AI chat, mint badge",
  },
  {
    value: "immortality-demo-seed",
    label: "Immortality Demo Seed",
    description: "Batch generate demo users with test wallets",
  },
];

interface RunScenarioResponse {
  success: boolean;
  result?: any;
  txHashes?: string[];
  errors?: string[];
  steps?: Array<{ step: string; status: "success" | "error"; message?: string }>;
}

export default function TestScenariosPage() {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedScenario, setSelectedScenario] = useState<ScenarioName | "">("");
  const [wallets, setWallets] = useState<string>("1");
  const [customParams, setCustomParams] = useState<string>("{}");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<RunScenarioResponse | null>(null);

  // 仅在 dev/staging 环境显示
  if (!isDevEnvironment()) {
    return (
      <PageLayout>
        <Section>
          <ThemedCard className="p-6">
            <p className="text-sm opacity-70">此页面仅在开发/测试环境可用。</p>
          </ThemedCard>
        </Section>
      </PageLayout>
    );
  }

  // 需要登录
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <Section>
          <ThemedCard className="p-6">
            <p className="text-sm opacity-70">请先登录以访问此页面。</p>
          </ThemedCard>
        </Section>
      </PageLayout>
    );
  }

  const handleRunScenario = async () => {
    if (!selectedScenario) {
      toast({
        title: "请选择场景",
        description: "请先选择一个测试场景",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setResult(null);

    try {
      let params: Record<string, any> = {};
      try {
        params = JSON.parse(customParams || "{}");
      } catch (e) {
        toast({
          title: "参数格式错误",
          description: "自定义参数必须是有效的 JSON 格式",
          variant: "destructive",
        });
        setIsRunning(false);
        return;
      }

      // For immortality-demo-seed, add wallets param
      if (selectedScenario === "immortality-demo-seed") {
        const walletsNum = parseInt(wallets, 10);
        if (isNaN(walletsNum) || walletsNum < 1) {
          toast({
            title: "钱包数量无效",
            description: "钱包数量必须是大于 0 的数字",
            variant: "destructive",
          });
          setIsRunning(false);
          return;
        }
        params.wallets = walletsNum;
      }

      const response = await fetch("/api/test/run-scenario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          scenario: selectedScenario,
          params,
        }),
      });

      const data: RunScenarioResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.errors?.join(", ") || "运行场景失败");
      }

      setResult(data);
      toast({
        title: "场景运行成功",
        description: data.steps ? `完成 ${data.steps.length} 个步骤` : "场景执行完成",
      });
    } catch (error: any) {
      console.error("[TestScenarios] Run scenario failed", error);
      toast({
        title: "运行失败",
        description: error?.message || "未知错误",
        variant: "destructive",
      });
      setResult({
        success: false,
        errors: [error?.message || "未知错误"],
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <PageLayout>
      <Section className="pt-12">
        <div className="mb-6">
          <h1
            className={cn(
              "text-3xl font-bold mb-2",
              theme === "cyberpunk" ? "font-orbitron text-cyan-100" : "font-fredoka text-slate-900",
            )}
          >
            Test Scenarios 控制台
          </h1>
          <p className="text-sm opacity-70">
            内部工具：用于触发自动化测试场景，生成 demo 用户，以及回归测试
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 左侧：配置面板 */}
          <ThemedCard className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">选择场景</label>
              <select
                className={cn(
                  "w-full rounded-xl border bg-transparent p-3 text-sm outline-none focus:ring-2",
                  theme === "cyberpunk"
                    ? "border-cyan-500/40 focus:ring-cyan-400/40"
                    : "border-slate-200 focus:ring-blue-200",
                )}
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value as ScenarioName)}
                disabled={isRunning}
              >
                <option value="">-- 选择场景 --</option>
                {SCENARIOS.map((scenario) => (
                  <option key={scenario.value} value={scenario.value}>
                    {scenario.label}
                  </option>
                ))}
              </select>
              {selectedScenario && (
                <p className="mt-2 text-xs opacity-60">
                  {SCENARIOS.find((s) => s.value === selectedScenario)?.description}
                </p>
              )}
            </div>

            {selectedScenario === "immortality-demo-seed" && (
              <div>
                <label className="block text-sm font-semibold mb-2">钱包数量</label>
                <input
                  type="number"
                  min="1"
                  className={cn(
                    "w-full rounded-xl border bg-transparent p-3 text-sm outline-none focus:ring-2",
                    theme === "cyberpunk"
                      ? "border-cyan-500/40 focus:ring-cyan-400/40"
                      : "border-slate-200 focus:ring-blue-200",
                  )}
                  value={wallets}
                  onChange={(e) => setWallets(e.target.value)}
                  placeholder="5"
                  disabled={isRunning}
                />
                <p className="mt-1 text-xs opacity-60">建议使用 5 个钱包</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">自定义参数（JSON）</label>
              <textarea
                className={cn(
                  "w-full rounded-xl border bg-transparent p-3 text-sm font-mono outline-none focus:ring-2",
                  theme === "cyberpunk"
                    ? "border-cyan-500/40 focus:ring-cyan-400/40"
                    : "border-slate-200 focus:ring-blue-200",
                )}
                rows={4}
                value={customParams}
                onChange={(e) => setCustomParams(e.target.value)}
                placeholder='{"usdcAmount": "1000000", "delayMs": 100}'
                disabled={isRunning}
              />
              <p className="mt-1 text-xs opacity-60">
                可选：场景特定的参数，例如 {"{"}"memories": [...], "chatMessages": [...]{"}"}
              </p>
            </div>

            <ThemedButton
              emphasis
              className="w-full"
              onClick={handleRunScenario}
              disabled={isRunning || !selectedScenario}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  运行中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  运行场景
                </>
              )}
            </ThemedButton>
          </ThemedCard>

          {/* 右侧：结果展示 */}
          <ThemedCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">运行结果</h2>
              {result && (
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={cn("text-sm", result.success ? "text-green-400" : "text-red-400")}>
                    {result.success ? "成功" : "失败"}
                  </span>
                </div>
              )}
            </div>

            {!result && !isRunning && (
              <p className="text-sm opacity-60">运行场景后，结果将显示在这里</p>
            )}

            {isRunning && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin opacity-60" />
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {result.steps && result.steps.length > 0 && (
                  <div>
                    <p className="text-xs opacity-60 mb-2">执行步骤</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {result.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "p-2 rounded-lg border text-sm flex items-center gap-2",
                            step.status === "success"
                              ? theme === "cyberpunk"
                                ? "border-green-500/20 bg-green-500/5"
                                : "border-green-200 bg-green-50"
                              : theme === "cyberpunk"
                              ? "border-red-500/20 bg-red-500/5"
                              : "border-red-200 bg-red-50",
                          )}
                        >
                          {step.status === "success" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs">{step.step}</p>
                            {step.message && (
                              <p className="text-xs opacity-60 mt-1">{step.message}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.txHashes && result.txHashes.length > 0 && (
                  <div>
                    <p className="text-xs opacity-60 mb-2">交易哈希</p>
                    <div className="space-y-1">
                      {result.txHashes.map((txHash, idx) => (
                        <a
                          key={idx}
                          href={`https://sepolia.basescan.org/tx/${txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-mono text-primary hover:underline block"
                        >
                          {txHash}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400 font-semibold mb-1">错误</p>
                    <div className="space-y-1">
                      {result.errors.map((error, idx) => (
                        <p key={idx} className="text-sm text-red-300">{error}</p>
                      ))}
                    </div>
                  </div>
                )}

                {result.result && (
                  <div>
                    <p className="text-xs opacity-60 mb-2">结果详情</p>
                    <details>
                      <summary className="text-xs opacity-60 cursor-pointer">查看详情</summary>
                      <pre className="mt-2 text-xs font-mono overflow-x-auto p-3 rounded bg-black/20">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <details>
                    <summary className="text-xs opacity-60 cursor-pointer flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      查看完整 JSON 响应
                    </summary>
                    <pre className="mt-2 text-xs font-mono overflow-x-auto p-3 rounded bg-black/20">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}
          </ThemedCard>
        </div>
      </Section>
    </PageLayout>
  );
}
