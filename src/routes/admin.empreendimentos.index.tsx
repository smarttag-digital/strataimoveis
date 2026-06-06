import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Eye, EyeOff, Star } from "lucide-react";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";

export const Route = createFileRoute("/admin/empreendimentos/")({
  component: AdminEmpreendimentos,
});

function AdminEmpreendimentos() {
  useRealtimeSync(["developments"]);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-developments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("developments")
        .select("id,name,slug,city,neighborhood,cover_image,published,is_featured,construction_status,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  async function togglePublished(id: string, current: boolean) {
    await supabase.from("developments").update({ published: !current }).eq("id", id);
    refetch();
  }
  async function toggleFeatured(id: string, current: boolean) {
    await supabase.from("developments").update({ is_featured: !current }).eq("id", id);
    refetch();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Empreendimentos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Lançamentos, loteamentos e empreendimentos.</p>
        </div>
        <Link to="/admin/empreendimentos/novo" className="btn-primary"><Plus className="mr-2 h-4 w-4" /> Novo empreendimento</Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Empreendimento</th>
              <th className="p-3">Local</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Carregando…</td></tr>}
            {!isLoading && data?.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-muted-foreground">Nenhum empreendimento cadastrado ainda.</td></tr>}
            {data?.map((d) => (
              <tr key={d.id} className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {d.cover_image ? <img src={d.cover_image} alt="" className="h-12 w-16 rounded object-cover" /> : <div className="h-12 w-16 rounded bg-secondary" />}
                    <span className="font-medium">{d.name}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{[d.neighborhood, d.city].filter(Boolean).join(" · ")}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button onClick={() => togglePublished(d.id, d.published)} className={`rounded px-2 py-1 text-xs ${d.published ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground"}`}>
                      {d.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => toggleFeatured(d.id, d.is_featured)} className={`rounded px-2 py-1 text-xs ${d.is_featured ? "bg-[var(--champagne)] text-black" : "bg-secondary text-muted-foreground"}`}>
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
                <td className="p-3 text-right">
                  <Link to="/admin/empreendimentos/$id/editar" params={{ id: d.id }} className="inline-flex items-center gap-1 rounded border border-border px-3 py-1.5 text-xs hover:bg-secondary">
                    <Pencil className="h-3 w-3" /> Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
