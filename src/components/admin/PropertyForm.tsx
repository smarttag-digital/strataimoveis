import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PROPERTY_TYPES } from "@/lib/site";
import { compressImageForUpload } from "@/lib/image-upload";
import { isValidVideoUrl } from "@/lib/video-url";
import { defaultWatermark, type WatermarkSettings } from "@/lib/watermark";
import { Upload, X, Loader2, Trash2 } from "lucide-react";

export type PropertyFormValues = {
  title: string;
  description: string;
  property_type: string;
  transaction_type: string;
  price: string;
  condo_fee: string;
  iptu: string;
  city: string;
  state: string;
  neighborhood: string;
  address: string;
  latitude: string;
  longitude: string;
  bedrooms: string;
  suites: string;
  bathrooms: string;
  parking_spaces: string;
  built_area: string;
  total_area: string;
  land_area: string;
  cover_image: string;
  gallery: string[];
  videos: string[];
  virtual_tour_url: string;
  features: string[];
  agent_id: string;
  status: string;
  archived: boolean;
  published: boolean;
  is_featured: boolean;
  is_launch: boolean;
  is_opportunity: boolean;
  is_new: boolean;
  is_mcmv: boolean;
};

export const emptyProperty: PropertyFormValues = {
  title: "", description: "", property_type: "casa", transaction_type: "venda",
  price: "", condo_fee: "", iptu: "",
  city: "Tatuí", state: "SP", neighborhood: "", address: "",
  latitude: "", longitude: "",
  bedrooms: "", suites: "", bathrooms: "", parking_spaces: "",
  built_area: "", total_area: "", land_area: "",
  cover_image: "", gallery: [], videos: [], virtual_tour_url: "",
  features: [], agent_id: "", status: "disponivel", archived: false,
  published: true, is_featured: false, is_launch: false, is_opportunity: false,
  is_new: false, is_mcmv: false,
};

const STATUS_OPTIONS = [
  { value: "disponivel", label: "Disponível" },
  { value: "reservado", label: "Reservado" },
  { value: "vendido", label: "Vendido" },
  { value: "alugado", label: "Alugado" },
  { value: "arquivado", label: "Arquivado" },
];

