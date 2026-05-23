-- Convert boolean featured column to text tier: null | 'silver' | 'gold'
-- Existing featured=true rows become 'gold'; false/null become null.
ALTER TABLE providers
  ALTER COLUMN featured TYPE text
  USING CASE WHEN featured = true THEN 'gold' ELSE NULL END;
