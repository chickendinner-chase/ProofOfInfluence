import { testWalletService } from "./testWalletService";
import { storage } from "../storage";
import { contractService } from "./contracts";
import { generateImmortalityReply } from "../chatbot/generateReply";
import { ethers } from "ethers";

export type ScenarioName = "immortality-playable-agent" | "immortality-demo-seed";

interface ScenarioResult {
  success: boolean;
  result?: any;
  txHashes?: string[];
  errors?: string[];
  steps?: Array<{ step: string; status: "success" | "error"; message?: string }>;
}

interface ImmortalityPlayableAgentParams {
  memories?: Array<{ text: string; emotion?: string }>;
  chatMessages?: string[];
  mintBadge?: boolean;
}

interface ImmortalityDemoSeedParams {
  wallets: number;
  createMemories?: boolean;
}

/**
 * Test Scenario Runner - Executes automated E2E test scenarios
 */
export class TestScenarioRunner {
  /**
   * Main router for scenario execution
   */
  async runScenario(
    scenarioName: ScenarioName,
    params: Record<string, any>
  ): Promise<ScenarioResult> {
    try {
      switch (scenarioName) {
        case "immortality-playable-agent":
          return await this.runImmortalityPlayableAgent(params as ImmortalityPlayableAgentParams);
        case "immortality-demo-seed":
          return await this.runImmortalityDemoSeed(params as ImmortalityDemoSeedParams);
        default:
          throw new Error(`Unknown scenario: ${scenarioName}`);
      }
    } catch (error: any) {
      console.error(`[TestScenarioRunner] Error running scenario ${scenarioName}:`, error);
      return {
        success: false,
        errors: [error.message || String(error)],
      };
    }
  }

  /**
   * Full E2E test: Create user, initialize memories, test AI chat, mint badge
   */
  async runImmortalityPlayableAgent(
    params: ImmortalityPlayableAgentParams = {}
  ): Promise<ScenarioResult> {
    const steps: Array<{ step: string; status: "success" | "error"; message?: string }> = [];
    const txHashes: string[] = [];
    const errors: string[] = [];
    let testWallet: any = null;

    try {
      // Step 1: Allocate test wallet
      steps.push({ step: "allocate_wallet", status: "success" });
      testWallet = await testWalletService.allocateWallet("immortality-playable-agent");
      const walletAddress = testWallet.walletAddress;

      // Step 2: Create or find user
      let user = await storage.getUserByWallet(walletAddress);
      if (!user) {
        user = await storage.findOrCreateUserByWallet(walletAddress);
        steps.push({ step: "create_user", status: "success", message: `User ID: ${user.id}` });
      } else {
        steps.push({ step: "find_user", status: "success", message: `User ID: ${user.id}` });
      }

      const userId = user.id;

      // Step 3: Initialize memories
      const defaultMemories = params.memories || [
        { text: "今天完成了第一个 Immortality 测试", emotion: "joy" },
        { text: "期待看到 AI Agent 如何记住这些记忆", emotion: "calm" },
        { text: "准备铸造第一个徽章", emotion: "joy" },
      ];

      const createdMemories = [];
      for (const memory of defaultMemories) {
        try {
          const created = await storage.createUserMemory({
            userId,
            text: memory.text,
            emotion: memory.emotion || null,
            tags: null,
            mediaUrl: null,
          });
          createdMemories.push(created);
        } catch (err: any) {
          errors.push(`Failed to create memory: ${err.message}`);
        }
      }
      steps.push({
        step: "initialize_memories",
        status: createdMemories.length > 0 ? "success" : "error",
        message: `Created ${createdMemories.length} memories`,
      });

      // Step 4: Test AI chat (multi-turn)
      const chatMessages = params.chatMessages || [
        "你好，还记得我最近在做什么吗？",
        "我想铸造一个徽章来纪念这段经历",
      ];

      const chatResults = [];
      const openAiKey = process.env.OPENAI_API_KEY;
      if (!openAiKey) {
        steps.push({
          step: "ai_chat",
          status: "error",
          message: "OPENAI_API_KEY not configured",
        });
        errors.push("OPENAI_API_KEY not configured");
      } else {
        for (const message of chatMessages) {
          try {
            const profile = await storage.getUserPersonalityProfile(userId);
            const memories = await storage.listUserMemories({ userId, limit: 10 });
            const reply = await generateImmortalityReply({
              message,
              profile: profile || null,
              memories,
              apiKey: openAiKey,
              modelName: process.env.OPENAI_MODEL,
            });
            chatResults.push({ message, reply: reply.reply });
          } catch (err: any) {
            errors.push(`Chat error: ${err.message}`);
          }
        }
        steps.push({
          step: "ai_chat",
          status: chatResults.length > 0 ? "success" : "error",
          message: `Processed ${chatResults.length} messages`,
        });
      }

      // Step 5: Mint badge (if enabled)
      if (params.mintBadge !== false) {
        try {
          if (!contractService.isContractDeployed("AchievementBadges")) {
            steps.push({
              step: "mint_badge",
              status: "error",
              message: "AchievementBadges contract not deployed",
            });
            errors.push("AchievementBadges contract not deployed");
          } else {
            const result = await contractService.call(
              "AchievementBadges",
              "mintBadge",
              { to: walletAddress, badgeType: 1 },
              {
                mode: "agentkit",
                userWallet: walletAddress,
              }
            );

            if (result.txHash) {
              txHashes.push(result.txHash);
              steps.push({
                step: "mint_badge",
                status: "success",
                message: `TX: ${result.txHash}`,
              });

              // Wait for confirmation (optional, can be async)
              // For now, we just record the txHash
            }
          }
        } catch (err: any) {
          errors.push(`Badge mint error: ${err.message}`);
          steps.push({
            step: "mint_badge",
            status: "error",
            message: err.message,
          });
        }
      }

      // Step 6: Verify on-chain state (optional)
      // This would require a provider and contract instance
      // For now, we skip this step

      // Release wallet (always release, even on error)
      try {
        await testWalletService.releaseWallet(testWallet.id);
      } catch (releaseError: any) {
        console.error("[TestScenarioRunner] Failed to release wallet:", releaseError);
        errors.push(`Failed to release wallet: ${releaseError.message}`);
      }

      return {
        success: errors.length === 0,
        result: {
          userId,
          walletAddress,
          memoriesCreated: createdMemories.length,
          chatResults,
        },
        txHashes,
        errors: errors.length > 0 ? errors : undefined,
        steps,
      };
    } catch (error: any) {
      console.error("[TestScenarioRunner] Fatal error in runImmortalityPlayableAgent:", error);
      errors.push(error.message || String(error));
      
      // Try to release wallet on fatal error
      if (testWallet?.id) {
        try {
          await testWalletService.releaseWallet(testWallet.id);
        } catch (releaseError: any) {
          console.error("[TestScenarioRunner] Failed to release wallet on error:", releaseError);
        }
      }
      
      return {
        success: false,
        errors,
        steps: steps.length > 0 ? steps : undefined,
      };
    }
  }

