import { useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { MessageBubble } from "@/components/MessageBubble";
import { ErrorState } from "@/components/ErrorState";
import { ChatEmptyState } from "@/components/EmptyState";
import { TypingIndicator } from "@/components/TypingIndicator";
import { CharacterCounter } from "@/components/CharacterCounter";
import type { Message } from "@shared/schema";

const MAX_MESSAGE_LENGTH = 2000;

interface ChatViewProps {
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

/**
 * Chat view component
 * Displays message history and input area
 */
export function ChatView({
  messages,
  input,
  onInputChange,
  onSend,
  isLoading,
  isError,
  onRetry,
  inputRef,
}: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <>
      <main
        id="main-content"
        className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 flex flex-col gap-6 overflow-y-auto"
        role="main"
        aria-label="المحادثة"
      >
        {/* Chat Transcript */}
        <div className="flex-1 flex flex-col gap-6 pb-4">
          {messages.length === 0 && !isLoading && <ChatEmptyState />}

          {isError && !isLoading && messages.length === 0 && (
            <ErrorState
              title="فشل تحميل المحادثة"
              message="حدث خطأ أثناء الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى."
              onRetry={onRetry}
            />
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <MessageBubble
                key={`${msg.role}-${index}-${msg.content.slice(0, 10)}`}
                message={msg}
                index={index}
              />
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area - Sticky footer for chat view */}
      <footer className="sticky bottom-0 z-10 bg-background/90 backdrop-blur-lg pt-2 pb-6 px-4 border-t border-border/50">
        <div className="max-w-2xl mx-auto space-y-4">
          <Card className="p-2 shadow-lg border-border rounded-2xl bg-card overflow-hidden">
            <div className="relative">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                    onInputChange(e.target.value);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="اكتب ردك هنا..."
                className="min-h-[60px] max-h-[160px] border-0 focus-visible:ring-0 shadow-none resize-none bg-transparent py-4 pl-14 pr-4"
                rows={1}
                disabled={isLoading}
                aria-label="حقل إدخال الرسالة"
                maxLength={MAX_MESSAGE_LENGTH}
              />
              {input.length > 100 && (
                <div className="absolute top-2 left-14">
                  <CharacterCounter current={input.length} max={MAX_MESSAGE_LENGTH} showAt={100} />
                </div>
              )}
              <div className="absolute bottom-3 left-3">
                <Button
                  size="icon"
                  onClick={onSend}
                  disabled={!input.trim() || isLoading}
                  className={`rounded-xl transition-all duration-300 ${
                    input.trim() ? "opacity-100 translate-y-0" : "opacity-50 translate-y-1"
                  }`}
                  aria-label="إرسال الرسالة"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="w-5 h-5 ml-0.5" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </footer>
    </>
  );
}

