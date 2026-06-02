import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setContact({ ...emptyContact, ...(data.contact ?? {}) });
      setSocial({ ...emptySocial, ...(data.social_links ?? {}) });
      setAbout({ ...emptyAbout, ...(data.about ?? {}) });
      setFeatures({ ...defaultFeatures, ...(data.features ?? {}) });
    }
  }, [data]);

  async function save() {
    setSaving(true);
    const upserts = [
      supabase.from("site_settings").upsert({ key: "contact", value: contact }),
      supabase.from("site_settings").upsert({ key: "social_links", value: social }),
      supabase.from("site_settings").upsert({ key: "about", value: about }),
      supabase.from("site_settings").upsert({ key: "features", value: features }),
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
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}
function F({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
