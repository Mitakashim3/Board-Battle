-- ============================================
-- Board-Battle Migration: Fix User Creation
-- Version: 1.0.2
-- Run this if users cannot register/login
-- ============================================

-- Drop and recreate the user creation trigger with proper defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, username, email, role, coins, energy, max_energy, mmr)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'username', 
            LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || FLOOR(RANDOM() * 10000)::TEXT
        ),
        NEW.email,
        'student',
        100,  -- Starting coins
        5,    -- Starting energy
        5,    -- Max energy
        1000  -- Starting MMR
    );
    RETURN NEW;
EXCEPTION WHEN unique_violation THEN
    -- If username already exists, try with a different random suffix
    INSERT INTO public.users (id, username, email, role, coins, energy, max_energy, mmr)
    VALUES (
        NEW.id,
        LOWER(REGEXP_REPLACE(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || FLOOR(RANDOM() * 100000)::TEXT,
        NEW.email,
        'student',
        100,
        5,
        5,
        1000
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIX: If you already signed up but no user row was created,
-- run this to manually create your user profile:
-- ============================================
-- 
-- First, find your user ID from auth.users:
--   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
--
-- Then insert into public.users:
--   INSERT INTO public.users (id, username, email, role, coins, energy, max_energy, mmr)
--   VALUES (
--     'your-uuid-from-above',
--     'your_username',
--     'your-email@example.com',
--     'admin',  -- Set to 'admin' if you want admin access
--     100,
--     5,
--     5,
--     1000
--   );
-- ============================================
