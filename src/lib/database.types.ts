export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'student' | 'admin'
export type BattleStatus = 'waiting' | 'active' | 'completed' | 'cancelled'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          role: UserRole
          mmr: number
          coins: number
          energy: number
          max_energy: number
          energy_last_updated: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          email: string
          role?: UserRole
          mmr?: number
          coins?: number
          energy?: number
          max_energy?: number
          energy_last_updated?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          role?: UserRole
          mmr?: number
          coins?: number
          energy?: number
          max_energy?: number
          energy_last_updated?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          description: string | null
          icon_url: string | null
          exam_type: string
          question_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon_url?: string | null
          exam_type: string
          question_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon_url?: string | null
          exam_type?: string
          question_count?: number
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          subject_id: string
          question_text: string
          options: Json
          difficulty: Difficulty
          correct_option_id: number // Hidden from students via RLS
          explanation: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          subject_id: string
          question_text: string
          options: Json
          difficulty?: Difficulty
          correct_option_id: number
          explanation?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          subject_id?: string
          question_text?: string
          options?: Json
          difficulty?: Difficulty
          correct_option_id?: number
          explanation?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
      battles: {
        Row: {
          id: string
          player1_id: string
          player2_id: string | null
          subject_id: string
          status: BattleStatus
          winner_id: string | null
          player1_score: number
          player2_score: number
          current_round: number
          max_rounds: number
          round_data: Json
          created_at: string
          updated_at: string
          started_at: string | null
          ended_at: string | null
        }
        Insert: {
          id?: string
          player1_id: string
          player2_id?: string | null
          subject_id: string
          status?: BattleStatus
          winner_id?: string | null
          player1_score?: number
          player2_score?: number
          current_round?: number
          max_rounds?: number
          round_data?: Json
          created_at?: string
          updated_at?: string
          started_at?: string | null
          ended_at?: string | null
        }
        Update: {
          id?: string
          player1_id?: string
          player2_id?: string | null
          subject_id?: string
          status?: BattleStatus
          winner_id?: string | null
          player1_score?: number
          player2_score?: number
          current_round?: number
          max_rounds?: number
          round_data?: Json
          created_at?: string
          updated_at?: string
          started_at?: string | null
          ended_at?: string | null
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          questions_answered: number
          correct_answers: number
          streak: number
          best_streak: number
          last_reviewed: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          questions_answered?: number
          correct_answers?: number
          streak?: number
          best_streak?: number
          last_reviewed?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          questions_answered?: number
          correct_answers?: number
          streak?: number
          best_streak?: number
          last_reviewed?: string | null
          created_at?: string
        }
      }
      battle_answers: {
        Row: {
          id: string
          battle_id: string
          user_id: string
          question_id: string
          selected_option: number
          is_correct: boolean
          time_taken_ms: number
          round: number
          created_at: string
        }
        Insert: {
          id?: string
          battle_id: string
          user_id: string
          question_id: string
          selected_option: number
          is_correct: boolean
          time_taken_ms: number
          round: number
          created_at?: string
        }
        Update: {
          id?: string
          battle_id?: string
          user_id?: string
          question_id?: string
          selected_option?: number
          is_correct?: boolean
          time_taken_ms?: number
          round?: number
          created_at?: string
        }
      }
    }
    Views: {
      questions_student_view: {
        Row: {
          id: string
          subject_id: string
          question_text: string
          options: Json
          difficulty: Difficulty
        }
      }
    }
    Functions: {
      submit_answer: {
        Args: {
          p_question_id: string
          p_selected_option: number
          p_subject_id?: string
        }
        Returns: {
          is_correct: boolean
          correct_option: number
          explanation: string | null
          new_streak: number
          coins_earned: number
        }
      }
      submit_battle_answer: {
        Args: {
          p_battle_id: string
          p_question_id: string
          p_selected_option: number
          p_time_taken_ms: number
        }
        Returns: {
          is_correct: boolean
          correct_option: number
          new_score: number
          opponent_score: number
        }
      }
      find_or_create_battle: {
        Args: {
          p_subject_id: string
        }
        Returns: {
          battle_id: string
          opponent_id: string | null
          is_new: boolean
        }
      }
      regenerate_energy: {
        Args: {}
        Returns: {
          new_energy: number
        }
      }
    }
    Enums: {
      user_role: UserRole
      battle_status: BattleStatus
      difficulty: Difficulty
    }
  }
}

// Helper types for client-side use
export type User = Database['public']['Tables']['users']['Row']
export type Subject = Database['public']['Tables']['subjects']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type QuestionStudentView = Database['public']['Views']['questions_student_view']['Row']
export type Battle = Database['public']['Tables']['battles']['Row']
export type UserProgress = Database['public']['Tables']['user_progress']['Row']
export type BattleAnswer = Database['public']['Tables']['battle_answers']['Row']

// Option type for questions
export interface QuestionOption {
  id: number
  text: string
}
