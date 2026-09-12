import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FormEvent, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SearchBar } from "@/components/site/SearchBar";
import { PropertyCard, type PropertyCardData } from "@/components/site/PropertyCard";
import { formatPrice, whatsappLink } from "@/lib/site";
import { defaultEditorialVideo, useRealtorProfile, useSetting } from "@/lib/site-settings";
import { submitLead } from "@/lib/crm.functions";
import { toVideoEmbed } from "@/lib/video-url";
import { ArrowRight, Building2, Check, Home, KeyRound, LandPlot, MessageCircle, Play, TrendingUp, X } from "lucide-react";
import { toast } from "sonner";
import heroImg from "@/assets/hero-home.jpg";
import logoImg from "@/assets/logo-leticia-souza.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Letícia Souza Imóveis — Imóveis em Tatuí/SP" },
      { name: "description", content: "Curadoria de casas, apartamentos, terrenos e empreendimentos em Tatuí e região, com atendimento imobiliário consultivo." },
      { property: "og:title", content: "Letícia Souza Imóveis — Tatuí/SP" },
      { property: "og:description", content: "Uma seleção criteriosa de imóveis para morar, investir e construir patrimônio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "preload", as: "image", href: heroImg, fetchpriority: "high" } as never],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <SelectedProperties />
      <LatestDevelopments />
      <RealtorStory />
      <Services />
      <OwnerCta />
      <EditorialVideoSection />
      <Regions />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <>
      <section className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden bg-primary text-primary-foreground">
        <img src={heroImg} alt="Residência contemporânea selecionada por Letícia Souza" className="absolute inset-0 -z-20 h-full w-full object-cover" width={1920} height={1280} fetchPriority="high" decoding="async" />
        <div className="absolute inset-0 -z-10 bg-primary/65" />
        <div className="container-prose grid min-h-[calc(100vh-5rem)] items-end gap-10 pb-28 pt-24 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.42fr)] md:pb-32">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-accent">Curadoria imobiliária · Tatuí e região</p>
            <h1 className="mt-7 max-w-4xl text-5xl leading-[0.98] sm:text-6xl md:text-8xl">
              Imóveis escolhidos para fazer sentido para você.
            </h1>
          </div>
          <div className="border-l border-primary-foreground/35 pl-6 md:mb-2">
            <p className="max-w-sm text-base leading-7 text-primary-foreground/80">Atendimento próximo, leitura de mercado e uma seleção criteriosa para cada momento da sua vida.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/imoveis" className="btn-primary bg-accent text-accent-foreground hover:bg-background">Explorar imóveis <ArrowRight className="ml-2 h-4 w-4" /></Link>
              <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-outline border-primary-foreground/60 text-primary-foreground hover:bg-primary-foreground hover:text-primary">Falar com Letícia</a>
            </div>
          </div>
        </div>
      </section>
      <div className="container-prose relative z-10 -mt-16"><SearchBar variant="hero" /></div>
    </>
  );
}

function SelectedProperties() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: async () => {
      const base = "id,slug,title,city,neighborhood,property_type,price,bedrooms,bathrooms,suites,parking_spaces,built_area,cover_image,status,is_featured,is_new,is_opportunity,is_launch";
      const { data: featured, error } = await supabase.from("properties").select(base).eq("published", true).eq("archived", false).in("status", ["disponivel", "reservado"]).eq("is_featured", true).order("created_at", { ascending: false }).limit(6);
      if (error) throw error;
      if (featured && featured.length > 0) return featured as PropertyCardData[];
      const { data: latest, error: latestError } = await supabase.from("properties").select(base).eq("published", true).eq("archived", false).in("status", ["disponivel", "reservado"]).order("created_at", { ascending: false }).limit(6);
      if (latestError) throw latestError;
      return latest as PropertyCardData[];
    },
  });

  return (
    <section className="container-prose py-28 md:py-36">
      <SectionHeading eyebrow="Portfólio selecionado" title="Imóveis que merecem um olhar mais atento." link="/imoveis" linkLabel="Ver todo o portfólio" />
      {isLoading ? <Skeleton n={3} /> : data && data.length > 0 ? (
        <div className="mt-14 grid gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">{data.map((property) => <PropertyCard key={property.id} p={property} />)}</div>
      ) : <Empty />}
    </section>
  );
}

