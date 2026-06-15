import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DevelopmentForm, type DevelopmentFormValues } from "@/components/admin/DevelopmentForm";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/empreendimentos/novo")({
  component: NovoEmpreendimento,
});

function NovoEmpreendimento() {
  const navigate = useNavigate();
  async function handleSubmit(v: DevelopmentFormValues) {
    const payload: any = {
      slug: "",
      name: v.name,
      builder: v.builder || null,
      description: v.description || null,
      city: v.city,
      neighborhood: v.neighborhood || null,
      address: v.address || null,
      location: v.location || v.neighborhood || null,
      construction_status: v.construction_status || null,
      delivery_date: v.delivery_date || null,
      price_from: v.price_from ? Number(v.price_from) : null,
      price_to: v.price_to ? Number(v.price_to) : null,
      units_count: v.units_count ? Number(v.units_count) : null,
      differentials: v.differentials,
      cover_image: v.cover_image || null,
      gallery: v.gallery,
      videos: v.videos,
      virtual_tour_url: v.virtual_tour_url || null,
      map_embed: v.map_embed || null,
      latitude: v.latitude ? Number(v.latitude) : null,
      longitude: v.longitude ? Number(v.longitude) : null,
      published: v.published,
      is_featured: v.is_featured,
    };
    const { data, error } = await supabase.from("developments").insert(payload).select("id").single();
    if (error) { toast.error("Erro ao salvar: " + error.message); return; }
    toast.success("Empreendimento salvo com sucesso");
    navigate({ to: "/admin/empreendimentos" });
  }
  return (
    <div>
      <h1 className="text-2xl font-bold">Novo empreendimento</h1>
      <div className="mt-8"><DevelopmentForm onSubmit={handleSubmit} submitLabel="Criar empreendimento" /></div>
    </div>
  );
}
