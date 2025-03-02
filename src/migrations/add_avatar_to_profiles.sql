
-- Add avatar column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'avatar'
    ) THEN
        ALTER TABLE profiles ADD COLUMN avatar TEXT;
    END IF;
END
$$;
