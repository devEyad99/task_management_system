BEGIN;

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS created_by INTEGER NULL,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tasks_created_by_fkey'
      AND conrelid = 'tasks'::regclass
  ) THEN
    ALTER TABLE tasks
      ADD CONSTRAINT tasks_created_by_fkey
      FOREIGN KEY (created_by)
      REFERENCES users(id)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;
END $$;

-- Existing rows deliberately retain NULL creator and completion timestamps.
-- Historical creators and completion times cannot be reconstructed reliably.

COMMIT;
