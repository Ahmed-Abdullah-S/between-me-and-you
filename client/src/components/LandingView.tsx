import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { CharacterCounter } from "@/components/CharacterCounter";

const MAX_MESSAGE_LENGTH = 2000;

interface LandingViewProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

const WELCOME_MESSAGE = {
  title: "بيني وبينك",
  lines: [
    "يمكن تحس إنك متضايق",
    "أو متلخبط",
    "أو حتى ما تدري وش فيك",
  ],
  emphasis: "عادي",
  instructions: [
    "اكتب اللي في بالك",
    "وأنا بسألك كم سؤال",
    "عشان نفصل الشعور عن المشكلة",
  ],
  footer: "خلك على طبيعتك\nما فيه إجابة صح أو غلط",
};

/**
 * Landing page view component
 * Displays welcome message and initial input
 */
export function LandingView({
  input,
  onInputChange,
  onSend,
  isLoading,
  inputRef,
}: LandingViewProps) {
  return (
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
            className="text-4xl md:text-6xl font-bold mb-8 leading-tight"
            style={{
              background: "linear-gradient(135deg, hsl(196 65% 35%) 0%, hsl(196 55% 50%) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {WELCOME_MESSAGE.title}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            {WELCOME_MESSAGE.lines.map((line, index) => (
              <p
                key={index}
                className="text-xl md:text-2xl text-foreground/90 leading-relaxed font-light"
              >
                {line}
              </p>
            ))}

            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8, type: "spring", stiffness: 200 }}
              className="text-3xl md:text-4xl font-semibold mt-10 mb-8"
              style={{
                background: "linear-gradient(135deg, hsl(196 65% 35%) 0%, hsl(196 55% 50%) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {WELCOME_MESSAGE.emphasis}
            </motion.p>

            <div className="space-y-3 mt-8">
              {WELCOME_MESSAGE.instructions.map((instruction, index) => (
                <p
                  key={index}
                  className="text-lg md:text-xl text-foreground/80 leading-relaxed"
                >
                  {instruction}
                </p>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="text-base md:text-lg text-muted-foreground mt-8 italic whitespace-pre-line"
            >
              {WELCOME_MESSAGE.footer}
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
          <Card className="p-3 shadow-xl border-border/30 rounded-3xl bg-card/80 backdrop-blur-md card-hover">
            <div className="relative">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                    onInputChange(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                placeholder="اكتب ما تشعر به هنا..."
                className="min-h-[120px] max-h-[200px] border-0 focus-visible:ring-2 focus-visible:ring-primary/20 shadow-none resize-none bg-transparent py-6 pl-16 pr-6 text-lg"
                rows={4}
                disabled={isLoading}
                autoFocus
                aria-label="حقل إدخال الرسالة"
                aria-describedby="input-help-text"
                maxLength={MAX_MESSAGE_LENGTH}
              />
              <div className="absolute top-2 left-4">
                <CharacterCounter current={input.length} max={MAX_MESSAGE_LENGTH} showAt={500} />
              </div>
              <div className="absolute bottom-4 left-4">
                <Button
                  size="icon"
                  onClick={onSend}
                  disabled={!input.trim() || isLoading}
                  className={`rounded-xl h-10 w-10 transition-all duration-300 ${
                    input.trim()
                      ? "opacity-100 translate-y-0 shadow-lg"
                      : "opacity-40 translate-y-1"
                  }`}
                  aria-label="إرسال الرسالة"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="w-5 h-5" aria-hidden="true" />
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
            id="input-help-text"
          >
            تنبيه: هذا فهم مبدئي مو تشخيص طبي. إذا كنت في خطر أو تفكر بإيذاء نفسك اطلب مساعدة مختصة فورًا.
          </motion.p>
        </motion.div>
      </div>
    </main>
  );
}

