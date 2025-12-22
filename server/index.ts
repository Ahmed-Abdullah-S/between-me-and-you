// Load environment variables from .env.local (highest priority), then .env
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync, readFileSync } from "fs";

const envLocalPath = resolve(process.cwd(), ".env.local");
if (process.env.NODE_ENV !== "production") {
  console.log("[Env] Looking for .env.local at:", envLocalPath);
  console.log("[Env] Current working directory:", process.cwd());
}

if (existsSync(envLocalPath)) {
  console.log("[Env] .env.local file found!");
  // Load .env.local with override to ensure it takes precedence
  const result = config({ path: envLocalPath, override: true });
  if (result.error) {
    console.warn("[Env] Warning: Could not load .env.local:", result.error.message);
    } else {
      if (process.env.NODE_ENV !== "production") {
        console.log("[Env] Loaded .env.local successfully");
      }
      // Debug: Show if OPENAI_API_KEY was loaded (without exposing the key)
      const keyLoaded = !!process.env.OPENAI_API_KEY;
      if (process.env.NODE_ENV !== "production" && !keyLoaded) {
        const keyLength = process.env.OPENAI_API_KEY?.length || 0;
        console.log(`[Env] OPENAI_API_KEY loaded: ${keyLoaded}, length: ${keyLength}`);
        // Try to read file directly to debug
        try {
          const fileContent = readFileSync(envLocalPath, "utf-8");
          const lines = fileContent.split("\n");
          const keyLine = lines.find(line => line.trim().startsWith("OPENAI_API_KEY="));
          console.log("[Env] File contains OPENAI_API_KEY line:", !!keyLine);
          if (keyLine) {
            const keyValue = keyLine.split("=")[1]?.trim();
            console.log("[Env] Key value length:", keyValue?.length || 0);
            console.log("[Env] Key value starts with 'sk-':", keyValue?.startsWith("sk-") || false);
          }
        } catch (err) {
          console.error("[Env] Could not read file:", err);
        }
      }
    }
} else {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Env] .env.local not found, using .env or system env vars");
  }
}
// Load .env as fallback (but .env.local already loaded with override, so this won't override it)
config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { getServerConfig } from "./config";
import { getServerConfig } from "./config";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

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

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const { port, openai } = getServerConfig();
  
  // Log AI mode on startup
  const aiMode = openai.enabled ? "🤖 Real AI (OpenAI)" : "🎭 Mock AI";
  log(`AI Mode: ${aiMode}${openai.enabled ? ` (Model: ${openai.model})` : ""}`);
  
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
