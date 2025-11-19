import type { IStorage } from "../storage";
import { TestWalletService } from "./testWalletService";
import { ImmortalityAgentKitService } from "./agentkit";
import { generateImmortalityReply } from "../chatbot/generateReply";
import type { SuggestedAction } from "../chatbot/generateReply";
import type { UserMemory } from "@shared/schema";

export type TestScenarioId = "immortality-playable-agent" | "immortality-demo-seed";

export interface RunScenarioParams {
  scenario: TestScenarioId;
  wallets?: number;
  seedMemories?: boolean;
  label?: string;
}

const IMMORTALITY_PROMPT = "帮我铸个徽章纪念今天";
const DEMO_MEMORY_CANDIDATES: Array<{ text: string; emotion: string }> = [
  { text: "今天和 Cyber Immortality 团队讨论 legacy 的意义，心里有点感动。", emotion: "grateful" },
  { text: "凌晨两点还在想自己的数字分身会如何安慰未来的自己。", emotion: "thoughtful" },
  { text: "收到了老朋友的语音，说想和我在元宇宙里再见一次。", emotion: "nostalgic" },
  { text: "第一次把童年的照片上传给分身，突然泪崩。", emotion: "emotional" },
  { text: "体验 Agent 帮我总结今天的心情，原来我真的被理解了。", emotion: "relieved" },
];

const DEMO_CHAT_PROMPTS = [
  "我今天特别想纪念一下和家人的回忆，可以帮我做点什么吗？",
  "能不能帮我设计一个徽章，记录下今晚的灵感？",
];

export class TestScenarioRunner {
  private readonly walletService: TestWalletService;
  private readonly agentkitService: ImmortalityAgentKitService;

  constructor(private readonly storage: IStorage) {
    this.walletService = new TestWalletService(storage);
    this.agentkitService = new ImmortalityAgentKitService(storage);
  }

  async runScenario(params: RunScenarioParams): Promise<Record<string, unknown>> {
    switch (params.scenario) {
      case "immortality-playable-agent":
        return this.runImmortalityPlayableAgent(params);
      case "immortality-demo-seed":
        return this.runImmortalityDemoSeed(params);
      default:
        throw new Error(`Unknown scenario: ${params.scenario}`);
    }
  }

  private async runImmortalityPlayableAgent(params: RunScenarioParams) {
    const label = params.label ?? "immortality-demo-user";
    this.log(`Preparing scenario 'immortality-playable-agent' for label=${label}`);

    const context = await this.walletService.getOrCreateWallet(label);
    this.log(`Using test wallet ${context.wallet.address} (userId=${context.user.id})`);

    let seededMemories: UserMemory[] = [];
    if (params.seedMemories !== false) {
      seededMemories = await this.seedMemories(context.user.id, 1);
      this.log(`created ${seededMemories.length} memories for user ${context.user.id}`);
    }

    const chatResult = await this.runChat(context.user.id, IMMORTALITY_PROMPT);
    this.log(`chat reply: ${chatResult.reply}`);
    this.log(`suggested actions: ${JSON.stringify(chatResult.suggestedActions)}`);

    if (!chatResult.suggestedActions.some((action) => action.type === "MINT_TEST_BADGE")) {
      throw new Error("Chat response did not include MINT_TEST_BADGE action");
    }

    const mintResult = await this.agentkitService.mintTestBadgeForUser(context.user.id);
    this.log(`mint badge txHash: ${mintResult.txHash}`);

    return {
      wallet: context.wallet,
      userId: context.user.id,
      memories: seededMemories.map((memory) => ({ id: memory.id, text: memory.text })),
      reply: chatResult.reply,
      suggestedActions: chatResult.suggestedActions,
      mintResult,
    };
  }

  private async runImmortalityDemoSeed(params: RunScenarioParams) {
    const walletCount = Math.min(Math.max(params.wallets ?? 5, 1), 20);
    this.log(`Preparing 'immortality-demo-seed' scenario for ${walletCount} wallets`);

    const results: Array<Record<string, unknown>> = [];
    for (let i = 0; i < walletCount; i++) {
      const label = `immortality-demo-${Date.now()}-${i}`;
      const context = await this.walletService.createWallet({ label });
      this.log(`created test wallet ${context.wallet.address} (${label}) for user ${context.user.id}`);

      const memoryCount = this.randomInRange(3, 5);
      const seededMemories = await this.seedMemories(context.user.id, memoryCount);
      this.log(`created ${seededMemories.length} memories for ${context.user.id}`);

      const chatRuns: Array<{ reply: string; suggestedActions: SuggestedAction[] }> = [];
      const chatsToRun = this.randomInRange(1, 2);
      for (let chatIndex = 0; chatIndex < chatsToRun; chatIndex++) {
        const prompt = DEMO_CHAT_PROMPTS[chatIndex % DEMO_CHAT_PROMPTS.length];
        const chatResult = await this.runChat(context.user.id, prompt);
        chatRuns.push(chatResult);
      }

      const mintResult = await this.agentkitService.mintTestBadgeForUser(context.user.id);
      this.log(`mint badge txHash for ${context.user.id}: ${mintResult.txHash}`);

      results.push({
        wallet: context.wallet,
        userId: context.user.id,
        memoryCount: seededMemories.length,
        chats: chatRuns,
        mintResult,
      });
    }

    return { wallets: results };
  }

  private async seedMemories(userId: string, count: number): Promise<UserMemory[]> {
    const created: UserMemory[] = [];
    for (let i = 0; i < count; i++) {
      const memoryTemplate = DEMO_MEMORY_CANDIDATES[i % DEMO_MEMORY_CANDIDATES.length];
      const memory = await this.storage.createUserMemory({
        userId,
        text: memoryTemplate.text,
        emotion: memoryTemplate.emotion,
        tags: null,
        mediaUrl: null,
      });
      created.push(memory);
    }
    return created;
  }

  private async runChat(userId: string, prompt: string): Promise<{ reply: string; suggestedActions: SuggestedAction[] }> {
    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      throw new Error("OPENAI_API_KEY is required to run chat scenarios");
    }

    const [profile, memories] = await Promise.all([
      this.storage.getUserPersonalityProfile(userId),
      this.storage.listUserMemories({ userId, limit: 10 }),
    ]);

    const result = await generateImmortalityReply({
      message: prompt,
      profile,
      memories,
      apiKey: openAiKey,
      modelName: process.env.OPENAI_MODEL,
    });

    return result;
  }

  private randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private log(message: string) {
    console.log(`[TestScenarioRunner] ${message}`);
  }
}
