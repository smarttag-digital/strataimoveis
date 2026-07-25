-- CRM SmartFlow sync fields on leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS crm_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS crm_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS crm_error TEXT,
  ADD COLUMN IF NOT EXISTS crm_external_id TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS leads_crm_status_idx ON public.leads (crm_status, created_at DESC);

-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated;

DROP TRIGGER IF EXISTS leads_touch_updated_at ON public.leads;
CREATE TRIGGER leads_touch_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Sync log so the admin can audit CRM traffic
CREATE TABLE IF NOT EXISTS public.crm_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  direction TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  status TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.crm_sync_log TO authenticated;
GRANT ALL ON public.crm_sync_log TO service_role;
ALTER TABLE public.crm_sync_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read crm sync log" ON public.crm_sync_log;
CREATE POLICY "Admins can read crm sync log"
ON public.crm_sync_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));