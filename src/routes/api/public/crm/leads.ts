import { createFileRoute } from "@tanstack/react-router";
import { authorizeCrmRequest } from "@/lib/crm.server";

export const Route = createFileRoute("/api/public/crm/leads")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const denied = authorizeCrmRequest(request);
        if (denied) return denied;

        const url = new URL(request.url);
        const since = url.searchParams.get("since");
        const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 500);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        let query = supabaseAdmin
          .from("leads")
          .select("id,name,phone,email,message,property_interest,source,created_at,crm_status")
          .order("created_at", { ascending: false })
          .limit(limit);
        if (since) query = query.gte("created_at", since);

        const { data, error } = await query;
        if (error) return Response.json({ error: "query_failed" }, { status: 500 });
        return Response.json({ origin: "strataimoveis", count: data?.length ?? 0, leads: data ?? [] });
      },
    },
  },
});
