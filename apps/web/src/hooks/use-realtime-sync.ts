import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { env } from "@/lib/env";
import { queryKeys } from "@/lib/query";

/**
 * Hook to listen for realtime update signals from the server via SSE.
 * When a note is updated on another device, this hook triggers query invalidation.
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const sseUrl = `${env.VITE_AUTH_SERVER_URL}/api/notes/sse`;
    const eventSource = new EventSource(sseUrl, { withCredentials: true });

    const handleDataChange = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id) {
          // Broad invalidation strategy for maximum consistency
          if (data.type === "note") {
            // Invalidate the specific note
            void queryClient.invalidateQueries({
              queryKey: queryKeys.note(data.id),
            });
          }

          // Always invalidate the whole folder/note structure on any change
          // This keeps subfolders, note counts, and titles in sync everywhere.
          void queryClient.invalidateQueries({
            queryKey: ["folder"],
          });
          void queryClient.invalidateQueries({
            queryKey: ["notes"],
          });
        }
      } catch (error) {
        console.error("Failed to parse SSE event data:", error);
      }
    };

    const handleError = (error: Event) => {
      // EventSource handles reconnection automatically
      console.error("SSE Connection Error:", error);
    };

    eventSource.addEventListener("data-change", handleDataChange);
    eventSource.addEventListener("error", handleError);

    return () => {
      eventSource.removeEventListener("data-change", handleDataChange);
      eventSource.removeEventListener("error", handleError);
      eventSource.close();
    };
  }, [queryClient]);
}
