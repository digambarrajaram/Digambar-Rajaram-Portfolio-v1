import express, { type Request, type Response, type NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { runChatAgent, ChatAgentInputError, type ChatMessage } from "./_lib/chatAgent.js";

// ---------------------------------------------------------------------------
// Vercel serverless entry point — exports a bare Express app (no listen()).
// Vercel's @vercel/node builder mounts this function at /api, so route paths
// inside the app should be defined relative to that function's root.
// ---------------------------------------------------------------------------

const app = express();

// Trust the Vercel edge proxy so rate-limiting and logging see client IPs.
app.set("trust proxy", 1);

// Security headers (CSP left off — same reasoning as server.ts).
app.use(helmet({ contentSecurityPolicy: false }));

// CORS — lock down to a specific origin once deployed by setting
// ALLOWED_ORIGIN in the Vercel dashboard.
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || true,
    credentials: false,
  })
);

app.use(express.json({ limit: "100kb" }));

// ---------------------------------------------------------------------------
// Rate limiting — /chat is capped tighter since the function is mounted at /api.
// ---------------------------------------------------------------------------
const globalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalApiLimiter);

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many messages sent. Please wait a moment before trying again." },
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get(["/health", "/api/health"], (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    env: process.env.NODE_ENV || "development",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.post(["/chat", "/api/chat"], chatLimiter, async (req: Request, res: Response, next: NextFunction) => {
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

// 404 for unmatched routes inside the serverless function.
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// ---------------------------------------------------------------------------
// Centralized error handler — never leaks internals in production.
// ---------------------------------------------------------------------------
app.use((error: any, req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ChatAgentInputError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, error);
  res.status(500).json({ error: "Something went wrong processing your request." });
});

export default app;
