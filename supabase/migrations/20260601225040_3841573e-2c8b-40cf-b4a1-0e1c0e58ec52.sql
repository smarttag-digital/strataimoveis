
-- Extension first
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Reference column
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS reference TEXT UNIQUE;

-- Sequence for reference codes
CREATE SEQUENCE IF NOT EXISTS public.property_reference_seq START 1000;

-- Slug helper
CREATE OR REPLACE FUNCTION public.slugify(v TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE SET search_path = public, extensions AS $$
  SELECT regexp_replace(
    regexp_replace(
      lower(public.unaccent(coalesce(v,''))),
      '[^a-z0-9]+', '-', 'g'
    ),
    '(^-+|-+$)', '', 'g'
  )
$$;

-- Trigger to auto-fill reference and slug
CREATE OR REPLACE FUNCTION public.fill_property_defaults()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  base TEXT;
  candidate TEXT;
  n INT := 1;
BEGIN
  IF NEW.reference IS NULL OR NEW.reference = '' THEN
    NEW.reference := 'LS' || lpad(nextval('public.property_reference_seq')::text, 5, '0');
  END IF;

  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base := public.slugify(NEW.title);
    IF base = '' THEN base := 'imovel'; END IF;
    candidate := base;
    WHILE EXISTS (SELECT 1 FROM public.properties WHERE slug = candidate AND id <> NEW.id) LOOP
      n := n + 1;
      candidate := base || '-' || n;
    END LOOP;
    NEW.slug := candidate;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fill_property_defaults ON public.properties;
CREATE TRIGGER trg_fill_property_defaults
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.fill_property_defaults();

-- Backfill references
UPDATE public.properties
SET reference = 'LS' || lpad(nextval('public.property_reference_seq')::text, 5, '0')
WHERE reference IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_properties_reference ON public.properties(reference);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON public.properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_neighborhood ON public.properties(neighborhood);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_published ON public.properties(published);

-- Seed defaults
INSERT INTO public.site_settings (key, value) VALUES
  ('social_links', '{"instagram":"https://instagram.com/leticiasouzaimoveis","facebook":"","tiktok":"","youtube":"","whatsapp":"5515997546750"}'::jsonb),
  ('contact', '{"phone":"+55 15 99754-6750","whatsapp":"5515997546750","email":"contato@leticiasouzaimoveis.com.br","creci":"CRECI 207663","address":"Tatuí - SP"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
