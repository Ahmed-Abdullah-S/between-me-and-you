import { useRef, useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { useChatPersistence } from "@/hooks/use-chat-persistence";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeProvider";
import { LandingView } from "@/components/LandingView";
import { ChatView } from "@/components/ChatView";
import { SkipLink } from "@/components/SkipLink";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { logger } from "@/lib/logger";

import type { Message } from "@shared/schema";

export default function Home() {
  const { messages, setMessages, clearMessages, hasPersistedMessages } = useChatPersistence([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatMutation = useChat();

  const handleSend = async () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");

    try {
      const response = await chatMutation.mutateAsync({ messages: newMessages });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.reply },
      ]);
      logger.info("Message sent successfully", { messageCount: newMessages.length });
    } catch (error) {
      // Error is handled by the mutation hook with toast
      // Remove the last user message if request failed
      setMessages((prev) => prev.slice(0, -1));
      logger.error("Failed to send message", error, { messageCount: newMessages.length });
    }
  };

  const handleRetry = () => {
    if (messages.length > 0) {
      // Retry last message
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage?.role === "user") {
        chatMutation.mutate({ messages });
      }
    }
  };

  const handleReset = () => {
    if (window.confirm("هل أنت متأكد أنك تريد بدء محادثة جديدة؟")) {
      clearMessages();
      setInput("");
      chatMutation.reset();
      logger.info("Conversation reset");
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "k",
      ctrlKey: true,
      handler: () => {
        inputRef.current?.focus();
      },
    },
    {
      key: "r",
      ctrlKey: true,
      shiftKey: true,
      handler: () => {
        handleReset();
      },
    },
  ]);

  const isLandingPage = messages.length === 0;

  return (
    <div className="min-h-screen bg-background flex flex-col font-arabic" dir="rtl">
      <SkipLink />
      {/* Header */}
      <header className={`sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 transition-all duration-200 ${isLandingPage ? 'border-transparent' : ''}`}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
          <h1 className="text-xl font-bold text-primary">بيني وبينك</h1>
          
          <div className="flex items-center gap-2">
            {!isLandingPage && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label="إعادة تعيين المحادثة"
              >
                <RefreshCw className="ml-2 w-4 h-4" />
                ابدأ من جديد
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Landing Page or Chat View */}
      {isLandingPage ? (
        <LandingView
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          isLoading={chatMutation.isPending}
          inputRef={inputRef}
        />
      ) : (
        <ChatView
          messages={messages}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          isLoading={chatMutation.isPending}
          isError={chatMutation.isError}
          onRetry={handleRetry}
          inputRef={inputRef}
        />
      )}
    </div>
  );
}
