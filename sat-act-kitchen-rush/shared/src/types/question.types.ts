import type { StationType } from './game.types';

export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  skillId: string;
  examType: 'SAT' | 'ACT' | 'both';
  section: string;
  contentDomain: string;
  subskill: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  stationType: Exclude<StationType, 'serving'>;
  timeBudget: number;
  stem: string;
  passage?: string;
  choices: Choice[];
  correctChoiceId: string;
  explanation: string;
}

export interface QuestionAttempt {
  id: string;
  userId: string;
  questionId: string;
  sessionId: string;
  selectedChoiceId: string;
  isCorrect: boolean;
  timeTaken: number;
  stationType: Exclude<StationType, 'serving'>;
  timestamp: Date;
}

export interface QuestionsData {
  version: string;
  generatedAt: string;
  totalQuestions: number;
  examTypes: string[];
  difficultyRange: number[];
  stationTypes: string[];
  questions: Question[];
}
