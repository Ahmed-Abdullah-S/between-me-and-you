import { z } from "zod";

/**
 * Message type for chat conversations
 */
export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

/**
 * Zod schema for chat request validation
 */
export const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().min(1, "Message content cannot be empty"),
    })
  ).min(1, "At least one message is required"),
});

/**
 * Zod schema for chat response validation
 */
export const chatResponseSchema = z.object({
  reply: z.string().min(1, "Reply cannot be empty"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
