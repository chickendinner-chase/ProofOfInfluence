import { storage } from "../storage";
import { userVaultService } from "./userVaultService";
import { agentPermissionService } from "./agentPermissionService";
import { generateImmortalityReply } from "../chatbot/generateReply";
import { ethers } from "ethers";
import {
  createBaseSepoliaPublicClient,
  createWalletClientFromPrivateKey,
  simulateAndWriteContract,
  waitForTransaction,
} from "./blockchainUtils";

/**
 * Test Scenario Runner V2 - Enhanced with UserVault and permission model
 */

export type ScenarioName = "immortality-playable-agent" | "immortality-demo-seed";

interface ScenarioResult {
  success: boolean;
  runId?: string;
  steps?: Array<{
    name: string;
    status: "success" | "failed";
    output?: any;
    error?: { code: string; message: string; data?: any };
  }>;
  result?: any;
  error?: { code: string; message: string; data?: any };
}

interface ImmortalityMintConfig {
  method?: "mintSelf" | "mintFor";
  priceEth?: string;
}

interface ImmortalityPlayableAgentParams {
  chain?: string;
  memorySeed?: string[];
  chat?: {
    messages: Array<{ role: string; content: string }>;
  };
  /**
   * Mint 配置:
   * - undefined: 使用默认行为（按当前逻辑）
   * - 对象: 开启 mint，并按配置执行
   * - false: 显式关闭 mint（整个场景不铸造）
   */
  mint?: ImmortalityMintConfig | false;
}

/**
 * Test Scenario Runner V2
 */
export class TestScenarioRunnerV2 {
  private readonly IMMORTALITY_AI_AGENT_ID = "immortality-ai";
  private readonly BADGE_CONTRACT_ADDRESS =
    process.env.IMMORTALITY_BADGE_ADDRESS || process.env.VITE_IMMORTALITY_BADGE_ADDRESS;