  /**
   * Batch generate demo users with test wallets
   */
  async runImmortalityDemoSeed(
    params: ImmortalityDemoSeedParams
  ): Promise<ScenarioResult> {
    const { wallets = 5, createMemories = false } = params;
    const results: Array<{
      userId: string;
      walletAddress: string;
      label: string;
      username?: string;
    }> = [];
    const errors: string[] = [];

    try {
      for (let i = 0; i < wallets; i++) {
        try {
          const label = `immortality-demo-${i + 1}`;
          const { testWallet } = await testWalletService.generateTestWallet(
            "immortality-demo-seed",
            label
          );

          // Create user
          const user = await storage.findOrCreateUserByWallet(testWallet.walletAddress);
          
          // Optionally create initial memories
          if (createMemories) {
            await storage.createUserMemory({
              userId: user.id,
              text: `这是 ${label} 的初始记忆`,
              emotion: "calm",
              tags: null,
              mediaUrl: null,
            });
          }

          // Link wallet to user
          await storage.updateTestWalletStatus(testWallet.id, "idle");
          // Note: We don't set userId on testWallet in the current schema, but we could update it

          results.push({
            userId: user.id,
            walletAddress: testWallet.walletAddress,
            label,
            username: user.username || undefined,
          });
        } catch (err: any) {
          errors.push(`Failed to create demo user ${i + 1}: ${err.message}`);
        }
      }

      return {
        success: errors.length === 0,
        result: results,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error: any) {
      console.error("[TestScenarioRunner] Fatal error in runImmortalityDemoSeed:", error);
      errors.push(error.message || String(error));
      return {
        success: false,
        errors,
      };
    }
  }
}

export const testScenarioRunner = new TestScenarioRunner();
