
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-grant admin to authorized email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'vivabemeco@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ PROPERTIES ============
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL, -- casa, apartamento, terreno, condominio, loteamento
  transaction_type TEXT NOT NULL DEFAULT 'venda', -- venda, aluguel
  price NUMERIC,
  city TEXT NOT NULL DEFAULT 'Tatuí',
  neighborhood TEXT,
  address TEXT,
  bedrooms INT,
  bathrooms INT,
  parking_spaces INT,
  land_area NUMERIC,
  built_area NUMERIC,
  cover_image TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  videos JSONB NOT NULL DEFAULT '[]'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_opportunity BOOLEAN NOT NULL DEFAULT false,
  is_launch BOOLEAN NOT NULL DEFAULT false,
  is_mcmv BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.properties TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published properties" ON public.properties FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage properties" ON public.properties FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ DEVELOPMENTS ============
CREATE TABLE public.developments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  differentials JSONB NOT NULL DEFAULT '[]'::jsonb,
  location TEXT,
  city TEXT DEFAULT 'Tatuí',
  map_embed TEXT,
  cover_image TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  videos JSONB NOT NULL DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.developments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.developments TO authenticated;
GRANT ALL ON public.developments TO service_role;
ALTER TABLE public.developments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read developments" ON public.developments FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage developments" ON public.developments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ BLOG ============
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  cover_image TEXT,
  author TEXT DEFAULT 'Letícia Souza',
  published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT now(),
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published posts" ON public.blog_posts FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage posts" ON public.blog_posts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ LEADS ============
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  message TEXT,
  property_interest TEXT,
  source TEXT DEFAULT 'site',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view leads" ON public.leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update leads" ON public.leads FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete leads" ON public.leads FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ SITE SETTINGS (key/value editable) ============
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('contact', '{"phone":"+55 15 99754-6750","whatsapp":"5515997546750","email":"contato@leticiasouzaimoveis.com.br","creci":"CRECI 207663","address":"Tatuí - SP","instagram":"","facebook":""}'::jsonb),
  ('seo', '{"title":"Letícia Souza Negócios Imobiliários | Imóveis em Tatuí-SP","description":"Corretora especializada em casas, apartamentos, terrenos, condomínios e loteamentos em Tatuí e região. Atendimento consultivo para morar, investir e construir patrimônio.","keywords":"imóveis Tatuí, casas à venda Tatuí, terrenos Tatuí, apartamentos Tatuí, corretora de imóveis Tatuí, Minha Casa Minha Vida Tatuí, loteamentos Tatuí, condomínios Tatuí, imóveis alto padrão Tatuí"}'::jsonb),
  ('about', '{"title":"Quem Sou","body":"Sou Letícia Souza, profissional do mercado imobiliário em Tatuí-SP, especializada em conectar pessoas às melhores oportunidades para morar, investir e construir patrimônio."}'::jsonb),
  ('hero', '{"title":"Encontre o imóvel ideal para morar, investir e construir seu patrimônio.","subtitle":"Atendimento especializado em Tatuí e região, conectando você às melhores oportunidades do mercado imobiliário."}'::jsonb);

-- ============ STORAGE BUCKET ============
INSERT INTO storage.buckets (id, name, public) VALUES ('property-media', 'property-media', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public read property media" ON storage.objects FOR SELECT USING (bucket_id = 'property-media');
CREATE POLICY "Admins upload property media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update property media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'property-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete property media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'property-media' AND public.has_role(auth.uid(), 'admin'));
