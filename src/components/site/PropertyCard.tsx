import { Link } from "@tanstack/react-router";
import { Bed, Bath, Car, Maximize, CalendarDays } from "lucide-react";
import { formatPrice } from "@/lib/site";
import { canSchedule, schedulingLink } from "@/lib/scheduling";

export type PropertyCardData = {
  id: string;
  slug: string;
  title: string;
  city: string | null;
  neighborhood: string | null;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spaces: number | null;
  built_area: number | null;
  cover_image: string | null;
  status?: string | null;
  is_featured?: boolean;
  is_new?: boolean;
  is_opportunity?: boolean;
  is_launch?: boolean;
};

export function PropertyCard({ p }: { p: PropertyCardData }) {
  const statusBadge = p.status === "vendido"
    ? { label: "Vendido", cls: "bg-destructive text-destructive-foreground" }
    : p.status === "alugado"
      ? { label: "Alugado", cls: "bg-primary text-primary-foreground" }
      : p.status === "reservado"
        ? { label: "Reservado", cls: "bg-[var(--champagne)] text-black" }
        : null;
  const badges = [
    statusBadge,
    p.is_launch && { label: "Lançamento", cls: "bg-black text-white" },
    p.is_opportunity && { label: "Oportunidade", cls: "bg-[var(--champagne)] text-black" },
    p.is_new && { label: "Novo", cls: "bg-white text-black border border-border" },
    p.is_featured && { label: "Destaque", cls: "bg-black/80 text-white" },
  ].filter(Boolean) as { label: string; cls: string }[];

  return (
    <Link
      to="/imovel/$ref"
      params={{ ref: p.slug || p.id }}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {p.cover_image ? (
          <img
            src={p.cover_image}
            alt={p.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            Sem foto
          </div>
        )}
        {badges.length > 0 && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1">
            {badges.map((b) => (
              <span key={b.label} className={`rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${b.cls}`}>
                {b.label}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {[p.neighborhood, p.city].filter(Boolean).join(" · ")}
        </div>
        <h3 className="mt-1 line-clamp-2 text-lg font-semibold">{p.title}</h3>
        <p className="mt-3 text-xl font-bold text-foreground">{formatPrice(p.price)}</p>
        <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
          {p.bedrooms != null && <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{p.bedrooms}</span>}
          {p.bathrooms != null && <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{p.bathrooms}</span>}
          {p.parking_spaces != null && <span className="flex items-center gap-1"><Car className="h-4 w-4" />{p.parking_spaces}</span>}
          {p.built_area != null && <span className="flex items-center gap-1"><Maximize className="h-4 w-4" />{p.built_area}m²</span>}
        </div>
      </div>
    </Link>
  );
}
