import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-primary">Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tente recarregar a página.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="btn-primary"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Letícia Souza Negócios Imobiliários | Imóveis em Tatuí-SP" },
      { name: "description", content: "Corretora especializada em casas, apartamentos, terrenos, condomínios e loteamentos em Tatuí-SP. Atendimento consultivo para morar, investir e construir patrimônio." },
      { name: "keywords", content: "imóveis Tatuí, casas à venda Tatuí, terrenos Tatuí, apartamentos Tatuí, corretora imóveis Tatuí, Minha Casa Minha Vida Tatuí, loteamentos Tatuí, condomínios Tatuí" },
      { name: "author", content: "Letícia Souza Negócios Imobiliários" },
      { property: "og:title", content: "Letícia Souza Negócios Imobiliários | Imóveis em Tatuí-SP" },
      { property: "og:description", content: "Corretora especializada em casas, apartamentos, terrenos, condomínios e loteamentos em Tatuí-SP. Atendimento consultivo para morar, investir e construir patrimônio." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Letícia Souza Negócios Imobiliários | Imóveis em Tatuí-SP" },
      { name: "twitter:description", content: "Corretora especializada em casas, apartamentos, terrenos, condomínios e loteamentos em Tatuí-SP. Atendimento consultivo para morar, investir e construir patrimônio." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a0e26cb5-6510-42ec-add4-3d35fff02472/id-preview-ddf575ca--fe01cd60-3be5-40f9-ab6e-e00208b3fafe.lovable.app-1779819395973.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a0e26cb5-6510-42ec-add4-3d35fff02472/id-preview-ddf575ca--fe01cd60-3be5-40f9-ab6e-e00208b3fafe.lovable.app-1779819395973.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300;400;500;600&display=swap" },
      { rel: "canonical", href: "/" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
