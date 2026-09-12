import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { formatPrice, propertyWhatsappLink } from "@/lib/site";
import { useRealtorProfile } from "@/lib/site-settings";
import { Bed, Bath, Car, Maximize, MapPin, ArrowLeft, Ruler, X, ChevronLeft, ChevronRight, PlayCircle, CalendarDays } from "lucide-react";
import { toVideoEmbed, isValidVideoUrl } from "@/lib/video-url";
import { canSchedule, schedulingLink } from "@/lib/scheduling";

const FALLBACK_PROPERTY_IMAGE = "/placeholder.svg";

export const Route = createFileRoute("/imoveis/$slug")({
  component: PropertyDetail,
  head: ({ params }) => ({
    meta: [
      { title: `Imóvel · ${params.slug.replace(/-/g, " ")}` },
    ],
    links: [{ rel: "canonical", href: `https://strataimoveis.lovable.app/imoveis/${params.slug}` }],
  }),
});

function PropertyDetail() {
  const { slug } = Route.useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["property", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*, agent:agents(id,name,photo,phone,whatsapp,email,creci,bio,active)")
        .eq("slug", slug)
        .eq("archived", false)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <SiteLayout><div className="container-prose py-24"><div className="h-96 animate-pulse rounded-lg bg-secondary" /></div></SiteLayout>;
  }
  if (!data) {
    return (
      <SiteLayout>
        <div className="container-prose py-24 text-center">
          <h1 className="text-2xl font-bold">Imóvel não encontrado</h1>
          <Link to="/imoveis" className="btn-primary mt-6 inline-flex">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const gallery = (data.gallery as string[]) || [];
  const allImages = ([data.cover_image, ...gallery].filter(Boolean) as string[]).length
    ? ([data.cover_image, ...gallery].filter(Boolean) as string[])
    : [FALLBACK_PROPERTY_IMAGE];
  const videos = ((data.videos as string[]) || []).filter(isValidVideoUrl);
  const agent = (data as any).agent as
    | { id: string; name: string; photo: string | null; phone: string | null; whatsapp: string | null; email: string | null; creci: string | null; active: boolean }
    | null;

  return (
    <SiteLayout>
      <section className="container-prose py-10">
        <Link to="/imoveis" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para imóveis
        </Link>
        <div className="grid gap-3 md:grid-cols-[1.5fr_1fr]">
          <button type="button" onClick={() => { setActiveImage(0); setLightboxOpen(true); }} className="relative overflow-hidden rounded-lg bg-secondary text-left">
            <img src={allImages[0]} alt={data.title} loading="eager" decoding="async" className="aspect-[16/10] h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
          </button>
          <div className="grid grid-cols-2 gap-3">
            {allImages.slice(1, 5).map((img, i) => (
              <button key={img} type="button" onClick={() => { setActiveImage(i + 1); setLightboxOpen(true); }} className="overflow-hidden rounded-lg bg-secondary">
                <img src={img} alt={`${data.title} - foto ${i + 2}`} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover transition-transform duration-300 hover:scale-105" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_360px]">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              <MapPin className="mr-1 inline h-3 w-3" />
              {[data.neighborhood, data.city].filter(Boolean).join(" · ")} · Ref. {data.reference}
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">{data.title}</h1>
            {(data.status === "vendido" || data.status === "alugado") && (
              <span className="mt-4 inline-flex rounded bg-destructive px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive-foreground">
                {data.status}
              </span>
            )}
            <p className="mt-4 text-3xl font-bold">{formatPrice(data.price)}</p>
            {(data.condo_fee || data.iptu) && (
              <p className="mt-1 text-sm text-muted-foreground">
                {data.condo_fee ? `Condomínio ${formatPrice(data.condo_fee)}/mês` : null}
                {data.condo_fee && data.iptu ? " · " : null}
                {data.iptu ? `IPTU ${formatPrice(data.iptu)}/ano` : null}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              {canSchedule(data) && (
                <a
                  href={schedulingLink(data)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <CalendarDays className="h-4 w-4" /> Agendar visita
                </a>
              )}
              {videos.length > 0 && (
                <a href="#videos" className="inline-flex items-center gap-2 rounded border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">
                  <PlayCircle className="h-4 w-4" /> Assistir vídeo
                </a>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {data.bedrooms != null && <Stat icon={Bed} label={data.suites ? `Dorm. (${data.suites} suítes)` : "Dormitórios"} value={data.bedrooms} />}
              {data.bathrooms != null && <Stat icon={Bath} label="Banheiros" value={data.bathrooms} />}
              {data.parking_spaces != null && <Stat icon={Car} label="Vagas" value={data.parking_spaces} />}
              {data.built_area != null && <Stat icon={Maximize} label="Área construída" value={`${data.built_area}m²`} />}
              {data.total_area != null && <Stat icon={Ruler} label="Área total" value={`${data.total_area}m²`} />}
            </div>

            {data.description && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold">Sobre o imóvel</h2>
                <p className="mt-3 whitespace-pre-line text-muted-foreground">{data.description}</p>
              </div>
            )}

            {Array.isArray(data.features) && data.features.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold">Diferenciais</h2>
                <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {(data.features as string[]).map((f) => <li key={f}>• {f}</li>)}
                </ul>
              </div>
            )}

            {videos.length > 0 && (
              <div id="videos" className="mt-10 scroll-mt-24">
                <h2 className="text-xl font-semibold">Vídeos</h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {videos.map((u) => (
                    <div key={u} className="aspect-video overflow-hidden rounded-lg bg-black">
                      <iframe src={toVideoEmbed(u)} className="h-full w-full" allow="autoplay; fullscreen; encrypted-media" allowFullScreen title="Vídeo do imóvel" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.virtual_tour_url && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold">Tour Virtual 360°</h2>
                <div className="mt-3 aspect-video overflow-hidden rounded-lg bg-black">
                  <iframe src={data.virtual_tour_url} className="h-full w-full" allow="fullscreen; xr-spatial-tracking" />
                </div>
              </div>
            )}

            {(data.address || data.latitude || data.longitude) && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold">Localização</h2>
                <p className="mt-3 text-muted-foreground">{[data.address, data.neighborhood, data.city].filter(Boolean).join(" · ")}</p>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <AgentCard agent={agent} propertyTitle={data.title} />
          </aside>
        </div>
        {canSchedule(data) && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 pr-24 backdrop-blur md:hidden">
            <a
              href={schedulingLink(data)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex w-full items-center justify-center gap-2"
            >
              <CalendarDays className="h-4 w-4" /> Agendar visita
            </a>
          </div>
        )}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <button type="button" onClick={() => setLightboxOpen(false)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><X className="h-6 w-6" /></button>
            <button type="button" onClick={() => setActiveImage((i) => (i === 0 ? allImages.length - 1 : i - 1))} className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><ChevronLeft className="h-7 w-7" /></button>
            <img src={allImages[activeImage]} alt={data.title} className="max-h-[90vh] max-w-[90vw] object-contain" />
            <button type="button" onClick={() => setActiveImage((i) => (i + 1) % allImages.length)} className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><ChevronRight className="h-7 w-7" /></button>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function AgentCard({ agent, propertyTitle }: { agent: any; propertyTitle: string }) {
  const { data: owner } = useRealtorProfile();
  const useAgent = agent && agent.active;
  const name = useAgent ? agent.name : owner?.name || "Letícia Souza";
  const photo = useAgent ? agent.photo : owner?.photo || null;
  const whatsapp = useAgent ? agent.whatsapp || agent.phone?.replace(/\D/g, "") : owner?.whatsapp;
  const creci = useAgent ? agent.creci : owner?.creci;

  const waLink = whatsapp
    ? `https://wa.me/${String(whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(
        `Olá ${name}, gostaria de mais informações do imóvel "${propertyTitle}".`
      )}`
    : propertyWhatsappLink(propertyTitle);

  return (
    <div className="sticky top-24 border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        {photo ? (
          <img src={photo} alt={name} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-foreground">
            {name.charAt(0)}
          </div>
        )}
        <div>
           <p className="text-xs uppercase tracking-wider text-muted-foreground">Corretora responsável</p>
           <p className="text-lg font-medium">{name}</p>
          {creci && <p className="text-xs text-muted-foreground">{creci}</p>}
        </div>
      </div>

      <a href={waLink} target="_blank" rel="noreferrer" className="btn-primary mt-5 w-full">
        Falar com {name.split(" ")[0]} no WhatsApp
      </a>

    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Icon className="h-5 w-5 text-accent" />
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

