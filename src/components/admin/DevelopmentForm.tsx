import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2, Trash2 } from "lucide-react";

export type DevelopmentFormValues = {
  name: string;
  builder: string;
  description: string;
  city: string;
  neighborhood: string;
  address: string;
  location: string;
  construction_status: string;
  delivery_date: string;
  price_from: string;
  price_to: string;
  units_count: string;
  differentials: string[];
  cover_image: string;
  gallery: string[];
  videos: string[];
  virtual_tour_url: string;
  map_embed: string;
  latitude: string;
  longitude: string;
  published: boolean;
  is_featured: boolean;
};

export const emptyDevelopment: DevelopmentFormValues = {
  name: "", builder: "", description: "",
  city: "Tatuí", neighborhood: "", address: "", location: "",
  construction_status: "lancamento", delivery_date: "",
  price_from: "", price_to: "", units_count: "",
  differentials: [], cover_image: "", gallery: [], videos: [],
  virtual_tour_url: "", map_embed: "",
  latitude: "", longitude: "",
  published: true, is_featured: false,
};

const STATUS_OPTIONS = [
  { value: "lancamento", label: "Lançamento" },
  { value: "em_obras", label: "Em obras" },
  { value: "pronto", label: "Pronto para morar" },
  { value: "entregue", label: "Entregue" },
];

