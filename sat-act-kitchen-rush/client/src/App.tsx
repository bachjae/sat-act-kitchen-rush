import { Kitchen } from '@components/game/Kitchen';
import { MainMenuView } from '@components/ui/MainMenuView';
import { ModeSelectView } from '@components/ui/ModeSelectView';
import { SkillSelectView } from '@components/ui/SkillSelectView';
import { useGameStore } from '@store/gameStore';

function App() {
  const { view } = useGameStore();

  return (
    <div className="w-full h-screen overflow-hidden">
      {view === 'main-menu' && <MainMenuView />}
      {view === 'mode-select' && <ModeSelectView />}
      {view === 'skill-select' && <SkillSelectView />}
      {(view === 'playing' || view === 'recap') && <Kitchen />}
      {view === 'settings' && (
        <div className="min-h-screen bg-kitchen-navy flex items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-8">SETTINGS</h1>
            <button
              onClick={() => useGameStore.getState().setView('main-menu')}
              className="px-8 py-3 bg-kitchen-teal text-kitchen-navy font-bold rounded-xl"
            >
              BACK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App
