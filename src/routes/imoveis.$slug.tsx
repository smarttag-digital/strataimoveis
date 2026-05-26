import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { formatPrice, propertyWhatsappLink } from "@/lib/site";
import { Bed, Bath, Car, Maximize, MapPin, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/imoveis/$slug")({
  component: PropertyDetail,
});

function PropertyDetail() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["property", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties").select("*").eq("slug", slug).maybeSingle();
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
  const allImages = [data.cover_image, ...gallery].filter(Boolean) as string[];

  return (
    <SiteLayout>
      <section className="container-prose py-10">
        <Link to="/imoveis" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" /> Voltar para imóveis
        </Link>
        <div className="grid gap-2 md:grid-cols-2">
          {allImages.slice(0, 4).map((img, i) => (
            <img key={i} src={img} alt="" className={`w-full rounded-lg object-cover ${i === 0 ? "md:col-span-2 aspect-[16/9]" : "aspect-[4/3]"}`} />
          ))}
          {allImages.length === 0 && (
            <div className="md:col-span-2 flex aspect-[16/9] items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              Sem fotos disponíveis
            </div>
          )}
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_360px]">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              <MapPin className="mr-1 inline h-3 w-3" />
              {[data.neighborhood, data.city].filter(Boolean).join(" · ")}
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">{data.title}</h1>
            <p className="mt-4 text-3xl font-bold">{formatPrice(data.price)}</p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {data.bedrooms != null && <Stat icon={Bed} label="Dormitórios" value={data.bedrooms} />}
              {data.bathrooms != null && <Stat icon={Bath} label="Banheiros" value={data.bathrooms} />}
              {data.parking_spaces != null && <Stat icon={Car} label="Vagas" value={data.parking_spaces} />}
              {data.built_area != null && <Stat icon={Maximize} label="Área const." value={`${data.built_area}m²`} />}
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
          </div>

          <aside className="sticky top-24 self-start rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">Tem interesse?</h3>
            <p className="mt-1 text-sm text-muted-foreground">Fale agora com a Letícia.</p>
            <a
              href={propertyWhatsappLink(data.title)}
              target="_blank"
              rel="noreferrer"
              className="btn-primary mt-5 w-full"
            >
              Falar no WhatsApp
            </a>
            <Link to="/contato" className="btn-outline mt-3 w-full">Enviar mensagem</Link>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Icon className="h-5 w-5 text-[var(--champagne)]" />
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
