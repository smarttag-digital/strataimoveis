import { Link } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/logo-leticia-souza.png";
import { Menu, X, MessageCircle } from "lucide-react";
import { useFeatures } from "@/lib/site-settings";
import { whatsappLink } from "@/lib/site";

const baseLinks = [
  { to: "/", label: "Início" },
  { to: "/imoveis", label: "Imóveis" },
  { to: "/empreendimentos", label: "Empreendimentos" },
  { to: "/sobre", label: "Sobre" },
];
const blogLink = { to: "/blog", label: "Blog" };
const contactLink = { to: "/contato", label: "Contato" };

export function Header() {
  const [open, setOpen] = useState(false);
  const { data: features } = useFeatures();
  const links = [
    ...baseLinks,
    ...(features?.blog_enabled !== false ? [blogLink] : []),
    contactLink,
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/92 backdrop-blur-md">
      <div className="container-prose grid h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:flex lg:justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label="Letícia Souza Imóveis">
          <img src={logo} alt="Letícia Souza" className="h-12 w-auto" width={48} height={48} />
          <span className="hidden text-sm font-semibold tracking-[0.08em] sm:inline">
            LETÍCIA SOUZA
            <span className="block text-[10px] font-normal tracking-[0.2em] text-muted-foreground">
              NEGÓCIOS IMOBILIÁRIOS
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-primary gap-2"><MessageCircle className="h-4 w-4" /> Falar com Letícia</a>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="grid h-11 w-11 place-items-center lg:hidden" aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border bg-background lg:hidden">
          <div className="container-prose flex flex-col py-4">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-3 text-sm font-medium">
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
