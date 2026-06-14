-- Ensure the featured column defaults to NULL so new providers are not featured
ALTER TABLE providers ALTER COLUMN featured SET DEFAULT NULL;
