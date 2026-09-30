BEGIN;

DO $$
BEGIN
  CREATE TYPE enum_users_role AS ENUM ('admin', 'manager', 'employee');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE enum_tasks_status AS ENUM ('pending', 'in-progress', 'completed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role enum_users_role NOT NULL DEFAULT 'employee',
  profile_image VARCHAR(255) NULL,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status enum_tasks_status NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  assigned_to INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL,
  CONSTRAINT tasks_assigned_to_fkey
    FOREIGN KEY (assigned_to)
    REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS tasks_assigned_to
  ON tasks (assigned_to);

COMMIT;
