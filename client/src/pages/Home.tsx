import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, RefreshCw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeProvider";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

const WELCOME_MESSAGE = `يمكن تحس إنك متضايق
أو متلخبط
أو حتى ما تدري وش فيك

عادي

اكتب اللي في بالك
وأنا بسألك كم سؤال
عشان نفصل الشعور
عن المشكلة

خلك على طبيعتك
ما فيه إجابة صح أو غلط`;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMutation = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMutation.isPending]);

  const handleSend = async () => {
    if (!input.trim()) return;

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
    } catch (error) {
      // Error is handled by the mutation hook with toast
      console.error(error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    if (window.confirm("هل أنت متأكد أنك تريد بدء محادثة جديدة؟")) {
      setMessages([]);
      setInput("");
      chatMutation.reset();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-arabic" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 transition-all duration-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
          <h1 className="text-xl font-bold text-primary">بيني وبينك</h1>
          
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <RefreshCw className="ml-2 w-4 h-4" />
                ابدأ من جديد
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        
        {/* Welcome Message - Only show if no messages */}
        {messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 flex flex-col justify-center items-center text-center py-12"
          >
            <div className="bg-card p-8 rounded-3xl shadow-sm border border-border max-w-lg">
              <p className="whitespace-pre-line text-lg md:text-xl leading-loose text-foreground font-medium">
                {WELCOME_MESSAGE}
              </p>
            </div>
          </motion.div>
        )}

        {/* Chat Transcript */}
        <div className="flex-1 flex flex-col gap-6 pb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`
                    max-w-[85%] px-6 py-4 rounded-2xl text-base leading-relaxed shadow-sm
                    ${msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-card text-foreground border border-border rounded-tl-sm shadow-sm"}
                  `}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator - Instagram style animated dots (subtle) */}
          {chatMutation.isPending && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-end"
            >
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
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

      </main>

      {/* Input Area */}
      <footer className="sticky bottom-0 z-10 bg-background/90 backdrop-blur-lg pt-2 pb-6 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Card className="p-2 shadow-lg border-border rounded-2xl bg-card overflow-hidden">
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={messages.length === 0 ? "اكتب ما تشعر به هنا..." : "اكتب ردك هنا..."}
                className="min-h-[60px] max-h-[160px] border-0 focus-visible:ring-0 shadow-none resize-none bg-transparent py-4 pl-14 pr-4"
                rows={messages.length === 0 ? 3 : 1}
                disabled={chatMutation.isPending}
              />
              <div className="absolute bottom-3 left-3">
                <Button 
                  size="icon" 
                  onClick={handleSend} 
                  disabled={!input.trim() || chatMutation.isPending}
                  className={`rounded-xl transition-all duration-300 ${input.trim() ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-1'}`}
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 ml-0.5" /> // ml-0.5 visual correction for send icon
                  )}
                </Button>
              </div>
            </div>
          </Card>
          
          <p className="text-center text-xs text-muted-foreground/60 px-4">
            تنبيه: هذا فهم مبدئي مو تشخيص طبي. إذا كنت في خطر أو تفكر بإيذاء نفسك اطلب مساعدة مختصة فورًا.
          </p>
        </div>
      </footer>
    </div>
  );
}
