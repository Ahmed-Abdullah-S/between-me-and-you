import type { Express } from "express";
import type { Server } from "http";
import { api } from "@shared/routes";
import { z } from "zod";
import { mockAiChat } from "./mockAi";

// Simple in-memory rate limiter (no dependencies)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  const ipsToDelete: string[] = [];
  rateLimitMap.forEach((record, ip) => {
    if (now > record.resetAt) {
      ipsToDelete.push(ip);
    }
  });
  ipsToDelete.forEach(ip => rateLimitMap.delete(ip));
}, RATE_LIMIT_WINDOW);

import { DEVELOPER_PROMPT, DEFAULT_MODEL, DEFAULT_TEMPERATURE } from "@shared/constants";

import type { Message } from "@shared/schema";

async function callOpenAI(messages: Message[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  // Prepare messages: start with system/developer prompt, then conversation
  const openAIMessages: Array<{ role: string; content: string }> = [
    { role: "system", content: DEVELOPER_PROMPT },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: openAIMessages,
      temperature: DEFAULT_TEMPERATURE,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || "OpenAI API error";
    throw new Error(`OpenAI API failed: ${errorMessage}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content;

  if (!reply || typeof reply !== "string") {
    throw new Error("Invalid response format from OpenAI");
  }

  return reply;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Status endpoint to check environment configuration (safe, no secrets exposed)
  app.get("/api/status", (_req, res) => {
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    const apiKeyLength = process.env.OPENAI_API_KEY?.length || 0;
    const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
    
    res.json({
      mode: hasApiKey ? "real-ai" : "mock",
      model: hasApiKey ? model : null,
      apiKeyConfigured: hasApiKey,
      apiKeyLength: hasApiKey ? apiKeyLength : 0,
      // Show first 7 and last 4 chars for verification (sk-proj-...XXXX)
      apiKeyPreview: hasApiKey 
        ? `${process.env.OPENAI_API_KEY?.substring(0, 7)}...${process.env.OPENAI_API_KEY?.substring(apiKeyLength - 4)}`
        : null,
    });
  });

  app.post(api.chat.path, async (req, res) => {
    try {
      // Rate limiting
      const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || 
                      (req.headers["x-real-ip"] as string) || 
                      req.socket.remoteAddress || 
                      "unknown";

      if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ 
          message: "كثرة الطلبات. انتظر قليلاً ثم حاول مرة أخرى." 
        });
      }

      // Input validation
      const { messages } = api.chat.input.parse(req.body);

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ 
          message: "يجب إرسال مصفوفة رسائل غير فارغة." 
        });
      }

      // Validate message structure
      for (const msg of messages) {
        if (!msg.role || !msg.content || typeof msg.content !== "string") {
          return res.status(400).json({ 
            message: "تنسيق الرسائل غير صحيح. يجب أن تحتوي كل رسالة على 'role' و 'content'." 
          });
        }
      }

      let reply: string;
      let mode: "openai" | "mock" | "mock-fallback";

      // Dual mode: OpenAI if key exists, otherwise mock
      if (process.env.OPENAI_API_KEY) {
        try {
          reply = await callOpenAI(messages);
          mode = "openai";
          console.log("[Chat] Using OpenAI API mode");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("[Chat] OpenAI API error, falling back to mock:", errorMessage);
          
          // Check for specific error types
          if (errorMessage.includes("quota") || errorMessage.includes("billing")) {
            console.warn("[Chat] ⚠️ OpenAI API quota exceeded. Using mock mode. Check your OpenAI billing/credits.");
          } else if (errorMessage.includes("invalid_api_key") || errorMessage.includes("Incorrect API key")) {
            console.warn("[Chat] ⚠️ Invalid OpenAI API key. Using mock mode.");
          } else {
            console.warn("[Chat] ⚠️ OpenAI API error. Using mock mode as fallback.");
          }
          
          // Fallback to mock on OpenAI failure
          reply = mockAiChat(messages);
          mode = "mock-fallback";
        }
      } else {
        // Mock mode
        reply = mockAiChat(messages);
        mode = "mock";
        console.log("[Chat] Using Mock AI mode (no OPENAI_API_KEY found)");
      }

      // Add mode indicator in development (as response header)
      if (process.env.NODE_ENV !== "production") {
        res.setHeader("X-AI-Mode", mode);
      }

      res.json({ reply });
    } catch (error) {
      console.error("Chat route error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "تنسيق الطلب غير صحيح." 
        });
      }
      res.status(500).json({ message: "حدث خطأ غير متوقع." });
    }
  });

  return httpServer;
}
