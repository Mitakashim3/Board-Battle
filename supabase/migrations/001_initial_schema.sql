-- ============================================
-- Board-Battle Database Schema
-- Version: 1.0.0
-- Security: OWASP Compliant with RLS
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE battle_status AS ENUM ('waiting', 'active', 'completed', 'cancelled');
CREATE TYPE difficulty AS ENUM ('easy', 'medium', 'hard');

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'student' NOT NULL,
    mmr INTEGER DEFAULT 1000 NOT NULL CHECK (mmr >= 0),
    coins INTEGER DEFAULT 0 NOT NULL CHECK (coins >= 0),
    energy INTEGER DEFAULT 5 NOT NULL CHECK (energy >= 0 AND energy <= max_energy),
    max_energy INTEGER DEFAULT 5 NOT NULL CHECK (max_energy > 0),
    energy_last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Subjects table
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    exam_type VARCHAR(50) NOT NULL, -- 'LET', 'Nursing', 'Criminology'
    question_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Questions table (correct_option_id hidden from students)
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- [{id: 0, text: "Option A"}, {id: 1, text: "Option B"}, ...]
    difficulty difficulty DEFAULT 'medium' NOT NULL,
    correct_option_id INTEGER NOT NULL, -- HIDDEN FROM STUDENTS VIA RLS
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Battles table
CREATE TABLE public.battles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    player2_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    status battle_status DEFAULT 'waiting' NOT NULL,
    winner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    player1_score INTEGER DEFAULT 0 NOT NULL,
    player2_score INTEGER DEFAULT 0 NOT NULL,
    current_round INTEGER DEFAULT 1 NOT NULL,
    max_rounds INTEGER DEFAULT 5 NOT NULL,
    round_data JSONB DEFAULT '[]'::jsonb NOT NULL, -- Question IDs for each round
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ
);

-- User progress tracking
CREATE TABLE public.user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    questions_answered INTEGER DEFAULT 0 NOT NULL,
    correct_answers INTEGER DEFAULT 0 NOT NULL,
    streak INTEGER DEFAULT 0 NOT NULL,
    best_streak INTEGER DEFAULT 0 NOT NULL,
    last_reviewed TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, subject_id)
);

-- Battle answers (for replay and analytics)
CREATE TABLE public.battle_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken_ms INTEGER NOT NULL,
    round INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_questions_subject ON public.questions(subject_id);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX idx_battles_status ON public.battles(status);
CREATE INDEX idx_battles_player1 ON public.battles(player1_id);
CREATE INDEX idx_battles_player2 ON public.battles(player2_id);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_battle_answers_battle ON public.battle_answers(battle_id);

-- ============================================
-- VIEW FOR STUDENTS (Hides correct_option_id)
-- ============================================

CREATE VIEW public.questions_student_view AS
SELECT 
    id,
    subject_id,
    question_text,
    options,
    difficulty
FROM public.questions;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_answers ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND role = (SELECT role FROM public.users WHERE id = auth.uid()) -- Can't change own role
    );

CREATE POLICY "Admins can update any user" ON public.users
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Subjects policies (everyone can read)
CREATE POLICY "Anyone can view subjects" ON public.subjects
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify subjects" ON public.subjects
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Questions policies
-- CRITICAL: Students can only SELECT from the view, not the table
CREATE POLICY "Admins have full access to questions" ON public.questions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Students can only read questions through the view (which hides correct_option_id)
-- This policy ensures they can't directly query the questions table
CREATE POLICY "No direct student access to questions table" ON public.questions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Grant access to the student view
GRANT SELECT ON public.questions_student_view TO authenticated;

-- Battles policies
CREATE POLICY "Users can view their own battles" ON public.battles
    FOR SELECT USING (
        auth.uid() = player1_id OR auth.uid() = player2_id
    );

CREATE POLICY "Users can create battles" ON public.battles
    FOR INSERT WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Players can update their battles" ON public.battles
    FOR UPDATE USING (
        auth.uid() = player1_id OR auth.uid() = player2_id
    );

-- User progress policies
CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id);

-- Battle answers policies
CREATE POLICY "Users can view own battle answers" ON public.battle_answers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own battle answers" ON public.battle_answers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to handle new user creation
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

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update subject question count
CREATE OR REPLACE FUNCTION public.update_question_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.subjects 
        SET question_count = question_count + 1 
        WHERE id = NEW.subject_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.subjects 
        SET question_count = question_count - 1 
        WHERE id = OLD.subject_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_subject_question_count
    AFTER INSERT OR DELETE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.update_question_count();

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_battles_updated_at
    BEFORE UPDATE ON public.battles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
