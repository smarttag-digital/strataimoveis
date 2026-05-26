import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { whatsappLink, SITE } from "@/lib/site";
import logo from "@/assets/logo-leticia-souza.png";

export const Route = createFileRoute("/sobre")({
  component: SobrePage,
});

function SobrePage() {
  const { data } = useQuery({
    queryKey: ["settings", "about"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "about").maybeSingle();
      return (data?.value as { title?: string; body?: string }) ?? null;
    },
  });

  return (
    <SiteLayout>
      <section className="container-prose py-24">
        <div className="grid items-center gap-16 md:grid-cols-[1fr_2fr]">
          <div className="rounded-2xl border border-border bg-secondary p-10">
            <img src={logo} alt={SITE.name} className="mx-auto h-40 w-auto" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Quem Sou</p>
            <h1 className="mt-2 text-3xl font-bold md:text-5xl">
              {data?.title ?? "Quem Sou"}
            </h1>
            <p className="mt-6 whitespace-pre-line text-lg text-muted-foreground">
              {data?.body ??
                "Sou Letícia Souza, profissional do mercado imobiliário em Tatuí-SP, especializada em conectar pessoas às melhores oportunidades para morar, investir e construir patrimônio."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-primary">
                Falar no WhatsApp
              </a>
              <a href="/imoveis" className="btn-outline">Ver imóveis</a>
            </div>
            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-muted-foreground">{SITE.creci}</p>
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
            <div key={s.n} className="rounded-lg border border-border bg-card p-8">
              <p className="text-3xl font-bold text-[var(--champagne)]">{s.n}</p>
              <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
