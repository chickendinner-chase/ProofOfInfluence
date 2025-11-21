// Unified authentication middleware
// Supports Replit Auth, Wallet Auth, and Auth Bypass
// Priority: Replit Auth > Wallet Session > DEV Bypass
import type { RequestHandler } from "express";
import * as client from "openid-client";
import { isReplitAuthEnabled, getOidcConfig, updateUserSession } from "./session";
import { getWalletAuthUser } from "./walletAuth";

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // 1. DEV BYPASS（开发环境）
  const authBypass =
    process.env.DEV_MODE_AUTH_BYPASS === "true" ||
    process.env.AUTH_BYPASS === "true";

  if (authBypass) {
    console.warn(
      "[Auth] Authentication bypass enabled (DEV_MODE_AUTH_BYPASS or AUTH_BYPASS is set)"
    );

    (req as any).user = {
      claims: {
        sub: process.env.AUTH_BYPASS_USER_ID || "dev-user",
        email: process.env.AUTH_BYPASS_USER_EMAIL || "dev@example.com",
        first_name: process.env.AUTH_BYPASS_USER_FIRST_NAME || "Dev",
        last_name: process.env.AUTH_BYPASS_USER_LAST_NAME || "User",
      },
      role: "admin",
      provider: "dev",
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    };
    return next();
  }

  // 2. Replit / Passport 登录
  if (isReplitAuthEnabled() && typeof req.isAuthenticated === "function") {
    const passportUser = req.user as any;

    if (req.isAuthenticated() && passportUser?.claims?.sub) {
      // 检查 token 是否过期
      if (passportUser?.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        if (now <= passportUser.expires_at) {
          // Token 有效，规范化并返回
          (req as any).user = {
            claims: passportUser.claims,
            walletAddress: passportUser.walletAddress,
            role: passportUser.role ?? "user",
            provider: "replit",
            expires_at: passportUser.expires_at,
            access_token: passportUser.access_token,
            refresh_token: passportUser.refresh_token,
          };
          return next();
        }

        // Token 过期 → 尝试刷新
        const refreshToken = passportUser.refresh_token;
        if (refreshToken) {
          try {
            const config = await getOidcConfig();
            const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
            updateUserSession(passportUser, tokenResponse);
            // 刷新后规范化
            (req as any).user = {
              claims: passportUser.claims,
              walletAddress: passportUser.walletAddress,
              role: passportUser.role ?? "user",
              provider: "replit",
              expires_at: passportUser.expires_at,
              access_token: passportUser.access_token,
              refresh_token: passportUser.refresh_token,
            };
            return next();
          } catch (error) {
            console.warn("[Auth] Replit token refresh failed, fallback to wallet auth");
          }
        }
      } else {
        // 没有 expires_at，直接规范化
        (req as any).user = {
          claims: passportUser.claims,
          walletAddress: passportUser.walletAddress,
          role: passportUser.role ?? "user",
          provider: "replit",
          expires_at: passportUser.expires_at,
          access_token: passportUser.access_token,
          refresh_token: passportUser.refresh_token,
        };
        return next();
      }
    }
  }

  // 3. 钱包登录（session.walletUser）
  const session: any = (req as any).session;
  if (session?.walletUser) {
    const walletUser = session.walletUser;
    console.log("[Auth] Wallet session found:", { 
      sessionId: session.id || session.sessionID,
      userId: walletUser.id,
      walletAddress: walletUser.walletAddress,
      role: walletUser.role 
    });
    (req as any).user = {
      claims: {
        sub: walletUser.id, // 统一当成 userId
        email: walletUser.email ?? undefined,
      },
      walletAddress: walletUser.walletAddress,
      role: walletUser.role ?? "user",
      provider: "wallet",
      expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 1 week
    };
    return next();
  } else {
    // Debug: log session state when wallet session is not found
    console.log("[Auth] No wallet session found:", {
      hasSession: !!session,
      sessionId: session?.id || session?.sessionID,
      sessionKeys: session ? Object.keys(session) : [],
    });
  }

  // 4. 未登录
  return res.status(401).json({ message: "Unauthorized" });
};

