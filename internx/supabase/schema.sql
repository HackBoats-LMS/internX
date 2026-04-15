-- 1. Create a table to store custom user data (Directly managed, no Supabase Auth dependency)
-- To apply this, run it in your Supabase SQL Editor. 
-- WARNING: This will drop the existing users table.

DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text,
  email text UNIQUE NOT NULL,
  password_hash text, -- OPTIONAL FOR SOCIAL LOGINS
  payment_status text DEFAULT 'unpaid',
  subscription_valid_until timestamp with time zone,
  otp_code text,                -- FOR FORGOT PASSWORD
  otp_expiry timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Turn on Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Service Role can do everything (we will use this in server actions)
CREATE POLICY "Enable all for service_role" ON public.users FOR ALL USING (true);
