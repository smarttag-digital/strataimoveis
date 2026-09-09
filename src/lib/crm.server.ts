import { createHmac, timingSafeEqual } from "crypto";

/** Shared payload shapes exchanged with the SmartFlow CRM. */
export type CrmLeadPayload = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string | null;
  property_interest: string | null;
  source: string | null;
  created_at: string;
  origin: "strataimoveis";
};

const DEFAULT_WEBHOOK_URL = "https://crmptedybiwxacympmdp.supabase.co/functions/v1/webhook-leads";

export function crmWebhookUrl() {
  return process.env.SMARTFLOW_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;
}

export function crmWebhookSecret() {
  return process.env.SMARTFLOW_WEBHOOK_SECRET || "";
}

export function signBody(body: string, secret: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

/** Constant-time bearer/token comparison for inbound CRM requests. */
export function tokenMatches(provided: string, expected: string) {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function authorizeCrmRequest(request: Request) {
  const expected = process.env.SMARTFLOW_API_TOKEN || "";
  if (!expected) {
    return new Response(JSON.stringify({ error: "CRM integration not configured" }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }
  const header = request.headers.get("authorization") || "";
  const provided = header.startsWith("Bearer ")
    ? header.slice(7)
    : request.headers.get("x-smartflow-token") || "";
  if (!tokenMatches(provided, expected)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return null;
}

/** Converte um lead do portal no formato aceito pelo webhook do SmartFlow. */
export function toSmartflowLead(lead: Record<string, any>) {
  const observacoes = [lead.message, lead.property_interest ? `Imóvel: ${lead.property_interest}` : null]
    .filter(Boolean)
    .join(" | ");

  const payload: Record<string, unknown> = {
    nome: lead.name ?? "",
    origem: lead.source ? `site:${lead.source}` : "site",
    idempotency_key: lead.id,
  };
  // O CRM rejeita campos enviados como nulos — só incluímos o que tem valor.
  if (lead.email) payload.email = lead.email;
  if (lead.phone) payload.telefone = lead.phone;
  if (lead.deal_type) payload.tipo_de_negocio = lead.deal_type;
  if (lead.property_type) payload.tipo_de_imovel = lead.property_type;
  if (typeof lead.price === "number") payload.valor = lead.price;
  if (lead.city) payload.cidade = lead.city;
  if (lead.neighborhood) payload.bairro = lead.neighborhood;
  if (observacoes) payload.observacoes = observacoes;
  return payload;
}

/** POST a payload to the SmartFlow webhook with an HMAC signature. */
export async function postToCrm(event: string, payload: unknown) {
  const url = crmWebhookUrl();
  if (!url) return { ok: false as const, status: 0, detail: "SMARTFLOW_WEBHOOK_URL não configurada" };

  // O webhook de leads espera o payload plano; demais eventos usam o envelope.
  const isLead = event === "lead.created";
  const body = JSON.stringify(
    isLead
      ? toSmartflowLead(payload as Record<string, any>)
      : { event, sent_at: new Date().toISOString(), data: payload },
  );
  const secret = crmWebhookSecret();
  const token = process.env.SMARTFLOW_API_TOKEN || "";
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (secret) headers["x-smartflow-signature"] = signBody(body, secret);
  if (token) headers["authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(url, { method: "POST", headers, body });
    const text = await res.text();
    return { ok: res.ok, status: res.status, detail: text.slice(0, 500) };
  } catch (e) {
    return { ok: false as const, status: 0, detail: e instanceof Error ? e.message : "network error" };
  }
}
