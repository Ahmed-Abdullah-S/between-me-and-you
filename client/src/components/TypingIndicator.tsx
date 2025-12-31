import { motion } from "framer-motion";

/**
 * Instagram-style typing indicator with animated dots
 * Extracted to avoid duplication between ChatView and other components
 */
export function TypingIndicator() {
  return (
    <div className="flex justify-end">
      <div className="bg-card border border-border px-5 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center justify-center gap-1.5">
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: 0,
            ease: "easeInOut",
          }}
        />
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: 0.4,
            ease: "easeInOut",
          }}
        />
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: 0.8,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}

