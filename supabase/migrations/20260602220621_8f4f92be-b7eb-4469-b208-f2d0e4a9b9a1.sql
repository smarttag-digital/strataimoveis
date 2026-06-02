
-- 1. Realtime publication for live sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;
ALTER PUBLICATION supabase_realtime ADD TABLE public.developments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;

ALTER TABLE public.properties REPLICA IDENTITY FULL;
ALTER TABLE public.developments REPLICA IDENTITY FULL;
ALTER TABLE public.site_settings REPLICA IDENTITY FULL;
ALTER TABLE public.blog_posts REPLICA IDENTITY FULL;

-- 2. Extend properties
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS condo_fee NUMERIC,
  ADD COLUMN IF NOT EXISTS iptu NUMERIC,
  ADD COLUMN IF NOT EXISTS suites INTEGER,
  ADD COLUMN IF NOT EXISTS total_area NUMERIC,
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'SP',
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT,
  ADD COLUMN IF NOT EXISTS agent_id UUID,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'disponivel',
  ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false;

-- 3. Extend developments
ALTER TABLE public.developments
  ADD COLUMN IF NOT EXISTS builder TEXT,
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS construction_status TEXT,
  ADD COLUMN IF NOT EXISTS delivery_date TEXT,
  ADD COLUMN IF NOT EXISTS price_from NUMERIC,
  ADD COLUMN IF NOT EXISTS price_to NUMERIC,
  ADD COLUMN IF NOT EXISTS units_count INTEGER,
  ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- 4. Trigger to autogenerate development slug
CREATE OR REPLACE FUNCTION public.fill_development_defaults()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  base TEXT;
  candidate TEXT;
  n INT := 1;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base := public.slugify(NEW.name);
    IF base = '' THEN base := 'empreendimento'; END IF;
    candidate := base;
    WHILE EXISTS (SELECT 1 FROM public.developments WHERE slug = candidate AND id <> NEW.id) LOOP
      n := n + 1;
      candidate := base || '-' || n;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fill_development_defaults ON public.developments;
CREATE TRIGGER trg_fill_development_defaults
BEFORE INSERT OR UPDATE ON public.developments
FOR EACH ROW EXECUTE FUNCTION public.fill_development_defaults();

-- Make sure property trigger is also bound
DROP TRIGGER IF EXISTS trg_fill_property_defaults ON public.properties;
CREATE TRIGGER trg_fill_property_defaults
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.fill_property_defaults();

-- 5. Agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  creci TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  bio TEXT,
  photo TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.agents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agents TO authenticated;
GRANT ALL ON public.agents TO service_role;

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active agents" ON public.agents;
CREATE POLICY "Public read active agents" ON public.agents
  FOR SELECT TO public
  USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins manage agents" ON public.agents;
CREATE POLICY "Admins manage agents" ON public.agents
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;
ALTER TABLE public.agents REPLICA IDENTITY FULL;

-- 6. Seed default features setting (blog enabled by default)
INSERT INTO public.site_settings (key, value)
VALUES ('features', '{"blog_enabled": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;
