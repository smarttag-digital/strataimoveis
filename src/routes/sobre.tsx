import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SITE } from "@/lib/site";
import { useRealtorProfile, useSetting } from "@/lib/site-settings";
import logo from "@/assets/logo-leticia-souza.png";

export const Route = createFileRoute("/sobre")({
  head: () => ({ meta: [
    { title: "Quem Sou — Letícia Souza Imóveis" },
    { name: "description", content: "Conheça Letícia Souza, corretora de imóveis em Tatuí e região, e sua forma consultiva de conduzir cada negociação." },
    { property: "og:title", content: "Quem Sou — Letícia Souza Imóveis" },
    { property: "og:description", content: "Atendimento próximo, curadoria e conhecimento do mercado imobiliário de Tatuí." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SobrePage,
});

function SobrePage() {
  const { data } = useSetting<{ title?: string; body?: string }>("about", {});
  const { data: profile } = useRealtorProfile();

  return (
    <SiteLayout>
       <section className="container-prose py-24 md:py-32">
         <div className="grid items-center gap-16 md:grid-cols-[0.9fr_1.1fr]">
           <div className="relative">
             <div className="aspect-[4/5] overflow-hidden bg-secondary">
               <img src={profile?.photo || logo} alt={profile?.name || SITE.name} className={`h-full w-full ${profile?.photo ? "object-cover" : "object-contain p-16"}`} />
             </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Quem Sou</p>
             <h1 className="mt-4 text-5xl leading-none md:text-7xl">
               {data?.title ?? profile?.name ?? "Letícia Souza"}
            </h1>
            <p className="mt-6 whitespace-pre-line text-lg text-muted-foreground">
               {data?.body ?? profile?.bio ?? "Sou Letícia Souza, profissional do mercado imobiliário em Tatuí-SP, especializada em conectar pessoas às melhores oportunidades para morar, investir e construir patrimônio."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
               <a href={`https://wa.me/${profile?.whatsapp || "5515997546750"}`} target="_blank" rel="noreferrer" className="btn-primary">
                Falar no WhatsApp
              </a>
              <a href="/imoveis" className="btn-outline">Ver imóveis</a>
            </div>
             <p className="mt-8 text-xs uppercase tracking-[0.25em] text-muted-foreground">{profile?.creci || SITE.creci} · {profile?.region || "Tatuí e região"}</p>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-20">
        <div className="container-prose grid gap-8 md:grid-cols-3">
          {[
            { n: "01", t: "Consultoria", d: "Análise do seu perfil, orçamento e objetivos para indicar o imóvel certo." },
            { n: "02", t: "Curadoria", d: "Seleção criteriosa de imóveis, empreendimentos e oportunidades em Tatuí." },
            { n: "03", t: "Concretização", d: "Acompanhamento completo do financiamento, documentação e entrega das chaves." },
          ].map((s) => (
             <div key={s.n} className="border-t border-border bg-card py-8">
               <p className="text-3xl text-accent">{s.n}</p>
              <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
