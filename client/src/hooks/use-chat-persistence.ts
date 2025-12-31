import { useState, useEffect, useCallback } from "react";
import type { Message } from "@shared/schema";
import { logger } from "@/lib/logger";

const STORAGE_KEY = "beini-wa-beinak-messages";
const MAX_STORED_MESSAGES = 50; // Limit to prevent localStorage bloat

/**
 * Hook for persisting chat messages to localStorage
 * Restores messages on mount, saves on change
 */
export function useChatPersistence(initialMessages: Message[] = []) {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Try to restore from localStorage on initial load
    if (typeof window === "undefined") return initialMessages;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          logger.info("Restored chat from localStorage", { messageCount: parsed.length });
          return parsed.slice(-MAX_STORED_MESSAGES);
        }
      }
    } catch (error) {
      logger.error("Failed to restore chat from localStorage", error);
    }
    return initialMessages;
  });

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      if (messages.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        const toStore = messages.slice(-MAX_STORED_MESSAGES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      }
    } catch (error) {
      logger.error("Failed to save chat to localStorage", error);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      logger.info("Cleared chat from localStorage");
    } catch (error) {
      logger.error("Failed to clear chat from localStorage", error);
    }
  }, []);

  return {
    messages,
    setMessages,
    clearMessages,
    hasPersistedMessages: messages.length > 0,
  };
}