  /**
   * Main router for scenario execution
   */
  async runScenario(
    scenarioKey: ScenarioName,
    demoUserId: string,
    params: Record<string, any> = {}
  ): Promise<ScenarioResult> {
    const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Create test run record
      const testRun = await storage.createTestRun({
        scenarioKey,
        demoUserId,
        status: "running",
      });

      let result: ScenarioResult;

      switch (scenarioKey) {
        case "immortality-playable-agent":
          result = await this.runImmortalityPlayableAgent(
            testRun.id,
            demoUserId,
            params as ImmortalityPlayableAgentParams
          );
          break;
        case "immortality-demo-seed":
          result = await this.runImmortalityDemoSeed(testRun.id, demoUserId, params);
          break;
        default:
          throw new Error(`Unknown scenario: ${scenarioKey}`);
      }

      // Update test run status
      await storage.updateTestRun(testRun.id, {
        status: result.success ? "success" : "failed",
        result: result.result || null,
      });

      return {
        ...result,
        runId: testRun.id,
      };
    } catch (error: any) {
      console.error(`[TestScenarioRunnerV2] Error running scenario ${scenarioKey}:`, error);

      return {
        success: false,
        runId,
        error: {
          code: "SCENARIO_FAILED",
          message: error.message || String(error),
        },
      };
    }
  }

  /**
   * Full E2E test: Create/select demo user → Vault → Memories → Chat → Mint → Verify
   */
  async runImmortalityPlayableAgent(
    runId: string,
    demoUserId: string,
    params: ImmortalityPlayableAgentParams = {}
  ): Promise<ScenarioResult> {
    const steps: ScenarioResult["steps"] = [];
    const chain = params.chain || "base-sepolia";
    const chainId = 84532; // base-sepolia
    const hasMintConfig = params.mint !== false && params.mint !== undefined;

    try {
      // Step 1: Allocate vault wallet
      await this.recordStep(runId, "allocate_vault_wallet", "success", {
        demoUserId,
        chain,
      });

      const vault = await userVaultService.getOrCreateDemoVault(demoUserId);
      const vaultWallet = await userVaultService.getNftWallet(vault.id, {
        chainId,
        network: chain,
      });

      steps.push({
        name: "allocate_vault_wallet",
        status: "success",
        output: {
          vaultId: vault.id,
          walletAddress: vaultWallet.walletAddress,
        },
      });

      // Step 2: Grant permissions to immortality-ai agent
      await agentPermissionService.grant(vault.id, this.IMMORTALITY_AI_AGENT_ID, [
        "memory.read",
        "memory.write",
        "chat.invoke",
        "badge.mint",
      ]);

      // Step 3: Initialize memories
      await agentPermissionService.assertAgentAllowed(
        vault.id,
        this.IMMORTALITY_AI_AGENT_ID,
        "memory.write"
      );

      const memorySeed = params.memorySeed || [
        "I am immortal.",
        "My badge proves it.",
        "POI is my RWA infra.",
      ];

      const createdMemories = [];
      // Use demo user ID for memories (consistent with vault owner)
      // The demo user was already created in getOrCreateDemoVault
      for (const text of memorySeed) {
        const memory = await storage.createUserMemory({
          userId: demoUserId,
          text,
          emotion: null,
          tags: null,
          mediaUrl: null,
        });
        createdMemories.push(memory);
      }

      steps.push({
        name: "initialize_memories",
        status: "success",
        output: { count: createdMemories.length },
      });
      await this.recordStep(runId, "initialize_memories", "success", {
        count: createdMemories.length,
      });

      // Step 4: AI Chat
      await agentPermissionService.assertAgentAllowed(
        vault.id,
        this.IMMORTALITY_AI_AGENT_ID,
        "chat.invoke"
      );

      const chatMessages =
        params.chat?.messages || [{ role: "user", content: "你是谁？你记得什么？" }];

      const openAiKey = process.env.OPENAI_API_KEY;
      if (!openAiKey) {
        const error = {
          code: "MODEL_AUTH",
          message: "OPENAI_API_KEY not configured",
        };
        steps.push({
          name: "ai_chat",
          status: "failed",
          error,
        });
        await this.recordStep(runId, "ai_chat", "failed", null, error);
      } else {
        // Use demo user ID (consistent with vault owner)
        // The demo user was already created in getOrCreateDemoVault
        const user = await storage.getUser(demoUserId);
        if (!user) {
          throw new Error(`Demo user not found: ${demoUserId}`);
        }

        const profile = await storage.getUserPersonalityProfile(demoUserId);
        const memories = await storage.listUserMemories({ userId: demoUserId, limit: 10 });

        const chatResults = [];
        for (const msg of chatMessages) {
          if (msg.role === "user") {
            const reply = await generateImmortalityReply({
              message: msg.content,
              profile: profile || null,
              memories,
              apiKey: openAiKey,
              modelName: process.env.OPENAI_MODEL,
            });
            chatResults.push({ message: msg.content, reply: reply.reply });
          }
        }

        steps.push({
          name: "ai_chat",
          status: "success",
          output: { hits: chatResults.map(() => true) },
        });
        await this.recordStep(runId, "ai_chat", "success", { results: chatResults });
      }

      // Step 5: Mint badge
      if (hasMintConfig) {
        const mintConfig = params.mint as ImmortalityMintConfig;
        await agentPermissionService.assertAgentAllowed(
          vault.id,
          this.IMMORTALITY_AI_AGENT_ID,
          "badge.mint"
        );

        if (!this.BADGE_CONTRACT_ADDRESS) {
          const error = {
            code: "NOT_FOUND",
            message: "IMMORTALITY_BADGE_ADDRESS not configured",
          };
          steps.push({
            name: "mint_badge",
            status: "failed",
            error,
          });
          await this.recordStep(runId, "mint_badge", "failed", null, error);
        } else {
          const mintMethod = mintConfig.method || "mintSelf";
          const priceEth = mintConfig.priceEth || "0";
          const priceWei = BigInt(Math.floor(parseFloat(priceEth) * 1e18));

          // Get private key from vault wallet metadata
          const privateKey = (vaultWallet.metadata as any)?.privateKey as string;
          if (!privateKey) {
            throw new Error("Private key not found in vault wallet metadata");
          }

          const publicClient = createBaseSepoliaPublicClient();
          const walletClient = createWalletClientFromPrivateKey(privateKey);

          // Contract ABI (includes errors for proper decoding)
          const abi = [
            {
              inputs: [],
              name: "mintSelf",
              outputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [{ internalType: "address", name: "to", type: "address" }],
              name: "mintFor",
              outputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
              stateMutability: "nonpayable",
              type: "function",
            },
            // Error definitions for decoding
            {
              inputs: [{ internalType: "address", name: "account", type: "address" }],
              name: "AlreadyMinted",
              type: "error",
            },
            {
              inputs: [
                { internalType: "uint256", name: "required", type: "uint256" },
                { internalType: "uint256", name: "provided", type: "uint256" },
              ],
              name: "InsufficientPayment",
              type: "error",
            },
            {
              inputs: [{ internalType: "uint256", name: "badgeType", type: "uint256" }],
              name: "BadgeDisabled",
              type: "error",
            },
            {
              inputs: [
                { internalType: "uint256", name: "badgeType", type: "uint256" },
                { internalType: "address", name: "account", type: "address" },
              ],
              name: "BadgeAlreadyClaimed",
              type: "error",
            },
          ] as const;

          // 在 mint_badge 步骤前添加诊断
          let shouldSkipMint = false;
          let skipReason = "";

          try {
            const badge = new ethers.Contract(
              this.BADGE_CONTRACT_ADDRESS,
              [
                "function paused() view returns (bool)",
                "function badgeTypes(uint256) view returns (bool enabled, bool transferable, string uri)",
                "function hasMinted(address) view returns (bool)",
                "function balanceOf(address) view returns (uint256)",
              ],
              walletClient
            );

            const isPaused = await badge.paused();
            const badgeType1 = await badge.badgeTypes(1);
            const alreadyMinted = await badge.hasMinted(vaultWallet.walletAddress);
            const balance = await badge.balanceOf(vaultWallet.walletAddress);

            // ethers v5 返回 BigNumber，需要转换为字符串或使用 gt(0) 方法
            const hasBalance = balance.gt(0);

            if (hasBalance || alreadyMinted) {
              shouldSkipMint = true;
              skipReason = "Address already has a badge";
            } else if (isPaused) {
              throw new Error("Contract is paused");
            } else if (!badgeType1.enabled) {
              throw new Error("Badge type 1 is not enabled");
            }

            console.log("[MintBadge] Diagnostic:", {
              isPaused,
              badgeTypeEnabled: badgeType1.enabled,
              alreadyMinted,
              balance: balance.toString(),
              shouldSkipMint,
            });
          } catch (diagnosticError: any) {
            console.error("[MintBadge] Diagnostic check failed:", diagnosticError);
            // 诊断失败不阻止执行，后面依旧尝试 mint
          }

          if (shouldSkipMint) {
            const output = {
              skipped: true,
              reason: skipReason,
              message: "Badge already exists, skipping mint",
            };

            steps.push({
              name: "mint_badge",
              status: "success",
              output,
            });

            await this.recordStep(runId, "mint_badge", "success", output);
          } else {
          const mintResult = await simulateAndWriteContract({
            provider: publicClient,
            signer: walletClient,
            contractAddress: this.BADGE_CONTRACT_ADDRESS,
              abi: abi as unknown as any[],
            functionName: mintMethod,
            args: mintMethod === "mintFor" ? [vaultWallet.walletAddress] : [],
            value: mintMethod === "mintSelf" ? priceWei : undefined,
          });

          if (mintResult.error) {
              const name = mintResult.error.name;
              const raw = mintResult.error.raw || "";

              const isAlreadyMinted =
                name === "AlreadyMinted" ||
                raw.includes("AlreadyMinted") ||
                raw.includes("already minted");

              if (isAlreadyMinted) {
                const output = {
                  skipped: true,
                  reason: "AlreadyMinted",
                  message: "Badge already exists (contract confirmed)",
                };

                steps.push({
                  name: "mint_badge",
                  status: "success",
                  output,
                });

                await this.recordStep(runId, "mint_badge", "success", output);
              } else {
            const error = {
              code: "CONTRACT_REVERT",
                  message: name || "Contract revert",
              data: {
                    errorName: name,
                errorArgs: mintResult.error.args,
              },
            };

            steps.push({
              name: "mint_badge",
              status: "failed",
              error,
            });

            await this.recordStep(runId, "mint_badge", "failed", null, error);
              }
          } else if (mintResult.txHash) {
            steps.push({
              name: "mint_badge",
              status: "success",
              output: { txHash: mintResult.txHash },
            });
            await this.recordStep(runId, "mint_badge", "success", {
              txHash: mintResult.txHash,
            });

            // Wait for confirmation (optional, can be async)
            try {
              await waitForTransaction(publicClient, mintResult.txHash, 1);
            } catch (waitErr) {
              console.warn("[TestRunner] Transaction confirmation wait failed:", waitErr);
              }
            }
          }
        }
      }

      // Step 6: Verify on-chain
      let verifyOutput: any = { owner: vaultWallet.walletAddress };
      if (this.BADGE_CONTRACT_ADDRESS && hasMintConfig) {
        try {
          const publicClient = createBaseSepoliaPublicClient();
          
          // ABI for reading contract state
          const readAbi = [
            {
              inputs: [{ internalType: "address", name: "account", type: "address" }],
              name: "hasMinted",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
              name: "ownerOf",
              outputs: [{ internalType: "address", name: "", type: "address" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [{ internalType: "address", name: "account", type: "address" }],
              name: "balanceOf",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
          ];

          const readContract = new ethers.Contract(
            this.BADGE_CONTRACT_ADDRESS,
            readAbi,
            publicClient
          );

          // Check if wallet has minted
          const hasMinted = await readContract.hasMinted(vaultWallet.walletAddress);
          const balance = await readContract.balanceOf(vaultWallet.walletAddress);
          const balanceBN = ethers.BigNumber.from(balance);

          verifyOutput = {
            owner: vaultWallet.walletAddress,
            hasMinted,
            balance: balanceBN.toString(),
            verified: hasMinted && balanceBN.gt(0),
          };
        } catch (verifyErr: any) {
          console.warn("[TestRunner] Verify step failed:", verifyErr);
          verifyOutput.error = verifyErr.message;
        }
      }

      steps.push({
        name: "verify",
        status: verifyOutput.error ? "failed" : "success",
        output: verifyOutput,
      });
      await this.recordStep(
        runId,
        "verify",
        verifyOutput.error ? "failed" : "success",
        verifyOutput
      );

      return {
        success: true,
        steps,
        result: {
          userId: demoUserId,
          vaultId: vault.id,
          walletAddress: vaultWallet.walletAddress,
          memoriesCreated: createdMemories.length,
        },
      };
    } catch (error: any) {
      console.error("[TestScenarioRunnerV2] Fatal error:", error);

      const errorObj = {
        code: error.code || "SCENARIO_FAILED",
        message: error.message || String(error),
        data: error.data,
      };

      steps.push({
        name: "fatal_error",
        status: "failed",
        error: errorObj,
      });

      await this.recordStep(runId, "fatal_error", "failed", null, errorObj);

      return {
        success: false,
        steps,
        error: errorObj,
      };
    }
  }

  /**
   * Batch generate demo users
   */
  async runImmortalityDemoSeed(
    runId: string,
    demoUserId: string,
    params: { wallets?: number; createMemories?: boolean } = {}
  ): Promise<ScenarioResult> {
    const { wallets = 5, createMemories = false } = params;
    const results: any[] = [];

    for (let i = 0; i < wallets; i++) {
      const demoId = `demo-${Date.now()}-${i}`;
      const vault = await userVaultService.getOrCreateDemoVault(demoId);
      const vaultWallet = await userVaultService.getNftWallet(vault.id);

      if (createMemories) {
        let user = await storage.getUserByWallet(vaultWallet.walletAddress);
        if (!user) {
          user = await storage.findOrCreateUserByWallet(vaultWallet.walletAddress);
        }
        await storage.createUserMemory({
          userId: user.id,
          text: `Initial memory for ${demoId}`,
          emotion: null,
          tags: null,
          mediaUrl: null,
        });
      }

      results.push({
        userId: demoId,
        vaultId: vault.id,
        walletAddress: vaultWallet.walletAddress,
      });
    }

    return {
      success: true,
      result: results,
    };
  }

  /**
   * Record a test step
   */
  private async recordStep(
    runId: string,
    name: string,
    status: "success" | "failed",
    output?: any,
    error?: { code: string; message: string; data?: any }
  ): Promise<void> {
    await storage.createTestStep({
      runId,
      name,
      status,
      input: null,
      output: output || null,
      error: error || null,
    });
  }
}

export const testScenarioRunnerV2 = new TestScenarioRunnerV2();
