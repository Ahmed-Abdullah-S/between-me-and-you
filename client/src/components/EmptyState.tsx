import { MessageSquare, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * Reusable empty state component
 * Used for empty lists, no results, initial states, etc.
 */
export function EmptyState({
  icon,
  title = "لا توجد بيانات",
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center space-y-4"
    >
      {icon || (
        <div className="rounded-full bg-muted p-4">
          <MessageSquare className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        )}
      </div>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

/**
 * Specialized empty state for chat initial state
 */
export function ChatEmptyState() {
  return (
    <EmptyState
      icon={
        <div className="rounded-full bg-primary/10 p-4">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
      }
      title="ابدأ المحادثة"
      description="اكتب رسالتك الأولى لبدء المحادثة"
    />
  );
}

