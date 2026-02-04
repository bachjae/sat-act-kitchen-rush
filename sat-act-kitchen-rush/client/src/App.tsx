import { useState, useEffect } from 'react';
import { Kitchen } from '@components/game/Kitchen';
import { MainMenu } from '@components/ui/MainMenu';
import { AuthModal } from '@components/ui/AuthModal';
import { useNavigationStore } from '@store/navigationStore';
import type { User } from '@app-types/user.types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const screen = useNavigationStore(state => state.screen);

  useEffect(() => {
    const savedUser = localStorage.getItem('mock-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser) as User);
    }
    setLoading(false);
  }, []);

  if (loading) return null;
  if (!user) return <AuthModal onLogin={setUser} />;

  return (
    <>
      {screen === 'main-menu' && <MainMenu />}
      {(screen === 'playing' || screen === 'recap') && <Kitchen />}
    </>
  );
}

export default App
