import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Newspaper } from "lucide-react";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
});

function BlogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id,slug,title,excerpt,category,cover_image,published_at,author")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary py-16">
        <div className="container-prose">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Conteúdo & Mercado</p>
          <h1 className="mt-2 text-3xl font-bold md:text-5xl">Blog</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Mercado imobiliário, Minha Casa Minha Vida, financiamento Caixa, terrenos, investimentos e dicas para compradores.
          </p>
        </div>
      </section>

      <section className="container-prose py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-80 animate-pulse rounded-lg bg-secondary" />)}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {data.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-lg border border-border bg-card">
                {p.cover_image && (
                  <img src={p.cover_image} alt={p.title} className="aspect-[16/9] w-full object-cover" loading="lazy" />
                )}
                <div className="p-6">
                  {p.category && <p className="text-xs uppercase tracking-[0.2em] text-[var(--champagne)]">{p.category}</p>}
                  <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
                  {p.excerpt && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>}
                  <p className="mt-4 text-xs text-muted-foreground">{p.author}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-secondary/50 p-12 text-center">
            <Newspaper className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Em breve novos conteúdos sobre o mercado imobiliário de Tatuí.</p>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
