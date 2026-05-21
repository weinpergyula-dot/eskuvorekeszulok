-- Allows a user to unlink their Google identity even if it's the only one,
-- provided they have a password set. Bypasses Supabase's single_identity_not_deletable
-- restriction via SECURITY DEFINER access to auth schema.
CREATE OR REPLACE FUNCTION public.unlink_google_identity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  v_user_id uuid;
  v_has_password boolean;
BEGIN
  v_user_id := auth.uid();

  SELECT encrypted_password IS NOT NULL AND encrypted_password != ''
  INTO v_has_password
  FROM auth.users
  WHERE id = v_user_id;

  IF NOT v_has_password THEN
    RAISE EXCEPTION 'no_password: Set a password before unlinking Google.';
  END IF;

  DELETE FROM auth.identities
  WHERE user_id = v_user_id AND provider = 'google';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'identity_not_found: No Google identity found.';
  END IF;

  -- Update app_metadata so providers list no longer includes google
  UPDATE auth.users
  SET raw_app_meta_data =
    raw_app_meta_data
    || jsonb_build_object(
        'provider', 'email',
        'providers', (
          SELECT jsonb_agg(p)
          FROM jsonb_array_elements_text(raw_app_meta_data->'providers') AS p
          WHERE p != 'google'
        )
      )
  WHERE id = v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.unlink_google_identity() TO authenticated;
