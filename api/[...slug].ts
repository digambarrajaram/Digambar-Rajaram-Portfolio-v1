import express, { type Request, type Response, type NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { runChatAgent, ChatAgentInputError, type ChatMessage } from "../src/server/chatAgent";

const app = express();

app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || true,
    credentials: false,
  })
);
app.use(express.json({ limit: "100kb" }));

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

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    env: process.env.NODE_ENV || "development",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.post("/chat", chatLimiter, async (req: Request, res: Response, next: NextFunction) => {
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

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

app.use((error: any, req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ChatAgentInputError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, error);
  res.status(500).json({ error: "Something went wrong processing your request." });
});

export default app;
