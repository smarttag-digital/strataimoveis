import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Eye, EyeOff, Star } from "lucide-react";
import { formatPrice } from "@/lib/site";
import { useState } from "react";

export const Route = createFileRoute("/admin/imoveis")({
  component: AdminImoveis,
});

function AdminImoveis() {
  const [q, setQ] = useState("");
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-properties", q],
    queryFn: async () => {
      let query = supabase
        .from("properties")
        .select("id,title,reference,slug,city,neighborhood,price,published,is_featured,cover_image,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (q) {
        query = query.or(
          `title.ilike.%${q}%,reference.ilike.%${q}%,city.ilike.%${q}%,neighborhood.ilike.%${q}%`
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  async function togglePublished(id: string, current: boolean) {
    await supabase.from("properties").update({ published: !current }).eq("id", id);
    refetch();
  }
  async function toggleFeatured(id: string, current: boolean) {
    await supabase.from("properties").update({ is_featured: !current }).eq("id", id);
    refetch();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Imóveis</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestão completa do catálogo.
          </p>
        </div>
        <Link to="/admin/imoveis/novo" className="btn-primary">
          <Plus className="mr-2 h-4 w-4" /> Novo imóvel
        </Link>
      </div>

      <div className="mt-6 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por título, referência, cidade ou bairro…"
          className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Imóvel</th>
              <th className="p-3">Ref.</th>
              <th className="p-3">Local</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Carregando…</td></tr>
            )}
            {!isLoading && data?.length === 0 && (
              <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Nenhum imóvel cadastrado ainda.</td></tr>
            )}
            {data?.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt="" className="h-12 w-16 rounded object-cover" />
                    ) : (
                      <div className="h-12 w-16 rounded bg-secondary" />
                    )}
                    <span className="font-medium">{p.title}</span>
                  </div>
                </td>
                <td className="p-3 font-mono text-xs">{p.reference}</td>
                <td className="p-3 text-muted-foreground">{[p.neighborhood, p.city].filter(Boolean).join(" · ")}</td>
                <td className="p-3">{formatPrice(p.price)}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => togglePublished(p.id, p.published)}
                      className={`rounded px-2 py-1 text-xs ${p.published ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground"}`}
                      title={p.published ? "Publicado" : "Rascunho"}
                    >
                      {p.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => toggleFeatured(p.id, p.is_featured)}
                      className={`rounded px-2 py-1 text-xs ${p.is_featured ? "bg-[var(--champagne)] text-black" : "bg-secondary text-muted-foreground"}`}
                      title={p.is_featured ? "Destaque" : "Marcar destaque"}
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
                <td className="p-3 text-right">
                  <Link
                    to="/admin/imoveis/$id/editar"
                    params={{ id: p.id }}
                    className="inline-flex items-center gap-1 rounded border border-border px-3 py-1.5 text-xs hover:bg-secondary"
                  >
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
