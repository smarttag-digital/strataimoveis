import { createFileRoute } from "@tanstack/react-router";
import { authorizeCrmRequest } from "@/lib/crm.server";

export const Route = createFileRoute("/api/public/crm/empreendimentos")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const denied = authorizeCrmRequest(request);
        if (denied) return denied;

        const url = new URL(request.url);
        const since = url.searchParams.get("since");
        const limit = Math.min(Number(url.searchParams.get("limit")) || 200, 500);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        let query = supabaseAdmin
          .from("developments")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(limit);
        if (since) query = query.gte("updated_at", since);

        const { data, error } = await query;
        if (error) return Response.json({ error: "query_failed" }, { status: 500 });
        return Response.json({ origin: "strataimoveis", count: data?.length ?? 0, developments: data ?? [] });
      },
    },
  },
});
