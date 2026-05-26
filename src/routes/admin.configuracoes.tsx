import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/configuracoes")({
  component: () => (
    <div>
      <h1 className="text-2xl font-bold">Configurações</h1>
      <p className="mt-2 text-sm text-muted-foreground">SEO, contatos e edição de páginas (em breve).</p>
    </div>
  ),
});
