import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PropertyForm, type PropertyFormValues } from "@/components/admin/PropertyForm";
import { toPropertyPayload } from "@/lib/property-payload";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/imoveis/novo")({
  component: NovoImovel,
});

function NovoImovel() {
  const navigate = useNavigate();

  async function handleSubmit(v: PropertyFormValues) {
    const payload = { slug: "", ...toPropertyPayload(v) };
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
