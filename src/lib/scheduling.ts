/** Integração com a agenda externa (LES Broker). */
export const SCHEDULING_URL = "https://agenda-lesbroker.lovable.app/";
export const SITE_ORIGIN = "https://strataimoveis.lovable.app";

export type SchedulingProperty = {
  id: string;
  slug?: string | null;
  reference?: string | null;
  title: string;
  city?: string | null;
  neighborhood?: string | null;
  property_type?: string | null;
  price?: number | null;
  status?: string | null;
  archived?: boolean | null;
};

/** Só imóveis disponíveis (ou reservados) podem receber agendamento. */
export function canSchedule(p: { status?: string | null; archived?: boolean | null }) {
  if (p.archived) return false;
  const s = (p.status || "disponivel").toLowerCase();
  return s === "disponivel" || s === "reservado";
}

export function propertyUrl(p: SchedulingProperty) {
  return `${SITE_ORIGIN}/imoveis/${p.slug || p.id}`;
}

/** Monta a URL da agenda já com o imóvel de interesse identificado. */
export function schedulingLink(p: SchedulingProperty) {
  const local = [p.neighborhood, p.city].filter(Boolean).join(" · ");
  const params = new URLSearchParams();
  params.set("imovel", p.slug || p.id);
  params.set("imovel_id", p.id);
  if (p.reference) params.set("codigo", p.reference);
  params.set("titulo", p.title);
  if (local) params.set("local", local);
  if (p.property_type) params.set("tipo", p.property_type);
  if (p.price != null) params.set("valor", String(p.price));
  params.set("url", propertyUrl(p));
  params.set(
    "resumo",
    `Visita — ${p.title}${local ? ` (${local})` : ""}${p.reference ? ` · Ref. ${p.reference}` : ""}`
  );
  params.set("origem", "Portal Strata Imóveis");
  params.set("utm_source", "portal-strata");
  params.set("utm_medium", "agendar-visita");
  return `${SCHEDULING_URL}?${params.toString()}`;
}
