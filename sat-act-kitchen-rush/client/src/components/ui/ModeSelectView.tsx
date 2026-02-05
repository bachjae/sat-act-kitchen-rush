import { useGameStore } from '@store/gameStore';

export function ModeSelectView() {
  const { setView, setGameMode } = useGameStore();

  const handleSelect = (mode: 'session' | 'zen') => {
    setGameMode(mode);
    setView('skill-select');
  };

  return (
    <div className="min-h-screen bg-kitchen-navy flex flex-col items-center justify-center p-4 text-white">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h2 className="text-4xl font-black italic text-kitchen-teal">SELECT GAME MODE</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          <button
            onClick={() => handleSelect('session')}
            className="flex flex-col items-center p-8 bg-white text-kitchen-navy rounded-3xl transition-all hover:scale-105 shadow-[0_10px_0_rgb(168,218,220)] active:translate-y-2 active:shadow-none"
          >
            <div className="text-6xl mb-4">⏱️</div>
            <h3 className="text-2xl font-black mb-2">SESSION</h3>
            <p className="text-gray-600 font-medium">30 minutes of high-intensity cooking and practice.</p>
          </button>

          <button
            onClick={() => handleSelect('zen')}
            className="flex flex-col items-center p-8 bg-white text-kitchen-navy rounded-3xl transition-all hover:scale-105 shadow-[0_10px_0_rgb(168,218,220)] active:translate-y-2 active:shadow-none"
          >
            <div className="text-6xl mb-4">🧘</div>
            <h3 className="text-2xl font-black mb-2">ZEN</h3>
            <p className="text-gray-600 font-medium">No timer. Practice at your own pace. Maximum focus.</p>
          </button>
        </div>

        <button
          onClick={() => setView('main-menu')}
          className="mt-12 text-kitchen-teal font-bold hover:underline"
        >
          BACK TO MENU
        </button>
      </div>
    </div>
  );
}
