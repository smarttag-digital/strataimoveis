CREATE INDEX IF NOT EXISTS idx_properties_public_default_listing
  ON public.properties (published, archived, status, created_at DESC)
  WHERE published = true AND archived = false;

CREATE INDEX IF NOT EXISTS idx_properties_public_featured_listing
  ON public.properties (is_featured, published, archived, status, created_at DESC)
  WHERE published = true AND archived = false AND is_featured = true;

CREATE INDEX IF NOT EXISTS idx_properties_admin_listing
  ON public.properties (archived, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_properties_transaction_type
  ON public.properties (transaction_type);

CREATE INDEX IF NOT EXISTS idx_properties_property_type
  ON public.properties (property_type);

CREATE INDEX IF NOT EXISTS idx_developments_public_listing
  ON public.developments (published, created_at DESC)
  WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_developments_admin_listing
  ON public.developments (created_at DESC);