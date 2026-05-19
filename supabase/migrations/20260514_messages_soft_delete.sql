-- Direct messages between users
-- Includes soft-delete support so the other party still sees the conversation.

CREATE TABLE IF NOT EXISTS public.messages (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id          UUID        REFERENCES public.providers(id) ON DELETE SET NULL,
  subject              TEXT        NOT NULL,
  body                 TEXT        NOT NULL,
  read                 BOOLEAN     NOT NULL DEFAULT FALSE,
  deleted_for_sender   BOOLEAN     NOT NULL DEFAULT FALSE,
  deleted_for_recipient BOOLEAN    NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can read their own messages (sent or received, not soft-deleted for them)
CREATE POLICY "Users can read own messages"
  ON public.messages FOR SELECT
  USING (
    (auth.uid() = sender_id    AND deleted_for_sender    = FALSE) OR
    (auth.uid() = recipient_id AND deleted_for_recipient = FALSE)
  );

-- Users can insert messages as sender
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update read flag and soft-delete flags on their own messages
CREATE POLICY "Users can update own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
