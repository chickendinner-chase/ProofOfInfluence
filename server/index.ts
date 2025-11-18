import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from 'http-proxy-middleware';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Proxy /api-gpt/* requests to the API Server on port 3001
// IMPORTANT: Must be registered BEFORE body parsers to avoid consuming request stream
app.use('/api-gpt', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  timeout: 120000,
  proxyTimeout: 120000,
  pathRewrite: {
    '^/api-gpt': ''
  },
  on: {
    proxyReq: (proxyReq: any, req: any, res: any) => {
      log(`[Proxy] ${req.method} /api-gpt${req.path} -> http://localhost:3001${req.path}`);
    },
    error: (err: any, req: any, res: any) => {
      log(`[Proxy Error] ${err.message}`);
    }
  }
}));

// Body parsers for non-proxied routes
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Proxy /api-gpt/* requests to the API Server on port 3001
app.use('/api-gpt', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api-gpt': '' // Remove /api-gpt prefix when forwarding
  },
  on: {
    proxyReq: (proxyReq: any, req: any, res: any) => {
      log(`[Proxy] ${req.method} /api-gpt${req.path} -> http://localhost:3001${req.path}`);
    },
    error: (err: any, req: any, res: any) => {
      log(`[Proxy Error] ${err.message}`);
      if (!res.headersSent) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'API Server unavailable', 
          message: 'The API server is currently not responding. Please ensure it is running on port 3001.' 
        }));
      }
    }
  }
}));

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  // Use 127.0.0.1 on Windows (0.0.0.0 and localhost IPv6 are not supported), 0.0.0.0 on other platforms
  const host = process.platform === 'win32' ? '127.0.0.1' : '0.0.0.0';
  server.listen(port, host, () => {
    log(`serving on port ${port}`);

    // Start background badge sync worker
    const rpcUrl = process.env.BASE_RPC_URL || process.env.BASE_SEPOLIA_RPC_URL;
    if (rpcUrl) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        startBadgeSync(provider);
        log("[BadgeSync] Background sync worker started");
      } catch (error: any) {
        log(`[BadgeSync] Failed to start sync worker: ${error.message}`);
      }
    } else {
      log("[BadgeSync] RPC URL not configured, skipping badge sync worker");
    }
  });
})();
