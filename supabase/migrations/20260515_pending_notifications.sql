-- Késleltetett értesítések sora.
-- A cron job percenként dolgozza fel a lejárt sorokat.
CREATE TABLE IF NOT EXISTS public.pending_notifications (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT        NOT NULL,
  recipient_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  payload      JSONB       NOT NULL DEFAULT '{}'::jsonb,
  send_after   TIMESTAMPTZ NOT NULL,
  sent         BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Egy (típus, fogadó, feladó) pároshoz csak egy sor lehet egyszerre.
  -- Ha újabb üzenet érkezik, az UPDATE frissíti send_after-t (így mindig az utolsó
  -- üzenet után 5 perccel megy ki az email, nem az első után).
  UNIQUE (type, recipient_id, sender_id)
);

ALTER TABLE public.pending_notifications ENABLE ROW LEVEL SECURITY;
-- Nincs user-facing policy: csak a service role (admin client) éri el.
