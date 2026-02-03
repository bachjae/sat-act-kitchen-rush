import { create } from 'zustand';
import type { Question } from '@types/question.types';
import type { Order } from '@types/game.types';

interface GameState {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'ended';
  sessionId: string | null;
  activeQuestion: Question | null;
  orders: Order[];
  score: number;
  coinsEarned: number;

  setStatus: (status: GameState['status']) => void;
  setActiveQuestion: (question: Question | null) => void;
  addOrder: (order: Order) => void;
  updateScore: (points: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  status: 'idle',
  sessionId: null,
  activeQuestion: null,
  orders: [],
  score: 0,
  coinsEarned: 0,

  setStatus: (status) => set({ status }),
  setActiveQuestion: (question) => set({ activeQuestion: question }),
  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
  updateScore: (points) => set((state) => ({ score: state.score + points })),
}));
