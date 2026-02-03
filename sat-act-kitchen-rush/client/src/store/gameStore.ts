import { create } from 'zustand';
import type { Question } from '@app-types/question.types';
import type { Order } from '@app-types/game.types';

interface GameState {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'ended';
  sessionId: string | null;
  activeQuestion: Question | null;
  orders: Order[];
  score: number;
  coinsEarned: number;
  timeLeft: number; // Session time in seconds

  setStatus: (status: GameState['status']) => void;
  setActiveQuestion: (question: Question | null) => void;
  addOrder: (order: Order) => void;
  updateScore: (points: number) => void;
  tick: (deltaTime: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  status: 'idle',
  sessionId: null,
  activeQuestion: null,
  orders: [],
  score: 0,
  coinsEarned: 0,
  timeLeft: 600, // 10 minutes

  setStatus: (status) => set({ status }),
  setActiveQuestion: (question) => set({ activeQuestion: question }),
  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
  updateScore: (points) => set((state) => ({ score: state.score + points })),
  tick: (dt) => set((state) => {
    if (state.status !== 'playing') return state;
    const newTime = Math.max(0, state.timeLeft - dt);

    // Update orders timeRemaining
    const updatedOrders = state.orders.map(o => {
      if (o.status === 'in_progress' || o.status === 'pending') {
        return { ...o, timeRemaining: Math.max(0, o.timeRemaining - dt) };
      }
      return o;
    });

    return {
      timeLeft: newTime,
      orders: updatedOrders,
      status: newTime === 0 ? 'ended' : state.status
    };
  }),
}));
