import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BASE_URL = "https://strataimoveis.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = ["/", "/imoveis", "/empreendimentos", "/sobre", "/contato", "/blog"];

        const [{ data: props }, { data: devs }, { data: posts }] = await Promise.all([
          supabaseAdmin
            .from("properties")
            .select("slug,updated_at")
            .eq("published", true)
            .eq("archived", false),
          supabaseAdmin
            .from("developments")
            .select("slug,updated_at")
            .eq("published", true),
          supabaseAdmin
            .from("blog_posts")
            .select("slug,updated_at")
            .eq("published", true),
        ]);

        const urls: string[] = [];
        const push = (loc: string, lastmod?: string, priority = "0.7") => {
          urls.push(
            `  <url>\n    <loc>${BASE_URL}${loc}</loc>${
              lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ""
            }\n    <priority>${priority}</priority>\n  </url>`
          );
        };

        for (const p of staticPaths) push(p, undefined, p === "/" ? "1.0" : "0.8");
        for (const r of props ?? []) push(`/imoveis/${r.slug}`, r.updated_at, "0.9");
        for (const r of devs ?? []) push(`/empreendimento/${r.slug}`, r.updated_at, "0.8");
        for (const r of posts ?? []) push(`/blog/${r.slug}`, r.updated_at, "0.6");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join(
          "\n"
        )}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=600",
          },
        });
      },
    },
  },
});