function LatestDevelopments() {
  const { data, isLoading } = useQuery({
    queryKey: ["home-developments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("developments").select("id,slug,name,city,neighborhood,location,cover_image,construction_status,delivery_date,price_from,is_featured").eq("published", true).order("is_featured", { ascending: false }).order("created_at", { ascending: false }).limit(4);
      if (error) throw error;
      return data;
    },
  });
  if (!isLoading && (!data || data.length === 0)) return null;
  return (
    <section className="bg-primary py-28 text-primary-foreground md:py-36">
      <div className="container-prose">
        <SectionHeading eyebrow="Novos capítulos" title="Empreendimentos para acompanhar desde o início." link="/empreendimentos" linkLabel="Conhecer empreendimentos" inverse />
        {isLoading ? <Skeleton n={2} dark /> : (
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {data?.map((development, index) => (
              <Link key={development.id} to="/empreendimento/$slug" params={{ slug: development.slug }} className={`group relative block overflow-hidden ${index === 0 ? "md:row-span-2" : ""}`}>
                <div className={index === 0 ? "aspect-[4/5] md:aspect-auto md:h-full" : "aspect-[16/9]"}>
                  {development.cover_image ? <img src={development.cover_image} alt={development.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" /> : <div className="h-full bg-secondary/15" />}
                </div>
                <div className="absolute inset-0 bg-primary/35" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">{development.construction_status || "Empreendimento"}{development.delivery_date ? ` · ${development.delivery_date}` : ""}</p>
                  <h3 className="mt-2 text-3xl">{development.name}</h3>
                  <p className="mt-2 text-sm text-primary-foreground/75">{[development.neighborhood, development.city, development.location].filter(Boolean).slice(0, 2).join(" · ")}</p>
                  {development.price_from && <p className="mt-4 text-sm">A partir de {formatPrice(development.price_from)}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RealtorStory() {
  const { data: profile } = useRealtorProfile();
  const realtor = profile ?? { name: "Letícia Souza", creci: "CRECI 207663", whatsapp: "5515997546750", photo: "", bio: "Atendimento consultivo em Tatuí e região.", region: "Tatuí e região" };
  return (
    <section className="container-prose grid items-center gap-14 py-28 md:grid-cols-[0.88fr_1.12fr] md:py-36">
      <div className="relative mx-auto w-full max-w-lg">
        <div className="aspect-[4/5] overflow-hidden bg-secondary">
          <img src={realtor.photo || heroImg} alt={`Corretora ${realtor.name}`} loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div className="absolute -bottom-5 -right-3 w-36 bg-background p-4 shadow-lg sm:right-8"><img src={logoImg} alt="Letícia Souza Negócios Imobiliários" className="h-auto w-full" /></div>
      </div>
      <div className="md:pl-8">
        <p className="text-xs uppercase tracking-[0.25em] text-accent">À frente de cada escolha</p>
        <h2 className="mt-5 text-5xl leading-none md:text-7xl">{realtor.name}</h2>
        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">{realtor.creci} · {realtor.region}</p>
        <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">{realtor.bio}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link to="/sobre" className="btn-outline">Conheça minha história</Link>
          <a href={`https://wa.me/${realtor.whatsapp}`} target="_blank" rel="noreferrer" className="btn-primary">Falar comigo</a>
        </div>
      </div>
    </section>
  );
}

const services = [
  { icon: Home, title: "Compra de imóveis", text: "Curadoria alinhada ao seu momento, prioridades e orçamento." },
  { icon: KeyRound, title: "Venda estratégica", text: "Posicionamento, apresentação e condução cuidadosa da negociação." },
  { icon: Building2, title: "Lançamentos", text: "Acesso a projetos promissores e apoio em cada etapa da compra." },
  { icon: LandPlot, title: "Terrenos e loteamentos", text: "Opções para construir, investir e ampliar patrimônio." },
  { icon: TrendingUp, title: "Investimento", text: "Leitura de potencial e oportunidades com visão de longo prazo." },
  { icon: MessageCircle, title: "Consultoria personalizada", text: "Uma conversa clara para transformar intenção em boa decisão." },
];

function Services() {
  return (
    <section className="border-y border-border bg-secondary/45 py-28 md:py-36">
      <div className="container-prose">
        <div className="max-w-2xl"><p className="text-xs uppercase tracking-[0.25em] text-accent">Como posso ajudar</p><h2 className="mt-4 text-5xl leading-none md:text-7xl">Cada negociação pede uma estratégia própria.</h2></div>
        <div className="mt-16 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <div key={service.title} className="bg-background p-8 md:p-10"><service.icon className="h-7 w-7 text-accent" /><h3 className="mt-7 text-2xl">{service.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{service.text}</p></div>)}</div>
      </div>
    </section>
  );
}

function OwnerCta() {
  const [open, setOpen] = useState(false);
  return (
    <section className="container-prose py-28 md:py-36">
      <div className="grid overflow-hidden bg-accent md:grid-cols-[1.2fr_0.8fr]">
        <div className="p-9 md:p-16"><p className="text-xs uppercase tracking-[0.25em]">Para proprietários</p><h2 className="mt-5 max-w-2xl text-5xl leading-none md:text-7xl">Seu imóvel merece uma apresentação à altura.</h2><p className="mt-7 max-w-xl leading-7 text-accent-foreground/75">Conte com avaliação, posicionamento e divulgação cuidadosa para encontrar o comprador certo.</p><button type="button" onClick={() => setOpen(true)} className="btn-primary mt-9">Quero anunciar meu imóvel</button></div>
        <div className="relative min-h-80"><img src={heroImg} alt="Imóvel apresentado com cuidado editorial" loading="lazy" className="absolute inset-0 h-full w-full object-cover" /></div>
      </div>
      {open && <OwnerLeadModal onClose={() => setOpen(false)} />}
    </section>
  );
}

function OwnerLeadModal({ onClose }: { onClose: () => void }) {
  const sendLead = useServerFn(submitLead);
  const [sending, setSending] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    const form = new FormData(event.currentTarget);
    const result = await sendLead({ data: { name: String(form.get("name") || ""), phone: String(form.get("phone") || ""), email: String(form.get("email") || ""), property_interest: "Anunciar imóvel", source: "captacao_home", message: `Tipo: ${String(form.get("type") || "Não informado")}\nLocalização: ${String(form.get("location") || "Não informada")}\n${String(form.get("message") || "")}` } });
    setSending(false);
    if (result.ok) { toast.success("Recebemos seus dados. A Letícia entrará em contato."); onClose(); } else toast.error("Não foi possível enviar agora. Tente novamente.");
  }
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-primary/70 p-4" role="dialog" aria-modal="true" aria-label="Anunciar imóvel">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-background p-7 shadow-2xl md:p-10">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-5"><div><p className="text-xs uppercase tracking-[0.2em] text-accent">Anuncie seu imóvel</p><h2 className="mt-2 text-4xl">Vamos começar com uma conversa.</h2></div><button type="button" onClick={onClose} aria-label="Fechar" className="grid h-10 w-10 place-items-center"><X className="h-5 w-5" /></button></div>
        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <Field label="Nome"><input name="name" required maxLength={200} className="input" /></Field>
          <Field label="WhatsApp"><input name="phone" required maxLength={40} className="input" /></Field>
          <Field label="E-mail"><input name="email" type="email" maxLength={320} className="input" /></Field>
          <Field label="Tipo de imóvel"><select name="type" className="input"><option>Casa</option><option>Apartamento</option><option>Terreno</option><option>Comercial</option><option>Outro</option></select></Field>
          <Field label="Localização" wide><input name="location" maxLength={200} className="input" /></Field>
          <Field label="Conte um pouco sobre o imóvel" wide><textarea name="message" maxLength={3000} className="input min-h-28" /></Field>
          <button type="submit" disabled={sending} className="btn-primary sm:col-span-2">{sending ? "Enviando…" : "Solicitar contato"}</button>
        </form>
      </div>
    </div>
  );
}

function EditorialVideoSection() {
  const { data } = useSetting("editorial_video", defaultEditorialVideo);
  const video = data ?? defaultEditorialVideo;
  const embed = video.url ? toVideoEmbed(video.url) : null;
  if (!embed) return null;
  return (
    <section className="bg-primary py-28 text-primary-foreground md:py-36"><div className="container-prose grid items-center gap-12 md:grid-cols-[0.72fr_1.28fr]"><div><Play className="h-8 w-8 text-accent" /><p className="mt-8 text-xs uppercase tracking-[0.25em] text-accent">Em destaque</p><h2 className="mt-4 text-5xl leading-none md:text-6xl">{video.title}</h2><p className="mt-6 leading-7 text-primary-foreground/65">{video.description}</p>{video.property && <p className="mt-6 text-sm">{video.property}</p>}</div><div className="aspect-video overflow-hidden"><iframe src={embed} title={video.title} loading="lazy" className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></div></section>
  );
}

function Regions() {
  const { data } = useSetting<{ items: string[] }>("service_regions", { items: ["Tatuí", "Boituva", "Cerquilho", "Cesário Lange", "Tietê", "Itapetininga"] });
  const items = data?.items ?? [];
  return <section className="container-prose py-24 text-center md:py-28"><p className="text-xs uppercase tracking-[0.25em] text-accent">Presença local</p><h2 className="mt-4 text-4xl md:text-6xl">Tatuí e região, com conhecimento de perto.</h2><div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4">{items.map((item) => <span key={item} className="border-b border-border pb-2 text-sm uppercase tracking-[0.12em]">{item}</span>)}</div></section>;
}

function SectionHeading({ eyebrow, title, link, linkLabel, inverse = false }: { eyebrow: string; title: string; link: "/imoveis" | "/empreendimentos"; linkLabel: string; inverse?: boolean }) {
  return <div className="grid items-end gap-7 md:grid-cols-[minmax(0,1fr)_auto]"><div><p className={`text-xs uppercase tracking-[0.25em] ${inverse ? "text-accent" : "text-muted-foreground"}`}>{eyebrow}</p><h2 className="mt-4 max-w-3xl text-5xl leading-none md:text-7xl">{title}</h2></div><Link to={link} className={`inline-flex items-center gap-2 border-b pb-2 text-sm ${inverse ? "border-primary-foreground/45" : "border-foreground/40"}`}>{linkLabel}<ArrowRight className="h-4 w-4" /></Link></div>;
}

function Skeleton({ n, dark = false }: { n: number; dark?: boolean }) {
  return <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: n }).map((_, i) => <div key={i} className={`aspect-[4/5] animate-pulse ${dark ? "bg-primary-foreground/10" : "bg-secondary"}`} />)}</div>;
}

function Empty() {
  return <div className="mt-14 border-y border-border py-14 text-center"><Check className="mx-auto h-8 w-8 text-accent" /><p className="mt-4 text-muted-foreground">Novas oportunidades estão sendo selecionadas. Fale com a Letícia para receber opções exclusivas.</p><a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-primary mt-6">Falar com Letícia</a></div>;
}

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={wide ? "sm:col-span-2" : ""}><span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}
