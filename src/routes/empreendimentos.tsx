import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { formatPrice, whatsappLink } from "@/lib/site";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/empreendimentos")({
  head: () => ({ meta: [
    { title: "Empreendimentos em Tatuí — Letícia Souza Imóveis" },
    { name: "description", content: "Conheça lançamentos e empreendimentos selecionados em Tatuí e região." },
    { property: "og:title", content: "Empreendimentos em Tatuí" },
    { property: "og:description", content: "Lançamentos, loteamentos e projetos selecionados por Letícia Souza." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: EmpreendimentosPage,
});

function EmpreendimentosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["developments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("developments")
        .select("id,name,slug,description,location,city,neighborhood,cover_image,published,created_at,construction_status,delivery_date,price_from,price_to")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data;
    },
  });

  return (
    <SiteLayout>
       <section className="border-b border-border bg-primary py-20 text-primary-foreground md:py-28">
        <div className="container-prose">
           <p className="text-xs uppercase tracking-[0.25em] text-accent">Lançamentos & Loteamentos</p>
           <h1 className="mt-4 text-5xl md:text-7xl">Empreendimentos</h1>
           <p className="mt-5 max-w-2xl text-primary-foreground/65">
            Conheça os principais empreendimentos disponíveis em Tatuí e região.
          </p>
        </div>
      </section>

       <section className="container-prose py-20 md:py-28">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-72 animate-pulse rounded-lg bg-secondary" />)}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {data.map((d) => (
             <article key={d.id} className="group overflow-hidden bg-card">
                <Link to="/empreendimento/$slug" params={{ slug: d.slug }}>
                  {d.cover_image ? (
                     <img src={d.cover_image} alt={d.name} className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" decoding="async" />
                  ) : (
                    <div className="flex aspect-[16/9] items-center justify-center bg-secondary text-muted-foreground">
                      <Building2 className="h-10 w-10" />
                    </div>
                  )}
                </Link>
                 <div className="py-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{[d.neighborhood, d.city].filter(Boolean).join(" · ") || d.location}</p>
                   <h3 className="mt-2 text-3xl">
                    <Link to="/empreendimento/$slug" params={{ slug: d.slug }}>{d.name}</Link>
                  </h3>
                  {d.description && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{d.description}</p>}
                   <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                     {d.construction_status && <span>{d.construction_status}</span>}
                     {d.delivery_date && <span>Entrega {d.delivery_date}</span>}
                     {d.price_from && <span>A partir de {formatPrice(d.price_from)}</span>}
                   </div>
                  <div className="mt-5 flex gap-2">
                    <Link to="/empreendimento/$slug" params={{ slug: d.slug }} className="btn-primary text-xs">Ver detalhes</Link>
                    <a
                      href={whatsappLink(`Olá Letícia, gostaria de mais informações sobre o empreendimento "${d.name}".`)}
                      target="_blank" rel="noreferrer"
                      className="btn-outline text-xs"
                    >
                      Tenho interesse
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-secondary/50 p-12 text-center">
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Em breve novos empreendimentos serão divulgados. Entre em contato para conhecer os disponíveis.
            </p>
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-primary mt-6 inline-flex">
              Falar no WhatsApp
            </a>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
