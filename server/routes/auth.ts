// Unified OAuth authentication routes
// MVP: Simple routing for all OAuth providers
import express from "express";
import { isReplitAuthEnabled } from "../replitAuth";

export function registerAuthRoutes(app: express.Express) {
  // Unified OAuth login entry point
  app.get("/api/auth/:provider", async (req, res, next) => {
    const { provider } = req.params;
    
    // 排除特定路径，避免拦截其他路由
    // /api/auth/user 和 /api/auth/wallet/* 应该由其他路由处理
    if (provider === "user" || provider === "wallet") {
      return next(); // 让其他路由处理
    }
    
    // Replit - redirect to existing route (already set up in replitAuth.ts)
    if (provider === "replit") {
      if (!isReplitAuthEnabled()) {
        return res.status(503).json({
          message: "Replit Auth is not configured",
          error: "AUTH_NOT_CONFIGURED"
        });
      }
      // Redirect to existing /api/login route
      return res.redirect("/api/login");
    }
    
    // Other OAuth providers - placeholder for MVP
    // TODO: Implement Passport strategies for Google, Apple, WeChat, Xiaohongshu
    const supportedProviders = ["google", "apple", "wechat", "xiaohongshu"];
    
    if (!supportedProviders.includes(provider)) {
      return res.status(400).json({
        message: `Unsupported provider: ${provider}`,
        supported: supportedProviders
      });
    }
    
    // For MVP, return a message indicating it's not yet implemented
    // In production, this would use Passport strategies
    return res.status(501).json({
      message: `${provider} login is not yet implemented`,
      provider,
      note: "This will be implemented with Passport strategies"
    });
  });
  
  // Unified OAuth callback
  app.get("/api/auth/:provider/callback", async (req, res, next) => {
    const { provider } = req.params;
    
    // 排除 wallet 路径
    if (provider === "wallet") {
      return next();
    }
    
    // Replit callback - redirect to existing route
    if (provider === "replit") {
      if (!isReplitAuthEnabled()) {
        return res.redirect("/login?error=auth_not_configured");
      }
      // Redirect to existing /api/callback route
      return res.redirect("/api/callback");
    }
    
    // Other providers - placeholder
    return res.redirect("/login?error=not_implemented");
  });
}

