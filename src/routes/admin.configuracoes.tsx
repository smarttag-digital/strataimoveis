import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { defaultWatermark, type WatermarkSettings, type WatermarkPosition } from "@/lib/watermark";

export const Route = createFileRoute("/admin/configuracoes")({
  component: Configuracoes,
});

type Contact = { phone: string; whatsapp: string; email: string; creci: string; address: string };
type Social = { instagram: string; facebook: string; tiktok: string; youtube: string; whatsapp: string };
type About = { title: string; body: string };
type Features = { blog_enabled: boolean };

const emptyContact: Contact = { phone: "", whatsapp: "", email: "", creci: "", address: "" };
const emptySocial: Social = { instagram: "", facebook: "", tiktok: "", youtube: "", whatsapp: "" };
const emptyAbout: About = { title: "", body: "" };
const defaultFeatures: Features = { blog_enabled: true };

const POSITIONS: { value: WatermarkPosition; label: string }[] = [
  { value: "top-left", label: "Superior esquerda" },
  { value: "top-center", label: "Superior centro" },
  { value: "top-right", label: "Superior direita" },
  { value: "center", label: "Centro" },
  { value: "bottom-left", label: "Inferior esquerda" },
  { value: "bottom-center", label: "Inferior centro" },
  { value: "bottom-right", label: "Inferior direita" },
];

