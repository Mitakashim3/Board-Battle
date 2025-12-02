import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { submitBattleAnswerSchema, validateInput } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validation = validateInput(submitBattleAnswerSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, issues: validation.issues },
        { status: 400 }
      );
    }
    
    const { battleId, questionId, selectedOption, timeTakenMs } = validation.data;
    
    // Call the RPC function
    const { data, error } = await supabase.rpc('submit_battle_answer', {
      p_battle_id: battleId,
      p_question_id: questionId,
      p_selected_option: selectedOption,
      p_time_taken_ms: timeTakenMs,
    });
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Submit battle answer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
