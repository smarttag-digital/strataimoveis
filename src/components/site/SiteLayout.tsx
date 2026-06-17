import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  // Scoped realtime: only invalidate property/development queries on changes.
  useRealtimeSync(["properties", "developments"], {
    invalidatePrefix: [
      "latest-properties",
      "featured-properties",
      "properties-list",
      "property-detail",
      "developments-list",
      "development-detail",
    ],
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
