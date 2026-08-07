// Must be the first import: populates process.env before any other module
// (chatAgent.ts included) is evaluated. ES module imports are hoisted and
// run before this file's own top-level code, so `dotenv.config()` called
// later — even before other statements — is too late for modules that read
// env vars at import time.
import "dotenv/config";

import express, { NextFunction, Request, Response } from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { runChatAgent, ChatAgentInputError, type ChatMessage } from "./src/server/chatAgent";

// ---------------------------------------------------------------------------
// Environment validation — fail fast at boot instead of erroring on the
// first request that happens to hit the chat endpoint.
// ---------------------------------------------------------------------------
const REQUIRED_ENV_VARS = ["GROQ_API_KEY"];
const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variable(s): ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PRODUCTION = NODE_ENV === "production";
const PORT = Number(process.env.PORT) || 3000;
// Set this once the site is deployed (e.g. "https://digambarrajaram.cloud") to
// lock CORS down to just your own domain. Left open (reflects request origin)
// until then so local/dev testing isn't blocked.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

async function startServer() {
  const app = express();

  // Needed behind a reverse proxy (Render/Vercel/Railway/Nginx) so
  // rate-limiting and logging see the real client IP, not the proxy's.
  app.set("trust proxy", 1);

  // ---------------------------------------------------------------------
  // Security headers.
  // CSP is left disabled rather than guessed at — Helmet's default CSP is
  // strict enough to silently break external calls (Formspree, fonts, etc.)
  // if enabled without knowing every origin this app actually needs. Turn
  // it on deliberately once those origins are known.
  // ---------------------------------------------------------------------
  app.use(helmet({ contentSecurityPolicy: false }));

  // ---------------------------------------------------------------------
  // CORS
  // ---------------------------------------------------------------------
  app.use(
    cors({
      origin: ALLOWED_ORIGIN || true,
      credentials: false
    })
  );

  // Body parser with a size cap — chat messages are short text, no reason
  // to accept large payloads.
  app.use(express.json({ limit: "100kb" }));

  // Minimal structured request logging.
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
    });
    next();
  });

  // ---------------------------------------------------------------------
  // Rate limiting — /api/chat gets a tighter cap since each request is an
  // LLM call (costs money and is the most abuse-prone route).
  // ---------------------------------------------------------------------
  const globalApiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use("/api", globalApiLimiter);

  const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many messages sent. Please wait a moment before trying again." }
  });

  // ---------------------------------------------------------------------
  // Routes
  // ---------------------------------------------------------------------
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: "healthy",
      env: NODE_ENV,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/chat", chatLimiter, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messages } = req.body as { messages?: ChatMessage[] };
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Invalid payload: 'messages' array is required." });
        return;
      }

      const responseMessage = await runChatAgent(messages);
      res.json({ message: responseMessage });
    } catch (error) {
      next(error);
    }
  });

  // ---------------------------------------------------------------------
  // Vite middleware (dev) vs static hosting (prod)
  // ---------------------------------------------------------------------
  if (!IS_PRODUCTION) {
    console.log("Starting server in DEVELOPMENT mode with Vite integration...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");

    app.use(
      express.static(distPath, {
        maxAge: "1y",
        setHeaders: (res, filePath) => {
          // Never long-cache the HTML shell — only hashed build assets.
          if (filePath.endsWith(".html")) {
            res.setHeader("Cache-Control", "no-cache");
          }
        }
      })
    );

    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // ---------------------------------------------------------------------
  // 404 for unmatched API routes (the SPA fallback above already covers
  // every other route in production).
  // ---------------------------------------------------------------------
  app.use("/api", (req: Request, res: Response) => {
    res.status(404).json({ error: "Not found" });
  });

  // ---------------------------------------------------------------------
  // Centralized error handler — must be registered last. Never leaks
  // internals (stack traces, raw error messages) to visitors in production.
  // ---------------------------------------------------------------------
  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof ChatAgentInputError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    // Log the real error for debugging but never leak internals to the client.
    console.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, error);
    res.status(500).json({
      error: "Something went wrong processing your request."
    });
  });

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 SRE Full-stack server running on http://0.0.0.0:${PORT} [${NODE_ENV}]`);
  });

  // ---------------------------------------------------------------------
  // Graceful shutdown — let in-flight requests finish instead of dropping
  // them on deploy/restart.
  // ---------------------------------------------------------------------
  const shutdown = (signal: string) => {
    console.log(`${signal} received: closing server gracefully...`);
    server.close(() => {
      console.log("Server closed. Exiting.");
      process.exit(0);
    });
    // Force-exit if close hangs (e.g. a stuck connection).
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((err) => {
  console.error("Critical error starting Express + Vite server:", err);
  process.exit(1);
});