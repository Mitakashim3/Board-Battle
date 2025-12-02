import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { bulkCreateQuestionsSchema, validateInput } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    // Use admin client for this endpoint
    const supabase = createAdminClient();
    
    // Verify admin role via JWT (middleware should have already verified this)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validation = validateInput(bulkCreateQuestionsSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, issues: validation.issues },
        { status: 400 }
      );
    }
    
    const { questions } = validation.data;
    
    // Insert questions
    const { data, error } = await supabase
      .from('questions')
      .insert(
        questions.map(q => ({
          subject_id: q.subjectId,
          question_text: q.questionText,
          options: q.options,
          correct_option_id: q.correctOptionId,
          difficulty: q.difficulty,
          explanation: q.explanation,
        }))
      )
      .select();
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      count: data.length,
      questions: data,
    });
  } catch (error) {
    console.error('Bulk create questions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
