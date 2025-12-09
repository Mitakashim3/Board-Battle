-- ============================================
-- Board-Battle Migration: Add CSE & Admin Setup
-- Version: 1.0.1
-- ============================================

-- ============================================
-- ADD CIVIL SERVICE EXAMINATION (CSE) SUBJECTS
-- ============================================

-- Professional Level Subjects
INSERT INTO public.subjects (name, description, icon_url, exam_type) VALUES
    ('Vocabulary', 'Word meanings, synonyms, antonyms, and word usage', '📚', 'CSE'),
    ('Reading Comprehension', 'Understanding and analyzing written passages', '📖', 'CSE'),
    ('Analogy', 'Identifying relationships between words and concepts', '🔗', 'CSE'),
    ('Logic', 'Logical reasoning and critical thinking', '🧠', 'CSE'),
    ('Numerical Reasoning', 'Mathematical problem solving and number series', '🔢', 'CSE'),
    ('Clerical Operations', 'Filing, coding, and clerical aptitude', '📋', 'CSE'),
    ('Philippine Constitution', 'Constitutional law and government structure', '⚖️', 'CSE'),
    ('Code of Conduct and Ethical Standards', 'RA 6713 and public service ethics', '🏛️', 'CSE'),
    ('Peace and Human Rights', 'Human rights principles and peace concepts', '☮️', 'CSE'),
    ('Environment Management', 'Environmental laws and sustainability', '🌍', 'CSE'),
    ('General Information', 'Current events and general knowledge', '📰', 'CSE');

-- Also add main exam categories for LET, Nursing, Criminology if not exists
INSERT INTO public.subjects (name, description, icon_url, exam_type) VALUES
    ('General Education', 'English, Filipino, Mathematics, Science, Social Studies', '📚', 'LET'),
    ('Professional Education', 'Teaching principles, methods, and strategies', '👩‍🏫', 'LET'),
    ('Major Subjects', 'Specialization area content', '🎯', 'LET'),
    
    ('Fundamentals of Nursing', 'Basic nursing principles and concepts', '💉', 'Nursing'),
    ('Medical-Surgical Nursing', 'Adult health nursing care', '🏥', 'Nursing'),
    ('Maternal and Child Health', 'OB-Gyne and Pediatric nursing', '👶', 'Nursing'),
    ('Community Health Nursing', 'Public health and community nursing', '🏘️', 'Nursing'),
    ('Psychiatric Nursing', 'Mental health nursing care', '🧠', 'Nursing'),
    
    ('Criminal Jurisprudence', 'Criminal law and procedure', '⚖️', 'Criminology'),
    ('Law Enforcement Administration', 'Police organization and management', '👮', 'Criminology'),
    ('Criminalistics', 'Forensic science and investigation', '🔬', 'Criminology'),
    ('Sociology of Crimes and Ethics', 'Criminal behavior and professional ethics', '📊', 'Criminology'),
    ('Correctional Administration', 'Penology and rehabilitation', '🏢', 'Criminology')
ON CONFLICT DO NOTHING;

-- ============================================
-- ADMIN PROMOTION FUNCTION
-- ============================================
-- SECURITY: This function can only be called by service_role
-- It's used to promote a user to admin status

CREATE OR REPLACE FUNCTION public.promote_to_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Only allow this to be called via service_role (backend/admin)
    -- This check ensures it can't be called from client
    IF current_setting('role', true) != 'service_role' THEN
        RAISE EXCEPTION 'Unauthorized: Only service_role can promote admins';
    END IF;
    
    -- Find user by email
    SELECT id INTO v_user_id 
    FROM public.users 
    WHERE email = user_email;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found with email: %', user_email;
    END IF;
    
    -- Promote to admin
    UPDATE public.users 
    SET role = 'admin' 
    WHERE id = v_user_id;
    
    RETURN TRUE;
END;
$$;

-- ============================================
-- FIRST ADMIN SETUP
-- ============================================
-- IMPORTANT: Run this AFTER you've signed up with your admin account!
-- 
-- Option 1: Via Supabase Dashboard SQL Editor (RECOMMENDED)
--   UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
--
-- Option 2: The promote_to_admin function can be called from a server-side script
--   with service_role key

-- Grant execute permission (only service_role can actually use it)
REVOKE EXECUTE ON FUNCTION public.promote_to_admin FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.promote_to_admin FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.promote_to_admin FROM anon;

