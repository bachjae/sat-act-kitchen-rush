import { create } from 'zustand';
import type { Question } from '@app-types/question.types';
import type { Order, StationType } from '@app-types/game.types';
import { OrderSystem } from '@game/systems/OrderSystem';

interface GameState {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'ended';
  sessionId: string | null;
  activeQuestion: Question | null;
  orders: Order[];
  score: number;
  coinsEarned: number;
  timeLeft: number; // Session time in seconds

  setStatus: (status: GameState['status']) => void;
  startSession: () => void;
  setActiveQuestion: (question: Question | null) => void;
  addOrder: (order: Order) => void;
  completeOrderStep: (stationType: StationType, isCorrect: boolean) => void;
  updateScore: (points: number) => void;
  updateOrderTimers: (dt: number) => void;
  tick: (deltaTime: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  status: 'idle',
  sessionId: null,
  activeQuestion: null,
  orders: [],
  score: 0,
  coinsEarned: 0,
  timeLeft: 600, // 10 minutes

  setStatus: (status) => set({ status }),

  startSession: () => {
    const order1 = OrderSystem.getInstance().generateOrder();
    const order2 = OrderSystem.getInstance().generateOrder();
    set({
      status: 'playing',
      orders: [order1, order2],
      score: 0,
      timeLeft: 600
    });
  },

  setActiveQuestion: (question) => set({ activeQuestion: question }),

  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),

  completeOrderStep: (stationType, isCorrect) => {
    const { orders } = get();
    // Find the order that has this station as its active step
    const orderIndex = orders.findIndex(o =>
      (o.status === 'pending' || o.status === 'in_progress') &&
      o.steps.some(s => s.status === 'active' && s.stationType === stationType)
    );

    if (orderIndex !== -1) {
      OrderSystem.getInstance().advanceOrder(orders[orderIndex].id, isCorrect);
    }
  },

  updateScore: (points) => set((state) => ({ score: state.score + points })),

  updateOrderTimers: (dt) => set((state) => ({
    orders: state.orders.map(o => {
      if (o.status === 'pending' || o.status === 'in_progress') {
        const newTime = Math.max(0, o.timeRemaining - dt);
        return {
          ...o,
          timeRemaining: newTime,
          status: newTime === 0 ? 'failed' : o.status
        };
      }
      return o;
    })
  })),

  tick: (dt) => {
    const { status, updateOrderTimers } = get();
    if (status !== 'playing') return;

    set((state) => {
      const newTime = Math.max(0, state.timeLeft - dt);
      return {
        timeLeft: newTime,
        status: newTime === 0 ? 'ended' : state.status
      };
    });

    updateOrderTimers(dt);
  },
}));
