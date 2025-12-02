import { create } from 'zustand';
import { QuestionStudentView, Subject } from '@/lib/database.types';

export type AnswerResult = {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  correctOption: number;
  explanation: string | null;
};

interface GameState {
  // Current session
  currentSubject: Subject | null;
  questions: QuestionStudentView[];
  currentQuestionIndex: number;
  questionsAnswered: number;
  correctAnswers: number;
  streak: number;
  
  // Answer history for current session
  answers: AnswerResult[];
  
  // UI State
  isLoading: boolean;
  showBreakModal: boolean;
  showResultFeedback: boolean;
  lastResult: AnswerResult | null;
}

interface GameActions {
  // Session management
  startSession: (subject: Subject, questions: QuestionStudentView[]) => void;
  endSession: () => void;
  resetSession: () => void;
  
  // Gameplay
  recordAnswer: (result: AnswerResult) => void;
  nextQuestion: () => void;
  
  // UI
  setLoading: (loading: boolean) => void;
  setShowBreakModal: (show: boolean) => void;
  setShowResultFeedback: (show: boolean) => void;
  
  // Computed
  getCurrentQuestion: () => QuestionStudentView | null;
  getProgress: () => number;
  shouldShowBreak: () => boolean;
}

type GameStore = GameState & GameActions;

const BREAK_INTERVAL = 10; // Show break modal every 10 questions

export const useGameStore = create<GameStore>()((set, get) => ({
  // Initial state
  currentSubject: null,
  questions: [],
  currentQuestionIndex: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  streak: 0,
  answers: [],
  isLoading: false,
  showBreakModal: false,
  showResultFeedback: false,
  lastResult: null,

  // Session management
  startSession: (subject, questions) =>
    set({
      currentSubject: subject,
      questions,
      currentQuestionIndex: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      streak: 0,
      answers: [],
      isLoading: false,
      showBreakModal: false,
    }),

  endSession: () =>
    set({
      currentSubject: null,
      questions: [],
      currentQuestionIndex: 0,
      isLoading: false,
    }),

  resetSession: () =>
    set({
      currentQuestionIndex: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      streak: 0,
      answers: [],
      showBreakModal: false,
    }),

  // Gameplay
  recordAnswer: (result) =>
    set((state) => ({
      answers: [...state.answers, result],
      questionsAnswered: state.questionsAnswered + 1,
      correctAnswers: state.correctAnswers + (result.isCorrect ? 1 : 0),
      streak: result.isCorrect ? state.streak + 1 : 0,
      lastResult: result,
      showResultFeedback: true,
    })),

  nextQuestion: () =>
    set((state) => {
      const nextIndex = state.currentQuestionIndex + 1;
      const shouldBreak = 
        state.questionsAnswered > 0 && 
        state.questionsAnswered % BREAK_INTERVAL === 0;
      
      return {
        currentQuestionIndex: nextIndex < state.questions.length ? nextIndex : state.currentQuestionIndex,
        showBreakModal: shouldBreak,
        showResultFeedback: false,
      };
    }),

  // UI
  setLoading: (loading) => set({ isLoading: loading }),
  setShowBreakModal: (show) => set({ showBreakModal: show }),
  setShowResultFeedback: (show) => set({ showResultFeedback: show }),

  // Computed
  getCurrentQuestion: () => {
    const { questions, currentQuestionIndex } = get();
    return questions[currentQuestionIndex] ?? null;
  },

  getProgress: () => {
    const { currentQuestionIndex, questions } = get();
    return questions.length > 0 
      ? ((currentQuestionIndex + 1) / questions.length) * 100 
      : 0;
  },

  shouldShowBreak: () => {
    const { questionsAnswered } = get();
    return questionsAnswered > 0 && questionsAnswered % BREAK_INTERVAL === 0;
  },
}));
