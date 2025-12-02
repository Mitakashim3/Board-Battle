import { z } from 'zod';

// ============================================
// Authentication Schemas
// ============================================

export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email is too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long'),
});

export const signupSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username is too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email is too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ============================================
// Game Schemas
// ============================================

export const submitAnswerSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  selectedOption: z.number()
    .int('Option must be an integer')
    .min(0, 'Invalid option')
    .max(3, 'Invalid option'),
  subjectId: z.string().uuid('Invalid subject ID').optional(),
});

export const submitBattleAnswerSchema = z.object({
  battleId: z.string().uuid('Invalid battle ID'),
  questionId: z.string().uuid('Invalid question ID'),
  selectedOption: z.number()
    .int('Option must be an integer')
    .min(0, 'Invalid option')
    .max(3, 'Invalid option'),
  timeTakenMs: z.number()
    .int('Time must be an integer')
    .min(0, 'Invalid time')
    .max(60000, 'Time exceeded maximum limit'),
});

export const findBattleSchema = z.object({
  subjectId: z.string().uuid('Invalid subject ID'),
});

// ============================================
// Question Schemas (Admin)
// ============================================

export const questionOptionSchema = z.object({
  id: z.number().int().min(0).max(3),
  text: z.string()
    .min(1, 'Option text is required')
    .max(500, 'Option text is too long'),
});

export const createQuestionSchema = z.object({
  subjectId: z.string().uuid('Invalid subject ID'),
  questionText: z.string()
    .min(10, 'Question text must be at least 10 characters')
    .max(2000, 'Question text is too long'),
  options: z.array(questionOptionSchema)
    .length(4, 'Exactly 4 options are required'),
  correctOptionId: z.number()
    .int('Correct option must be an integer')
    .min(0, 'Invalid correct option')
    .max(3, 'Invalid correct option'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  explanation: z.string()
    .max(1000, 'Explanation is too long')
    .optional()
    .nullable(),
});

export const bulkCreateQuestionsSchema = z.object({
  questions: z.array(createQuestionSchema)
    .min(1, 'At least one question is required')
    .max(100, 'Cannot create more than 100 questions at once'),
});

// ============================================
// Subject Schemas (Admin)
// ============================================

export const createSubjectSchema = z.object({
  name: z.string()
    .min(2, 'Subject name must be at least 2 characters')
    .max(100, 'Subject name is too long'),
  description: z.string()
    .max(500, 'Description is too long')
    .optional()
    .nullable(),
  examType: z.enum(['LET', 'Nursing', 'Criminology']),
  iconUrl: z.string().url('Invalid icon URL').optional().nullable(),
});

// ============================================
// Profile Schemas
// ============================================

export const updateProfileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username is too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable(),
});

// ============================================
// Type exports
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type SubmitBattleAnswerInput = z.infer<typeof submitBattleAnswerSchema>;
export type FindBattleInput = z.infer<typeof findBattleSchema>;
export type QuestionOption = z.infer<typeof questionOptionSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type BulkCreateQuestionsInput = z.infer<typeof bulkCreateQuestionsSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ============================================
// Validation helper
// ============================================

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  issues: z.ZodIssue[];
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    error: result.error.issues[0]?.message ?? 'Validation failed',
    issues: result.error.issues,
  };
}
