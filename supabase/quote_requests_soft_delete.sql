-- Soft-delete support for quote requests
-- Run this in the Supabase SQL editor before deploying the corresponding code changes.

ALTER TABLE quote_request_recipients
  ADD COLUMN IF NOT EXISTS deleted_by_provider boolean DEFAULT false NOT NULL;

ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS deleted_by_visitor boolean DEFAULT false NOT NULL;
