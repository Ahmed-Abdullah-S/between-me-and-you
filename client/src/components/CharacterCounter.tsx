import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  current: number;
  max?: number;
  showAt?: number; // Only show when current >= this value
  className?: string;
}

/**
 * Character counter for text inputs
 * Shows remaining characters when approaching limit
 */
export function CharacterCounter({
  current,
  max = 2000,
  showAt = 100,
  className,
}: CharacterCounterProps) {
  if (current < showAt) return null;

  const remaining = max - current;
  const isWarning = remaining < 200;
  const isDanger = remaining < 50;

  return (
    <span
      className={cn(
        "text-xs transition-colors",
        isDanger
          ? "text-destructive font-medium"
          : isWarning
          ? "text-amber-500"
          : "text-muted-foreground/60",
        className
      )}
    >
      {remaining.toLocaleString("ar-SA")}
    </span>
  );
}

