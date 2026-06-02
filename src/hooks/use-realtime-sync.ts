import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to Postgres changes on a set of tables and invalidates
 * matching React Query keys whenever a row changes. Used to keep the
 * public site in sync with admin edits without any manual refresh.
 */
export function useRealtimeSync(
  tables: string[],
  options?: { invalidatePrefix?: string[] }
) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase.channel("global-sync");
    tables.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          // Invalidate everything by default — queries are cheap and this
          // guarantees the site mirrors the admin in real time.
          if (options?.invalidatePrefix?.length) {
            options.invalidatePrefix.forEach((p) =>
              queryClient.invalidateQueries({ queryKey: [p] })
            );
          } else {
            queryClient.invalidateQueries();
          }
        }
      );
    });
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, tables.join("|"), options?.invalidatePrefix?.join("|")]);
}
