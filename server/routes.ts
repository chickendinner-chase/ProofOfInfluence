// Backend API routes - includes Replit Auth integration from blueprint:javascript_log_in_with_replit
import express, { type Express, type Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProfileSchema, insertLinkSchema } from "@shared/schema";
import { stripe } from "./stripe";

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
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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

      // TODO: Add signature verification for production
      // For MVP: storing wallet address without full signature verification
      // Future: Implement nonce-based challenge and verify signature server-side
      // using ethers.js: verifyMessage(nonce, signature) === walletAddress
      
      const user = await storage.updateUserWallet(userId, walletAddress);
      res.json(user);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      res.status(400).json({ message: "Failed to connect wallet" });
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

  // Stripe webhook endpoint - must be placed before other routes to handle raw body
  app.post("/api/stripe-webhook", express.raw({ type: 'application/json' }), async (req: any, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('Warning: STRIPE_WEBHOOK_SECRET is not set. Webhook signature verification disabled.');
    }

    let event;

    try {
      // Verify webhook signature if secret is configured
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        // For development without webhook secret
        event = JSON.parse(req.body.toString());
      }
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          console.log('Payment successful for session:', session.id);

          // Get transaction from database
          const transaction = await storage.getTransactionBySessionId(session.id);
          
          if (transaction) {
            // Update transaction status
            await storage.updateTransaction(transaction.id, {
              status: 'completed',
              stripePaymentIntentId: session.payment_intent as string,
              email: session.customer_email || transaction.email || null,
            });
            
            console.log(`Transaction ${transaction.id} marked as completed`);
          } else {
            console.error(`Transaction not found for session ${session.id}`);
          }
          break;
        }

        case 'checkout.session.expired': {
          const session = event.data.object;
          console.log('Payment session expired:', session.id);

          const transaction = await storage.getTransactionBySessionId(session.id);
          if (transaction && transaction.status === 'pending') {
            await storage.updateTransaction(transaction.id, {
              status: 'failed',
            });
          }
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object;
          console.log('Payment failed:', paymentIntent.id);
          // Could update transaction status here if needed
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Stripe payment routes
  app.post("/api/create-checkout-session", async (req: any, res) => {
    try {
      const { amount, purpose } = req.body;

      // Validate amount
      if (!amount || amount < 1 || amount > 10000) {
        return res.status(400).json({ message: "Invalid amount. Must be between $1 and $10,000" });
      }

      // Validate purpose
      if (!purpose || typeof purpose !== 'string') {
        return res.status(400).json({ message: "Payment purpose is required" });
      }

      const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
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
    try {
      const userId = req.user.claims.sub;
      // TODO: Get actual POI balance from blockchain/wallet
      // For MVP, return mock balance or from transactions
      const mockPoiBalance = 0; // Replace with actual balance lookup
      
      const tier = await storage.getUserTier(mockPoiBalance);
      res.json({ tier, poiBalance: mockPoiBalance });
    } catch (error) {
      console.error("Error fetching user tier:", error);
      res.status(500).json({ message: "Failed to fetch user tier" });
    }
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

  app.post("/api/poi/fee-credits/burn-intent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { burnTxHash } = req.body;

      if (!burnTxHash) {
        return res.status(400).json({ message: "burnTxHash is required" });
      }

      // Check if this transaction has already been processed
      const existing = await storage.getBurnIntentByTxHash(burnTxHash);
      if (existing) {
        return res.status(400).json({ 
          message: "This burn transaction has already been processed",
          code: "POI_BURN_ALREADY_PROCESSED"
        });
      }

      // TODO: Verify transaction on blockchain
      // For MVP, using mock values
      const mockPoiAmount = 1000; // POI burned
      const mockSnapshotRate = 0.05; // $0.05 per POI
      const creditedCents = Math.floor(mockPoiAmount * mockSnapshotRate * 100);

      // Create burn intent record
      const burnIntent = await storage.createBurnIntent({
        userId,
        burnTxHash,
        poiAmount: mockPoiAmount,
        creditedCents,
        snapshotRate: mockSnapshotRate.toString(),
        status: 'credited',
      });

      // Update user's fee credit balance
      await storage.updateFeeCreditBalance(userId, creditedCents);

      res.json({
        creditedCents,
        snapshotRate: mockSnapshotRate,
        burnIntent,
      });
    } catch (error) {
      console.error("Error processing burn intent:", error);
      res.status(500).json({ message: "Failed to process burn intent" });
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

  const httpServer = createServer(app);
  return httpServer;
}
