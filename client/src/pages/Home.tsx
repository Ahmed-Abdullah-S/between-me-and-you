import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, RefreshCw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeProvider";

import type { Message } from "@shared/schema";

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

  const isLandingPage = messages.length === 0;

  return (
    <div className="min-h-screen bg-background flex flex-col font-arabic" dir="rtl">
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
              >
                <RefreshCw className="ml-2 w-4 h-4" />
                ابدأ من جديد
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Landing Page */}
      {isLandingPage ? (
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-3xl w-full flex flex-col items-center gap-12">
            {/* Welcome Message - Styled beautifully */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center space-y-6"
            >
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight"
              >
                بيني وبينك
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-4"
              >
                <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed font-light">
                  يمكن تحس إنك متضايق
                </p>
                <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed font-light">
                  أو متلخبط
                </p>
                <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed font-light">
                  أو حتى ما تدري وش فيك
                </p>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="text-2xl md:text-3xl text-primary font-medium mt-8 mb-6"
                >
                  عادي
                </motion.p>
                
                <div className="space-y-3 mt-8">
                  <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
                    اكتب اللي في بالك
                  </p>
                  <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
                    وأنا بسألك كم سؤال
                  </p>
                  <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
                    عشان نفصل الشعور عن المشكلة
                  </p>
                </div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="text-base md:text-lg text-muted-foreground mt-8 italic"
                >
                  خلك على طبيعتك
                  <br />
                  ما فيه إجابة صح أو غلط
                </motion.p>
              </motion.div>
            </motion.div>

            {/* Chat Input - Centered and larger on landing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="w-full max-w-2xl"
            >
              <Card className="p-3 shadow-xl border-border/50 rounded-3xl bg-card/50 backdrop-blur-sm">
                <div className="relative">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب ما تشعر به هنا..."
                    className="min-h-[120px] max-h-[200px] border-0 focus-visible:ring-2 focus-visible:ring-primary/20 shadow-none resize-none bg-transparent py-6 pl-16 pr-6 text-lg"
                    rows={4}
                    disabled={chatMutation.isPending}
                    autoFocus
                  />
                  <div className="absolute bottom-4 left-4">
                    <Button 
                      size="icon" 
                      onClick={handleSend} 
                      disabled={!input.trim() || chatMutation.isPending}
                      className={`rounded-xl h-10 w-10 transition-all duration-300 ${
                        input.trim() 
                          ? 'opacity-100 translate-y-0 shadow-lg' 
                          : 'opacity-40 translate-y-1'
                      }`}
                    >
                      {chatMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="text-center text-xs text-muted-foreground/70 mt-4 px-4"
              >
                تنبيه: هذا فهم مبدئي مو تشخيص طبي. إذا كنت في خطر أو تفكر بإيذاء نفسك اطلب مساعدة مختصة فورًا.
              </motion.p>
            </motion.div>
          </div>
        </main>
      ) : (
        /* Full Chat View */
        <>
          <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 flex flex-col gap-6 overflow-y-auto">
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

          {/* Input Area - Sticky footer for chat view */}
          <footer className="sticky bottom-0 z-10 bg-background/90 backdrop-blur-lg pt-2 pb-6 px-4 border-t border-border/50">
            <div className="max-w-2xl mx-auto space-y-4">
              <Card className="p-2 shadow-lg border-border rounded-2xl bg-card overflow-hidden">
                <div className="relative">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب ردك هنا..."
                    className="min-h-[60px] max-h-[160px] border-0 focus-visible:ring-0 shadow-none resize-none bg-transparent py-4 pl-14 pr-4"
                    rows={1}
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
                        <Send className="w-5 h-5 ml-0.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
