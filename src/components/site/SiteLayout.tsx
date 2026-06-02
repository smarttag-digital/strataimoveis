import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  // Keep all public pages live-synced with admin edits.
  useRealtimeSync([
    "properties",
    "developments",
    "site_settings",
    "blog_posts",
    "agents",
  ]);
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
