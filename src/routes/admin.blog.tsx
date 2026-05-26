import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/blog")({
  component: () => (
    <div>
      <h1 className="text-2xl font-bold">Blog</h1>
      <p className="mt-2 text-sm text-muted-foreground">Editor de posts (em breve nesta versão do painel).</p>
    </div>
  ),
});
