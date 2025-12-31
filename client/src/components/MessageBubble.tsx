import { memo } from "react";
import { motion } from "framer-motion";
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
  index: number;
}

/**
 * Memoized message bubble component for performance
 * Prevents re-rendering of all messages when new message arrives
 */
export const MessageBubble = memo(function MessageBubble({
  message,
  index,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`
          max-w-[85%] px-6 py-4 rounded-2xl text-base leading-relaxed shadow-sm
          ${isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card text-foreground border border-border rounded-tl-sm shadow-sm"}
        `}
      >
        {message.content}
      </div>
    </motion.div>
  );
});

