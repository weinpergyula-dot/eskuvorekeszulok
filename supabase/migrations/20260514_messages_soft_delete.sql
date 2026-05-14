-- Soft-delete support for messages
-- When a user "deletes" a thread, we mark the messages as deleted for them
-- instead of hard-deleting, so the other party still sees the conversation.

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS deleted_for_sender    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_for_recipient BOOLEAN NOT NULL DEFAULT FALSE;
