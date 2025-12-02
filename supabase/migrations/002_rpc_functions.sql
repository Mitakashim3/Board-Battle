-- ============================================
-- Board-Battle RPC Functions (Anti-Cheat Logic)
-- Version: 1.0.0
-- CRITICAL: All answer verification happens here
-- ============================================

-- ============================================
-- SUBMIT ANSWER (Solo Mode) - ANTI-CHEAT
-- This function is the ONLY way to verify answers
-- The correct_option_id is NEVER sent to the client
-- ============================================

CREATE OR REPLACE FUNCTION public.submit_answer(
    p_question_id UUID,
    p_selected_option INTEGER,
    p_subject_id UUID DEFAULT NULL
)
RETURNS TABLE (
    is_correct BOOLEAN,
    correct_option INTEGER,
    explanation TEXT,
    new_streak INTEGER,
    coins_earned INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_correct_option INTEGER;
    v_explanation TEXT;
    v_subject_id UUID;
    v_is_correct BOOLEAN;
    v_current_streak INTEGER;
    v_best_streak INTEGER;
    v_coins_earned INTEGER := 0;
    v_difficulty difficulty;
BEGIN
    -- Get the current user
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Validate input (anti-injection)
    IF p_selected_option < 0 OR p_selected_option > 3 THEN
        RAISE EXCEPTION 'Invalid option selected';
    END IF;

    -- Get the correct answer from the database (SERVER-SIDE ONLY)
    SELECT 
        correct_option_id, 
        q.explanation,
        q.subject_id,
        q.difficulty
    INTO 
        v_correct_option, 
        v_explanation,
        v_subject_id,
        v_difficulty
    FROM public.questions q
    WHERE q.id = p_question_id;

    IF v_correct_option IS NULL THEN
        RAISE EXCEPTION 'Question not found';
    END IF;

    -- Use provided subject_id or the one from the question
    v_subject_id := COALESCE(p_subject_id, v_subject_id);

    -- Verify the answer
    v_is_correct := (p_selected_option = v_correct_option);

    -- Calculate coins based on difficulty and correctness
    IF v_is_correct THEN
        v_coins_earned := CASE v_difficulty
            WHEN 'easy' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'hard' THEN 3
        END;
    END IF;

    -- Update or insert user progress
    INSERT INTO public.user_progress (user_id, subject_id, questions_answered, correct_answers, streak, best_streak, last_reviewed)
    VALUES (v_user_id, v_subject_id, 1, CASE WHEN v_is_correct THEN 1 ELSE 0 END, CASE WHEN v_is_correct THEN 1 ELSE 0 END, CASE WHEN v_is_correct THEN 1 ELSE 0 END, NOW())
    ON CONFLICT (user_id, subject_id) DO UPDATE SET
        questions_answered = user_progress.questions_answered + 1,
        correct_answers = user_progress.correct_answers + CASE WHEN v_is_correct THEN 1 ELSE 0 END,
        streak = CASE WHEN v_is_correct THEN user_progress.streak + 1 ELSE 0 END,
        best_streak = GREATEST(user_progress.best_streak, CASE WHEN v_is_correct THEN user_progress.streak + 1 ELSE user_progress.best_streak END),
        last_reviewed = NOW()
    RETURNING streak, best_streak INTO v_current_streak, v_best_streak;

    -- Bonus coins for streaks
    IF v_is_correct AND v_current_streak > 0 AND v_current_streak % 5 = 0 THEN
        v_coins_earned := v_coins_earned + 5; -- Bonus for every 5-streak
    END IF;

    -- Update user coins
    UPDATE public.users
    SET coins = coins + v_coins_earned
    WHERE id = v_user_id;

    -- Return the result
    RETURN QUERY SELECT 
        v_is_correct,
        v_correct_option,
        v_explanation,
        v_current_streak,
        v_coins_earned;
END;
$$;

-- ============================================
-- SUBMIT BATTLE ANSWER - ANTI-CHEAT FOR BATTLES
-- ============================================

CREATE OR REPLACE FUNCTION public.submit_battle_answer(
    p_battle_id UUID,
    p_question_id UUID,
    p_selected_option INTEGER,
    p_time_taken_ms INTEGER
)
RETURNS TABLE (
    is_correct BOOLEAN,
    correct_option INTEGER,
    new_score INTEGER,
    opponent_score INTEGER,
    battle_status battle_status
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_correct_option INTEGER;
    v_is_correct BOOLEAN;
    v_battle RECORD;
    v_new_score INTEGER;
    v_opponent_score INTEGER;
    v_is_player1 BOOLEAN;
    v_current_round INTEGER;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Validate input
    IF p_selected_option < 0 OR p_selected_option > 3 THEN
        RAISE EXCEPTION 'Invalid option selected';
    END IF;

    IF p_time_taken_ms < 0 OR p_time_taken_ms > 60000 THEN -- Max 60 seconds
        RAISE EXCEPTION 'Invalid time taken';
    END IF;

    -- Get battle details
    SELECT * INTO v_battle
    FROM public.battles b
    WHERE b.id = p_battle_id
    AND b.status = 'active'
    AND (b.player1_id = v_user_id OR b.player2_id = v_user_id);

    IF v_battle IS NULL THEN
        RAISE EXCEPTION 'Battle not found or not active';
    END IF;

    v_is_player1 := (v_battle.player1_id = v_user_id);

    -- Check if user already answered this question in this battle
    IF EXISTS (
        SELECT 1 FROM public.battle_answers
        WHERE battle_id = p_battle_id
        AND user_id = v_user_id
        AND question_id = p_question_id
    ) THEN
        RAISE EXCEPTION 'Question already answered';
    END IF;

    -- Get the correct answer
    SELECT correct_option_id INTO v_correct_option
    FROM public.questions
    WHERE id = p_question_id;

    IF v_correct_option IS NULL THEN
        RAISE EXCEPTION 'Question not found';
    END IF;

    v_is_correct := (p_selected_option = v_correct_option);

    -- Record the answer
    INSERT INTO public.battle_answers (
        battle_id, user_id, question_id, selected_option, 
        is_correct, time_taken_ms, round
    )
    VALUES (
        p_battle_id, v_user_id, p_question_id, p_selected_option,
        v_is_correct, p_time_taken_ms, v_battle.current_round
    );

    -- Update battle scores
    IF v_is_player1 THEN
        UPDATE public.battles
        SET player1_score = player1_score + CASE WHEN v_is_correct THEN 1 ELSE 0 END
        WHERE id = p_battle_id
        RETURNING player1_score, player2_score INTO v_new_score, v_opponent_score;
    ELSE
        UPDATE public.battles
        SET player2_score = player2_score + CASE WHEN v_is_correct THEN 1 ELSE 0 END
        WHERE id = p_battle_id
        RETURNING player2_score, player1_score INTO v_new_score, v_opponent_score;
    END IF;

    -- Check if battle should end (both players answered current round)
    -- This is simplified - in production you'd check round completion

    RETURN QUERY SELECT 
        v_is_correct,
        v_correct_option,
        v_new_score,
        v_opponent_score,
        v_battle.status;
END;
$$;

-- ============================================
-- FIND OR CREATE BATTLE (Matchmaking)
-- ============================================

CREATE OR REPLACE FUNCTION public.find_or_create_battle(
    p_subject_id UUID
)
RETURNS TABLE (
    battle_id UUID,
    opponent_id UUID,
    is_new BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_user_mmr INTEGER;
    v_existing_battle RECORD;
    v_new_battle_id UUID;
    v_question_ids UUID[];
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Get user's MMR
    SELECT mmr INTO v_user_mmr FROM public.users WHERE id = v_user_id;

    -- Check user energy
    IF (SELECT energy FROM public.users WHERE id = v_user_id) < 1 THEN
        RAISE EXCEPTION 'Not enough energy';
    END IF;

    -- Find an existing waiting battle with similar MMR (±200)
    SELECT * INTO v_existing_battle
    FROM public.battles b
    WHERE b.subject_id = p_subject_id
    AND b.status = 'waiting'
    AND b.player1_id != v_user_id
    AND EXISTS (
        SELECT 1 FROM public.users u 
        WHERE u.id = b.player1_id 
        AND ABS(u.mmr - v_user_mmr) <= 200
    )
    ORDER BY b.created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED; -- Prevents race conditions

    IF v_existing_battle IS NOT NULL THEN
        -- Join existing battle
        UPDATE public.battles
        SET 
            player2_id = v_user_id,
            status = 'active',
            started_at = NOW()
        WHERE id = v_existing_battle.id;

        -- Consume energy
        UPDATE public.users SET energy = energy - 1 WHERE id = v_user_id;

        RETURN QUERY SELECT 
            v_existing_battle.id,
            v_existing_battle.player1_id,
            FALSE;
    ELSE
        -- Create new battle
        
        -- Select 5 random questions for the battle
        SELECT ARRAY_AGG(q.id) INTO v_question_ids
        FROM (
            SELECT id FROM public.questions
            WHERE subject_id = p_subject_id
            ORDER BY RANDOM()
            LIMIT 5
        ) q;

        IF array_length(v_question_ids, 1) < 5 THEN
            RAISE EXCEPTION 'Not enough questions for battle';
        END IF;

        INSERT INTO public.battles (
            player1_id, subject_id, status, round_data
        )
        VALUES (
            v_user_id, p_subject_id, 'waiting', to_jsonb(v_question_ids)
        )
        RETURNING id INTO v_new_battle_id;

        -- Consume energy
        UPDATE public.users SET energy = energy - 1 WHERE id = v_user_id;

        RETURN QUERY SELECT 
            v_new_battle_id,
            NULL::UUID,
            TRUE;
    END IF;
END;
$$;

-- ============================================
-- ENERGY REGENERATION
-- ============================================

CREATE OR REPLACE FUNCTION public.regenerate_energy()
RETURNS TABLE (
    new_energy INTEGER,
    next_regen_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_user RECORD;
    v_minutes_passed INTEGER;
    v_energy_to_add INTEGER;
    v_new_energy INTEGER;
    v_regen_interval_minutes INTEGER := 30; -- 30 minutes per energy
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    SELECT * INTO v_user FROM public.users WHERE id = v_user_id;

    IF v_user.energy >= v_user.max_energy THEN
        -- Already at max
        RETURN QUERY SELECT v_user.energy, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    -- Calculate energy to add based on time passed
    v_minutes_passed := EXTRACT(EPOCH FROM (NOW() - v_user.energy_last_updated)) / 60;
    v_energy_to_add := v_minutes_passed / v_regen_interval_minutes;

    IF v_energy_to_add > 0 THEN
        v_new_energy := LEAST(v_user.energy + v_energy_to_add, v_user.max_energy);
        
        UPDATE public.users
        SET 
            energy = v_new_energy,
            energy_last_updated = NOW()
        WHERE id = v_user_id;

        RETURN QUERY SELECT 
            v_new_energy,
            CASE WHEN v_new_energy < v_user.max_energy 
                THEN NOW() + (v_regen_interval_minutes * INTERVAL '1 minute')
                ELSE NULL
            END;
    ELSE
        -- Calculate time until next energy
        RETURN QUERY SELECT 
            v_user.energy,
            v_user.energy_last_updated + ((v_regen_interval_minutes - (v_minutes_passed % v_regen_interval_minutes)) * INTERVAL '1 minute');
    END IF;
END;
$$;

-- ============================================
-- END BATTLE (Determine winner, update MMR)
-- ============================================

CREATE OR REPLACE FUNCTION public.end_battle(
    p_battle_id UUID
)
RETURNS TABLE (
    winner_id UUID,
    player1_mmr_change INTEGER,
    player2_mmr_change INTEGER,
    coins_earned INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_battle RECORD;
    v_winner_id UUID;
    v_mmr_change INTEGER := 25; -- Base MMR change
    v_coins INTEGER := 10; -- Coins for winning
BEGIN
    SELECT * INTO v_battle
    FROM public.battles
    WHERE id = p_battle_id AND status = 'active';

    IF v_battle IS NULL THEN
        RAISE EXCEPTION 'Battle not found or not active';
    END IF;

    -- Determine winner
    IF v_battle.player1_score > v_battle.player2_score THEN
        v_winner_id := v_battle.player1_id;
    ELSIF v_battle.player2_score > v_battle.player1_score THEN
        v_winner_id := v_battle.player2_id;
    ELSE
        v_winner_id := NULL; -- Draw
    END IF;

    -- Update battle
    UPDATE public.battles
    SET 
        status = 'completed',
        winner_id = v_winner_id,
        ended_at = NOW()
    WHERE id = p_battle_id;

    -- Update MMR and coins
    IF v_winner_id IS NOT NULL THEN
        -- Winner gains MMR and coins
        UPDATE public.users
        SET mmr = mmr + v_mmr_change, coins = coins + v_coins
        WHERE id = v_winner_id;

        -- Loser loses MMR (but not below 0)
        UPDATE public.users
        SET mmr = GREATEST(0, mmr - v_mmr_change)
        WHERE id = CASE 
            WHEN v_winner_id = v_battle.player1_id THEN v_battle.player2_id
            ELSE v_battle.player1_id
        END;

        RETURN QUERY SELECT 
            v_winner_id,
            CASE WHEN v_winner_id = v_battle.player1_id THEN v_mmr_change ELSE -v_mmr_change END,
            CASE WHEN v_winner_id = v_battle.player2_id THEN v_mmr_change ELSE -v_mmr_change END,
            v_coins;
    ELSE
        -- Draw - no MMR change, small coin reward
        UPDATE public.users SET coins = coins + 2 WHERE id IN (v_battle.player1_id, v_battle.player2_id);

        RETURN QUERY SELECT 
            NULL::UUID,
            0,
            0,
            2;
    END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.submit_answer TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_battle_answer TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_or_create_battle TO authenticated;
GRANT EXECUTE ON FUNCTION public.regenerate_energy TO authenticated;
GRANT EXECUTE ON FUNCTION public.end_battle TO authenticated;
