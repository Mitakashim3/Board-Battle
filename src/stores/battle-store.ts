import { create } from 'zustand';
import { Battle, User } from '@/lib/database.types';

export type BattlePhase = 
  | 'idle'
  | 'searching'
  | 'found'
  | 'countdown'
  | 'playing'
  | 'waiting_opponent'
  | 'round_result'
  | 'finished';

interface BattleState {
  // Battle data
  battle: Battle | null;
  opponent: User | null;
  questionIds: string[];
  currentRound: number;
  
  // Scores
  playerScore: number;
  opponentScore: number;
  
  // Phase management
  phase: BattlePhase;
  countdown: number;
  
  // Current round
  currentQuestionId: string | null;
  playerAnswered: boolean;
  opponentAnswered: boolean;
  roundTimeRemaining: number;
  
  // Results
  lastRoundResult: {
    playerCorrect: boolean;
    opponentCorrect: boolean;
    correctOption: number;
  } | null;
}

interface BattleActions {
  // Battle lifecycle
  startSearch: () => void;
  setBattle: (battle: Battle, opponent: User | null, questionIds: string[]) => void;
  startCountdown: () => void;
  decrementCountdown: () => void;
  startPlaying: () => void;
  
  // Round management
  startRound: (questionId: string) => void;
  setPlayerAnswered: () => void;
  setOpponentAnswered: () => void;
  updateScores: (playerScore: number, opponentScore: number) => void;
  
  // Round results
  showRoundResult: (result: BattleState['lastRoundResult']) => void;
  nextRound: () => void;
  
  // End battle
  finishBattle: (winnerId: string | null) => void;
  resetBattle: () => void;
  
  // Timer
  decrementRoundTime: () => void;
  
  // Helpers
  isPlayerTurn: () => boolean;
  isWinner: (userId: string) => boolean;
}

type BattleStore = BattleState & BattleActions;

const ROUND_TIME_SECONDS = 15;
const COUNTDOWN_SECONDS = 3;

export const useBattleStore = create<BattleStore>()((set, get) => ({
  // Initial state
  battle: null,
  opponent: null,
  questionIds: [],
  currentRound: 0,
  playerScore: 0,
  opponentScore: 0,
  phase: 'idle',
  countdown: COUNTDOWN_SECONDS,
  currentQuestionId: null,
  playerAnswered: false,
  opponentAnswered: false,
  roundTimeRemaining: ROUND_TIME_SECONDS,
  lastRoundResult: null,

  // Battle lifecycle
  startSearch: () =>
    set({
      phase: 'searching',
      battle: null,
      opponent: null,
      playerScore: 0,
      opponentScore: 0,
    }),

  setBattle: (battle, opponent, questionIds) =>
    set({
      battle,
      opponent,
      questionIds,
      phase: 'found',
      currentRound: 0,
    }),

  startCountdown: () =>
    set({
      phase: 'countdown',
      countdown: COUNTDOWN_SECONDS,
    }),

  decrementCountdown: () =>
    set((state) => ({
      countdown: state.countdown - 1,
    })),

  startPlaying: () =>
    set({
      phase: 'playing',
      currentRound: 1,
    }),

  // Round management
  startRound: (questionId) =>
    set({
      currentQuestionId: questionId,
      playerAnswered: false,
      opponentAnswered: false,
      roundTimeRemaining: ROUND_TIME_SECONDS,
      lastRoundResult: null,
      phase: 'playing',
    }),

  setPlayerAnswered: () => set({ playerAnswered: true }),

  setOpponentAnswered: () => set({ opponentAnswered: true }),

  updateScores: (playerScore, opponentScore) =>
    set({ playerScore, opponentScore }),

  // Round results
  showRoundResult: (result) =>
    set({
      lastRoundResult: result,
      phase: 'round_result',
    }),

  nextRound: () =>
    set((state) => {
      const nextRound = state.currentRound + 1;
      const isLastRound = nextRound > state.questionIds.length;
      
      return {
        currentRound: nextRound,
        phase: isLastRound ? 'finished' : 'playing',
        currentQuestionId: isLastRound 
          ? null 
          : state.questionIds[nextRound - 1],
      };
    }),

  // End battle
  finishBattle: (winnerId) =>
    set((state) => ({
      phase: 'finished',
      battle: state.battle 
        ? { ...state.battle, winner_id: winnerId, status: 'completed' as const }
        : null,
    })),

  resetBattle: () =>
    set({
      battle: null,
      opponent: null,
      questionIds: [],
      currentRound: 0,
      playerScore: 0,
      opponentScore: 0,
      phase: 'idle',
      countdown: COUNTDOWN_SECONDS,
      currentQuestionId: null,
      playerAnswered: false,
      opponentAnswered: false,
      roundTimeRemaining: ROUND_TIME_SECONDS,
      lastRoundResult: null,
    }),

  // Timer
  decrementRoundTime: () =>
    set((state) => ({
      roundTimeRemaining: Math.max(0, state.roundTimeRemaining - 1),
    })),

  // Helpers
  isPlayerTurn: () => !get().playerAnswered,

  isWinner: (userId) => {
    const { battle } = get();
    return battle?.winner_id === userId;
  },
}));
