import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertyForm, type PropertyFormValues } from "@/components/admin/PropertyForm";
import { toPropertyPayload, fromPropertyRow } from "@/lib/property-payload";
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

  const initial = fromPropertyRow(data);

  async function handleSubmit(v: PropertyFormValues) {
    const { error } = await supabase.from("properties").update(toPropertyPayload(v)).eq("id", id);
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
