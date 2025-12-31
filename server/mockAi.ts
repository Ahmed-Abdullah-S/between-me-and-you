import type { Message } from "@shared/schema";
import { MOCK_QUESTIONS, MOCK_FINAL_REVEAL } from "@shared/constants";

/**
 * Mock AI chat function for fallback mode
 * Uses a simple question flow and final reveal
 */
export function mockAiChat(messages: Message[]): string {
  // Count user messages (excluding system and initial assistant messages)
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  // If we have 5+ user messages, return the final reveal
  if (userMessageCount >= 5) {
    return MOCK_FINAL_REVEAL;
  }

  // Otherwise, return the appropriate question based on message count
  const questionIndex = Math.min(userMessageCount - 1, MOCK_QUESTIONS.length - 1);
  return MOCK_QUESTIONS[questionIndex] || MOCK_QUESTIONS[MOCK_QUESTIONS.length - 1];
}
