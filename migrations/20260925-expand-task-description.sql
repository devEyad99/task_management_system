BEGIN;

-- Service validation permits descriptions up to 5,000 characters. TEXT keeps
-- persistence aligned with that public contract for databases created before
-- the base migration was added.
ALTER TABLE tasks
  ALTER COLUMN description TYPE TEXT;

COMMIT;
