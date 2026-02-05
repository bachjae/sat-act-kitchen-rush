import { useGameStore } from '@store/gameStore';

export function MainMenuView() {
  const { setView } = useGameStore();

  return (
    <div className="min-h-screen bg-kitchen-navy flex flex-col items-center justify-center p-4 text-white">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter italic">
            KITCHEN <span className="text-kitchen-red text-7xl">RUSH</span>
          </h1>
          <p className="text-kitchen-teal font-bold uppercase tracking-widest text-sm">
            SAT / ACT Edition
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-8">
          <button
            onClick={() => setView('mode-select')}
            className="group relative bg-kitchen-red hover:bg-red-500 text-white py-6 rounded-2xl font-black text-2xl transition-all hover:scale-105 shadow-[0_8px_0_rgb(153,27,27)] active:shadow-none active:translate-y-2"
          >
            PLAY NOW
          </button>

          <button
            disabled
            className="group relative bg-blue-600 opacity-50 cursor-not-allowed text-white py-4 rounded-2xl font-bold text-xl shadow-[0_6px_0_rgb(30,58,138)]"
          >
            MULTIPLAYER (COMING SOON)
          </button>

          <button
            onClick={() => setView('settings')}
            className="group relative bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-2xl font-bold text-xl transition-all shadow-[0_6px_0_rgb(31,41,55)] active:shadow-none active:translate-y-1.5"
          >
            SETTINGS
          </button>
        </div>

        <div className="pt-12 text-gray-400 text-sm font-medium">
          MASTER YOUR SKILLS. BECOME THE TOP CHEF.
        </div>
      </div>
    </div>
  );
}
