GRANT EXECUTE ON FUNCTION public.slugify(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.unaccent(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.unaccent(regdictionary, text) TO anon, authenticated, service_role;