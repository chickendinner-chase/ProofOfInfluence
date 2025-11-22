import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDemoUser } from "@/hooks/useDemoUser";
import { useLocation } from "wouter";
import {
  executeActivateAgent,
  executeUploadMemory,
  executeMintBadge,
  type ActionResponse,
} from "@/lib/immortalityActions";
import { ChatPayment } from "@/components/ChatPayment";
import { RwaTicker } from "./rwa/RwaTicker";
import { RwaChatCard } from "./rwa/RwaChatCard";
import { useI18n } from "@/i18n";
import { ImmortalityFlowStep, ImmortalityFlowState } from "../../../shared/immortality-flow";
import type { RwaItem } from "../../../shared/types/rwa";
import { handleImmortalityEvent, mapStepToReplyKey } from "@/lib/immortality/flow/engine";

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
  rwaItems?: RwaItem[]; // NEW: RWA assets attached to this message
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
  const { t } = useI18n();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const demoUser = useDemoUser();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [executingActions, setExecutingActions] = useState<Set<string>>(new Set());

  // Flow State
  const [flowState, setFlowState] = useState<ImmortalityFlowState>({
    currentStep: ImmortalityFlowStep.ENTRY,
    context: {
      walletConnected: false,
      socialConnected: false,
      badgeMinted: false,
      questionsAnswered: 0,
    },
    history: [],
  });

  // Effect to sync auth state with flow context
  useEffect(() => {
    if (isAuthenticated !== flowState.context.walletConnected || user?.id !== flowState.context.userId) {
        const newState = handleImmortalityEvent(flowState, {
            walletConnected: isAuthenticated,
            userId: user?.id
        });
        if (newState.currentStep !== flowState.currentStep) {
             setFlowState(newState);
             setMessages(prev => [...prev, {
                role: 'assistant',
                content: t(mapStepToReplyKey(newState.currentStep)),
                timestamp: new Date().toISOString()
            }]);
        } else if (newState.context !== flowState.context) {
             setFlowState(newState);
        }
    }
  }, [isAuthenticated, user, flowState, t]);

  // Initial Welcome Message + Action Hint
  useEffect(() => {
      if (messages.length === 0) {
          const now = new Date().toISOString();
          
          const welcomeMessage: ChatMessage = {
              role: 'assistant',
              content: t(mapStepToReplyKey(flowState.currentStep)),
              timestamp: now,
          };
          
          const hintMessage: ChatMessage = {
              role: 'assistant',
              content: t('immortality.initial_hint'),
              timestamp: new Date().toISOString(),
          };
          
          setMessages([welcomeMessage, hintMessage]);
      }
  }, []);

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

  const handleActionMessage = async (action: ActionMessage, messageIndex: number, actionIndex?: number) => {
    // Check authentication before executing any action
    if (!isAuthenticated || !user) {
      const errorMessage = t('common.error'); // Simplified error or use a specific key
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Please connect wallet first.",
          timestamp: new Date().toISOString(),
        },
      ]);
      toast({
        title: t('common.error'),
        description: "Please connect wallet first.",
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
          if (result.success) {
              const newState = handleImmortalityEvent(flowState, { badgeMinted: true });
              if (newState.currentStep !== flowState.currentStep) {
                 setFlowState(newState);
                 setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: t(mapStepToReplyKey(newState.currentStep)),
                    timestamp: new Date().toISOString()
                }]);
             } else {
                 setFlowState(newState);
             }
          }
          break;
        case "pay_poi":
          // Insert a payment action message instead of calling backend API
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Please recharge to continue.",
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
            ? `${result.message}${result.txHash ? ` (Tx: ${result.txHash})` : ""}`
            : `${t('common.error')}: ${result.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (result.success) {
        toast({
          title: t('common.success'),
          description: result.message,
        });
      } else {
        toast({
          title: t('common.error'),
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
          content: `${t('common.error')}: ${error.message || "Unknown error"}`,
          timestamp: new Date().toISOString(),
        },
      ]);
      toast({
        title: t('common.error'),
        description: error.message || "Unknown error",
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

      // Check for flow progress (Training Questions)
      if (flowState.currentStep === ImmortalityFlowStep.TRAINING_QUESTIONS) {
           const newState = handleImmortalityEvent(flowState, { questionsAnswered: flowState.context.questionsAnswered + 1 });
           if (newState.currentStep !== flowState.currentStep) {
               setFlowState(newState);
               setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: t(mapStepToReplyKey(newState.currentStep)),
                  timestamp: new Date().toISOString()
              }]);
           } else {
               setFlowState(newState);
           }
      }

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
        replyContent += `\n\n💳 -${data.creditsCharged} Credits`;
        if (data.newBalance !== undefined) {
          replyContent += ` | Balance: ${data.newBalance}`;
        }
      }
      
      replyContent +=
        (data.suggestedActions?.length && !data.actions?.length
          ? `\n\nNext steps: ${data.suggestedActions
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
        queryClient.invalidateQueries({ queryKey: ["/api/immortality/balance"] });
      }

      // Auto-execute actions that have autoExecute: true
      for (let i = 0; i < actionsToProcess.length; i++) {
        const action = actionsToProcess[i];
        if (action.autoExecute) {
          await handleActionMessage(action, messageIndex, i);
        }
      }
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: "Failed to get reply",
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

  const handleRwaSelected = (item: RwaItem) => {
    // 1) Update state machine
    const newState = handleImmortalityEvent(flowState, {
      rwaItemId: item.id,
    });

    if (newState.currentStep !== flowState.currentStep) {
      setFlowState(newState);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t(mapStepToReplyKey(newState.currentStep)),
          timestamp: new Date().toISOString(),
        },
      ]);
    } else {
      setFlowState(newState);
    }

    // 2) Insert user message + assistant message with RWA card immediately
    const now = new Date().toISOString();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: `I'm interested in ${item.name}`,
        timestamp: now,
      },
      {
        role: "assistant",
        content: t("immortality.rwa.after_preview_prompt"),
        timestamp: new Date().toISOString(),
        rwaItems: [item],
      },
    ]);

    // Note: No automatic chat mutation - user can ask follow-up questions manually
  };

  const handleRwaPreview = (item: RwaItem) => {
    // Optional: Insert a prompt message in chat
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: t("immortality.rwa.preview_redirect"),
        timestamp: new Date().toISOString(),
      },
    ]);

    // Navigate to detail page
    setLocation(`/app/rwa-market?id=${item.id}`);
  };

  const handleRwaBuy = (item: RwaItem) => {
    // V0: Frontend-only feedback, no backend call required
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: t("immortality.rwa.register_success"),
        timestamp: new Date().toISOString(),
      },
    ]);

    toast({
      title: t("common.success"),
      description: t("immortality.rwa.register_success"),
    });

    // TODO: If backend API /api/rwa/register-interest is ready, add fetch call here
  };

  return (
    <ThemedCard className="h-full w-full flex flex-col overflow-hidden">
      {/* RWA Ticker */}
      <RwaTicker onSelectItem={handleRwaSelected} />

      <div className="flex flex-col flex-1 min-h-0 p-6">
        {/* Header - Fixed: Chat Title + Credits/Agent Info */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">{t('immortality.title')}</span>
          </div>
          
          {/* Credits and Agent Info */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm opacity-80">
            <span>
              Immortality Credits <span className="font-semibold">{balanceData?.credits ?? 0}</span>
            </span>
            <span className="hidden sm:inline">·</span>
            <span>
              POI Credits <span className="font-semibold">{balanceData?.poiCredits ?? 0}</span>
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1.5">
              Agent: {demoUser.isUsingDemoUser
                ? (demoUser.selectedDemoUser?.username || demoUser.selectedDemoUser?.label || demoUser.selectedDemoUser?.walletAddress.slice(0, 6))
                : (user?.username ?? "Guest")}
              <span className={cn(
                "h-2 w-2 rounded-full",
                theme === "cyberpunk" ? "bg-emerald-400" : "bg-green-500"
              )} />
              <span>Online</span>
            </span>
          </div>
        </div>

      {/* Messages Area - Scrollable */}
      <div
        className={cn(
          "flex-1 rounded-2xl border p-4 space-y-4 overflow-y-auto min-h-0",
          theme === "cyberpunk" ? "border-cyan-400/30 bg-cyan-400/5" : "border-slate-200 bg-white",
        )}
      >
        {messages.map((msg, idx) => {

          return (
            <div key={`${msg.timestamp}-${idx}`} className={cn("text-sm space-y-2", msg.role === "assistant" && "italic")}>
              <div className="text-xs opacity-60">
                {msg.role === "user" ? "You" : "Cyber Immortality"}
              </div>
              <p>{msg.content}</p>
              
              {/* Render payment component if paymentAction is true */}
              {msg.paymentAction && (
                <div className="mt-3">
                  <ChatPayment
                    suggestedAmount={msg.suggestedAmount}
                    onSuccess={() => {
                      // Invalidate balance query to refresh balance after payment
                      queryClient.invalidateQueries({ queryKey: ["/api/immortality/balance"] });
                    }}
                  />
                </div>
              )}
              
              {/* Render RWA cards if rwaItems are attached */}
              {msg.rwaItems && msg.rwaItems.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {msg.rwaItems.map((item) => (
                    <RwaChatCard
                      key={item.id}
                      item={item}
                      onPreview={() => handleRwaPreview(item)}
                      onRegister={() => handleRwaBuy(item)}
                    />
                  ))}
                </div>
              )}
              
              {/* Generic action buttons temporarily hidden - only RWA card buttons are shown */}
              {false && msg.actions && (msg.actions?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.actions?.map((action, actionIdx) => {
                    const actionId = `${idx}-${action.actionType}-${actionIdx}`;
                    const isAutoExecuting = action.autoExecute && executingActions.has(actionId);
                    
                    if (action.autoExecute && !isAutoExecuting) {
                      // Auto-execute actions show loading state
                      return null; // Already handled in onSuccess
                    }
                    
                    const buttonIsExecuting = executingActions.has(actionId);
                    
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
                            {t('common.loading')}
                          </>
                        ) : (
                          action.content || `Execute ${action.actionType}`
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
                  <span>Executing...</span>
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
          placeholder={t('immortality.chat_placeholder')}
        />
        <ThemedButton
          size="sm"
          onClick={() => {
            // Insert a payment action message with default suggested amount
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: "Recharge Immortality Credits",
                timestamp: new Date().toISOString(),
                paymentAction: true,
                suggestedAmount: 20,
              },
            ]);
          }}
        >
          Recharge
        </ThemedButton>
        <ThemedButton emphasis disabled={!input.trim() || chatMutation.status === "pending"} onClick={handleSend}>
          {chatMutation.status === "pending" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('common.loading')}
            </>
          ) : (
            t('common.send')
          )}
        </ThemedButton>
      </div>
      </div>
    </ThemedCard>
  );
}
