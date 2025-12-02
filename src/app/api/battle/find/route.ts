import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { findBattleSchema, validateInput } from '@/lib/validations';

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
    const validation = validateInput(findBattleSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, issues: validation.issues },
        { status: 400 }
      );
    }
    
    const { subjectId } = validation.data;
    
    // Call the RPC function
    const { data, error } = await supabase.rpc('find_or_create_battle', {
      p_subject_id: subjectId,
    });
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Find battle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
