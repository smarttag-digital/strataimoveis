import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, MessageSquare, BookOpen } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [p, l, b] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      ]);
      return { properties: p.count ?? 0, leads: l.count ?? 0, posts: b.count ?? 0 };
    },
  });

  const cards = [
    { label: "Imóveis", value: data?.properties ?? 0, icon: Building2, to: "/admin/imoveis" },
    { label: "Leads", value: data?.leads ?? 0, icon: MessageSquare, to: "/admin/leads" },
    { label: "Posts do blog", value: data?.posts ?? 0, icon: BookOpen, to: "/admin/blog" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Visão geral</h1>
      <p className="mt-1 text-sm text-muted-foreground">Resumo do site e do conteúdo publicado.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-[var(--champagne)]">
            <c.icon className="h-6 w-6 text-[var(--champagne)]" />
            <p className="mt-4 text-3xl font-bold">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        <p><strong>Próximas iterações do painel:</strong> CRUD completo de imóveis com upload de fotos/vídeos, gestão de empreendimentos, editor de blog, edição de páginas e SEO. A estrutura do banco já está pronta para receber esses módulos.</p>
      </div>
    </div>
  );
}
