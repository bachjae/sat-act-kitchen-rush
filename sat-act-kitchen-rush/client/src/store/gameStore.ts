import { create } from 'zustand';
import type { Question } from '@app-types/question.types';
import type { Order, StationType } from '@app-types/game.types';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  stations: string[];
  ingredients: { name: string; station: string }[];
  estimatedTime: number;
}

export type MechanicType = 'fridge' | 'prep' | 'stove' | 'plating' | null;

interface GameState {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'ended';
  sessionId: string | null;
  activeQuestion: Question | null;
  activeRecipe: Recipe | null;
  activeStation: StationType | null;
  activeMechanic: MechanicType;
  currentStepIndex: number;
  orders: Order[];
  score: number;
  coinsEarned: number;

  setStatus: (status: GameState['status']) => void;
  setActiveQuestion: (question: Question | null) => void;
  setActiveRecipe: (recipe: Recipe | null) => void;
  setActiveStation: (station: StationType | null) => void;
  setActiveMechanic: (mechanic: MechanicType) => void;
  dismissRecipe: () => void;
  advanceRecipeStep: () => void;
  addOrder: (order: Order) => void;
  startOrder: (orderId: string) => void;
  completeOrder: (orderId: string) => void;
  advanceOrderStep: (orderId: string) => void;
  updateScore: (points: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  status: 'idle',
  sessionId: null,
  activeQuestion: null,
  activeRecipe: null,
  activeStation: null,
  activeMechanic: null,
  currentStepIndex: 0,
  orders: [],
  score: 0,
  coinsEarned: 0,

  setStatus: (status) => set({ status }),
  setActiveQuestion: (question) => set({ activeQuestion: question }),
  setActiveRecipe: (recipe) => set({ activeRecipe: recipe, currentStepIndex: 0 }),
  setActiveStation: (station) => set({ activeStation: station }),
  setActiveMechanic: (mechanic) => set({ activeMechanic: mechanic }),
  dismissRecipe: () => set({ activeRecipe: null }),
  advanceRecipeStep: () => set((state) => ({ currentStepIndex: state.currentStepIndex + 1 })),
  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),

  startOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'in_progress' as const } : o
      ),
    })),

  completeOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'completed' as const } : o
      ),
    })),

  advanceOrderStep: (orderId) =>
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        const steps = o.steps.map((s, i, arr) => {
          if (s.status === 'active') return { ...s, status: 'completed' as const };
          // Unlock the next locked step after the one we just completed
          const prevStep = arr[i - 1];
          if (s.status === 'locked' && prevStep?.status === 'active') {
            return { ...s, status: 'active' as const };
          }
          return s;
        });
        return { ...o, steps };
      }),
    })),

  updateScore: (points) => set((state) => ({ score: state.score + points })),
}));
