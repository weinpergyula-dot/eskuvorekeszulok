-- Értesítési beállítások táblája
-- Minden felhasználónak egy sora van; ha még nem létezik, az alapértelmezett true.

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notify_new_message       BOOLEAN NOT NULL DEFAULT TRUE,  -- új üzenet érkezett
  notify_new_review        BOOLEAN NOT NULL DEFAULT TRUE,  -- új értékelés (szolgáltató)
  notify_new_quote_request BOOLEAN NOT NULL DEFAULT TRUE,  -- új ajánlatkérés (szolgáltató)
  notify_quote_reply       BOOLEAN NOT NULL DEFAULT TRUE,  -- válasz érkezett ajánlatkérésre (látogató)
  notify_contact_message   BOOLEAN NOT NULL DEFAULT TRUE,  -- kapcsolati üzenet (admin)
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_select" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "own_insert" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own_update" ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);
