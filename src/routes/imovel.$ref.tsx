import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/imovel/$ref")({
  component: ImovelByRef,
});

function ImovelByRef() {
  const { ref } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["property-by-ref", ref],
    queryFn: async () => {
      // Try by reference first (case-insensitive), then by slug
      const upper = ref.toUpperCase();
      let { data } = await supabase
        .from("properties")
        .select("slug")
        .eq("reference", upper)
        .eq("published", true)
        .maybeSingle();
      if (!data) {
        const r = await supabase
          .from("properties")
          .select("slug")
          .eq("slug", ref)
          .eq("published", true)
          .maybeSingle();
        data = r.data;
      }
      return data;
    },
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container-prose py-24 text-center text-muted-foreground">
          Buscando imóvel…
        </div>
      </SiteLayout>
    );
  }
  if (data?.slug) {
    return <Navigate to="/imoveis/$slug" params={{ slug: data.slug }} replace />;
  }
  return (
    <SiteLayout>
      <div className="container-prose py-24 text-center">
        <h1 className="text-2xl font-bold">Imóvel não encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          Verifique o número de referência <strong>{ref}</strong>.
        </p>
        <Link to="/imoveis" className="btn-primary mt-6 inline-flex">
          Ver todos os imóveis
        </Link>
      </div>
    </SiteLayout>
  );
}
