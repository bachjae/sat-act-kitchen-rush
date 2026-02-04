import type { UserProfile } from '@app-types/user.types';

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const profileKey = `user-profile-${userId}`;
  const saved = localStorage.getItem(profileKey);
  if (saved) return JSON.parse(saved);

  const newProfile: UserProfile = {
    userId,
    coins: 0,
    xp: 0,
    level: 1,
    totalSessions: 0,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(profileKey, JSON.stringify(newProfile));
  return newProfile;
}

export async function updateUserStats(userId: string, updates: Partial<UserProfile>) {
  const profileKey = `user-profile-${userId}`;
  const profile = await getUserProfile(userId);
  const updated = { ...profile, ...updates };
  localStorage.setItem(profileKey, JSON.stringify(updated));
  return updated;
}
