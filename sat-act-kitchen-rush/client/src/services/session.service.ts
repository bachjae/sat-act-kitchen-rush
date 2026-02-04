export async function saveSession(sessionData: {
  userId: string;
  score: number;
  stats: any;
  coinsEarned: number;
}) {
  const sessions = JSON.parse(localStorage.getItem('sessions') || '[]') as any[];
  const newSession = {
    ...sessionData,
    id: 'sess-' + Date.now(),
    createdAt: new Date().toISOString()
  };
  sessions.push(newSession);
  localStorage.setItem('sessions', JSON.stringify(sessions));
  console.log('✅ Session saved locally:', newSession.id);
  return newSession.id;
}

export async function getSessions() {
  return JSON.parse(localStorage.getItem('sessions') || '[]');
}