export function DevelopmentForm({
  initial,
  onSubmit,
  submitLabel = "Salvar",
  onDelete,
}: {
  initial?: Partial<DevelopmentFormValues>;
  onSubmit: (v: DevelopmentFormValues) => Promise<void>;
  submitLabel?: string;
  onDelete?: () => Promise<void>;
}) {
  const [v, setV] = useState<DevelopmentFormValues>({ ...emptyDevelopment, ...initial });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [diffInput, setDiffInput] = useState("");
  const [videoInput, setVideoInput] = useState("");

  useEffect(() => {
    if (initial) setV({ ...emptyDevelopment, ...initial });
  }, [initial]);

  function up<K extends keyof DevelopmentFormValues>(k: K, val: DevelopmentFormValues[K]) {
    setV((s) => ({ ...s, [k]: val }));
  }

  async function handleUpload(files: FileList | null, target: "cover" | "gallery") {
    if (!files || files.length === 0) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `developments/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("property-media").upload(path, file, { upsert: false, contentType: file.type });
      if (!error) {
        const { data } = supabase.storage.from("property-media").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    if (target === "cover" && urls[0]) up("cover_image", urls[0]);
    else up("gallery", [...v.gallery, ...urls]);
    setUploading(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await onSubmit(v); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <Card title="Informações principais">
        <Grid>
          <Field label="Nome" className="md:col-span-2"><input className="input" value={v.name} onChange={(e) => up("name", e.target.value)} required /></Field>
          <Field label="Construtora"><input className="input" value={v.builder} onChange={(e) => up("builder", e.target.value)} /></Field>
          <Field label="Status da obra">
            <select className="input" value={v.construction_status} onChange={(e) => up("construction_status", e.target.value)}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Previsão de entrega"><input className="input" value={v.delivery_date} onChange={(e) => up("delivery_date", e.target.value)} placeholder="Ex.: Dez/2027" /></Field>
          <Field label="Unidades"><input className="input" type="number" value={v.units_count} onChange={(e) => up("units_count", e.target.value)} /></Field>
          <Field label="Faixa de preço — de"><input className="input" type="number" value={v.price_from} onChange={(e) => up("price_from", e.target.value)} /></Field>
          <Field label="Faixa de preço — até"><input className="input" type="number" value={v.price_to} onChange={(e) => up("price_to", e.target.value)} /></Field>
          <Field label="Descrição" className="md:col-span-2"><textarea className="input min-h-32" value={v.description} onChange={(e) => up("description", e.target.value)} /></Field>
        </Grid>
      </Card>

      <Card title="Localização">
        <Grid>
          <Field label="Cidade"><input className="input" value={v.city} onChange={(e) => up("city", e.target.value)} /></Field>
          <Field label="Bairro"><input className="input" value={v.neighborhood} onChange={(e) => up("neighborhood", e.target.value)} /></Field>
          <Field label="Endereço" className="md:col-span-2"><input className="input" value={v.address} onChange={(e) => up("address", e.target.value)} /></Field>
          <Field label="Latitude"><input className="input" value={v.latitude} onChange={(e) => up("latitude", e.target.value)} placeholder="-23.355" /></Field>
          <Field label="Longitude"><input className="input" value={v.longitude} onChange={(e) => up("longitude", e.target.value)} placeholder="-47.857" /></Field>
          <Field label="Mapa (iframe embed)" className="md:col-span-2"><textarea className="input" value={v.map_embed} onChange={(e) => up("map_embed", e.target.value)} placeholder='<iframe src="..."></iframe>' /></Field>
        </Grid>
      </Card>

      <Card title="Diferenciais">
        <div className="mt-2 flex flex-wrap gap-2">
          {v.differentials.map((f) => (
            <span key={f} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs">
              {f}
              <button type="button" onClick={() => up("differentials", v.differentials.filter((x) => x !== f))}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input className="input" value={diffInput} placeholder="Ex.: Piscina, Salão de festas…" onChange={(e) => setDiffInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (diffInput.trim()) { up("differentials", [...v.differentials, diffInput.trim()]); setDiffInput(""); } } }} />
          <button type="button" className="btn-outline" onClick={() => { if (diffInput.trim()) { up("differentials", [...v.differentials, diffInput.trim()]); setDiffInput(""); } }}>Adicionar</button>
        </div>
      </Card>

      <Card title="Mídia">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Foto de capa</label>
          {v.cover_image && (
            <div className="mt-2 relative inline-block">
              <img src={v.cover_image} alt="" className="h-32 w-48 rounded object-cover" />
              <button type="button" onClick={() => up("cover_image", "")} className="absolute -right-2 -top-2 rounded-full bg-black p-1 text-white"><X className="h-3 w-3" /></button>
            </div>
          )}
          <div className="mt-2"><UploadBtn onChange={(f) => handleUpload(f, "cover")} disabled={uploading} label="Selecionar capa" /></div>
        </div>

        <div className="mt-6">
          <label className="text-xs font-medium text-muted-foreground">Galeria</label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {v.gallery.map((url) => (
              <div key={url} className="relative">
                <img src={url} alt="" className="h-24 w-full rounded object-cover" />
                <button type="button" onClick={() => up("gallery", v.gallery.filter((u) => u !== url))} className="absolute -right-1 -top-1 rounded-full bg-black p-1 text-white"><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
          <div className="mt-2"><UploadBtn onChange={(f) => handleUpload(f, "gallery")} disabled={uploading} label="Adicionar fotos" multiple /></div>
        </div>

        <div className="mt-6">
          <label className="text-xs font-medium text-muted-foreground">Vídeos (URL)</label>
          <div className="mt-2 space-y-1">
            {v.videos.map((u) => (
              <div key={u} className="flex items-center gap-2 rounded bg-secondary px-3 py-1.5 text-xs">
                <span className="flex-1 truncate">{u}</span>
                <button type="button" onClick={() => up("videos", v.videos.filter((x) => x !== u))}><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input className="input" value={videoInput} onChange={(e) => setVideoInput(e.target.value)} placeholder="https://youtube.com/…" />
            <button type="button" className="btn-outline" onClick={() => { if (videoInput.trim()) { up("videos", [...v.videos, videoInput.trim()]); setVideoInput(""); } }}>Adicionar</button>
          </div>
        </div>

        <div className="mt-6">
          <Field label="Tour virtual (URL)"><input className="input" value={v.virtual_tour_url} onChange={(e) => up("virtual_tour_url", e.target.value)} placeholder="https://…" /></Field>
        </div>
      </Card>

      <Card title="Status">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Toggle label="Publicado" v={v.published} onChange={(b) => up("published", b)} />
          <Toggle label="Destaque" v={v.is_featured} onChange={(b) => up("is_featured", b)} />
        </div>
      </Card>

      <div className="flex items-center justify-between">
        {onDelete ? (
          <button type="button" onClick={onDelete} className="inline-flex items-center gap-1 rounded border border-destructive/30 px-4 py-2 text-sm text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" /> Excluir
          </button>
        ) : <span />}
        <button type="submit" disabled={saving || uploading} className="btn-primary">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {submitLabel}
        </button>
      </div>

      <style>{`.input { width: 100%; border: 1px solid var(--color-border); background: var(--color-background); padding: 0.55rem 0.75rem; border-radius: var(--radius); font-size: 0.875rem; }`}</style>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}
function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
function Toggle({ label, v, onChange }: { label: string; v: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded border border-border bg-background px-3 py-2 text-sm">
      <input type="checkbox" checked={v} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
function UploadBtn({ onChange, label, disabled, multiple }: { onChange: (f: FileList | null) => void; label: string; disabled?: boolean; multiple?: boolean }) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 rounded border border-dashed border-border px-4 py-2 text-sm hover:bg-secondary ${disabled ? "opacity-50" : ""}`}>
      <Upload className="h-4 w-4" /> {label}
      <input type="file" className="hidden" accept="image/*" multiple={multiple} onChange={(e) => onChange(e.target.files)} disabled={disabled} />
    </label>
  );
}
