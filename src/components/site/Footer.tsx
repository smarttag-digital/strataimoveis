import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import logo from "@/assets/logo-leticia-souza-dark.png";
import { SITE } from "@/lib/site";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFeatures } from "@/lib/site-settings";

type SocialLinks = {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  whatsapp?: string;
};

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M20.52 3.48A11.94 11.94 0 0012.05 0C5.5 0 .17 5.33.17 11.88c0 2.09.55 4.13 1.6 5.93L0 24l6.34-1.66a11.86 11.86 0 005.7 1.45h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.24-6.16-3.41-8.43zM12.05 21.7a9.83 9.83 0 01-5.01-1.37l-.36-.21-3.76.99 1-3.67-.23-.38a9.82 9.82 0 01-1.51-5.18c0-5.44 4.43-9.86 9.88-9.86 5.44 0 9.87 4.43 9.87 9.87 0 5.44-4.43 9.86-9.87 9.86z" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43V8.51a8.16 8.16 0 004.77 1.52V6.6a4.85 4.85 0 01-1.84.09z" />
  </svg>
);

export function useSocialLinks() {
  return useQuery({
    queryKey: ["site-settings", "social_links"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "social_links")
        .maybeSingle();
      return (data?.value ?? {}) as SocialLinks;
    },
  });
}

export function Footer() {
  const { data: social } = useSocialLinks();
  const { data: features } = useFeatures();
  const blogOn = features?.blog_enabled !== false;
  const links = social ?? {};
  const items = [
    { key: "instagram", url: links.instagram, label: "Instagram", Icon: Instagram },
    { key: "facebook", url: links.facebook, label: "Facebook", Icon: Facebook },
    { key: "tiktok", url: links.tiktok, label: "TikTok", Icon: TikTokIcon },
    { key: "youtube", url: links.youtube, label: "YouTube", Icon: Youtube },
    {
      key: "whatsapp",
      url: links.whatsapp ? `https://wa.me/${links.whatsapp}` : "",
      label: "WhatsApp",
      Icon: WhatsAppIcon,
    },
  ].filter((i) => i.url);

  return (
    <>
       <footer className="mt-24 bg-primary text-primary-foreground">
        <div className="container-prose grid gap-12 py-16 md:grid-cols-[2fr_1fr]">
          <div>
            <img src={logo} alt={SITE.name} className="h-20 w-auto" />
             <p className="mt-4 max-w-md text-sm text-primary-foreground/70">
              Especialista em conectar pessoas às melhores oportunidades imobiliárias em
              Tatuí e região — para morar, investir e construir patrimônio.
            </p>
             <p className="mt-4 text-xs uppercase tracking-[0.2em] text-accent">
              {SITE.creci}
            </p>
            {items.length > 0 && (
              <div className="mt-6 flex gap-3">
                {items.map(({ key, url, label, Icon }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                     className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-foreground/15 text-primary-foreground/80 transition-all hover:border-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div>
             <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-accent">
              Navegação
            </h4>
             <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/imoveis">Imóveis</Link></li>
              <li><Link to="/empreendimentos">Empreendimentos</Link></li>
              <li><Link to="/sobre">Sobre</Link></li>
              {blogOn && <li><Link to="/blog">Blog</Link></li>}
              <li><Link to="/contato">Contato</Link></li>
            </ul>
          </div>
        </div>
         <div className="border-t border-primary-foreground/10">
           <div className="container-prose flex flex-col items-center justify-between gap-2 py-6 text-xs text-primary-foreground/50 md:flex-row">
            <p>© 2026 {SITE.name}. Todos os direitos reservados.</p>
             <p>Desenvolvido por <span className="font-medium text-accent">{SITE.developer}</span>.</p>
          </div>
        </div>
      </footer>

    </>
  );
}
