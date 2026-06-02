import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/corretores")({
  component: AdminCorretores,
});

type Agent = {
  id?: string;
  name: string; creci: string; phone: string; whatsapp: string;
  email: string; bio: string; photo: string; active: boolean;
};
const empty: Agent = { name: "", creci: "", phone: "", whatsapp: "", email: "", bio: "", photo: "", active: true };

function AdminCorretores() {
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["admin-agents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agents" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const [editing, setEditing] = useState<Agent | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function save() {
    if (!editing) return;
    setSaving(true);
    const payload: any = { ...editing };
    if (payload.id) {
      const { error } = await supabase.from("agents" as any).update(payload).eq("id", payload.id);
      if (error) toast.error(error.message); else toast.success("Corretor atualizado.");
    } else {
      delete payload.id;
      const { error } = await supabase.from("agents" as any).insert(payload);
      if (error) toast.error(error.message); else toast.success("Corretor adicionado.");
    }
    setSaving(false);
    setEditing(null);
    refetch();
  }

  async function remove(id: string) {
    if (!confirm("Excluir corretor?")) return;
    const { error } = await supabase.from("agents" as any).delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removido."); refetch(); }
  }

  async function uploadPhoto(file: File | null) {
    if (!file || !editing) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `agents/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("property-media").upload(path, file, { contentType: file.type });
    if (!error) {
      const { data } = supabase.storage.from("property-media").getPublicUrl(path);
      setEditing({ ...editing, photo: data.publicUrl });
    }
    setUploading(false);
  }

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Corretores</h1>
          <p className="mt-1 text-sm text-muted-foreground">Equipe que aparece nas páginas dos imóveis.</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary"><Plus className="mr-2 h-4 w-4" /> Novo corretor</button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-muted-foreground">Carregando…</p>}
        {data?.map((a) => (
          <div key={a.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start gap-4">
              {a.photo ? <img src={a.photo} alt="" className="h-16 w-16 rounded-full object-cover" /> : <div className="h-16 w-16 rounded-full bg-secondary" />}
              <div className="flex-1">
                <h3 className="font-semibold">{a.name}</h3>
                <p className="text-xs text-muted-foreground">{a.creci}</p>
                <p className="text-xs text-muted-foreground">{a.phone}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setEditing(a)} className="btn-outline flex-1 text-xs">Editar</button>
              <button onClick={() => remove(a.id)} className="rounded border border-destructive/30 px-3 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-lg border border-border bg-card p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold">{editing.id ? "Editar corretor" : "Novo corretor"}</h2>
            <div className="mt-5 space-y-3">
              <F label="Nome"><input className="i" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></F>
              <F label="CRECI"><input className="i" value={editing.creci} onChange={(e) => setEditing({ ...editing, creci: e.target.value })} /></F>
              <F label="Telefone"><input className="i" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></F>
              <F label="WhatsApp (só números)"><input className="i" value={editing.whatsapp} onChange={(e) => setEditing({ ...editing, whatsapp: e.target.value })} /></F>
              <F label="E-mail"><input className="i" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></F>
              <F label="Biografia"><textarea className="i min-h-24" value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} /></F>
              <div>
                <span className="mb-1 block text-xs font-medium text-muted-foreground">Foto</span>
                {editing.photo && (
                  <div className="relative mb-2 inline-block">
                    <img src={editing.photo} className="h-20 w-20 rounded-full object-cover" />
                    <button onClick={() => setEditing({ ...editing, photo: "" })} className="absolute -right-1 -top-1 rounded-full bg-black p-1 text-white"><X className="h-3 w-3" /></button>
                  </div>
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-dashed border-border px-4 py-2 text-sm hover:bg-secondary">
                  <Upload className="h-4 w-4" /> {uploading ? "Enviando…" : "Selecionar foto"}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => uploadPhoto(e.target.files?.[0] ?? null)} disabled={uploading} />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
                Ativo (visível no site)
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn-outline">Cancelar</button>
              <button onClick={save} disabled={saving} className="btn-primary">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar
              </button>
            </div>
            <style>{`.i { width: 100%; border: 1px solid var(--color-border); background: var(--color-background); padding: 0.55rem 0.75rem; border-radius: var(--radius); font-size: 0.875rem; }`}</style>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}
