import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DevelopmentForm, type DevelopmentFormValues } from "@/components/admin/DevelopmentForm";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/empreendimentos/$id/editar")({
  component: EditarEmpreendimento,
});

function EditarEmpreendimento() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["development", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("developments").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Carregando…</p>;
  if (!data) return <p>Empreendimento não encontrado.</p>;

  const initial: Partial<DevelopmentFormValues> = {
    name: data.name ?? "",
    builder: data.builder ?? "",
    description: data.description ?? "",
    city: data.city ?? "Tatuí",
    neighborhood: data.neighborhood ?? "",
    address: data.address ?? "",
    location: data.location ?? "",
    construction_status: data.construction_status ?? "lancamento",
    delivery_date: data.delivery_date ?? "",
    price_from: data.price_from?.toString() ?? "",
    price_to: data.price_to?.toString() ?? "",
    units_count: data.units_count?.toString() ?? "",
    differentials: (data.differentials as string[]) ?? [],
    cover_image: data.cover_image ?? "",
    gallery: (data.gallery as string[]) ?? [],
    videos: (data.videos as string[]) ?? [],
    virtual_tour_url: data.virtual_tour_url ?? "",
    map_embed: data.map_embed ?? "",
    latitude: data.latitude?.toString() ?? "",
    longitude: data.longitude?.toString() ?? "",
    published: data.published ?? true,
    is_featured: data.is_featured ?? false,
  };

  async function handleSubmit(v: DevelopmentFormValues) {
    const payload: any = {
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
    const { error } = await supabase.from("developments").update(payload).eq("id", id);
    if (error) { toast.error("Erro ao salvar: " + error.message); return; }
    toast.success("Empreendimento atualizado!");
  }

  async function handleDelete() {
    if (!confirm("Excluir este empreendimento?")) return;
    const { error } = await supabase.from("developments").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Excluído.");
    navigate({ to: "/admin/empreendimentos" });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Editar empreendimento</h1>
      <div className="mt-8">
        <DevelopmentForm initial={initial} onSubmit={handleSubmit} onDelete={handleDelete} submitLabel="Salvar alterações" />
      </div>
    </div>
  );
}
