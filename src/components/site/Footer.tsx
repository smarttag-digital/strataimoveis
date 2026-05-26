import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-leticia-souza-dark.png";
import { SITE } from "@/lib/site";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 bg-[#0a0a0a] text-white">
      <div className="container-prose grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <img src={logo} alt={SITE.name} className="h-20 w-auto" />
          <p className="mt-4 max-w-sm text-sm text-white/70">
            Especialista em conectar pessoas às melhores oportunidades imobiliárias em
            Tatuí e região — para morar, investir e construir patrimônio.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[var(--champagne)]">
            {SITE.creci}
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--champagne)]">
            Navegação
          </h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/imoveis">Imóveis</Link></li>
            <li><Link to="/empreendimentos">Empreendimentos</Link></li>
            <li><Link to="/sobre">Sobre</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/contato">Contato</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--champagne)]">
            Contato
          </h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" />{SITE.phone}</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" />{SITE.email}</li>
            <li>{SITE.city}</li>
            <li className="flex gap-3 pt-2">
              <a href="#" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
              <a href="#" aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-prose flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/50 md:flex-row">
          <p>© 2026 {SITE.name}. Todos os direitos reservados.</p>
          <p>Desenvolvido por <span className="text-[var(--champagne)] font-medium">{SITE.developer}</span>.</p>
        </div>
      </div>
    </footer>
  );
}
