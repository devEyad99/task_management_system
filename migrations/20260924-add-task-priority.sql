BEGIN;

DO $$
BEGIN
  CREATE TYPE enum_tasks_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS priority enum_tasks_priority
  NOT NULL DEFAULT 'medium';

-- Supports the default createdAt + id ordering used by task lists.
CREATE INDEX IF NOT EXISTS tasks_created_at_id_idx
  ON tasks ("createdAt", id);

-- Supports the priority filter and the allowlisted priority + id ordering.
CREATE INDEX IF NOT EXISTS tasks_priority_id_idx
  ON tasks (priority, id);

-- Supports deadline ranges, overdue scans, and deadline + id ordering.
CREATE INDEX IF NOT EXISTS tasks_deadline_id_idx
  ON tasks (deadline, id);

COMMIT;
