import { useMutation } from "@tanstack/react-query";
import { api, type ChatRequest, type ChatResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useChat() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ChatRequest) => {
      // Validate input before sending using the shared schema
      const validatedData = api.chat.input.parse(data);

      const res = await fetch(api.chat.path, {
        method: api.chat.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send message");
      }

      // Validate response
      const responseData = await res.json();
      return api.chat.responses[200].parse(responseData);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });
}
