
-- 1) Remove auto-admin-by-email escalation path. Admins must be granted manually.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Admin role is no longer auto-granted based on email.
  -- Provision admins manually via the user_roles table.
  RETURN NEW;
END;
$$;

-- 2) Replace overly-permissive leads INSERT policy with bounded validation
DROP POLICY IF EXISTS "Anyone can submit leads" ON public.leads;
CREATE POLICY "Public can submit valid leads"
ON public.leads
FOR INSERT
WITH CHECK (
  name IS NOT NULL
  AND length(trim(name)) BETWEEN 1 AND 200
  AND (email IS NULL OR length(email) <= 320)
  AND (phone IS NULL OR length(phone) <= 40)
  AND (message IS NULL OR length(message) <= 4000)
  AND (property_interest IS NULL OR length(property_interest) <= 200)
  AND (source IS NULL OR length(source) <= 60)
);
