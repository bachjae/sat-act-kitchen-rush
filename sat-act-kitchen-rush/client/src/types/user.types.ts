export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  authProvider: 'email' | 'google' | 'anonymous';
  createdAt: Date;
  lastLoginAt: Date;
  stats: UserStats;
}

export interface UserStats {
  totalSessions: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  averageAccuracy: number;
  totalPlayTimeSeconds: number;
  highScore: number;
  streak: number;
}

export interface UserSkillMastery {
  id: string;
  userId: string;
  skillId: string;
  mastery: number;
  totalAttempts: number;
  correctAttempts: number;
  lastAttemptAt: Date;
  emaScore: number;
}

export interface Skill {
  id: string;
  examType: 'SAT' | 'ACT';
  section: string;
  contentDomain: string;
  subskill: string;
  description: string;
}
