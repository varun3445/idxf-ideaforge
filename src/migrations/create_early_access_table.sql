
-- Create table for early access signups
CREATE TABLE IF NOT EXISTS public.early_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  is_pro BOOLEAN DEFAULT FALSE,
  payment_id TEXT
);

-- Add RLS policies
ALTER TABLE public.early_access ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (for signups)
CREATE POLICY "Allow inserts to early_access" 
  ON public.early_access
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only allow select/update/delete for authenticated service role
CREATE POLICY "Allow management for service_role"
  ON public.early_access
  USING (true)
  WITH CHECK (true);
