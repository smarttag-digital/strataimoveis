import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/admin/imoveis")({
  component: AdminImoveis,
});

function AdminImoveis() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Imóveis</h1>
      <p className="mt-1 text-sm text-muted-foreground">Gestão completa do catálogo.</p>
      <div className="mt-10 rounded-lg border border-dashed border-border bg-card p-12 text-center">
        <Building2 className="mx-auto h-10 w-10 text-[var(--champagne)]" />
        <p className="mt-4 text-sm text-muted-foreground">
          Módulo de cadastro de imóveis com upload de fotos e vídeos será habilitado na próxima iteração.
          A estrutura do banco já está pronta — basta confirmar o fluxo desejado para implementarmos.
        </p>
      </div>
    </div>
  );
}
