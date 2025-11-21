import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  executeActivateAgent,
  executeUploadMemory,
  executeMintBadge,
  type ActionResponse,
} from "@/lib/immortalityActions";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  // Support for action messages
  actionType?: string;
  autoExecute?: boolean;
}

interface ActionMessage {
  type: "action";
  actionType: "activate_agent" | "upload_memory" | "mint_badge";
  autoExecute: boolean;
  content: string;
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
  // Support for structured action messages
  actions?: ActionMessage[];
}

export function ImmortalityChat() {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [executingActions, setExecutingActions] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    actionType: string;
    actionTitle: string;
    actionDescription?: string;
    onConfirm: () => Promise<void>;
  }>({
    open: false,
    actionType: "",
    actionTitle: "",
    onConfirm: async () => {},
  });

  // Helper to execute an action
  const executeAction = async (
    actionType: "activate_agent" | "upload_memory" | "mint_badge",
    memoryData?: { text: string; emotion?: string }
  ) => {
    const actionKey = `${actionType}-${Date.now()}`;
    setExecutingActions((prev) => new Set(prev).add(actionKey));

    try {
      let result: ActionResponse;
      switch (actionType) {
        case "activate_agent":
          result = await executeActivateAgent();
          break;
        case "upload_memory":
          if (!memoryData) {
            throw new Error("Memory data is required for upload_memory");
          }
          result = await executeUploadMemory(memoryData);
          break;
        case "mint_badge":
          result = await executeMintBadge();
          break;
        default:
          throw new Error(`Unknown action type: ${actionType}`);
      }

      // Add result message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.success
            ? `✅ ${result.message}${result.txHash ? ` (交易哈希: ${result.txHash})` : ""}`
            : `❌ ${result.message}`,
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
      const errorMessage = error?.message || "操作失败";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ ${errorMessage}`,
          timestamp: new Date().toISOString(),
        },
      ]);
      toast({
        title: "操作失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setExecutingActions((prev) => {
        const next = new Set(prev);
        next.delete(actionKey);
        return next;
      });
    }
  };

  // Helper to parse and handle action messages
  const handleActionMessage = (action: ActionMessage, userMessage: string) => {
    if (action.autoExecute) {
      // Auto-execute for upload_memory
      if (action.actionType === "upload_memory") {
        executeAction("upload_memory", {
          text: userMessage,
          emotion: undefined,
        });
      }
    } else {
      // Show confirmation dialog for sensitive actions
      const actionTitles: Record<string, string> = {
        activate_agent: "激活代理",
        mint_badge: "铸造徽章",
      };
      const actionDescriptions: Record<string, string> = {
        activate_agent: "这将为你的保险库激活 Immortality AI 代理，授予其访问权限。",
        mint_badge: "这将在区块链上铸造一枚 Immortality Badge，需要支付 Gas 费用。",
      };

      setConfirmDialog({
        open: true,
        actionType: action.actionType,
        actionTitle: actionTitles[action.actionType] || "执行操作",
        actionDescription: actionDescriptions[action.actionType] || action.content,
        onConfirm: async () => {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
          await executeAction(action.actionType);
        },
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
    onSuccess: (data, variables) => {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      // Handle structured action messages (new format)
      if (data.actions && data.actions.length > 0) {
        data.actions.forEach((action) => {
          handleActionMessage(action, variables);
        });
      }

      // Handle backward compatibility with suggestedActions (old format)
      if (data.suggestedActions && data.suggestedActions.length > 0) {
        // Convert suggestedActions to action format for display
        const actionText = data.suggestedActions
          .map((action) => `${action.title}`)
          .join(" / ");
        assistantMessage.content += `\n\n可能的下一步：${actionText}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: variables,
          timestamp: new Date().toISOString(),
        },
        assistantMessage,
      ]);

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
    chatMutation.mutate(trimmed);
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <ThemedCard className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        <span className="font-semibold">赛博分身对话</span>
      </div>
      <div
        className={cn(
          "rounded-2xl border p-4 space-y-4 max-h-[320px] overflow-y-auto",
          theme === "cyberpunk" ? "border-cyan-400/30 bg-cyan-400/5" : "border-slate-200 bg-white",
        )}
      >
        {messages.length === 0 && (
          <p className="text-sm opacity-70">
            告诉你的分身最近的感受，它会结合人格档案与记忆给出建议。
          </p>
        )}
        {messages.map((msg, idx) => (
          <div key={`${msg.timestamp}-${idx}`} className={cn("text-sm space-y-2", msg.role === "assistant" && "italic")}>
            <div className="text-xs opacity-60">
              {msg.role === "user" ? "你" : "Cyber Immortality"}
            </div>
            <p>{msg.content}</p>
            {msg.actionType && !msg.autoExecute && (
              <ThemedButton
                size="sm"
                onClick={() => {
                  const actionTitles: Record<string, string> = {
                    activate_agent: "激活代理",
                    mint_badge: "铸造徽章",
                  };
                  setConfirmDialog({
                    open: true,
                    actionType: msg.actionType!,
                    actionTitle: actionTitles[msg.actionType!] || "执行操作",
                    onConfirm: async () => {
                      setConfirmDialog((prev) => ({ ...prev, open: false }));
                      await executeAction(msg.actionType as any);
                    },
                  });
                }}
                disabled={executingActions.size > 0}
              >
                {executingActions.size > 0 ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    执行中...
                  </>
                ) : (
                  "执行操作"
                )}
              </ThemedButton>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={cn(
            "flex-1 min-w-[240px] rounded-xl border bg-transparent p-3 text-sm outline-none focus:ring-2",
            theme === "cyberpunk" ? "border-cyan-500/40 focus:ring-cyan-400/40" : "border-slate-200 focus:ring-blue-200",
          )}
          placeholder="输入想对分身说的话..."
        />
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

      {/* Confirmation Dialog for Sensitive Actions */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.actionTitle}</AlertDialogTitle>
            {confirmDialog.actionDescription && (
              <AlertDialogDescription>{confirmDialog.actionDescription}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDialog.onConfirm}
              disabled={executingActions.size > 0}
            >
              {executingActions.size > 0 ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  执行中...
                </>
              ) : (
                "确认"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ThemedCard>
  );
}

