// Backend API routes - includes Replit Auth integration from blueprint:javascript_log_in_with_replit
import express, { type Express, type Request } from "express";
import { createServer, type Server } from "http";
import { ethers } from "ethers";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { isAuthenticated } from "./auth";
import { insertProfileSchema, insertLinkSchema } from "@shared/schema";
import { stripe } from "./stripe";
import { registerMarketRoutes } from "./routes/market";
import { registerReservePoolRoutes } from "./routes/reservePool";
import { registerMerchantRoutes } from "./routes/merchant";
import { registerAirdropRoutes } from "./routes/airdrop";
import { registerReferralContractRoutes } from "./routes/referral";
import { registerBadgeRoutes } from "./routes/badge";
import { mintTestBadge } from "./agentkit";
import { generateImmortalityReply } from "./chatbot/generateReply";
import { z } from "zod";
import { contractService } from "./services/contracts";
import { createWalletNonce, getWalletNonce, consumeWalletNonce } from "./auth/walletNonce";
import { approveSpender, getAllowance } from "./agentkit/erc20";
import tgeContract from "@shared/contracts/poi_tge.json";
import usdcContract from "@shared/contracts/poi_tge.json";
import { getSaleStatus } from "./agentkit/tge";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const tgeSaleAddress =
  process.env.TGESALE_ADDRESS ||
  process.env.VITE_TGESALE_ADDRESS ||
  process.env.NEXT_PUBLIC_TGESALE_ADDRESS ||
  "";
const tgeRpcUrl =
  process.env.TGE_RPC_URL ||
  process.env.BASE_RPC_URL ||
  process.env.VITE_BASE_RPC_URL ||
  "https://mainnet.base.org";
