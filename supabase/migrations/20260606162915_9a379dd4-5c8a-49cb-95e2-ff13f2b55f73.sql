
-- Revoke EXECUTE on SECURITY DEFINER helpers that are only meant to be called
-- internally by triggers or by RLS policy evaluation (not exposed as RPCs).
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.fill_property_defaults() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.fill_development_defaults() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.slugify(text) FROM anon, authenticated, public;
-- has_role is intentionally callable so RLS policies can evaluate it for the
-- current request; leave its grants in place.
