// Unified authentication middleware
// Supports Replit Auth, Wallet Auth, and Auth Bypass
// Priority: Replit Auth > Wallet Session > DEV Bypass
import type { RequestHandler } from "express";
import * as client from "openid-client";
import { isReplitAuthEnabled, getOidcConfig, updateUserSession } from "../replitAuth";
import { getWalletAuthUser } from "./walletAuth";

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Support DEV mode bypass
  const authBypass =
    process.env.DEV_MODE_AUTH_BYPASS === "true" ||
    process.env.AUTH_BYPASS === "true";

  //
  // Priority 1: Replit Auth (if enabled)
  //
  if (isReplitAuthEnabled() && typeof req.isAuthenticated === "function") {
    const user = req.user as any;

    if (req.isAuthenticated() && user?.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (now <= user.expires_at) {
        return next();
      }

      // Expired → try to refresh with refresh_token
      const refreshToken = user.refresh_token;
      if (refreshToken) {
        try {
          const config = await getOidcConfig();
          const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
          updateUserSession(user, tokenResponse);
          return next();
        } catch (error) {
          console.warn("[Auth] Replit token refresh failed, fallback to wallet auth");
        }
      }
    }
  }

  //
  // Priority 2: Wallet Session Auth
  //
  const walletUser = getWalletAuthUser(req);
  if (walletUser) {
    // For compatibility with existing code (many places use req.user.claims.sub)
    (req as any).user = {
      claims: {
        sub: walletUser.id,
        email: walletUser.email ?? undefined,
      },
      walletAddress: walletUser.walletAddress,
      role: walletUser.role ?? "user",
      // Give a temporary expiration time, mainly to avoid some logic depending on expires_at
      expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 1 week
    };
    return next();
  }

  //
  // Priority 3: Auth Bypass (for development environment)
  //
  if (authBypass) {
    console.warn(
      "[Auth] Authentication bypass enabled (DEV_MODE_AUTH_BYPASS or AUTH_BYPASS is set)"
    );

    if (!req.user) {
      (req as any).user = {
        claims: {
          sub: process.env.AUTH_BYPASS_USER_ID || "dev-user",
          email: process.env.AUTH_BYPASS_USER_EMAIL || "dev@example.com",
          first_name: process.env.AUTH_BYPASS_USER_FIRST_NAME || "Dev",
          last_name: process.env.AUTH_BYPASS_USER_LAST_NAME || "User",
        },
        role: "admin",
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      };
    }
    return next();
  }

  // None of the three → Unauthorized
  return res.status(401).json({ message: "Unauthorized" });
};

