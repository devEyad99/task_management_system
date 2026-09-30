BEGIN;

-- Authentication treats email addresses case-insensitively. Stop here instead
-- of silently merging accounts if historical case-only duplicates exist.
DO $$
BEGIN
  IF EXISTS (
    SELECT LOWER(email)
    FROM users
    GROUP BY LOWER(email)
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot normalize user emails: case-insensitive duplicates exist';
  END IF;
END $$;

UPDATE users
SET email = LOWER(email)
WHERE email <> LOWER(email);

-- The existing column constraint protects normalized application writes. This
-- expression index also protects imports and direct database writes.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
  ON users (LOWER(email));

COMMIT;
