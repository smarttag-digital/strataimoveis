import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PropertyCard, type PropertyCardData } from "@/components/site/PropertyCard";
import { whatsappLink, PROPERTY_TYPES } from "@/lib/site";
import { ArrowRight, MapPin, Search, ShieldCheck, Sparkles, HandshakeIcon } from "lucide-react";
import heroImg from "@/assets/hero-home.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <QuickSearch />
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
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
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
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-outline border-white/60 text-white hover:bg-white hover:text-black">
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

function QuickSearch() {
  return (
    <section className="relative -mt-16 z-10 px-5">
      <form
        action="/imoveis"
        method="get"
        className="container-prose grid grid-cols-1 gap-3 rounded-xl bg-card p-5 shadow-2xl shadow-black/10 md:grid-cols-[1fr_1fr_1fr_auto]"
      >
        <select name="type" className="rounded-md border border-border bg-background px-4 py-3 text-sm">
          <option value="">Tipo de imóvel</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input
          name="city"
          placeholder="Cidade ou bairro"
          className="rounded-md border border-border bg-background px-4 py-3 text-sm"
        />
        <select name="bedrooms" className="rounded-md border border-border bg-background px-4 py-3 text-sm">
          <option value="">Dormitórios</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
        <button type="submit" className="btn-primary">
          <Search className="mr-2 h-4 w-4" /> Buscar
        </button>
      </form>
    </section>
  );
}

function FeaturedProperties() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id,slug,title,city,neighborhood,price,bedrooms,bathrooms,parking_spaces,built_area,cover_image,is_featured,is_new,is_opportunity,is_launch")
        .eq("published", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data as PropertyCardData[];
    },
  });

  return (
    <section className="container-prose py-24">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Selecionados para você</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Imóveis em destaque</h2>
        </div>
        <Link to="/imoveis" className="btn-outline">Ver todos</Link>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-lg bg-secondary" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-secondary/50 p-12 text-center">
          <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            Em breve novos imóveis serão publicados aqui. Entre em contato para
            conhecer as oportunidades exclusivas.
          </p>
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-primary mt-6">
            Falar com a Letícia
          </a>
        </div>
      )}
    </section>
  );
}

function Specialties() {
  const items = [
    { icon: ShieldCheck, title: "Atendimento Consultivo", text: "Análise personalizada do seu perfil para encontrar o imóvel certo." },
    { icon: Sparkles, title: "Minha Casa Minha Vida", text: "Especialista em financiamento Caixa e enquadramento no programa." },
    { icon: HandshakeIcon, title: "Investimentos Imobiliários", text: "Loteamentos, terrenos e empreendimentos para construir patrimônio." },
  ];
  return (
    <section className="bg-secondary py-24">
      <div className="container-prose">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Especialidades</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Tudo o que você precisa, com quem entende</h2>
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
          <h2 className="text-3xl font-bold md:text-4xl">Vamos encontrar o seu próximo imóvel?</h2>
          <p className="mt-3 text-white/70">
            Casas, apartamentos, terrenos, condomínios, loteamentos e investimentos em Tatuí e região.
          </p>
        </div>
        <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-primary justify-self-start md:justify-self-end bg-[var(--champagne)] text-black hover:bg-white">
          Conversar no WhatsApp
        </a>
      </div>
    </section>
  );
}
