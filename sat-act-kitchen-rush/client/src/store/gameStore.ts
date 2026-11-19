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

export type MechanicType = 'fridge' | 'prep' | 'stove' | 'grill' | 'fry' | 'oven' | 'plating' | 'dessert' | 'drinks' | null;

// Ingredient mapping: recipe ingredient name → inventory ID
export const INGREDIENT_NAME_TO_ID: Record<string, string> = {
  'Beef Patty': 'beef',
  'Potato': 'potato',
  'Lettuce': 'lettuce',
  'Fish Fillets': 'fish',
  'Bread': 'bread',
  'Pasta': 'pasta',
  'Bacon': 'bacon',
  'Cake Base': 'cake-base',
  'Tomato': 'tomato',
  'Cheese': 'cheese',
  'Chicken': 'chicken',
  'Eggs': 'eggs',
};

// Reverse mapping: inventory ID → display name
export const INGREDIENT_ID_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(INGREDIENT_NAME_TO_ID).map(([name, id]) => [id, name])
);

interface GameState {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'ended';
  view: 'main-menu' | 'mode-select' | 'skill-select' | 'playing' | 'settings' | 'recap';
  gameMode: 'session' | 'zen' | null;
  selectedSkill: string | 'all';
  sessionId: string | null;
  activeQuestion: Question | null;
  activeRecipe: Recipe | null;
  activeStation: StationType | null;
  activeMechanic: MechanicType;
  currentStepIndex: number;
  orders: Order[];
  inventory: string[];
  score: number;
  coinsEarned: number;

  // Actions
  setStatus: (status: GameState['status']) => void;
  setView: (view: GameState['view']) => void;
  setGameMode: (mode: GameState['gameMode']) => void;
  setSelectedSkill: (skill: string) => void;
  setActiveQuestion: (question: Question | null) => void;
  setActiveRecipe: (recipe: Recipe | null) => void;
  setActiveStation: (station: StationType | null) => void;
  setActiveMechanic: (mechanic: MechanicType) => void;
  dismissRecipe: () => void;
  advanceRecipeStep: () => void;
  addOrder: (order: Order) => void;
  startOrder: (orderId: string) => void;
  completeOrder: (orderId: string) => void;
  advanceOrderStep: (orderId: string, stationType?: StationType) => void;
  updateScore: (points: number) => void;
  addToInventory: (item: string) => void;
  removeFromInventory: (item: string) => void;
  clearInventory: () => void;
  updateOrderTimers: (deltaTime: number) => void;
}

// Helper functions (use outside of components with useGameStore.getState())
export function getActiveOrder(): Order | null {
  const state = useGameStore.getState();
  return state.orders.find(o => o.status === 'in_progress') || null;
}

export function getRequiredIngredientsForStation(stationType: StationType): string[] {
  const state = useGameStore.getState();
  const activeOrder = state.orders.find(o => o.status === 'in_progress');
  if (!activeOrder || !state.activeRecipe) return [];

  // Get ingredients that belong to this station from the recipe
  const recipeIngredients = state.activeRecipe.ingredients
    .filter(ing => ing.station === stationType)
    .map(ing => INGREDIENT_NAME_TO_ID[ing.name] || ing.name.toLowerCase().replace(/\s+/g, '-'));

  return recipeIngredients;
}

export const useGameStore = create<GameState>((set) => ({
  status: 'idle',
  view: 'main-menu',
  gameMode: null,
  selectedSkill: 'all',
  sessionId: null,
  activeQuestion: null,
  activeRecipe: null,
  activeStation: null,
  activeMechanic: null,
  currentStepIndex: 0,
  orders: [],
  inventory: [],
  score: 0,
  coinsEarned: 0,

  setStatus: (status) => set({ status }),
  setView: (view) => set({ view }),
  setGameMode: (mode) => set({ gameMode: mode }),
  setSelectedSkill: (skill) => set({ selectedSkill: skill }),
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

  advanceOrderStep: (orderId, stationType) =>
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;

        // If stationType provided, only complete the FIRST active step matching that station
        if (stationType) {
          let foundAndCompleted = false;
          const steps = o.steps.map((s, i, arr) => {
            // Complete the first active step that matches the station type
            if (!foundAndCompleted && s.status === 'active' && s.stationType === stationType) {
              foundAndCompleted = true;
              return { ...s, status: 'completed' as const };
            }
            // Unlock the next locked step if the previous was just completed
            const prevStep = arr[i - 1];
            if (s.status === 'locked' && prevStep && foundAndCompleted && i === arr.findIndex(x => x.status === 'locked')) {
              return { ...s, status: 'active' as const };
            }
            return s;
          });

          // Second pass: unlock next step after any completed step
          const finalSteps = steps.map((s, i, arr) => {
            if (s.status === 'locked' && i > 0 && arr[i - 1].status === 'completed') {
              return { ...s, status: 'active' as const };
            }
            return s;
          });

          return { ...o, steps: finalSteps };
        }

        // Fallback: original behavior (complete first active step)
        const steps = o.steps.map((s, i, arr) => {
          if (s.status === 'active') return { ...s, status: 'completed' as const };
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

  addToInventory: (item) => set((state) => ({
    inventory: [...state.inventory, item].slice(-9)
  })),

  removeFromInventory: (item) => set((state) => ({
    inventory: state.inventory.filter((_, index) =>
      index !== state.inventory.indexOf(item)
    )
  })),

  clearInventory: () => set({ inventory: [] }),

  updateOrderTimers: (deltaTime) => set((state) => ({
    orders: state.orders.map((order) => {
      if (order.status !== 'in_progress') return order;
      const newTime = Math.max(0, order.timeRemaining - deltaTime);
      return { ...order, timeRemaining: newTime };
    })
  })),
}));
