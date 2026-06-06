import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { whatsappLink, formatPrice } from "@/lib/site";
import { ArrowLeft, MapPin } from "lucide-react";

export const Route = createFileRoute("/empreendimento/$slug")({
  component: DevelopmentDetail,
});

function DevelopmentDetail() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["development", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("developments").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  if (isLoading) {
    return <SiteLayout><div className="container-prose py-24"><div className="h-96 animate-pulse rounded-lg bg-secondary" /></div></SiteLayout>;
  }
  if (!data) {
    return (
      <SiteLayout>
        <div className="container-prose py-24 text-center">
          <h1 className="text-2xl font-bold">Empreendimento não encontrado</h1>
          <Link to="/empreendimentos" className="btn-primary mt-6 inline-flex"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
        </div>
      </SiteLayout>
    );
  }

  const gallery = (data.gallery as string[]) || [];
  const allImages = [data.cover_image, ...gallery].filter(Boolean) as string[];
  const videos = (data.videos as string[]) || [];
  const differentials = (data.differentials as string[]) || [];

  return (
    <SiteLayout>
      <section className="container-prose py-10">
        <Link to="/empreendimentos" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
        </Link>
        <div className="grid gap-2 md:grid-cols-2">
          {allImages.slice(0, 4).map((img, i) => (
            <img key={i} src={img} alt="" className={`w-full rounded-lg object-cover ${i === 0 ? "md:col-span-2 aspect-[16/9]" : "aspect-[4/3]"}`} />
          ))}
          {allImages.length === 0 && <div className="md:col-span-2 flex aspect-[16/9] items-center justify-center rounded-lg bg-secondary text-muted-foreground">Sem fotos</div>}
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_360px]">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              <MapPin className="mr-1 inline h-3 w-3" />{[data.neighborhood, data.city].filter(Boolean).join(" · ")}
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">{data.name}</h1>
            {data.builder && <p className="mt-1 text-sm text-muted-foreground">por {data.builder}</p>}

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {data.construction_status && <Info label="Status" value={data.construction_status} />}
              {data.delivery_date && <Info label="Entrega" value={data.delivery_date} />}
              {data.units_count && <Info label="Unidades" value={data.units_count} />}
              {(data.price_from || data.price_to) && (
                <Info label="Faixa de preço" value={`${data.price_from ? formatPrice(data.price_from) : ""}${data.price_to ? " – " + formatPrice(data.price_to) : ""}`} />
              )}
            </div>

            {data.description && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold">Sobre o empreendimento</h2>
                <p className="mt-3 whitespace-pre-line text-muted-foreground">{data.description}</p>
              </div>
            )}

            {differentials.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold">Diferenciais</h2>
                <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {differentials.map((f) => <li key={f}>• {f}</li>)}
                </ul>
              </div>
            )}

            {videos.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold">Vídeos</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {videos.map((v) => <li key={v}><a href={v} target="_blank" rel="noreferrer" className="text-[var(--champagne)] underline">{v}</a></li>)}
                </ul>
              </div>
            )}

            {data.virtual_tour_url && (
              <a href={data.virtual_tour_url} target="_blank" rel="noreferrer" className="btn-outline mt-8 inline-flex">Acessar tour virtual</a>
            )}

            {data.map_embed && (
              <div
                className="mt-10"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(data.map_embed, {
                    ALLOWED_TAGS: ["iframe", "div", "a", "br"],
                    ALLOWED_ATTR: [
                      "src",
                      "width",
                      "height",
                      "style",
                      "allowfullscreen",
                      "allow",
                      "loading",
                      "referrerpolicy",
                      "frameborder",
                      "title",
                      "href",
                      "target",
                      "rel",
                      "class",
                    ],
                    ALLOWED_URI_REGEXP: /^https:\/\/(www\.)?google\.com\/maps\//i,
                  }),
                }}
              />
            )}
          </div>

          <aside className="sticky top-24 self-start rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">Tem interesse?</h3>
            <p className="mt-1 text-sm text-muted-foreground">Fale agora com a Letícia.</p>
            <a
              href={whatsappLink(`Olá Letícia, gostaria de mais informações sobre o empreendimento "${data.name}".`)}
              target="_blank" rel="noreferrer" className="btn-primary mt-5 w-full"
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

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
