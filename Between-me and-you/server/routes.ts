import type { Express } from "express";
import type { Server } from "http";
import { api } from "@shared/routes";
import { z } from "zod";
import { mockAiChat } from "./mockAi";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post(api.chat.path, async (req, res) => {
    try {
      const { messages } = api.chat.input.parse(req.body);

      // Use mock AI engine - no external API calls
      const reply = mockAiChat(messages);

      res.json({ reply });
    } catch (error) {
      console.error("Chat route error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request format" });
      }
      res.status(500).json({ message: "حدث خطأ غير متوقع." });
    }
  });

  return httpServer;
}
