import { Link } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/logo-leticia-souza.png";
import { Menu, X } from "lucide-react";
import { useFeatures } from "@/lib/site-settings";

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
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container-prose flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label="Letícia Souza Imóveis">
          <img src={logo} alt="Letícia Souza" className="h-12 w-auto" width={48} height={48} />
          <span className="hidden text-sm font-semibold tracking-wide sm:inline">
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
        <button onClick={() => setOpen((v) => !v)} className="lg:hidden" aria-label="Menu">
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