export function PropertyForm({
  initial,
  onSubmit,
  submitLabel = "Salvar",
  onDelete,
}: {
  initial?: Partial<PropertyFormValues>;
  onSubmit: (v: PropertyFormValues) => Promise<void>;
  submitLabel?: string;
  onDelete?: () => Promise<void>;
}) {
  const [v, setV] = useState<PropertyFormValues>({ ...emptyProperty, ...initial });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [featureInput, setFeatureInput] = useState("");
  const [videoInput, setVideoInput] = useState("");
  const [skipWatermark, setSkipWatermark] = useState<{ cover: boolean; gallery: boolean }>({
    cover: false,
    gallery: false,
  });

  useEffect(() => {
    if (initial) setV({ ...emptyProperty, ...initial });
  }, [initial]);

  const { data: agents } = useQuery({
    queryKey: ["agents-active"],
    queryFn: async () => {
      const { data } = await supabase
        .from("agents")
        .select("id,name")
        .eq("active", true)
        .order("name");
      return data ?? [];
    },
  });

  const { data: watermark } = useQuery({
    queryKey: ["site-settings", "watermark"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "watermark")
        .maybeSingle();
      return { ...defaultWatermark, ...((data?.value as Partial<WatermarkSettings>) ?? {}) } as WatermarkSettings;
    },
  });

  function up<K extends keyof PropertyFormValues>(k: K, val: PropertyFormValues[K]) {
    setV((s) => ({ ...s, [k]: val }));
  }

  async function handleUpload(files: FileList | null, target: "cover" | "gallery") {
    if (!files || files.length === 0) return;
    setUploading(true);
    const wm = skipWatermark[target] ? undefined : watermark;
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const compressed = await compressImageForUpload(file, wm);
      const ext = compressed.extension;
      const path = `properties/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("property-media").upload(path, compressed.file, {
        upsert: false,
        contentType: compressed.file.type,
      });
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
    try {
      await onSubmit(v);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <Card title="Informações principais">
        <Grid>
          <Field label="Título" className="md:col-span-2">
            <input className="input" value={v.title} onChange={(e) => up("title", e.target.value)} required />
          </Field>
          <Field label="Tipo de imóvel">
            <select className="input" value={v.property_type} onChange={(e) => up("property_type", e.target.value)}>
              {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Negócio">
            <select className="input" value={v.transaction_type} onChange={(e) => up("transaction_type", e.target.value)}>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </select>
          </Field>
          <Field label="Valor (R$)">
            <input className="input" type="number" inputMode="numeric" value={v.price} onChange={(e) => up("price", e.target.value)} />
          </Field>
          <Field label="Condomínio (R$/mês)">
            <input className="input" type="number" value={v.condo_fee} onChange={(e) => up("condo_fee", e.target.value)} />
          </Field>
          <Field label="IPTU (R$/ano)">
            <input className="input" type="number" value={v.iptu} onChange={(e) => up("iptu", e.target.value)} />
          </Field>
          <Field label="Descrição" className="md:col-span-2">
            <textarea className="input min-h-32" value={v.description} onChange={(e) => up("description", e.target.value)} />
          </Field>
        </Grid>
      </Card>

      <Card title="Localização">
        <Grid>
          <Field label="Cidade">
            <input className="input" value={v.city} onChange={(e) => up("city", e.target.value)} required />
          </Field>
          <Field label="UF">
            <input className="input" value={v.state} maxLength={2} onChange={(e) => up("state", e.target.value.toUpperCase())} />
          </Field>
          <Field label="Bairro">
            <input className="input" value={v.neighborhood} onChange={(e) => up("neighborhood", e.target.value)} />
          </Field>
          <Field label="Endereço">
            <input className="input" value={v.address} onChange={(e) => up("address", e.target.value)} />
          </Field>
          <Field label="Latitude">
            <input className="input" value={v.latitude} onChange={(e) => up("latitude", e.target.value)} placeholder="-23.3556" />
          </Field>
          <Field label="Longitude">
            <input className="input" value={v.longitude} onChange={(e) => up("longitude", e.target.value)} placeholder="-47.8542" />
          </Field>
        </Grid>
      </Card>

      <Card title="Características">
        <Grid>
          <Field label="Dormitórios">
            <input className="input" type="number" value={v.bedrooms} onChange={(e) => up("bedrooms", e.target.value)} />
          </Field>
          <Field label="Suítes">
            <input className="input" type="number" value={v.suites} onChange={(e) => up("suites", e.target.value)} />
          </Field>
          <Field label="Banheiros">
            <input className="input" type="number" value={v.bathrooms} onChange={(e) => up("bathrooms", e.target.value)} />
          </Field>
          <Field label="Vagas">
            <input className="input" type="number" value={v.parking_spaces} onChange={(e) => up("parking_spaces", e.target.value)} />
          </Field>
          <Field label="Área construída (m²)">
            <input className="input" type="number" value={v.built_area} onChange={(e) => up("built_area", e.target.value)} />
          </Field>
          <Field label="Área total (m²)">
            <input className="input" type="number" value={v.total_area} onChange={(e) => up("total_area", e.target.value)} />
          </Field>
          <Field label="Área do terreno (m²)">
            <input className="input" type="number" value={v.land_area} onChange={(e) => up("land_area", e.target.value)} />
          </Field>
        </Grid>

        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground">Diferenciais</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {v.features.map((f) => (
              <span key={f} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs">
                {f}
                <button type="button" onClick={() => up("features", v.features.filter((x) => x !== f))}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              className="input"
              value={featureInput}
              placeholder="Ex.: Piscina, Churrasqueira…"
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (featureInput.trim()) {
                    up("features", [...v.features, featureInput.trim()]);
                    setFeatureInput("");
                  }
                }
              }}
            />
            <button type="button" className="btn-outline" onClick={() => {
              if (featureInput.trim()) {
                up("features", [...v.features, featureInput.trim()]);
                setFeatureInput("");
              }
            }}>Adicionar</button>
          </div>
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
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <UploadBtn onChange={(f) => handleUpload(f, "cover")} disabled={uploading} label="Selecionar capa" />
            {watermark?.enabled && watermark.logo_url && (
              <SkipWatermark
                checked={skipWatermark.cover}
                onChange={(b) => setSkipWatermark((s) => ({ ...s, cover: b }))}
              />
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="text-xs font-medium text-muted-foreground">Galeria de fotos</label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {v.gallery.map((url) => (
              <div key={url} className="relative">
                <img src={url} alt="" className="h-24 w-full rounded object-cover" />
                <button type="button" onClick={() => up("gallery", v.gallery.filter((u) => u !== url))} className="absolute -right-1 -top-1 rounded-full bg-black p-1 text-white"><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <UploadBtn onChange={(f) => handleUpload(f, "gallery")} disabled={uploading} label="Adicionar fotos" multiple />
            {watermark?.enabled && watermark.logo_url && (
              <SkipWatermark
                checked={skipWatermark.gallery}
                onChange={(b) => setSkipWatermark((s) => ({ ...s, gallery: b }))}
              />
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="text-xs font-medium text-muted-foreground">Vídeos (URL YouTube/Vimeo)</label>
          <div className="mt-2 space-y-1">
            {v.videos.map((u) => (
              <div key={u} className="flex items-center gap-2 rounded bg-secondary px-3 py-1.5 text-xs">
                <span className="flex-1 truncate">{u}</span>
                <button type="button" onClick={() => up("videos", v.videos.filter((x) => x !== u))}><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input className="input" value={videoInput} onChange={(e) => setVideoInput(e.target.value)} placeholder="https://youtube.com/watch?v=... ou https://youtu.be/..." />
            <button type="button" className="btn-outline" onClick={() => {
              const url = videoInput.trim();
              if (!url) return;
              if (!isValidVideoUrl(url)) { alert("URL de vídeo inválida. Use um link do YouTube ou Vimeo."); return; }
              if (v.videos.includes(url)) { setVideoInput(""); return; }
              up("videos", [...v.videos, url]);
              setVideoInput("");
            }}>Adicionar</button>
          </div>
          {videoInput && !isValidVideoUrl(videoInput.trim()) && (
            <p className="mt-1 text-xs text-destructive">Formato não reconhecido — cole um link do YouTube ou Vimeo.</p>
          )}
        </div>

        <div className="mt-6">
          <Field label="Tour Virtual (URL 360º / Matterport)">
            <input className="input" value={v.virtual_tour_url} onChange={(e) => up("virtual_tour_url", e.target.value)} placeholder="https://my.matterport.com/show/?m=..." />
          </Field>
        </div>
      </Card>

      <Card title="Corretor & Status">
        <Grid>
          <Field label="Corretor responsável">
            <select className="input" value={v.agent_id} onChange={(e) => up("agent_id", e.target.value)}>
              <option value="">— Padrão da imobiliária —</option>
              {(agents ?? []).map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Status do imóvel">
            <select className="input" value={v.status} onChange={(e) => up("status", e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
        </Grid>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          <Toggle label="Publicado" v={v.published} onChange={(b) => up("published", b)} />
          <Toggle label="Destaque" v={v.is_featured} onChange={(b) => up("is_featured", b)} />
          <Toggle label="Arquivado" v={v.archived} onChange={(b) => up("archived", b)} />
          <Toggle label="Lançamento" v={v.is_launch} onChange={(b) => up("is_launch", b)} />
          <Toggle label="Oportunidade" v={v.is_opportunity} onChange={(b) => up("is_opportunity", b)} />
          <Toggle label="Novo" v={v.is_new} onChange={(b) => up("is_new", b)} />
          <Toggle label="MCMV" v={v.is_mcmv} onChange={(b) => up("is_mcmv", b)} />
        </div>
      </Card>

      <div className="flex items-center justify-between">
        {onDelete ? (
          <button type="button" onClick={onDelete} className="inline-flex items-center gap-1 rounded border border-destructive/30 px-4 py-2 text-sm text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" /> Excluir imóvel
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
