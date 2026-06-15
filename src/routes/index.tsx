import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SearchBar } from "@/components/site/SearchBar";
import { PropertyCard, type PropertyCardData } from "@/components/site/PropertyCard";
import { whatsappLink } from "@/lib/site";
import { ArrowRight, MapPin, ShieldCheck, Sparkles, HandshakeIcon } from "lucide-react";
import heroImg from "@/assets/hero-home.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Letícia Souza Imóveis — Imóveis em Tatuí/SP | CRECI 207663" },
      {
        name: "description",
        content:
          "Encontre casas, apartamentos, terrenos e empreendimentos em Tatuí e região com atendimento consultivo. Compra, venda e Minha Casa Minha Vida.",
      },
      { property: "og:title", content: "Letícia Souza Imóveis — Tatuí/SP" },
      {
        property: "og:description",
        content:
          "Casas, apartamentos, terrenos e investimentos em Tatuí. Atendimento consultivo e exclusivo.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <LatestProperties />
      <FeaturedProperties />
      <Specialties />
      <CtaBanner />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden">
      <img
        src={heroImg}
        alt="Casa elegante em Tatuí"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        width={1920}
        height={1280}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
      <div className="container-prose py-24 text-white">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--champagne)]">
          Tatuí · SP · CRECI 207663
        </p>
        <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          Encontre o imóvel ideal para morar, investir e construir seu patrimônio.
        </h1>
        <p className="mt-6 max-w-2xl text-base text-white/85 md:text-lg">
          Atendimento especializado em Tatuí e região, conectando você às melhores
          oportunidades do mercado imobiliário.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/imoveis" className="btn-primary bg-white text-black hover:bg-[var(--champagne)]">
            Ver Imóveis <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="btn-outline border-white/60 text-white hover:bg-white hover:text-black"
          >
            Falar no WhatsApp
          </a>
        </div>

        <div className="mt-14">
          <SearchBar variant="hero" />
        </div>
      </div>
    </section>
  );
}

function LatestProperties() {
  const { data, isLoading } = useQuery({
    queryKey: ["latest-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(
          "id,slug,title,city,neighborhood,price,bedrooms,bathrooms,parking_spaces,built_area,cover_image,is_featured,is_new,is_opportunity,is_launch"
        )
        .eq("published", true)
        .eq("archived", false)
        .in("status", ["disponivel", "reservado"])
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as PropertyCardData[];
    },
  });

  return (
    <section className="container-prose py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Recém cadastrados
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Últimos imóveis</h2>
        </div>
        <Link to="/imoveis" className="btn-outline">
          Ver todos
        </Link>
      </div>
      {isLoading ? (
        <Skeleton n={6} />
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <PropertyCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <Empty />
      )}
    </section>
  );
}

function FeaturedProperties() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(
          "id,slug,title,city,neighborhood,price,bedrooms,bathrooms,parking_spaces,built_area,cover_image,is_featured,is_new,is_opportunity,is_launch"
        )
        .eq("published", true)
        .eq("archived", false)
        .in("status", ["disponivel", "reservado"])
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data as PropertyCardData[];
    },
  });

  if (!isLoading && (!data || data.length === 0)) return null;

  return (
    <section className="bg-secondary py-20">
      <div className="container-prose">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Selecionados para você
            </p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">Imóveis em destaque</h2>
          </div>
        </div>
        {isLoading ? (
          <Skeleton n={3} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data!.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Skeleton({ n }: { n: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(n)].map((_, i) => (
        <div key={i} className="h-96 animate-pulse rounded-lg bg-secondary" />
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-secondary/50 p-12 text-center">
      <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
      <p className="mt-4 text-muted-foreground">
        Em breve novos imóveis serão publicados aqui. Entre em contato para conhecer as
        oportunidades exclusivas.
      </p>
      <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-primary mt-6">
        Falar com a Letícia
      </a>
    </div>
  );
}

function Specialties() {
  const items = [
    { icon: ShieldCheck, title: "Atendimento Consultivo", text: "Análise personalizada do seu perfil para encontrar o imóvel certo." },
    { icon: Sparkles, title: "Minha Casa Minha Vida", text: "Especialista em financiamento Caixa e enquadramento no programa." },
    { icon: HandshakeIcon, title: "Investimentos Imobiliários", text: "Loteamentos, terrenos e empreendimentos para construir patrimônio." },
  ];
  return (
    <section className="py-24">
      <div className="container-prose">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Especialidades</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            Tudo o que você precisa, com quem entende
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((i) => (
            <div key={i.title} className="rounded-lg border border-border bg-card p-8">
              <i.icon className="h-8 w-8 text-[var(--champagne)]" />
              <h3 className="mt-5 text-lg font-semibold">{i.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{i.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="bg-black py-20 text-white">
      <div className="container-prose grid items-center gap-6 md:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">
            Vamos encontrar o seu próximo imóvel?
          </h2>
          <p className="mt-3 text-white/70">
            Casas, apartamentos, terrenos, condomínios, loteamentos e investimentos em Tatuí e região.
          </p>
        </div>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noreferrer"
          className="btn-primary justify-self-start md:justify-self-end bg-[var(--champagne)] text-black hover:bg-white"
        >
          Conversar no WhatsApp
        </a>
      </div>
    </section>
  );
}
