-- Returns true if the currently authenticated user has an encrypted password set.
-- Used to determine if a Google-only user can unlink their Google account.
CREATE OR REPLACE FUNCTION public.user_has_password()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = auth, public
AS $$
  SELECT
    encrypted_password IS NOT NULL AND encrypted_password != ''
  FROM auth.users
  WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.user_has_password() TO authenticated;
