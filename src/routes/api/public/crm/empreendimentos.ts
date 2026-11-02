import { createFileRoute } from "@tanstack/react-router";
import { authorizeCrmRequest } from "@/lib/crm.server";
import { crmQuerySchema } from "@/lib/security-validation";

export const Route = createFileRoute("/api/public/crm/empreendimentos")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const denied = authorizeCrmRequest(request);
        if (denied) return denied;

        const url = new URL(request.url);
        const parsed = crmQuerySchema.safeParse({ since: url.searchParams.get("since"), limit: url.searchParams.get("limit") ?? 200 });
        if (!parsed.success) return Response.json({ error: "invalid_query" }, { status: 400 });
        const { since, limit } = parsed.data;

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
        return Response.json({ origin: "strataimoveis", count: data?.length ?? 0, developments: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});