const tgeProvider = new ethers.providers.JsonRpcProvider(tgeRpcUrl);
const tgeSaleAbi = [
  "function purchase(uint256 usdcAmount, bytes32[] calldata proof)",
  "function currentTier() view returns (uint256)",
  "function tiers(uint256) view returns (uint256 pricePerToken, uint256 remainingTokens)",
  "function minContribution() view returns (uint256)",
  "function maxContribution() view returns (uint256)",
  "function totalRaised() view returns (uint256)",
];

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User {
      claims?: {
        sub: string;
        email?: string;
        first_name?: string;
        last_name?: string;
        profile_image_url?: string;
      };
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  registerMarketRoutes(app);
  registerReservePoolRoutes(app);
  registerMerchantRoutes(app);
  registerAirdropRoutes(app);
  registerReferralContractRoutes(app);
  registerBadgeRoutes(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Auto-create profile on first login if it doesn't exist
      if (user) {
        const existingProfile = await storage.getProfile(userId);
        if (!existingProfile) {
          const defaultName = user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.firstName || user.email?.split('@')[0] || 'User';
          
          await storage.createProfile({
            userId,
            name: defaultName,
            bio: null,
            avatarUrl: user.profileImageUrl || null,
            googleUrl: null,
            twitterUrl: null,
            weiboUrl: null,
            tiktokUrl: null,
            isPublic: false, // Profile is private by default until user sets username
          });
        }
      }
      
      // Development mode: Grant admin access to all users if DEV_MODE_ADMIN is enabled
      // IMPORTANT: Only works when NODE_ENV is explicitly set to 'development' for security
      // This prevents accidental admin access in production or staging environments
      const isDevelopment = process.env.NODE_ENV === 'development';
      const devModeAdmin = process.env.DEV_MODE_ADMIN === 'true';
      
      if (user && isDevelopment && devModeAdmin) {
        // Override user role to admin in development mode for testing
        user.role = 'admin';
        console.log(`[DEV MODE] Admin access granted to user ${user.email || user.id}`);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Wallet Authentication
  app.get("/api/auth/wallet/nonce", async (req: any, res) => {
    const address = String(req.query.address || "").toLowerCase();
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ message: "Invalid address" });
    }
    
    const nonce = createWalletNonce(address);
    
    // SIWE-style message format
    const domain = process.env.APP_DOMAIN || req.hostname || "proofofinfluence.com";
    const message = [
      "Login to ProofOfInfluence",
      `Domain: ${domain}`,
      `Wallet: ${address}`,
      `Nonce: ${nonce}`,
      `Time: ${new Date().toISOString()}`,
    ].join("\n");
    
    res.json({ address, nonce, message });
  });

  app.post("/api/auth/wallet/login", async (req: any, res) => {
    try {
      const { address, signature, message } = req.body as {
        address?: string;
        signature?: string;
        message?: string;
      };

      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(400).json({ message: "Invalid address" });
      }

      if (!signature) {
        return res.status(400).json({ message: "Signature is required" });
      }

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const normalized = address.toLowerCase();

      // 1) Get and verify nonce
      const expectedNonce = getWalletNonce(normalized);
      if (!expectedNonce) {
        return res.status(401).json({ message: "Nonce expired or not found. Please request a new nonce." });
      }

      // Check if message contains the expected nonce
      if (!message.includes(expectedNonce)) {
        return res.status(401).json({ message: "Nonce mismatch. Message does not contain expected nonce." });
      }

      // 2) Verify signature using the message provided by frontend
      let recovered: string;
      try {
        recovered = ethers.utils.verifyMessage(message, signature).toLowerCase();
      } catch (error) {
        return res.status(401).json({ message: "Invalid signature format." });
      }

      if (recovered !== normalized) {
        return res.status(401).json({ message: "Signature verification failed. Signature does not match address." });
      }

      // 3) Consume nonce to prevent replay attacks
      if (!consumeWalletNonce(normalized, expectedNonce)) {
        return res.status(401).json({ message: "Nonce already used. Please request a new nonce." });
      }

      // 4) Get or create user
      let user = await storage.getUserByWallet(normalized);
      if (!user) {
        // Create new user with wallet address
        const userId = `wallet_${normalized.slice(2, 10)}_${Date.now()}`;
        // First create user with minimal data
        user = await storage.upsertUser({
          id: userId,
        });
        // Then update wallet address
        user = await storage.updateUserWallet(userId, normalized);
      } else {
        // Update last login time (updateUserWallet also updates updatedAt)
        user = await storage.updateUserWallet(user.id, normalized);
      }

      // 5) Set wallet user in session
      const { setWalletAuthUser } = await import("./auth/walletAuth");
      setWalletAuthUser(req, {
        id: user.id,
        walletAddress: normalized,
        email: user.email,
        role: user.role,
      });

      // 6) Explicitly save session to ensure it's written to store
      await new Promise<void>((resolve, reject) => {
        (req.session as any).save((err: any) => (err ? reject(err) : resolve()));
      });

      res.json({
        user: {
          id: user.id,
          walletAddress: normalized,
          email: user.email,
          role: user.role,
        },
        authenticated: true,
      });
    } catch (error: any) {
      console.error("[WalletAuth] Login error:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  // Early-Bird Registration

  app.post("/api/early-bird/register", async (req: any, res) => {
    const schema = z.object({
      email: z.string().email(),
      wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      referrerCode: z.string().optional(),
    });

    let body: z.infer<typeof schema>;
    try {
      body = schema.parse(req.body);
    } catch (err: any) {
      return res.status(400).json({ message: err?.message ?? "Invalid data" });
    }

    try {
      const email = body.email.toLowerCase();
      const wallet = body.wallet.toLowerCase();

      // Upsert registration
      const registration = await storage.createEarlyBirdRegistration({
        email,
        wallet,
        referrerCode: body.referrerCode,
      } as any);

      res.json({
        id: registration.id,
        status: registration.status,
        referralCode: registration.referralCode,
      });
    } catch (error: any) {
      console.error("Early-bird register error:", error);
      res.status(500).json({ message: "Failed to register" });
    }
  });

  app.post("/api/early-bird/register-and-claim", async (req: any, res) => {
    const schema = z.object({
      email: z.string().email(),
      walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      signature: z.string(),
      referrerCode: z.string().optional(),
    });

    let body: z.infer<typeof schema>;
    try {
      body = schema.parse(req.body);
    } catch (err: any) {
      return res.status(400).json({ message: err?.message ?? "Invalid data" });
    }

    const wallet = body.walletAddress.toLowerCase();
    try {
      // Verify nonce
      const nonce = getWalletNonce(wallet);
      if (!nonce) {
        return res.status(400).json({ message: "Nonce expired or not found" });
      }
      const message = `Sign this nonce to prove ownership: ${nonce}`;
      const recovered = ethers.utils.verifyMessage(message, body.signature);
      if (recovered.toLowerCase() !== wallet) {
        return res.status(400).json({ message: "Invalid signature" });
      }
      if (!consumeWalletNonce(wallet, nonce)) {
        return res.status(400).json({ message: "Nonce already used" });
      }

      // Upsert registration with verify token
      const verifyToken = ethers.utils.hexlify(ethers.utils.randomBytes(16));
      const registration = await storage.createEarlyBirdRegistration({
        email: body.email.toLowerCase(),
        wallet,
        referrerCode: body.referrerCode,
        verifyToken,
      } as any);

      const origin = `${req.protocol}://${req.get("host")}`;
      const confirmUrl = `${origin}/api/auth/identities/claim?token=${verifyToken}`;

      res.json({
        id: registration.id,
        status: registration.status,
        token: verifyToken,
        confirmUrl,
      });
    } catch (error: any) {
      console.error("Early-bird register-and-claim error:", error);
      res.status(500).json({ message: "Failed to register" });
    }
  });

  app.get("/api/early-bird/verify", async (req: any, res) => {
    const token = String(req.query.token || "");
    if (!token) {
      return res.status(400).json({ message: "Missing token" });
    }

    try {
      const result = await storage.verifyEarlyBirdRegistration(token);
      if (!result) {
        return res.status(400).json({ message: "Invalid token" });
      }
      res.json({ status: "verified" });
    } catch (error: any) {
      console.error("Early-bird verify error:", error);
      res.status(500).json({ message: "Failed to verify" });
    }
  });

  app.post("/api/auth/identities/claim", isAuthenticated, async (req: any, res) => {
    const schema = z.object({
      token: z.string().min(8),
    });

    let body: z.infer<typeof schema>;
    try {
      body = schema.parse(req.body);
    } catch (err: any) {
      return res.status(400).json({ message: err?.message ?? "Invalid data" });
    }

    try {
      const claimed = await storage.verifyEarlyBirdRegistration(body.token);
      if (!claimed) {
        return res.status(400).json({ message: "Invalid or used token" });
      }

      const userId = req.user.claims.sub;
      // Prevent binding same wallet to different users
      const existing = await storage.findIdentity("wallet", undefined, claimed.wallet);
      if (existing && existing.userId !== userId) {
        return res.status(400).json({ message: "Wallet already bound to another account" });
      }

      const identity = await storage.upsertIdentity({
        userId,
        provider: "wallet",
        walletAddress: claimed.wallet,
        email: claimed.email,
        emailVerified: false,
      } as any);

      res.json({ status: "bound", identity });
    } catch (error: any) {
      console.error("Claim identity error:", error);
      res.status(500).json({ message: "Failed to claim identity" });
    }
  });

  // Profile routes
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertProfileSchema.parse({ ...req.body, userId });
      const profile = await storage.createProfile(validatedData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(400).json({ message: "Failed to create profile" });
    }
  });

  app.patch("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // If username is being updated, check if it's unique
      if (req.body.username) {
        const user = await storage.getUser(userId);
        if (user && user.username !== req.body.username) {
          const existingUser = await storage.getUserByUsername(req.body.username);
          if (existingUser) {
            return res.status(400).json({ message: "Username already taken" });
          }
          // Update username on user table
          await storage.updateUserUsername(userId, req.body.username);
          // Make profile public when username is set
          req.body.isPublic = true;
        }
        // Remove username from profile updates (it's stored in users table)
        delete req.body.username;
      }
      
      const profile = await storage.updateProfile(userId, req.body);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  const personalitySchema = z.object({
    mbtiType: z.string().max(4).optional(),
    mbtiScores: z
      .record(z.number().min(0).max(1))
      .optional(),
    values: z
      .record(z.number().min(0).max(1))
      .optional(),
  });

  app.get("/api/me/personality", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserPersonalityProfile(userId);
      res.json(profile ?? null);
    } catch (error) {
      console.error("Error fetching personality profile:", error);
      res.status(500).json({ message: "Failed to fetch personality profile" });
    }
  });

  app.post("/api/me/personality", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = personalitySchema.parse(req.body);
      const profile = await storage.upsertUserPersonalityProfile({
        userId,
        mbtiType: validated.mbtiType ?? null,
        mbtiScores: validated.mbtiScores ?? null,
        values: validated.values ?? null,
      });
      res.json(profile);
    } catch (error: any) {
      console.error("Error saving personality profile:", error);
      res.status(400).json({ message: "Failed to save personality profile", details: error.message });
    }
  });

  const memorySchema = z.object({
    text: z.string().min(1).max(2000),
    emotion: z.string().max(32).optional(),
  });
  const chatMessageSchema = z.object({
    message: z.string().min(1),
  });

  app.get("/api/me/memories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = Number(req.query.limit) || 20;
      const cappedLimit = Math.min(Math.max(limit, 1), 50);
      const memories = await storage.listUserMemories({ userId, limit: cappedLimit });
      res.json(memories);
    } catch (error) {
      console.error("Error fetching memories:", error);
      res.status(500).json({ message: "Failed to fetch memories" });
    }
  });

  app.post("/api/me/memories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = memorySchema.parse(req.body);
      const memory = await storage.createUserMemory({
        userId,
        text: validated.text,
        emotion: validated.emotion ?? null,
        tags: null,
        mediaUrl: null,
      });
      res.json(memory);
    } catch (error: any) {
      console.error("Error creating memory:", error);
      res.status(400).json({ message: "Failed to create memory", details: error.message });
    }
  });

  app.post("/api/chat", isAuthenticated, async (req: any, res) => {
    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      return res.status(503).json({ message: "Chat service not configured" });
    }

    let body;
    try {
      body = chatMessageSchema.parse(req.body);
    } catch (error: any) {
      return res.status(400).json({ message: error?.message ?? "Invalid request" });
    }

    const userId = req.user.claims.sub;
    try {
      const [profile, memories] = await Promise.all([
        storage.getUserPersonalityProfile(userId),
        storage.listUserMemories({ userId, limit: 10 }),
      ]);

      const { reply, suggestedActions } = await generateImmortalityReply({
        message: body.message,
        profile,
        memories,
        apiKey: openAiKey,
        modelName: process.env.OPENAI_MODEL,
      });

      res.json({
        reply,
        profileUsed: !!profile,
        memoryCount: memories.length,
        suggestedActions,
      });
    } catch (error: any) {
      console.error("Error generating chat reply:", error);
      res.status(500).json({ message: "Failed to generate reply" });
    }
  });

  app.post("/api/immortality/actions/mint-test-badge", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.walletAddress) {
        return res.status(400).json({ message: "请先绑定钱包地址" });
      }

      const action = await storage.createAgentkitAction({
        userId,
        actionType: "MINT_TEST_BADGE",
        status: "pending",
        requestPayload: { badgeId: 1 },
        metadata: { network: process.env.AGENTKIT_DEFAULT_CHAIN || "base-sepolia" },
      });

      try {
        const txHash = await mintTestBadge(user.walletAddress);
        await storage.updateAgentkitAction(action.id, {
          status: "success",
          txHash,
        });
        res.json({ actionId: action.id, status: "success", txHash });
      } catch (err: any) {
        await storage.updateAgentkitAction(action.id, {
          status: "failed",
          errorMessage: err?.message ?? "Unknown error",
        });
        throw err;
      }
    } catch (error: any) {
      console.error("Error minting badge:", error);
      res.status(500).json({ message: "Failed to mint badge", details: error?.message });
    }
  });

  // Unified contract action endpoint
  // Supports both user-wallet mode (returns tx data) and agentkit mode (executes via backend)
  app.post("/api/contracts/:contract/:action", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { contract, action } = req.params;
    const { mode = "agentkit", args = {} } = req.body;

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // For agentkit mode, user must have linked wallet
      if (mode === "agentkit" && !user.walletAddress) {
        return res.status(400).json({ message: "请先绑定钱包地址" });
      }

      // Check if contract is deployed
      if (!contractService.isContractDeployed(contract)) {
        return res.status(400).json({ 
          message: `Contract ${contract} is not deployed yet`,
          contract,
        });
      }

      // For agentkit mode, create action record
      let actionRecord: any = null;
      if (mode === "agentkit") {
        const actionType = `${contract.toUpperCase()}_${action.toUpperCase()}`;
        actionRecord = await storage.createAgentkitAction({
          userId,
          actionType,
          status: "pending",
          requestPayload: args,
          metadata: { 
            contract,
            action,
            network: process.env.AGENTKIT_DEFAULT_CHAIN || "base-sepolia" 
          },
        });
      }

      try {
        const result = await contractService.call(contract, action, args, {
          mode,
          userWallet: user.walletAddress || undefined,
        });

        // Update action record if in agentkit mode
        if (mode === "agentkit" && actionRecord && result.txHash) {
          await storage.updateAgentkitAction(actionRecord.id, {
            status: "success",
            txHash: result.txHash,
          });
        }

        res.json({
          ...(actionRecord ? { actionId: actionRecord.id } : {}),
          status: mode === "agentkit" ? "success" : "prepared",
          mode,
          ...result,
        });
      } catch (err: any) {
        // Update action record on failure
        if (mode === "agentkit" && actionRecord) {
          await storage.updateAgentkitAction(actionRecord.id, {
            status: "failed",
            errorMessage: err?.message ?? "Unknown error",
          });
        }
        throw err;
      }
    } catch (error: any) {
      console.error(`Error executing ${contract}.${action}:`, error);
      res.status(500).json({ 
        message: `Failed to execute ${action}`,
        contract,
        action,
        details: error?.message 
      });
    }
  });

  // Unified identity endpoints
  app.get("/api/auth/identities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const identities = await storage.getUserIdentities(userId);
      res.json({ identities });
    } catch (error: any) {
      console.error("List identities error:", error);
      res.status(500).json({ message: "Failed to list identities" });
    }
  });

  // TGE public status (optional wallet query)
  app.get("/api/tge/status", async (req: any, res) => {
    try {
      const wallet = (req.query.wallet as string | undefined) || undefined;
      const status = await getSaleStatus(wallet);
      res.json(status);
    } catch (error: any) {
      console.error("Get TGE status error:", error);
      res.status(500).json({ message: "Failed to fetch TGE status" });
    }
  });

  // AgentKit USDC approve helper (secured by allowlist)
  app.post("/api/contracts/USDC/approve", isAuthenticated, async (req: any, res) => {
    const schema = z.object({
      amount: z.string().min(1), // wei-like smallest unit (6 decimals for USDC)
      spender: z.string().optional(), // default to TGESale address
    });
    let body: z.infer<typeof schema>;
    try {
      body = schema.parse(req.body);
    } catch (err: any) {
      return res.status(400).json({ message: err?.message ?? "Invalid data" });
    }

    try {
      const spender = body.spender || (tgeContract.address as string);
      // Allowlist token address from env (preferred) or from config on server
      const token = process.env.USDC_TOKEN_ADDRESS;
      if (!token || token === "0x0000000000000000000000000000000000000000") {
        return res.status(400).json({ message: "USDC token address not configured on server" });
      }
      if (!spender || spender === "0x0000000000000000000000000000000000000000") {
        return res.status(400).json({ message: "TGESale address not configured" });
      }

      // Optional: check current allowance for AgentKit wallet
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const current = await getAllowance(token, /* owner is AgentKit wallet */ process.env.CDP_WALLET_ADDRESS || "0x0000000000000000000000000000000000000000", spender);

      const txHash = await approveSpender(token as `0x${string}`, spender as `0x${string}`, body.amount);
      res.json({ status: "success", txHash, previousAllowance: current });
    } catch (error: any) {
      console.error("USDC approve error:", error);
      res.status(500).json({ message: "Failed to approve USDC", details: error?.message });
    }
  });

  app.post("/api/auth/identities/bind", isAuthenticated, async (req: any, res) => {
    const schema = z.object({
      provider: z.enum(["email", "google", "apple", "wallet", "replit"]),
      providerUserId: z.string().optional(),
      email: z.string().email().optional(),
      walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
      emailVerified: z.boolean().optional(),
    });

    let body: z.infer<typeof schema>;
    try {
      body = schema.parse(req.body);
    } catch (err: any) {
      return res.status(400).json({ message: err?.message ?? "Invalid data" });
    }

    try {
      const userId = req.user.claims.sub;

      // Prevent binding same wallet to different users
      if (body.walletAddress) {
        const existing = await storage.findIdentity("wallet", undefined, body.walletAddress);
        if (existing && existing.userId !== userId) {
          return res.status(400).json({ message: "Wallet already bound to another account" });
        }
      }

      const identity = await storage.upsertIdentity({
        userId,
        provider: body.provider,
        providerUserId: body.providerUserId,
        email: body.email,
        emailVerified: body.emailVerified ?? false,
        walletAddress: body.walletAddress,
      } as any);

      res.json({ identity });
    } catch (error: any) {
      console.error("Bind identity error:", error);
      res.status(500).json({ message: "Failed to bind identity" });
    }
  });

  // Public profile route (no auth required)
  app.get("/api/profile/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const profile = await storage.getProfile(user.id);
      if (!profile || !profile.isPublic) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const links = await storage.getVisibleLinks(user.id);
      console.log('[DEBUG] Public profile - user.id:', user.id, 'links found:', links.length, 'links:', JSON.stringify(links));
      
      // Increment profile views
      await storage.incrementProfileViews(user.id);

      res.json({ profile, links, user });
    } catch (error) {
      console.error("Error fetching public profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Link routes
  app.get("/api/links", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const links = await storage.getLinks(userId);
      res.json(links);
    } catch (error) {
      console.error("Error fetching links:", error);
      res.status(500).json({ message: "Failed to fetch links" });
    }
  });

  app.post("/api/links", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertLinkSchema.parse({ ...req.body, userId });
      const link = await storage.createLink(validatedData);
      res.json(link);
    } catch (error) {
      console.error("Error creating link:", error);
      res.status(400).json({ message: "Failed to create link" });
    }
  });

  app.patch("/api/links/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const link = await storage.updateLink(id, req.body);
      res.json(link);
    } catch (error) {
      console.error("Error updating link:", error);
      res.status(400).json({ message: "Failed to update link" });
    }
  });

  app.delete("/api/links/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLink(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting link:", error);
      res.status(400).json({ message: "Failed to delete link" });
    }
  });

  app.post("/api/links/reorder", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { linkIds } = req.body;
      await storage.reorderLinks(userId, linkIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering links:", error);
      res.status(400).json({ message: "Failed to reorder links" });
    }
  });

  // Link click tracking (public route)
  app.post("/api/links/:id/click", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementLinkClicks(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking link click:", error);
      res.status(500).json({ message: "Failed to track click" });
    }
  });

  // Web3 wallet routes
  app.post("/api/wallet/connect", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletAddress, signature } = req.body;

      if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({ message: "Invalid wallet address" });
      }

      const wallet = walletAddress.toLowerCase();

      // Verify signature if provided
      if (signature) {
        // Verify nonce
        const nonce = getWalletNonce(wallet);
        if (!nonce) {
          return res.status(400).json({ message: "Nonce expired or not found. Please request a new nonce." });
        }

        const message = `Sign this nonce to prove ownership: ${nonce}`;
        const recovered = ethers.utils.verifyMessage(message, signature);
        
        if (recovered.toLowerCase() !== wallet) {
          return res.status(400).json({ message: "Invalid signature. Signature does not match wallet address." });
        }

        // Consume nonce to prevent replay attacks
        if (!consumeWalletNonce(wallet, nonce)) {
          return res.status(400).json({ message: "Nonce already used. Please request a new nonce." });
        }
      } else {
        // If no signature provided, warn but allow (for backward compatibility during transition)
        console.warn(`Wallet connection without signature for user ${userId}, wallet ${wallet}`);
      }
      
      const user = await storage.updateUserWallet(userId, wallet);
      res.json(user);
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      res.status(400).json({ message: error.message || "Failed to connect wallet" });
    }
  });

  app.delete("/api/wallet/disconnect", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.updateUserWallet(userId, "");
      res.json(user);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      res.status(400).json({ message: "Failed to disconnect wallet" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const links = await storage.getLinks(userId);
      const profile = await storage.getProfile(userId);

      const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
      const topLinks = [...links].sort((a, b) => b.clicks - a.clicks).slice(0, 5);

      res.json({
        totalClicks,
        totalViews: profile?.totalViews || 0,
        topLinks,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const stripeWebhookMiddleware = express.raw({ type: "application/json" });

  const handleStripeWebhook = async (req: any, res: any) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn("Warning: STRIPE_WEBHOOK_SECRET is not set. Webhook signature verification disabled.");
    }

    let event;

    try {
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        event = JSON.parse(req.body.toString());
      }
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const sessionId = session.id;
          console.log("Payment successful for session:", sessionId);

          const transaction = await storage.getTransactionBySessionId(sessionId);
          if (transaction) {
            await storage.updateTransaction(transaction.id, {
              status: "completed",
              stripePaymentIntentId: session.payment_intent as string,
              email: session.customer_email || transaction.email || null,
            });
          }

          const fiatTx = await storage.getFiatTransactionBySessionId(sessionId);
          if (fiatTx && fiatTx.status !== "completed") {
            await storage.updateFiatTransaction(fiatTx.id, {
              status: "completed",
              metadata: {
                ...(fiatTx.metadata || {}),
                eventId: event.id,
                paymentIntentId: session.payment_intent,
              },
            });

            if (fiatTx.userId && fiatTx.credits > 0) {
              await storage.adjustImmortalityCredits({
                userId: fiatTx.userId,
                credits: fiatTx.credits,
                source: "stripe",
                reference: sessionId,
                metadata: {
                  amountFiat: fiatTx.amountFiat,
                  currency: fiatTx.currency,
                },
              });
            }
          }
          break;
        }

        case "checkout.session.expired":
        case "checkout.session.async_payment_failed":
        case "checkout.session.async_payment_expired": {
          const session = event.data.object;
          const sessionId = session.id;
          console.log("Payment session expired/failed:", sessionId);

          const transaction = await storage.getTransactionBySessionId(sessionId);
          if (transaction && transaction.status === "pending") {
            await storage.updateTransaction(transaction.id, {
              status: "failed",
            });
          }

          await storage.updateFiatTransactionBySessionId(sessionId, {
            status: "failed",
          });
          break;
        }

        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object;
          console.log("Payment failed:", paymentIntent.id);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  };

  app.post("/api/stripe-webhook", stripeWebhookMiddleware, handleStripeWebhook);
  app.post("/api/stripe/webhook", stripeWebhookMiddleware, handleStripeWebhook);

  const createCheckoutSessionLegacy = async (req: any, res: any, requireAuth: boolean) => {
    try {
      const { amount, purpose } = req.body;

      if (!amount || amount < 1 || amount > 10000) {
        return res.status(400).json({ message: "Invalid amount. Must be between $1 and $10,000" });
      }
      if (!purpose || typeof purpose !== "string") {
        return res.status(400).json({ message: "Payment purpose is required" });
      }
      if (requireAuth && !req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const baseUrl = process.env.BASE_URL || "http://localhost:5173";
      const amountInCents = Math.round(amount * 100);
      
      // Get current user if logged in
      const userId = req.user?.id;
      const userEmail = req.user?.email;

      // Create transaction record in database
      const transaction = await storage.createTransaction({
        userId: userId || null,
        stripeSessionId: null, // Will be updated after Stripe session creation
        amount: amountInCents,
        currency: 'usd',
        status: 'pending',
        poiTokens: Math.round(amount), // 1:1 ratio with USD
        email: userEmail || null,
        metadata: {
          purpose,
          createdFrom: 'web',
        },
      });

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: userEmail || undefined,
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: purpose,
              description: `ProofOfInfluence - ${purpose}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}`,
        metadata: {
          transactionId: transaction.id,
          userId: userId || 'anonymous',
          poiTokens: Math.round(amount).toString(),
        },
      });

      // Update transaction with Stripe session ID
      await storage.updateTransaction(transaction.id, {
        stripeSessionId: session.id,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  };

  // Stripe payment routes (legacy)
  app.post("/api/create-checkout-session", async (req: any, res) => {
    await createCheckoutSessionLegacy(req, res, false);
  });

  // Stripe payment routes (ledger-aware)
  app.post("/api/stripe/create-checkout-session", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, currency = "usd" } = req.body;
      const userId = req.user.claims.sub;
      const userEmail = req.user.claims.email;

      if (!amount || amount < 1 || amount > 10000) {
        return res.status(400).json({ message: "Amount must be between $1 and $10,000" });
      }

      const amountInCents = Math.round(amount * 100);
      const credits = Math.round(amount);
      const baseUrl = process.env.BASE_URL || "http://localhost:5173";

      const fiatTx = await storage.createFiatTransaction({
        userId,
        amountFiat: amountInCents,
        currency,
        status: "pending",
        credits,
        metadata: {
          origin: "recharge",
        },
        stripeSessionId: null,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: userEmail || undefined,
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: "Immortality Credits",
                description: "Recharge credits for ProjectX Immortality services",
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/recharge?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/recharge`,
        metadata: {
          fiatTransactionId: fiatTx.id,
          userId,
          credits: credits.toString(),
        },
      });

      await storage.updateFiatTransaction(fiatTx.id, { stripeSessionId: session.id });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating Stripe checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.get("/api/immortality/balance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const balance = await storage.getUserBalance(userId);
      res.json({
        credits: balance?.immortalityCredits ?? 0,
        poiCredits: balance?.poiCredits ?? 0,
      });
    } catch (error) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });

  // Get transaction details by session ID
  app.get("/api/transaction/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      const transaction = await storage.getTransactionBySessionId(sessionId);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  // Get user's transaction history (requires authentication)
  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const transactions = await storage.getUserTransactions(userId);
      
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // POI Tier routes
  app.get("/api/poi/tiers", async (req, res) => {
    try {
      const tiers = await storage.getAllTiers();
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching tiers:", error);
      res.status(500).json({ message: "Failed to fetch tiers" });
    }
  });

  app.get("/api/poi/me/tier", isAuthenticated, async (req: any, res) => {
    // TODO: Implement real POI tier logic when POI-based perks/levels are defined.
    // For now this endpoint is a placeholder and always returns tier "none".
    // Frontend currently queries POI balance directly on-chain via usePoiToken hook.
    
    res.json({
      tier: "none",
      poiBalance: null,
      rulesVersion: 0
    });
  });

  // POI Fee Credit routes
  app.get("/api/poi/me/fee-credits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const feeCredit = await storage.getFeeCredit(userId);
      
      res.json({
        balanceCents: feeCredit?.balanceCents || 0,
      });
    } catch (error) {
      console.error("Error fetching fee credits:", error);
      res.status(500).json({ message: "Failed to fetch fee credits" });
    }
  });


  // Checkout routes
  app.post("/api/checkout/quote", async (req, res) => {
    try {
      const {
        items,
        fees,
        region,
        applyTier,
        applyFeeCreditsCents,
      } = req.body;

      // Validate inputs
      if (!items || !fees) {
        return res.status(400).json({ message: "items and fees are required" });
      }

      // Calculate item total
      const itemTotalCents = items.reduce((sum: number, item: any) => sum + item.priceCents, 0);
      
      // Calculate original fee total
      const feeOriginalCents = (fees.platformFeeCents || 0) + 
                               (fees.authFeeCents || 0) + 
                               (fees.custodyFeeCents || 0);

      let tierDiscountCents = 0;
      let shippingCreditAppliedCents = 0;
      let feeCreditsAppliedCents = 0;

      // Apply tier discount if requested
      if (applyTier && req.user) {
        // TODO: Get actual user tier based on POI balance
        const mockPoiBalance = 0;
        const userTier = await storage.getUserTier(mockPoiBalance);
        
        if (userTier) {
          // Apply discount to platform fee only
          const discountRate = parseFloat(userTier.feeDiscountRate);
          tierDiscountCents = Math.floor((fees.platformFeeCents || 0) * discountRate);
          
          // Apply shipping credit cap
          shippingCreditAppliedCents = Math.min(
            fees.shippingCents || 0,
            userTier.shippingCreditCapCents
          );
        }
      }

      // Apply fee credits if requested
      if (applyFeeCreditsCents && applyFeeCreditsCents > 0 && req.user) {
        const userId = req.user.claims?.sub;
        if (userId) {
          const feeCredit = await storage.getFeeCredit(userId);
          const availableCredits = feeCredit?.balanceCents || 0;

          // Max 20% of total fees can be paid with credits
          const maxFeeCreditCents = Math.floor(feeOriginalCents * 0.20);
          
          feeCreditsAppliedCents = Math.min(
            applyFeeCreditsCents,
            availableCredits,
            maxFeeCreditCents
          );
        }
      }

      const feesPayable = feeOriginalCents - tierDiscountCents - feeCreditsAppliedCents;
      const shippingPayable = Math.max(0, (fees.shippingCents || 0) - shippingCreditAppliedCents);
      const payableCents = itemTotalCents + feesPayable + shippingPayable;

      res.json({
        itemTotalCents,
        feeOriginalCents,
        tierDiscountCents,
        feeCreditsAppliedCents,
        shippingCreditAppliedCents,
        payableCents,
        appliedMode: {
          tier: tierDiscountCents > 0,
          feeCredit: feeCreditsAppliedCents > 0,
        },
      });
    } catch (error) {
      console.error("Error calculating quote:", error);
      res.status(500).json({ message: "Failed to calculate quote" });
    }
  });

  app.post("/api/checkout/lock-credits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { orderId, amountCents } = req.body;

      if (!orderId || !amountCents) {
        return res.status(400).json({ message: "orderId and amountCents are required" });
      }

      // Check available balance
      const feeCredit = await storage.getFeeCredit(userId);
      const availableCredits = feeCredit?.balanceCents || 0;

      if (amountCents > availableCredits) {
        return res.status(400).json({ 
          message: "Insufficient fee credits",
          code: "INSUFFICIENT_FEE_CREDITS"
        });
      }

      // Create lock
      const lock = await storage.createFeeCreditLock({
        userId,
        orderId,
        lockedCents: amountCents,
        status: 'locked',
      });

      res.json(lock);
    } catch (error) {
      console.error("Error locking credits:", error);
      res.status(500).json({ message: "Failed to lock credits" });
    }
  });

  app.post("/api/checkout/confirm", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({ message: "orderId is required" });
      }

      // Get the lock
      const lock = await storage.getFeeCreditLock(orderId);
      if (!lock) {
        return res.status(404).json({ message: "Lock not found" });
      }

      if (lock.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Consume the credits (deduct from balance)
      await storage.updateFeeCreditBalance(userId, -lock.lockedCents);

      // Update lock status
      await storage.updateFeeCreditLockStatus(lock.id, 'consumed');

      res.json({ success: true });
    } catch (error) {
      console.error("Error confirming checkout:", error);
      res.status(500).json({ message: "Failed to confirm checkout" });
    }
  });

  app.post("/api/checkout/cancel", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({ message: "orderId is required" });
      }

      // Get the lock
      const lock = await storage.getFeeCreditLock(orderId);
      if (!lock) {
        return res.status(404).json({ message: "Lock not found" });
      }

      if (lock.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Release the lock
      await storage.releaseFeeCreditLock(orderId);

      res.json({ success: true });
    } catch (error) {
      console.error("Error canceling checkout:", error);
      res.status(500).json({ message: "Failed to cancel checkout" });
    }
  });

  // Region and feature flag routes
  app.get("/api/region", async (req, res) => {
    // TODO: Detect region from IP or user settings
    res.json({ region: process.env.REGION_DEFAULT || "US" });
  });

  app.get("/api/features", async (req, res) => {
    res.json({
      FEATURE_POI_TIER_DISCOUNT: process.env.FEATURE_POI_TIER_DISCOUNT === 'true',
      FEATURE_POI_FEE_CREDIT: process.env.FEATURE_POI_FEE_CREDIT === 'true',
    });
  });

  // TGE Routes
  // Get TGE configuration
  app.get("/api/tge/config", async (req, res) => {
    try {
      const config = {
        launchDate: process.env.TGE_LAUNCH_DATE || "2025-12-31T00:00:00Z",
        chain: process.env.TGE_CHAIN || "Base",
        dex: process.env.TGE_DEX || "Uniswap V2",
        initialPrice: process.env.TGE_INITIAL_PRICE || "TBD",
      };
      res.json(config);
    } catch (error) {
      console.error("Error fetching TGE config:", error);
      res.status(500).json({ message: "Failed to fetch TGE configuration" });
    }
  });

  app.get("/api/tge/status", async (_req, res) => {
    try {
      if (!tgeSaleAddress || tgeSaleAddress === ZERO_ADDRESS) {
        return res.json({ configured: false });
      }

      const contract = new ethers.Contract(tgeSaleAddress, tgeSaleAbi, tgeProvider);
      const [currentTier, minContribution, maxContribution, totalRaised] = await Promise.all([
        contract.currentTier(),
        contract.minContribution(),
        contract.maxContribution(),
        contract.totalRaised(),
      ]);
      const tierInfo = await contract.tiers(currentTier);

      res.json({
        configured: true,
        saleAddress: tgeSaleAddress,
        sale: {
          currentTier: currentTier.toString(),
          pricePerToken: tierInfo.pricePerToken.toString(),
          remainingTokens: tierInfo.remainingTokens.toString(),
          minContribution: minContribution.toString(),
          maxContribution: maxContribution.toString(),
          totalRaised: totalRaised.toString(),
        },
      });
    } catch (error) {
      console.error("Error fetching TGE status:", error);
      res.status(500).json({ message: "Failed to fetch TGE status" });
    }
  });

  // Subscribe to TGE email updates
  app.post("/api/tge/subscribe", async (req, res) => {
    try {
      const { email, source } = req.body;
      
      if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Invalid email address" });
      }

      const subscription = await storage.subscribeTgeEmail(email, source || "tge_page");
      res.json({ 
        message: "Successfully subscribed to TGE updates",
        subscription 
      });
    } catch (error: any) {
      // Handle duplicate email error
      if (error.message?.includes("duplicate") || error.code === "23505") {
        return res.status(200).json({ 
          message: "You are already subscribed to TGE updates" 
        });
      }
      
      console.error("Error subscribing to TGE updates:", error);
      res.status(500).json({ message: "Failed to subscribe to TGE updates" });
    }
  });

  // Campaign Summary Stats (for Landing Page)
  app.get("/api/campaign/summary", async (req, res) => {
    try {
      // Get total users count
      const totalUsers = await storage.getTotalUsersCount();
      
      // Get early-bird stats
      const earlyBirdStats = await storage.getEarlyBirdStats();
      
      const response = {
        totalUsers,
        totalRewardsDistributed: earlyBirdStats.totalRewardsDistributed,
        earlyBirdSlotsRemaining: earlyBirdStats.config?.participantCap
          ? Math.max(0, earlyBirdStats.config.participantCap - earlyBirdStats.totalParticipants)
          : null,
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching campaign summary:", error);
      res.status(500).json({ message: "Failed to fetch campaign summary" });
    }
  });

  // Early-Bird Routes
  // Get campaign statistics
  app.get("/api/early-bird/stats", async (req, res) => {
    try {
      const stats = await storage.getEarlyBirdStats();
      
      res.json({
        totalParticipants: stats.totalParticipants,
        participantCap: stats.config?.participantCap || null,
        totalRewardsDistributed: stats.totalRewardsDistributed,
        totalRewardPool: stats.config?.totalRewardPool || "100000",
        endDate: stats.config?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (error) {
      console.error("Error fetching early-bird stats:", error);
      res.status(500).json({ message: "Failed to fetch campaign stats" });
    }
  });

  // Get user's rewards summary (authenticated)
  app.get("/api/early-bird/user/rewards", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const summary = await storage.getUserEarlyBirdSummary(userId);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching user rewards:", error);
      res.status(500).json({ message: "Failed to fetch user rewards" });
    }
  });

  // Get user's task progress (authenticated)
  app.get("/api/early-bird/user/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserEarlyBirdProgress(userId);
      
      // Transform to match frontend interface
      const formattedProgress = progress.map(p => ({
        taskId: p.taskId,
        completed: p.completed,
        completedAt: p.completedAt?.toISOString(),
        claimed: p.claimed,
      }));
      
      res.json(formattedProgress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  // Get all active tasks
  app.get("/api/early-bird/tasks", async (req, res) => {
    try {
      const tasks = await storage.getEarlyBirdTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Mark a task as complete (authenticated) - for testing/admin
  app.post("/api/early-bird/user/complete-task", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { taskId, rewardAmount } = req.body;
      
      if (!taskId) {
        return res.status(400).json({ message: "Task ID is required" });
      }
      
      const progress = await storage.markTaskComplete(userId, taskId, rewardAmount || 0);
      res.json({ 
        message: "Task marked as complete",
        progress 
      });
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  // Referral Routes
  // Get user's referral link (authenticated)
  app.get("/api/referral/link", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const referralCode = await storage.getOrCreateReferralCode(userId);
      
      // Generate full referral link
      const baseUrl = process.env.BASE_URL || "https://proof.in";
      const referralLink = `${baseUrl}/login?ref=${referralCode.referralCode}`;
      
      res.json({
        referralCode: referralCode.referralCode,
        referralLink,
      });
    } catch (error) {
      console.error("Error fetching referral link:", error);
      res.status(500).json({ message: "Failed to fetch referral link" });
    }
  });

  // Get user's referral stats (authenticated)
  app.get("/api/referral/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserReferralStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });

  // Get referral leaderboard (public)
  app.get("/api/referral/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getReferralLeaderboard(limit);
      
      // Format for frontend with rank
      const formattedLeaderboard = leaderboard.map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        referralCount: entry.referralCount,
      }));
      
      res.json(formattedLeaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Process referral code during signup (internal use)
  app.post("/api/referral/process", isAuthenticated, async (req: any, res) => {
    try {
      const inviteeId = req.user.claims.sub;
      const { referralCode } = req.body;
      
      if (!referralCode) {
        return res.status(400).json({ message: "Referral code is required" });
      }

      // Check if user was already referred
      const alreadyReferred = await storage.hasBeenReferred(inviteeId);
      if (alreadyReferred) {
        return res.status(400).json({ message: "User has already been referred" });
      }

      // Find the referral code
      const code = await storage.getReferralByCode(referralCode);
      if (!code) {
        return res.status(404).json({ message: "Invalid referral code" });
      }

      // Don't allow self-referral
      if (code.userId === inviteeId) {
        return res.status(400).json({ message: "Cannot refer yourself" });
      }

      // Create referral relationship
      const referral = await storage.createReferral(code.userId, inviteeId, referralCode);
      
      res.json({
        message: "Referral processed successfully",
        referral,
      });
    } catch (error) {
      console.error("Error processing referral:", error);
      res.status(500).json({ message: "Failed to process referral" });
    }
  });

  // Airdrop Routes
  // Check airdrop eligibility
  app.get("/api/airdrop/check", async (req: any, res) => {
    try {
      let userIdOrAddress: string;

      // If authenticated, use userId; otherwise use query param address
      if (req.user?.claims?.sub) {
        userIdOrAddress = req.user.claims.sub;
      } else if (req.query.address) {
        userIdOrAddress = req.query.address as string;
      } else {
        return res.status(400).json({ message: "Address or authentication required" });
      }

      const eligibility = await storage.checkAirdropEligibility(userIdOrAddress);
      
      // Format response for frontend
      if (eligibility.eligible && !eligibility.claimed && eligibility.index !== undefined) {
        // Format amount from POI units to wei string for frontend
        const { formatAmountToWei } = require("./services/merkleAirdrop");
        const amountWei = formatAmountToWei(eligibility.amount);
        
        res.json({
          eligible: true,
          amount: amountWei, // Return as wei string for frontend
          index: eligibility.index,
          proof: eligibility.proof || [],
          roundId: eligibility.roundId || 0,
        });
      } else {
        res.json({
          eligible: false,
          amount: "0",
          index: undefined,
          proof: [],
          roundId: undefined,
        });
      }
    } catch (error) {
      console.error("Error checking airdrop eligibility:", error);
      res.status(500).json({ message: "Failed to check airdrop eligibility" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}
