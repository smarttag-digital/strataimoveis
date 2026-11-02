import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { newLeadSchema } from "@/lib/security-validation";

const leadIdSchema = z.object({ leadId: z.string().uuid() });

/** Registra um lead do site e já envia ao CRM. Público (formulários do portal). */
export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input) => newLeadSchema.parse(input))
  .handler(async ({ data }) => {
    const { postToCrm } = await import("@/lib/crm.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .insert({
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        message: data.message || null,
        property_interest: data.property_interest || null,
        source: data.source || "site",
      })
      .select("id,name,phone,email,message,property_interest,source,created_at")
      .maybeSingle();

    if (error || !lead) return { ok: false as const };

    const result = await postToCrm("lead.created", { ...lead, origin: "strataimoveis" });

    await supabaseAdmin
      .from("leads")
      .update({
        crm_status: result.ok ? "synced" : "error",
        crm_synced_at: result.ok ? new Date().toISOString() : null,
        crm_error: result.ok ? null : result.detail,
      })
      .eq("id", lead.id);

    await supabaseAdmin.from("crm_sync_log").insert({
      direction: "outbound",
      entity: "lead",
      entity_id: lead.id,
      status: result.ok ? "success" : "error",
      detail: result.detail || null,
    });

    return { ok: true as const, crm: result.ok };
  });

/**
 * Envia um lead recém-criado para o CRM SmartFlow.
 * Reenvio administrativo. O envio inicial continua dentro de submitLead.
 */
export const syncLeadToCrm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => leadIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { postToCrm } = await import("@/lib/crm.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: lead } = await supabaseAdmin
      .from("leads")
      .select("id,name,phone,email,message,property_interest,source,created_at")
      .eq("id", data.leadId)
      .maybeSingle();

    if (!lead) return { ok: false, reason: "not_found" as const };

    const result = await postToCrm("lead.created", { ...lead, origin: "strataimoveis" });

    await supabaseAdmin
      .from("leads")
      .update({
        crm_status: result.ok ? "synced" : "error",
        crm_synced_at: result.ok ? new Date().toISOString() : null,
        crm_error: result.ok ? null : result.detail,
      })
      .eq("id", lead.id);

    await supabaseAdmin.from("crm_sync_log").insert({
      direction: "outbound",
      entity: "lead",
      entity_id: lead.id,
      status: result.ok ? "success" : "error",
      detail: result.detail || null,
    });

    return { ok: result.ok };
  });

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

/** Reenvia ao CRM todos os leads pendentes ou com erro (admin). */
export const retryPendingLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const { postToCrm } = await import("@/lib/crm.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: leads } = await supabaseAdmin
      .from("leads")
      .select("id,name,phone,email,message,property_interest,source,created_at")
      .neq("crm_status", "synced")
      .order("created_at", { ascending: true })
      .limit(100);

    let sent = 0;
    let failed = 0;
    for (const lead of leads ?? []) {
      const result = await postToCrm("lead.created", { ...lead, origin: "strataimoveis" });
      if (result.ok) sent++;
      else failed++;
      await supabaseAdmin
        .from("leads")
        .update({
          crm_status: result.ok ? "synced" : "error",
          crm_synced_at: result.ok ? new Date().toISOString() : null,
          crm_error: result.ok ? null : result.detail,
        })
        .eq("id", lead.id);
    }
    await supabaseAdmin.from("crm_sync_log").insert({
      direction: "outbound",
      entity: "lead_batch",
      status: failed === 0 ? "success" : "partial",
      detail: `${sent} enviados, ${failed} com erro`,
    });
    return { sent, failed };
  });

/** Envia o catálogo (imóveis e empreendimentos publicados) ao CRM (admin). */
export const syncCatalogToCrm = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const { postToCrm } = await import("@/lib/crm.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: properties }, { data: developments }] = await Promise.all([
      supabaseAdmin
        .from("properties")
        .select("*")
        .eq("published", true)
        .eq("archived", false)
        .order("created_at", { ascending: false })
        .limit(500),
      supabaseAdmin
        .from("developments")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    const result = await postToCrm("catalog.sync", {
      origin: "strataimoveis",
      properties: properties ?? [],
      developments: developments ?? [],
    });

    await supabaseAdmin.from("crm_sync_log").insert({
      direction: "outbound",
      entity: "catalog",
      status: result.ok ? "success" : "error",
      detail: result.detail || null,
    });

    return {
      ok: result.ok,
      properties: properties?.length ?? 0,
      developments: developments?.length ?? 0,
      detail: result.detail,
    };
  });

/** Situação atual da integração para o painel (admin). */
export const getCrmStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const { crmWebhookUrl } = await import("@/lib/crm.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ count: pending }, { count: synced }, { data: log }] = await Promise.all([
      supabaseAdmin.from("leads").select("id", { count: "exact", head: true }).neq("crm_status", "synced"),
      supabaseAdmin.from("leads").select("id", { count: "exact", head: true }).eq("crm_status", "synced"),
      supabaseAdmin
        .from("crm_sync_log")
        .select("id,direction,entity,status,detail,created_at")
        .order("created_at", { ascending: false })
        .limit(15),
    ]);

    return {
      webhookConfigured: !!crmWebhookUrl(),
      inboundApiConfigured: !!process.env.SMARTFLOW_API_TOKEN,
      pending: pending ?? 0,
      synced: synced ?? 0,
      log: log ?? [],
    };
  });
