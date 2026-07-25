import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCrmStatus, retryPendingLeads, syncCatalogToCrm } from "@/lib/crm.functions";
import { CheckCircle2, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/crm")({
  component: AdminCrmPage,
  head: () => ({
    meta: [
      { title: "Integração SmartFlow | Painel" },
      { name: "description", content: "Status da integração do portal com o CRM SmartFlow." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminCrmPage() {
  const qc = useQueryClient();
  const fetchStatus = useServerFn(getCrmStatus);
  const retry = useServerFn(retryPendingLeads);
  const syncCatalog = useServerFn(syncCatalogToCrm);

  const { data, isLoading } = useQuery({
    queryKey: ["crm-status"],
    queryFn: () => fetchStatus(),
  });

  const retryMutation = useMutation({
    mutationFn: () => retry(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm-status"] }),
  });
  const catalogMutation = useMutation({
    mutationFn: () => syncCatalog(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["crm-status"] }),
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Integração SmartFlow</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Envio automático de leads e sincronização do catálogo com o CRM.
        </p>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Leads enviados" value={String(data?.synced ?? 0)} />
            <Stat label="Leads pendentes" value={String(data?.pending ?? 0)} />
            <Flag label="Envio de leads (webhook)" ok={!!data?.webhookConfigured} />
            <Flag label="API de leitura do CRM" ok={!!data?.inboundApiConfigured} />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="btn-primary inline-flex items-center gap-2"
              disabled={retryMutation.isPending}
              onClick={() => retryMutation.mutate()}
            >
              {retryMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Reenviar leads pendentes
            </button>
            <button
              className="btn-outline inline-flex items-center gap-2"
              disabled={catalogMutation.isPending}
              onClick={() => catalogMutation.mutate()}
            >
              {catalogMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Sincronizar imóveis e empreendimentos
            </button>
          </div>

          {retryMutation.data && (
            <p className="text-sm text-muted-foreground">
              {retryMutation.data.sent} lead(s) enviados, {retryMutation.data.failed} com erro.
            </p>
          )}
          {catalogMutation.data && (
            <p className="text-sm text-muted-foreground">
              {catalogMutation.data.ok ? "Catálogo enviado" : "Falha no envio"} — {catalogMutation.data.properties} imóveis
              e {catalogMutation.data.developments} empreendimentos.
            </p>
          )}

          <section className="rounded-lg border border-border bg-card">
            <h2 className="border-b border-border px-5 py-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Últimas sincronizações
            </h2>
            <ul className="divide-y divide-border text-sm">
              {(data?.log ?? []).length === 0 && (
                <li className="px-5 py-4 text-muted-foreground">Nenhuma sincronização registrada ainda.</li>
              )}
              {(data?.log ?? []).map((l) => (
                <li key={l.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span className={l.status === "success" ? "text-emerald-600" : "text-destructive"}>
                    {l.status === "success" ? "OK" : l.status}
                  </span>
                  <span className="font-medium">{l.entity}</span>
                  <span className="text-muted-foreground">{l.direction}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(l.created_at).toLocaleString("pt-BR")}
                  </span>
                  {l.detail && <span className="w-full truncate text-xs text-muted-foreground">{l.detail}</span>}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-border bg-secondary/40 p-5 text-sm">
            <h2 className="font-semibold">Endpoints disponíveis para o SmartFlow</h2>
            <p className="mt-2 text-muted-foreground">
              Autentique com o cabeçalho <code>Authorization: Bearer &lt;SMARTFLOW_API_TOKEN&gt;</code>.
            </p>
            <ul className="mt-3 space-y-1 font-mono text-xs">
              <li>GET /api/public/crm/leads?since=ISO&amp;limit=100</li>
              <li>GET /api/public/crm/imoveis?since=ISO&amp;limit=200</li>
              <li>GET /api/public/crm/empreendimentos?since=ISO&amp;limit=200</li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Flag({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-2 inline-flex items-center gap-2 text-sm font-medium ${ok ? "text-emerald-600" : "text-destructive"}`}>
        {ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        {ok ? "Configurado" : "Pendente"}
      </p>
    </div>
  );
}
