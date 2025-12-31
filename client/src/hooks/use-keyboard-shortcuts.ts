import { useEffect } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: (e: KeyboardEvent) => void;
  description?: string;
}

/**
 * Hook for managing keyboard shortcuts
 * Useful for accessibility and power users
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.altKey ? e.altKey : !e.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.handler(e);
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

/**
 * Common keyboard shortcuts for the chat interface
 */
export const CHAT_SHORTCUTS = {
  SEND: { key: "Enter", description: "إرسال الرسالة" },
  NEW_LINE: { key: "Enter", shiftKey: true, description: "سطر جديد" },
  FOCUS_INPUT: { key: "k", ctrlKey: true, description: "التركيز على حقل الإدخال" },
  RESET: { key: "r", ctrlKey: true, shiftKey: true, description: "إعادة تعيين المحادثة" },
} as const;

