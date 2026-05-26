import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-leticia-souza.png";
import { LogOut, Home, MessageSquare, Building2, BookOpen, Settings } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate({ to: "/auth" }); return; }
      if (mounted) setEmail(user.email ?? null);
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (!mounted) return;
      setIsAdmin(!!roles);
      setChecking(false);
    }
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate({ to: "/auth" });
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Carregando...</div>;
  }
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary p-6">
        <div className="max-w-md rounded-lg border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-semibold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A conta <strong>{email}</strong> não possui permissão administrativa.
            Apenas o e-mail autorizado pode acessar o painel.
          </p>
          <button onClick={signOut} className="btn-outline mt-6">Sair</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-secondary">
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="border-b border-border p-5">
          <img src={logo} alt="Letícia Souza" className="h-10 w-auto" />
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Painel</p>
        </div>
        <nav className="flex-1 space-y-1 p-3 text-sm">
          <NavItem to="/admin" icon={Home} label="Visão geral" />
          <NavItem to="/admin/imoveis" icon={Building2} label="Imóveis" />
          <NavItem to="/admin/leads" icon={MessageSquare} label="Leads" />
          <NavItem to="/admin/blog" icon={BookOpen} label="Blog" />
          <NavItem to="/admin/configuracoes" icon={Settings} label="Configurações" />
        </nav>
        <button onClick={signOut} className="m-3 flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4 md:hidden">
          <img src={logo} alt="" className="h-8" />
          <button onClick={signOut}><LogOut className="h-5 w-5" /></button>
        </header>
        <main className="p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-foreground/80 hover:bg-secondary"
      activeProps={{ className: "bg-secondary text-foreground font-semibold" }}
      activeOptions={{ exact: true }}
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}
