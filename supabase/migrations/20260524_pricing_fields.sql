-- Add pricing PDF and text fields to providers table
-- Run in Supabase SQL editor

ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS pricing_pdf_url  TEXT,
  ADD COLUMN IF NOT EXISTS pricing_text     TEXT;
