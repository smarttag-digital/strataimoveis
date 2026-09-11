import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { PROPERTY_TYPES } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  variant?: "hero" | "inline";
  initial?: Partial<SearchValues>;
};

export type SearchValues = {
  transaction: "" | "venda" | "aluguel";
  type: string;
  city: string;
  neighborhood: string;
  minPrice: string;
  maxPrice: string;
  reference: string;
};

const defaults: SearchValues = {
  transaction: "",
  type: "",
  city: "",
  neighborhood: "",
  minPrice: "",
  maxPrice: "",
  reference: "",
};

export function SearchBar({ variant = "hero", initial }: Props) {
  const navigate = useNavigate();
  const [values, setValues] = useState<SearchValues>({ ...defaults, ...initial });
  const [cities, setCities] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [showRef, setShowRef] = useState(false);

  useEffect(() => {
    supabase
      .from("properties")
      .select("city,neighborhood")
      .eq("published", true)
      .eq("archived", false)
      .in("status", ["disponivel", "reservado"])
      .limit(500)
      .then(({ data }) => {
        if (!data) return;
        setCities([...new Set(data.map((d) => d.city).filter(Boolean) as string[])].sort());
        setNeighborhoods(
          [...new Set(data.map((d) => d.neighborhood).filter(Boolean) as string[])].sort()
        );
      });
  }, []);

  function update<K extends keyof SearchValues>(k: K, v: SearchValues[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (values.reference.trim()) {
      navigate({ to: "/imovel/$ref", params: { ref: values.reference.trim() } });
      return;
    }
    const search: Record<string, string> = {};
    if (values.transaction) search.transaction = values.transaction;
    if (values.type) search.type = values.type;
    if (values.city) search.city = values.city;
    if (values.neighborhood) search.neighborhood = values.neighborhood;
    if (values.minPrice) search.minPrice = values.minPrice;
    if (values.maxPrice) search.maxPrice = values.maxPrice;
    navigate({ to: "/imoveis", search });
  }

  const container =
    variant === "hero"
      ? "rounded-md border border-border bg-card/95 p-4 shadow-xl shadow-primary/5 backdrop-blur-md"
      : "rounded-xl bg-card p-4 shadow-md border border-border";

  return (
    <form onSubmit={submit} className={container}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <SelectField
          label="Tipo de Negócio"
          value={values.transaction}
          onChange={(v) => update("transaction", v as SearchValues["transaction"])}
          options={[
            { value: "", label: "Todos" },
            { value: "venda", label: "Comprar" },
            { value: "aluguel", label: "Alugar" },
          ]}
        />
        <SelectField
          label="Tipo de Imóvel"
          value={values.type}
          onChange={(v) => update("type", v)}
          options={[
            { value: "", label: "Todos" },
            ...PROPERTY_TYPES.map((t) => ({ value: t.value, label: t.label })),
          ]}
        />
        <InputField
          label="Valor mínimo"
          value={values.minPrice}
          onChange={(v) => update("minPrice", v)}
          placeholder="R$ 0"
          inputMode="numeric"
        />
        <InputField
          label="Valor máximo"
          value={values.maxPrice}
          onChange={(v) => update("maxPrice", v)}
          placeholder="Sem limite"
          inputMode="numeric"
        />
        <button
          type="submit"
          className="row-span-2 hidden h-full items-center justify-center rounded bg-primary px-8 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:bg-accent hover:text-accent-foreground lg:flex"
        >
          <Search className="mr-2 h-4 w-4" /> Pesquisar
        </button>

        <SelectField
          label="Cidade"
          value={values.city}
          onChange={(v) => update("city", v)}
          options={[
            { value: "", label: "Todas" },
            ...cities.map((c) => ({ value: c, label: c })),
          ]}
        />
        <SelectField
          label="Bairros"
          value={values.neighborhood}
          onChange={(v) => update("neighborhood", v)}
          options={[
            { value: "", label: "Todos" },
            ...neighborhoods.map((n) => ({ value: n, label: n })),
          ]}
        />
        <div className="md:col-span-2">
          {showRef ? (
            <InputField
              label="Número de referência"
              value={values.reference}
              onChange={(v) => update("reference", v)}
              placeholder="Ex.: LS01001"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowRef(true)}
              className="flex h-full w-full items-center justify-end pr-1 text-sm font-medium text-accent hover:underline"
            >
              <Search className="mr-2 h-4 w-4" /> Buscar por referência
            </button>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="mt-3 flex w-full items-center justify-center rounded bg-primary px-8 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:bg-accent hover:text-accent-foreground lg:hidden"
      >
        <Search className="mr-2 h-4 w-4" /> Pesquisar
      </button>
    </form>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative flex flex-col gap-1 rounded border border-border/60 bg-background px-4 py-2 transition-colors focus-within:border-accent">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center justify-between">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent pr-6 text-sm font-medium text-foreground outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground" />
      </div>
    </label>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "numeric" | "text";
  autoFocus?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 rounded border border-border/60 bg-background px-4 py-2 transition-colors focus-within:border-accent">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoFocus={autoFocus}
        className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
      />
    </label>
  );
}
