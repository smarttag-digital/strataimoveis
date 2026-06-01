import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PropertyForm, type PropertyFormValues } from "@/components/admin/PropertyForm";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/imoveis/novo")({
  component: NovoImovel,
});

function NovoImovel() {
  const navigate = useNavigate();

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
    const { error, data } = await supabase.from("properties").insert(payload).select("id").single();
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    toast.success("Imóvel criado!");
    navigate({ to: "/admin/imoveis/$id/editar", params: { id: data.id } });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Novo imóvel</h1>
      <p className="mt-1 text-sm text-muted-foreground">Cadastre um novo imóvel para o site.</p>
      <div className="mt-8">
        <PropertyForm onSubmit={handleSubmit} submitLabel="Criar imóvel" />
      </div>
    </div>
  );
}
