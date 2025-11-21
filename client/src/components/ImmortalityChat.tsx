import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  executeActivateAgent,
  executeUploadMemory,
  executeMintBadge,
  type ActionResponse,
} from "@/lib/immortalityActions";
import { ChatPayment } from "@/components/ChatPayment";

interface ActionMessage {
  type: "action";
  actionType: "activate_agent" | "upload_memory" | "mint_badge" | "pay_poi";
  autoExecute: boolean;
  content: string;
  suggestedAmount?: number; // For pay_poi action
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  actions?: ActionMessage[];
  paymentAction?: boolean; // Flag to show payment component
  suggestedAmount?: number; // Suggested amount for payment
}

interface ChatResponse {
  reply: string;
  profileUsed: boolean;
  memoryCount: number;
  suggestedActions?: Array<{
    type: string;
    title: string;
    description?: string;
  }>;
  actions?: ActionMessage[];
  newBalance?: number; // Updated balance after charging
  creditsCharged?: number; // Amount of credits charged
}

export function ImmortalityChat() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [executingActions, setExecutingActions] = useState<Set<string>>(new Set());

  // Fetch balance
  const { data: balanceData } = useQuery<{ credits: number; poiCredits: number }>({
    queryKey: ["/api/immortality/balance"],
    queryFn: async () => {
      const response = await fetch("/api/immortality/balance");
      if (!response.ok) throw new Error("Failed to fetch balance");
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const currentBalance = balanceData?.credits ?? 0;

  const handleActionMessage = async (action: ActionMessage, messageIndex: number, actionIndex?: number) => {
    // Check authentication before executing any action
    if (!isAuthenticated || !user) {
      const errorMessage = "请先使用钱包登录后再执行此操作";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
      toast({
        title: "需要登录",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    const actionId = `${messageIndex}-${action.actionType}-${actionIndex ?? 0}`;
    setExecutingActions((prev) => new Set(prev).add(actionId));

    try {
      let result: ActionResponse;

      switch (action.actionType) {
        case "activate_agent":
          result = await executeActivateAgent();
          break;
        case "upload_memory":
          // Extract text from action content or use a default
          const text = action.content || "记忆内容";
          result = await executeUploadMemory({ text });
          break;
        case "mint_badge":
          result = await executeMintBadge();
          break;
        case "pay_poi":
          // Insert a payment action message instead of calling backend API
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "请充值以继续使用 Immortality Chat",
              timestamp: new Date().toISOString(),
              paymentAction: true,
              suggestedAmount: action.suggestedAmount || 20,
            },
          ]);
          setExecutingActions((prev) => {
            const next = new Set(prev);
            next.delete(actionId);
            return next;
          });
          return; // Early return, no backend call needed
        default:
          throw new Error(`Unknown action type: ${action.actionType}`);
      }

      // Add result message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.success
            ? `${result.message}${result.txHash ? ` (交易哈希: ${result.txHash})` : ""}`
            : `操作失败: ${result.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (result.success) {
        toast({
          title: "操作成功",
          description: result.message,
        });
      } else {
        toast({
          title: "操作失败",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("[ImmortalityChat] Error executing action:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `操作执行失败: ${error.message || "未知错误"}`,
          timestamp: new Date().toISOString(),
        },
      ]);
      toast({
        title: "操作失败",
        description: error.message || "执行操作时发生错误",
        variant: "destructive",
      });
    } finally {
      setExecutingActions((prev) => {
        const next = new Set(prev);
        next.delete(actionId);
        return next;
      });
    }
  };

  const chatMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      if (!response.ok) {
        throw new Error("Failed to get reply");
      }
      return (await response.json()) as ChatResponse;
    },
    onSuccess: async (data, variables) => {
      const messageIndex = messages.length; // Index for the new assistant message (user message already added)

      // Process actions (prioritize actions array, fallback to suggestedActions)
      const actionsToProcess = data.actions && data.actions.length > 0 
        ? data.actions 
        : data.suggestedActions?.map((sa) => ({
            type: "action" as const,
            actionType: sa.type as "activate_agent" | "upload_memory" | "mint_badge" | "pay_poi",
            autoExecute: false,
            content: sa.title,
          })) || [];

      // Add assistant message with actions
      let replyContent = data.reply;
      
      // Append credits charged info if available
      if (data.creditsCharged !== undefined && data.creditsCharged > 0) {
        replyContent += `\n\n💳 已消耗 ${data.creditsCharged} Credits`;
        if (data.newBalance !== undefined) {
          replyContent += `，当前余额：${data.newBalance} Credits`;
        }
      }
      
      replyContent +=
        (data.suggestedActions?.length && !data.actions?.length
          ? `\n\n可能的下一步：${data.suggestedActions
              .map((action) => `${action.title}`)
              .join(" / ")}` 
          : "");

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: replyContent,
        timestamp: new Date().toISOString(),
        actions: actionsToProcess.length > 0 ? actionsToProcess : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Refresh balance after charging
      if (data.newBalance !== undefined) {
        queryClient.invalidateQueries(["/api/immortality/balance"]);
      }

      // Auto-execute actions that have autoExecute: true
      for (let i = 0; i < actionsToProcess.length; i++) {
        const action = actionsToProcess[i];
        if (action.autoExecute) {
          await handleActionMessage(action, messageIndex, i);
        }
      }

      toast({
        title: "分身回复完成",
        description: data.profileUsed
          ? `已参考人格档案与 ${data.memoryCount} 条记忆`
          : "尚未录入人格或记忆，回复为通用建议",
      });
    },
    onError: () => {
      toast({
        title: "回复失败",
        description: "暂时无法连接分身，请稍后再试",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || chatMutation.status === "pending") return;
    setInput("");
    
    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      },
    ]);
    
    chatMutation.mutate(trimmed);
  };

  return (
    <ThemedCard className="h-full p-6 flex flex-col">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">赛博分身对话</span>
        </div>
        {isAuthenticated && (
          <div className="flex items-center gap-2 text-sm">
            <Coins className={cn("w-4 h-4", theme === "cyberpunk" ? "text-cyan-400" : "text-primary")} />
            <span className={cn("font-medium", theme === "cyberpunk" ? "text-cyan-300" : "text-slate-700")}>
              {currentBalance} Credits
            </span>
          </div>
        )}
      </div>

      {/* Messages Area - Scrollable */}
      <div
        className={cn(
          "flex-1 rounded-2xl border p-4 space-y-4 overflow-y-auto min-h-0",
          theme === "cyberpunk" ? "border-cyan-400/30 bg-cyan-400/5" : "border-slate-200 bg-white",
        )}
      >
        {messages.length === 0 && (
          <p className="text-sm opacity-70">
            告诉你的分身最近的感受，它会结合人格档案与记忆给出建议。
          </p>
        )}
        {messages.map((msg, idx) => {

          return (
            <div key={`${msg.timestamp}-${idx}`} className={cn("text-sm space-y-2", msg.role === "assistant" && "italic")}>
              <div className="text-xs opacity-60">
                {msg.role === "user" ? "你" : "Cyber Immortality"}
              </div>
              <p>{msg.content}</p>
              
              {/* Render payment component if paymentAction is true */}
              {msg.paymentAction && (
                <div className="mt-3">
                  <ChatPayment
                    suggestedAmount={msg.suggestedAmount}
                    onSuccess={() => {
                      // Invalidate balance query to refresh balance after payment
                      queryClient.invalidateQueries(["/api/immortality/balance"]);
                    }}
                  />
                </div>
              )}
              
              {/* Render action buttons for non-auto-execute actions */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.actions.map((action, actionIdx) => {
                    const actionId = `${idx}-${action.actionType}-${actionIdx}`;
                    const isAutoExecuting = action.autoExecute && executingActions.has(actionId);
                    
                    if (action.autoExecute && !isAutoExecuting) {
                      // Auto-execute actions show loading state
                      return null; // Already handled in onSuccess
                    }
                    
                    const buttonActionId = `${idx}-${action.actionType}-${actionIdx}`;
                    const buttonIsExecuting = executingActions.has(buttonActionId);
                    
                    return (
                      <ThemedButton
                        key={`${action.actionType}-${actionIdx}`}
                        size="sm"
                        disabled={buttonIsExecuting}
                        onClick={() => handleActionMessage(action, idx, actionIdx)}
                        className="text-xs"
                      >
                        {buttonIsExecuting ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            执行中...
                          </>
                        ) : (
                          action.content || `执行 ${action.actionType}`
                        )}
                      </ThemedButton>
                    );
                  })}
                </div>
              )}

              {/* Show loading indicator for auto-execute actions */}
              {msg.actions?.some((a) => a.autoExecute) && 
               msg.actions.some((a, ai) => executingActions.has(`${idx}-${a.actionType}-${ai}`)) && (
                <div className="flex items-center gap-2 text-xs opacity-70">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>正在执行操作...</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="flex gap-3 flex-wrap mt-4 flex-shrink-0">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className={cn(
            "flex-1 min-w-[240px] rounded-xl border bg-transparent p-3 text-sm outline-none focus:ring-2",
            theme === "cyberpunk" ? "border-cyan-500/40 focus:ring-cyan-400/40" : "border-slate-200 focus:ring-blue-200",
          )}
          placeholder="输入想对分身说的话..."
        />
        <ThemedButton
          size="sm"
          onClick={() => {
            // Insert a payment action message with default suggested amount
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: "充值 Immortality Credits 以继续使用聊天功能",
                timestamp: new Date().toISOString(),
                paymentAction: true,
                suggestedAmount: 20,
              },
            ]);
          }}
        >
          充值
        </ThemedButton>
        <ThemedButton emphasis disabled={!input.trim() || chatMutation.status === "pending"} onClick={handleSend}>
          {chatMutation.status === "pending" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              等待回复...
            </>
          ) : (
            "发送"
          )}
        </ThemedButton>
      </div>
    </ThemedCard>
  );
}

