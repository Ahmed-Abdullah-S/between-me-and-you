import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Reusable error state component with retry functionality
 * Used for displaying API errors, network failures, etc.
 */
export function ErrorState({
  title = "حدث خطأ",
  message = "حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.",
  onRetry,
  retryLabel = "إعادة المحاولة",
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center p-8"
    >
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" className="mt-4">
                <RefreshCw className="ml-2 h-4 w-4" />
                {retryLabel}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

