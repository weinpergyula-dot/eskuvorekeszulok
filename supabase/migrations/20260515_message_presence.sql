-- Tracks which thread a user currently has open (for presence-based notifications)
CREATE TABLE IF NOT EXISTS public.message_presence (
  user_id    UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_key TEXT        NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.message_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own presence"
  ON public.message_presence
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
