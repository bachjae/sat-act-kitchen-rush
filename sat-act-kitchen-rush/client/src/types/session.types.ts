import type { QuestionAttempt } from './question.types';

export interface GameSession {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  mode: 'solo' | 'multiplayer';
  score: number;
  ordersCompleted: number;
  ordersFailed: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  attempts: QuestionAttempt[];
}

export interface SessionSummary {
  sessionId: string;
  score: number;
  ordersCompleted: number;
  ordersFailed: number;
  accuracy: number;
  totalTime: number;
  skillBreakdown: SkillBreakdown[];
}

export interface SkillBreakdown {
  skillId: string;
  attempted: number;
  correct: number;
  accuracy: number;
  masteryChange: number;
}
