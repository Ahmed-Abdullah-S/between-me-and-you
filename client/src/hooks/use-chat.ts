import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { api, type ChatRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { withRetry, isRetryableError } from "@/lib/retry";
import { logger } from "@/lib/logger";

const REQUEST_TIMEOUT = 45000; // 45 seconds (longer than server's 30s for OpenAI)

export function useChat() {
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: ChatRequest) => {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Validate input before sending using the shared schema
      const validatedData = api.chat.input.parse(data);

      // Use retry logic for transient errors
      return withRetry(
        async () => {
          // Set up timeout
          const timeoutId = setTimeout(() => {
            abortController.abort();
          }, REQUEST_TIMEOUT);

          try {
            const res = await fetch(api.chat.path, {
              method: api.chat.method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(validatedData),
              signal: abortController.signal,
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              const errorMessage = errorData.message || "Failed to send message";
              
              // Create error with status code info for retry logic
              const error = new Error(errorMessage);
              if (res.status >= 500) {
                // Server errors are retryable
                (error as any).retryable = true;
              }
              throw error;
            }

            // Validate response
            const responseData = await res.json();
            return api.chat.responses[200].parse(responseData);
          } catch (error) {
            clearTimeout(timeoutId);
            throw error;
          }
        },
        {
          maxAttempts: 2, // Only retry once for chat (don't want duplicate messages)
          baseDelay: 2000,
          shouldRetry: (error) => {
            // Don't retry aborted requests (user-initiated cancellation)
            if (error.name === "AbortError") return false;
            // Retry server errors and network errors
            return (error as any).retryable || isRetryableError(error);
          },
        }
      );
    },
    onError: (error) => {
      // Don't show toast for aborted requests
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      
      logger.error("Chat request failed", error);
      
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Clear abort controller after request completes
      abortControllerRef.current = null;
    },
  });

  // Cleanup: abort request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return mutation;
}
