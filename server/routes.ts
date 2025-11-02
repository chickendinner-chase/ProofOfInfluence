// Backend API routes - includes Replit Auth integration from blueprint:javascript_log_in_with_replit
import type { Express, Request } from "express";
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

  const httpServer = createServer(app);
  return httpServer;
}
