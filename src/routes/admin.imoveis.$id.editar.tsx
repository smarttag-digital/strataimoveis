import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertyForm, type PropertyFormValues } from "@/components/admin/PropertyForm";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin/imoveis/$id/editar")({
  component: EditarImovel,
});

function EditarImovel() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-property", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (!data) return <p>Imóvel não encontrado.</p>;

  const initial: Partial<PropertyFormValues> = {
    title: data.title ?? "",
    description: data.description ?? "",
    property_type: data.property_type ?? "casa",
    transaction_type: data.transaction_type ?? "venda",
    price: data.price?.toString() ?? "",
    city: data.city ?? "Tatuí",
    neighborhood: data.neighborhood ?? "",
    address: data.address ?? "",
    bedrooms: data.bedrooms?.toString() ?? "",
    bathrooms: data.bathrooms?.toString() ?? "",
    parking_spaces: data.parking_spaces?.toString() ?? "",
    built_area: data.built_area?.toString() ?? "",
    land_area: data.land_area?.toString() ?? "",
    cover_image: data.cover_image ?? "",
    gallery: (data.gallery as string[]) ?? [],
    videos: (data.videos as string[]) ?? [],
    features: (data.features as string[]) ?? [],
    published: data.published,
    is_featured: data.is_featured,
    is_launch: data.is_launch,
    is_opportunity: data.is_opportunity,
    is_new: data.is_new,
    is_mcmv: data.is_mcmv,
  };

  async function handleSubmit(v: PropertyFormValues) {
    const payload = {
      title: v.title,
      description: v.description || null,
      property_type: v.property_type,
      transaction_type: v.transaction_type,
      price: v.price ? Number(v.price) : null,
      city: v.city,
      neighborhood: v.neighborhood || null,
      address: v.address || null,
      bedrooms: v.bedrooms ? Number(v.bedrooms) : null,
      bathrooms: v.bathrooms ? Number(v.bathrooms) : null,
      parking_spaces: v.parking_spaces ? Number(v.parking_spaces) : null,
      built_area: v.built_area ? Number(v.built_area) : null,
      land_area: v.land_area ? Number(v.land_area) : null,
      cover_image: v.cover_image || null,
      gallery: v.gallery,
      videos: v.videos,
      features: v.features,
      published: v.published,
      is_featured: v.is_featured,
      is_launch: v.is_launch,
      is_opportunity: v.is_opportunity,
      is_new: v.is_new,
      is_mcmv: v.is_mcmv,
    };
    const { error } = await supabase.from("properties").update(payload).eq("id", id);
    if (error) { toast.error("Erro ao salvar: " + error.message); return; }
    toast.success("Alterações salvas.");
  }

  async function handleDelete() {
    if (!confirm("Tem certeza? Esta ação não pode ser desfeita.")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) { toast.error("Erro: " + error.message); return; }
    toast.success("Imóvel excluído.");
    navigate({ to: "/admin/imoveis" });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Ref. {data.reference}
          </p>
          <h1 className="text-2xl font-bold">{data.title}</h1>
        </div>
        {data.slug && (
          <Link
            to="/imoveis/$slug"
            params={{ slug: data.slug }}
            target="_blank"
            className="btn-outline"
          >
            <ExternalLink className="mr-2 h-4 w-4" /> Ver no site
          </Link>
        )}
      </div>
      <div className="mt-8">
        <PropertyForm initial={initial} onSubmit={handleSubmit} onDelete={handleDelete} submitLabel="Salvar alterações" />
      </div>
    </div>
  );
}
