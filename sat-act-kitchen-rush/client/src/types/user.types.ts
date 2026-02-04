export interface User {
  uid: string;
  email?: string;
  isAnonymous: boolean;
}

export interface UserProfile {
  userId: string;
  coins: number;
  xp: number;
  level: number;
  totalSessions: number;
  createdAt: string;
}
