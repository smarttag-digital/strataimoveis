import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { whatsappLink } from "@/lib/site";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contato")({
  component: ContatoPage,
});

function ContatoPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("leads").insert({
      name: String(fd.get("name") || ""),
      phone: String(fd.get("phone") || ""),
      email: String(fd.get("email") || ""),
      message: String(fd.get("message") || ""),
      source: "contato",
    });
    setLoading(false);
    if (error) setError("Não foi possível enviar. Tente novamente.");
    else setSent(true);
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary py-16">
        <div className="container-prose">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Vamos conversar</p>
          <h1 className="mt-2 text-3xl font-bold md:text-5xl">Contato</h1>
        </div>
      </section>

      <section className="container-prose grid gap-12 py-16 md:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="text-xl font-semibold">Atendimento personalizado</h2>
          <p className="mt-3 text-muted-foreground">
            Estou pronta para te atender e indicar a melhor oportunidade do mercado
            imobiliário de Tatuí. Envie sua mensagem pelo formulário ou chame no WhatsApp —
            respondo o quanto antes.
          </p>
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-primary mt-8 inline-flex">
            Falar no WhatsApp
          </a>

          <div className="mt-8 overflow-hidden rounded-lg border border-border">
            <iframe
              title="Tatuí - SP"
              src="https://www.google.com/maps?q=Tatu%C3%AD%2C+SP&output=embed"
              className="h-64 w-full"
              loading="lazy"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-8">
          {sent ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--champagne)]" />
              <h3 className="mt-4 text-xl font-semibold">Mensagem enviada!</h3>
              <p className="mt-2 text-muted-foreground">Entrarei em contato em breve.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold">Envie sua mensagem</h2>
              <Input name="name" label="Nome" required />
              <Input name="phone" label="Telefone" required />
              <Input name="email" label="E-mail" type="email" />
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">Mensagem</span>
                <textarea name="message" rows={5} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? "Enviando..." : "Enviar mensagem"}
              </button>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function Input({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input name={name} type={type} required={required} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
    </label>
  );
}
