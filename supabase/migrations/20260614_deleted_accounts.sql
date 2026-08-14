-- Track deleted accounts so admins can audit who left
CREATE TABLE IF NOT EXISTS public.deleted_accounts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL,
  email       text,
  full_name   text,
  role        text,
  deleted_at  timestamptz NOT NULL DEFAULT now(),
  deleted_by  uuid        -- NULL = self-deleted; admin's user_id if deleted by admin
);

-- Only the service-role key can read/write this table
ALTER TABLE public.deleted_accounts ENABLE ROW LEVEL SECURITY;
-- No policies → only service-role bypasses RLS
