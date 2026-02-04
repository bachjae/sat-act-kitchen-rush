import { create } from 'zustand';
import type { Question } from '@app-types/question.types';
import type { Order, SessionStats, QuestionAttempt } from '@app-types/game.types';
import { AudioManager } from '@game/engine/AudioManager';
import { saveSession } from '@services/session.service';
import { updateUserStats } from '@services/user.service';
import type { User } from '@app-types/user.types';

interface GameState {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'ended';
  sessionId: string | null;
  activeQuestion: Question | null;
  orders: Order[];
  score: number;
  coinsEarned: number;
  sessionTimeRemaining: number;
  stats: SessionStats;

  setStatus: (status: GameState['status']) => void;
  setActiveQuestion: (question: Question | null) => void;
  addOrder: (order: Order) => void;
  updateScore: (points: number) => void;
  tickSessionTime: (deltaTime: number) => void;
  recordAttempt: (attempt: QuestionAttempt) => void;
  updateOrder: (order: Order) => void;
  completeOrder: (orderId: string) => void;
  failOrder: (orderId: string) => void;
  endSession: () => void;
  resetGame: () => void;
}

const initialStats: SessionStats = {
  totalOrdersGenerated: 0,
  totalOrdersCompleted: 0,
  totalOrdersFailed: 0,
  totalQuestionsAttempted: 0,
  totalCorrectAnswers: 0,
  totalCoinsEarned: 0,
  totalXpEarned: 0,
  stationBreakdown: {
    ticket: { attempted: 0, correct: 0, totalTime: 0 },
    fridge: { attempted: 0, correct: 0, totalTime: 0 },
    prep: { attempted: 0, correct: 0, totalTime: 0 },
    stove: { attempted: 0, correct: 0, totalTime: 0 },
    plating: { attempted: 0, correct: 0, totalTime: 0 },
    serving: { attempted: 0, correct: 0, totalTime: 0 },
  },
  questionReview: [],
};

export const useGameStore = create<GameState>((set, get) => ({
  status: 'idle',
  sessionId: null,
  activeQuestion: null,
  orders: [],
  score: 0,
  coinsEarned: 0,
  sessionTimeRemaining: 600, // 10 minutes default
  stats: { ...initialStats },

  setStatus: (status) => set({ status }),
  setActiveQuestion: (question) => set({ activeQuestion: question }),
  addOrder: (order) => set((state) => ({
    orders: [...state.orders, order],
    stats: {
      ...state.stats,
      totalOrdersGenerated: state.stats.totalOrdersGenerated + 1
    }
  })),
  updateScore: (points) => set((state) => ({
    score: state.score + points,
    coinsEarned: state.coinsEarned + Math.floor(points / 10)
  })),

  tickSessionTime: (dt) => set((state) => {
    const newTime = Math.max(0, state.sessionTimeRemaining - dt);

    // Update individual order timers
    const updatedOrders = state.orders.map(order => ({
      ...order,
      timeRemaining: Math.max(0, order.timeRemaining - dt)
    }));

    // Check for failed orders
    const failedOrderIds = updatedOrders
      .filter(o => o.timeRemaining <= 0 && o.status !== 'failed')
      .map(o => o.id);

    let finalOrders = updatedOrders;
    let newStats = { ...state.stats };

    if (failedOrderIds.length > 0) {
      finalOrders = updatedOrders.filter(o => o.timeRemaining > 0);
      newStats.totalOrdersFailed += failedOrderIds.length;
    }

    if (newTime === 0 && state.status === 'playing') {
      setTimeout(() => get().endSession(), 0);
      return {
        sessionTimeRemaining: 0,
        status: 'ended',
        orders: finalOrders,
        stats: newStats
      };
    }

    return {
      sessionTimeRemaining: newTime,
      orders: finalOrders,
      stats: newStats
    };
  }),

  recordAttempt: (attempt) => set((state) => {
    const station = attempt.stationType;
    const newStats = { ...state.stats };
    newStats.totalQuestionsAttempted++;
    if (attempt.isCorrect) newStats.totalCorrectAnswers++;

    newStats.stationBreakdown[station].attempted++;
    if (attempt.isCorrect) newStats.stationBreakdown[station].correct++;
    newStats.stationBreakdown[station].totalTime += attempt.timeTaken;

    newStats.questionReview.push(attempt);

    return { stats: newStats };
  }),

  updateOrder: (order) => set((state) => ({
    orders: state.orders.map(o => o.id === order.id ? order : o)
  })),

  completeOrder: (orderId) => set((state) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return state;

    AudioManager.getInstance().playSound('complete');

    return {
      orders: state.orders.filter(o => o.id !== orderId),
      stats: {
        ...state.stats,
        totalOrdersCompleted: state.stats.totalOrdersCompleted + 1,
        totalCoinsEarned: state.stats.totalCoinsEarned + 50, // Bonus for completion
        totalXpEarned: state.stats.totalXpEarned + 100,
      }
    };
  }),

  failOrder: (orderId) => set((state) => {
    AudioManager.getInstance().playSound('fail');
    return {
      orders: state.orders.filter(o => o.id !== orderId),
      stats: {
        ...state.stats,
        totalOrdersFailed: state.stats.totalOrdersFailed + 1
      }
    };
  }),

  endSession: () => {
    const state = get();
    set({ status: 'ended' });

    // Save session data
    const userStr = localStorage.getItem('mock-user');
    const user = userStr ? JSON.parse(userStr) as User : null;
    if (user && user.uid) {
      saveSession({
        userId: user.uid,
        score: state.score,
        stats: state.stats,
        coinsEarned: state.coinsEarned,
      });

      // Update user lifetime stats
      updateUserStats(user.uid, {
        coins: (state.stats.totalCoinsEarned || 0),
        xp: (state.stats.totalXpEarned || 0),
        totalSessions: 1 // This should ideally increment
      });
    }
  },

  resetGame: () => set({
    status: 'idle',
    orders: [],
    score: 0,
    coinsEarned: 0,
    sessionTimeRemaining: 600,
    stats: { ...initialStats, stationBreakdown: { ...initialStats.stationBreakdown } },
    activeQuestion: null,
  }),
}));