function Configuracoes() {
  const { data, refetch } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("key,value");
      const map: Record<string, any> = {};
      data?.forEach((r) => (map[r.key] = r.value));
      return map;
    },
  });

  const [contact, setContact] = useState<Contact>(emptyContact);
  const [social, setSocial] = useState<Social>(emptySocial);
  const [about, setAbout] = useState<About>(emptyAbout);
  const [features, setFeatures] = useState<Features>(defaultFeatures);
  const [watermark, setWatermark] = useState<WatermarkSettings>(defaultWatermark);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (data) {
      setContact({ ...emptyContact, ...(data.contact ?? {}) });
      setSocial({ ...emptySocial, ...(data.social_links ?? {}) });
      setAbout({ ...emptyAbout, ...(data.about ?? {}) });
      setFeatures({ ...defaultFeatures, ...(data.features ?? {}) });
      setWatermark({ ...defaultWatermark, ...(data.watermark ?? {}) });
    }
  }, [data]);

  async function uploadLogo(file: File) {
    setUploadingLogo(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `watermark/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("property-media").upload(path, file, {
        upsert: true, contentType: file.type,
      });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("property-media").getPublicUrl(path);
      setWatermark((w) => ({ ...w, logo_url: pub.publicUrl }));
      toast.success("Logomarca carregada. Clique em Salvar para aplicar.");
    } catch (e: any) {
      toast.error("Erro no upload: " + e.message);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function save() {
    setSaving(true);
    const upserts = [
      supabase.from("site_settings").upsert({ key: "contact", value: contact }),
      supabase.from("site_settings").upsert({ key: "social_links", value: social }),
      supabase.from("site_settings").upsert({ key: "about", value: about }),
      supabase.from("site_settings").upsert({ key: "features", value: features }),
      supabase.from("site_settings").upsert({ key: "watermark", value: watermark }),
    ];
    const results = await Promise.all(upserts);
    setSaving(false);
    const err = results.find((r) => r.error)?.error;
    if (err) toast.error("Erro: " + err.message);
    else { toast.success("Configurações salvas."); refetch(); }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <p className="mt-1 text-sm text-muted-foreground">Tudo aqui é refletido em tempo real no site.</p>

      <Card title="Recursos do site">
        <label className="flex cursor-pointer items-center justify-between rounded border border-border bg-background px-4 py-3">
          <div>
            <p className="font-medium">Exibir Blog no site</p>
            <p className="text-xs text-muted-foreground">Quando desativado, o menu Blog desaparece e a página redireciona para a home.</p>
          </div>
          <input
            type="checkbox"
            checked={features.blog_enabled}
            onChange={(e) => setFeatures({ ...features, blog_enabled: e.target.checked })}
            className="h-5 w-5"
          />
        </label>
      </Card>

      <Card title="Logomarca automática nas fotos">
        <label className="flex cursor-pointer items-center justify-between rounded border border-border bg-background px-4 py-3">
          <div>
            <p className="font-medium">Aplicar logomarca automaticamente</p>
            <p className="text-xs text-muted-foreground">Insere a marca em novas fotos enviadas. Fotos que já foram marcadas por este sistema não recebem uma segunda marca.</p>
          </div>
          <input
            type="checkbox"
            checked={watermark.enabled}
            onChange={(e) => setWatermark({ ...watermark, enabled: e.target.checked })}
            className="h-5 w-5"
          />
        </label>

        <div className="mt-4">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Logomarca (PNG com transparência recomendado)</span>
          <div className="flex items-center gap-4">
            {watermark.logo_url ? (
              <div className="relative rounded border border-border bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#fafafa_0%_50%)] p-2">
                <img src={watermark.logo_url} alt="Logomarca" className="h-16 w-auto object-contain" />
                <button
                  type="button"
                  onClick={() => setWatermark({ ...watermark, logo_url: "" })}
                  className="absolute -right-2 -top-2 rounded-full bg-black p-1 text-white"
                ><X className="h-3 w-3" /></button>
              </div>
            ) : (
              <div className="rounded border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">Nenhuma logomarca definida</div>
            )}
            <label className={`inline-flex cursor-pointer items-center gap-2 rounded border border-dashed border-border px-4 py-2 text-sm hover:bg-secondary ${uploadingLogo ? "opacity-50" : ""}`}>
              {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Enviar logomarca
              <input type="file" className="hidden" accept="image/png,image/webp,image/svg+xml"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); e.currentTarget.value = ""; }}
                disabled={uploadingLogo}
              />
            </label>
          </div>
        </div>

        <Grid className="mt-4">
          <F label="Posição">
            <select className="input" value={watermark.position} onChange={(e) => setWatermark({ ...watermark, position: e.target.value as WatermarkPosition })}>
              {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </F>
          <F label={`Tamanho — ${watermark.size}% da largura`}>
            <input type="range" min={5} max={50} step={1} value={watermark.size}
              onChange={(e) => setWatermark({ ...watermark, size: Number(e.target.value) })} className="w-full" />
          </F>
          <F label={`Margem — ${watermark.margin}%`}>
            <input type="range" min={0} max={20} step={1} value={watermark.margin}
              onChange={(e) => setWatermark({ ...watermark, margin: Number(e.target.value) })} className="w-full" />
          </F>
          <F label={`Transparência — ${Math.round(watermark.opacity * 100)}%`}>
            <input type="range" min={10} max={100} step={5} value={Math.round(watermark.opacity * 100)}
              onChange={(e) => setWatermark({ ...watermark, opacity: Number(e.target.value) / 100 })} className="w-full" />
          </F>
        </Grid>
      </Card>

      <Card title="Contato">
        <Grid>
          <F label="Telefone"><input className="input" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></F>
          <F label="WhatsApp (DDI+DDD, só números)"><input className="input" value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} /></F>
          <F label="E-mail"><input className="input" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></F>
          <F label="CRECI"><input className="input" value={contact.creci} onChange={(e) => setContact({ ...contact, creci: e.target.value })} /></F>
          <F label="Endereço" className="md:col-span-2"><input className="input" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></F>
        </Grid>
      </Card>

      <Card title="Sobre (página Quem Sou)">
        <Grid>
          <F label="Título" className="md:col-span-2"><input className="input" value={about.title} onChange={(e) => setAbout({ ...about, title: e.target.value })} /></F>
          <F label="Texto" className="md:col-span-2"><textarea className="input min-h-40" value={about.body} onChange={(e) => setAbout({ ...about, body: e.target.value })} /></F>
        </Grid>
      </Card>

      <Card title="Redes sociais">
        <Grid>
          <F label="Instagram"><input className="input" value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} placeholder="https://instagram.com/…" /></F>
          <F label="Facebook"><input className="input" value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} placeholder="https://facebook.com/…" /></F>
          <F label="TikTok"><input className="input" value={social.tiktok} onChange={(e) => setSocial({ ...social, tiktok: e.target.value })} placeholder="https://tiktok.com/@…" /></F>
          <F label="YouTube"><input className="input" value={social.youtube} onChange={(e) => setSocial({ ...social, youtube: e.target.value })} placeholder="https://youtube.com/@…" /></F>
          <F label="WhatsApp (só números)"><input className="input" value={social.whatsapp} onChange={(e) => setSocial({ ...social, whatsapp: e.target.value })} /></F>
        </Grid>
      </Card>

      <div className="mt-6 flex justify-end">
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar configurações
        </button>
      </div>

      <style>{`.input { width: 100%; border: 1px solid var(--color-border); background: var(--color-background); padding: 0.55rem 0.75rem; border-radius: var(--radius); font-size: 0.875rem; }`}</style>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}
function Grid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${className ?? ""}`}>{children}</div>;
}
function F({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
