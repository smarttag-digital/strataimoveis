import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PropertyCard, type PropertyCardData } from "@/components/site/PropertyCard";
import { PROPERTY_TYPES } from "@/lib/site";
import { Search } from "lucide-react";

type Filters = {
  type: string;
  city: string;
  neighborhood: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
};

const empty: Filters = {
  type: "", city: "", neighborhood: "", minPrice: "", maxPrice: "",
  bedrooms: "", bathrooms: "", parking: "",
};

export const Route = createFileRoute("/imoveis")({
  validateSearch: (s: Record<string, unknown>): Partial<Filters> => ({
    type: (s.type as string) || "",
    city: (s.city as string) || "",
    bedrooms: (s.bedrooms as string) || "",
  }),
  component: ImoveisPage,
});

function ImoveisPage() {
  const initial = Route.useSearch();
  const [filters, setFilters] = useState<Filters>({ ...empty, ...initial });

  const { data, isLoading } = useQuery({
    queryKey: ["properties", filters],
    queryFn: async () => {
      let q = supabase
        .from("properties")
        .select("id,slug,title,city,neighborhood,price,bedrooms,bathrooms,parking_spaces,built_area,cover_image,is_featured,is_new,is_opportunity,is_launch")
        .eq("published", true);
      if (filters.type) q = q.eq("property_type", filters.type);
      if (filters.city) q = q.ilike("city", `%${filters.city}%`);
      if (filters.neighborhood) q = q.ilike("neighborhood", `%${filters.neighborhood}%`);
      if (filters.minPrice) q = q.gte("price", Number(filters.minPrice));
      if (filters.maxPrice) q = q.lte("price", Number(filters.maxPrice));
      if (filters.bedrooms) q = q.gte("bedrooms", Number(filters.bedrooms));
      if (filters.bathrooms) q = q.gte("bathrooms", Number(filters.bathrooms));
      if (filters.parking) q = q.gte("parking_spaces", Number(filters.parking));
      q = q.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data as PropertyCardData[];
    },
  });

  function update<K extends keyof Filters>(k: K, v: string) {
    setFilters((f) => ({ ...f, [k]: v }));
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary py-12">
        <div className="container-prose">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Busca de imóveis</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Encontre seu próximo lar ou investimento</h1>
        </div>
      </section>

      <section className="container-prose -mt-8 grid gap-6 py-8 lg:grid-cols-[300px_1fr]">
        <aside className="self-start rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider">Filtros</h2>
          <div className="space-y-3">
            <Field label="Tipo">
              <select value={filters.type} onChange={(e) => update("type", e.target.value)} className="input">
                <option value="">Todos</option>
                {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Cidade">
              <input value={filters.city} onChange={(e) => update("city", e.target.value)} className="input" placeholder="Tatuí" />
            </Field>
            <Field label="Bairro">
              <input value={filters.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} className="input" />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Valor min">
                <input value={filters.minPrice} onChange={(e) => update("minPrice", e.target.value)} className="input" inputMode="numeric" />
              </Field>
              <Field label="Valor max">
                <input value={filters.maxPrice} onChange={(e) => update("maxPrice", e.target.value)} className="input" inputMode="numeric" />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Dorm.">
                <input value={filters.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} className="input" inputMode="numeric" />
              </Field>
              <Field label="Banh.">
                <input value={filters.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} className="input" inputMode="numeric" />
              </Field>
              <Field label="Vagas">
                <input value={filters.parking} onChange={(e) => update("parking", e.target.value)} className="input" inputMode="numeric" />
              </Field>
            </div>
            <button
              type="button"
              onClick={() => setFilters({ ...empty })}
              className="mt-2 w-full text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Buscando..." : `${data?.length ?? 0} imóveis encontrados`}
            </p>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-96 animate-pulse rounded-lg bg-secondary" />)}
            </div>
          ) : data && data.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {data.map((p) => <PropertyCard key={p.id} p={p} />)}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-secondary/50 p-12 text-center">
              <Search className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Nenhum imóvel encontrado com esses filtros.</p>
            </div>
          )}
        </div>
      </section>

      <style>{`.input { width: 100%; border: 1px solid var(--color-border); background: var(--color-background); padding: 0.55rem 0.75rem; border-radius: var(--radius); font-size: 0.85rem; }`}</style>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
