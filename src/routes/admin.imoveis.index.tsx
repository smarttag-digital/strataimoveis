import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Eye, EyeOff, Star, Copy, Archive, ArchiveRestore, CheckCircle2, KeyRound } from "lucide-react";
import { formatPrice } from "@/lib/site";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/imoveis/")({
  component: AdminImoveis,
});

type Filter = "disponiveis" | "vendidos" | "alugados" | "destaques" | "arquivados" | "todos";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "disponiveis", label: "Disponíveis" },
  { key: "destaques", label: "Destaques" },
  { key: "vendidos", label: "Vendidos" },
  { key: "alugados", label: "Alugados" },
  { key: "arquivados", label: "Arquivados" },
  { key: "todos", label: "Todos" },
];

function AdminImoveis() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("disponiveis");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-properties", q, filter],
    queryFn: async () => {
      let query = supabase
        .from("properties")
        .select("id,title,reference,slug,city,neighborhood,price,published,is_featured,archived,status,cover_image,created_at,transaction_type")
        .order("created_at", { ascending: false })
        .limit(300);

      if (filter === "arquivados") query = query.eq("archived", true);
      else query = query.eq("archived", false);

      if (filter === "vendidos") query = query.eq("status", "vendido");
      if (filter === "alugados") query = query.eq("status", "alugado");
      if (filter === "destaques") query = query.eq("is_featured", true);
      if (filter === "disponiveis") query = query.eq("status", "disponivel");

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

  async function update(id: string, patch: Partial<{ published: boolean; is_featured: boolean; archived: boolean; status: string }>, msg?: string) {
    const { error } = await supabase.from("properties").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else if (msg) toast.success(msg);
    refetch();
  }

  async function duplicate(id: string) {
    const { data: src } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
    if (!src) return;
    const { id: _id, reference, slug, created_at, updated_at, ...rest } = src;
    const { data: created, error } = await supabase
      .from("properties")
      .insert({ ...rest, title: `${src.title} (cópia)`, slug: "", reference: null, published: false, is_featured: false })
      .select("id")
      .single();
    if (error) { toast.error(error.message); return; }
    toast.success("Imóvel duplicado.");
    if (created) refetch();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Imóveis</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestão completa do catálogo.</p>
        </div>
        <Link to="/admin/imoveis/novo" className="btn-primary">
          <Plus className="mr-2 h-4 w-4" /> Novo imóvel
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1.5 text-xs ${
              filter === f.key
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por título, referência, cidade ou bairro…"
          className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm"
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
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
              <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Nenhum imóvel encontrado.</td></tr>
            )}
            {data?.map((p) => (
              <tr key={p.id} className="border-t border-border align-middle">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt="" className="h-12 w-16 rounded object-cover" />
                    ) : (
                      <div className="h-12 w-16 rounded bg-secondary" />
                    )}
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground capitalize">{p.status}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 font-mono text-xs">{p.reference}</td>
                <td className="p-3 text-muted-foreground">{[p.neighborhood, p.city].filter(Boolean).join(" · ")}</td>
                <td className="p-3">{formatPrice(p.price)}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    <IconBtn
                      title={p.published ? "Publicado" : "Rascunho"}
                      active={p.published}
                      onClick={() => update(p.id, { published: !p.published })}
                    >
                      {p.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </IconBtn>
                    <IconBtn
                      title="Destaque"
                      active={p.is_featured}
                      activeCls="bg-[var(--champagne)] text-black"
                      onClick={() => update(p.id, { is_featured: !p.is_featured })}
                    >
                      <Star className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    <Link
                      to="/admin/imoveis/$id/editar"
                      params={{ id: p.id }}
                      className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-secondary"
                    >
                      <Pencil className="h-3 w-3" /> Editar
                    </Link>
                    <button
                      onClick={() => duplicate(p.id)}
                      className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-secondary"
                      title="Duplicar"
                    >
                      <Copy className="h-3 w-3" /> Duplicar
                    </button>
                    {p.transaction_type === "venda" ? (
                      <button
                        onClick={() => update(p.id, { status: "vendido" }, "Marcado como vendido")}
                        className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-secondary"
                        title="Marcar como vendido"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Vendido
                      </button>
                    ) : (
                      <button
                        onClick={() => update(p.id, { status: "alugado" }, "Marcado como alugado")}
                        className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-secondary"
                        title="Marcar como alugado"
                      >
                        <KeyRound className="h-3 w-3" /> Alugado
                      </button>
                    )}
                    {p.archived ? (
                      <button
                        onClick={() => update(p.id, { archived: false }, "Restaurado")}
                        className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-secondary"
                        title="Restaurar"
                      >
                        <ArchiveRestore className="h-3 w-3" /> Restaurar
                      </button>
                    ) : (
                      <button
                        onClick={() => update(p.id, { archived: true }, "Arquivado")}
                        className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-secondary"
                        title="Arquivar"
                      >
                        <Archive className="h-3 w-3" /> Arquivar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IconBtn({
  children, onClick, active, title, activeCls = "bg-green-100 text-green-700",
}: { children: React.ReactNode; onClick: () => void; active?: boolean; title: string; activeCls?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded px-2 py-1 text-xs ${active ? activeCls : "bg-secondary text-muted-foreground"}`}
    >
      {children}
    </button>
  );
}
