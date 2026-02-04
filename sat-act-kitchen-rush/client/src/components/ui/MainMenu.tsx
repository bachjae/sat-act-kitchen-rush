import { useState } from 'react';
import { useNavigationStore } from '@store/navigationStore';
import type { SessionType } from '@store/navigationStore';
import { useGameStore } from '@store/gameStore';
import { SettingsModal } from './SettingsModal';

export function MainMenu() {
  const { startSession } = useNavigationStore();
  const { resetGame } = useGameStore();
  const [showSessionSelect, setShowSessionSelect] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleStartSolo = () => {
    setShowSessionSelect(true);
  };

  const handleSelectSession = (type: SessionType) => {
    resetGame();
    // Set timer based on session type
    const timeMap: Record<string, number> = {
      quick: 600, // 10 min
      standard: 1800, // 30 min
      practice: 999999, // Infinite-ish
    };
    useGameStore.setState({ sessionTimeRemaining: timeMap[type || 'quick'] });
    startSession(type);
  };

  return (
    <div className="fixed inset-0 bg-navy flex items-center justify-center p-4">
      {/* Background decoration - simplified kitchen theme */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="grid grid-cols-12 gap-4 rotate-12 scale-150">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="w-20 h-20 bg-white rounded-lg" />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-lg bg-cream rounded-3xl shadow-2xl p-8 border-8 border-blue-400">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-navy leading-tight mb-2 tracking-tighter">
            SAT/ACT<br />KITCHEN RUSH
          </h1>
          <p className="text-blue-600 font-bold uppercase tracking-widest text-sm">Master your tests, one dish at a time</p>
        </div>

        <div className="space-y-4">
          <MenuButton
            onClick={handleStartSolo}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            START SOLO SESSION
          </MenuButton>

          <MenuButton
            disabled
            className="bg-gray-400 text-gray-200 cursor-not-allowed relative"
          >
            MULTIPLAYER
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-navy text-[10px] font-black px-2 py-1 rounded-full border-2 border-navy">
              COMING SOON
            </span>
          </MenuButton>

          <MenuButton
            onClick={() => setShowSettings(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            SETTINGS
          </MenuButton>

          <MenuButton
            onClick={() => alert('How to play: Complete orders by answering SAT/ACT questions at each kitchen station!')}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            HOW TO PLAY
          </MenuButton>
        </div>

        <div className="mt-10 text-center text-xs text-gray-400 font-mono">
          v1.0.0 • Developed for Google Jules Prompt
        </div>
      </div>

      {/* Session Type Selector Modal */}
      {showSessionSelect && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full border-4 border-navy shadow-2xl">
            <h2 className="text-3xl font-black text-navy mb-6 text-center">SELECT SESSION</h2>
            <div className="space-y-4">
              <SessionOption
                title="Quick Service"
                desc="10 minute sprint. Great for a quick review."
                color="border-green-400 hover:bg-green-50"
                onClick={() => handleSelectSession('quick')}
              />
              <SessionOption
                title="Standard Session"
                desc="30 minute deep dive. The full experience."
                color="border-blue-400 hover:bg-blue-50"
                onClick={() => handleSelectSession('standard')}
              />
              <SessionOption
                title="Practice Mode"
                desc="Untimed. Infinite orders until you close shop."
                color="border-yellow-400 hover:bg-yellow-50"
                onClick={() => handleSelectSession('practice')}
              />
            </div>
            <button
              onClick={() => setShowSessionSelect(false)}
              className="mt-6 w-full text-gray-500 font-bold hover:text-navy transition-colors"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

interface MenuButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

function MenuButton({ children, onClick, className, disabled = false }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-5 rounded-2xl font-black text-2xl shadow-[0_6px_0_0_rgba(0,0,0,0.2)]
        active:shadow-none active:translate-y-1 transition-all duration-75
        ${className ?? ''}
      `}
    >
      {children}
    </button>
  );
}

interface SessionOptionProps {
  title: string;
  desc: string;
  color: string;
  onClick: () => void;
}

function SessionOption({ title, desc, color, onClick }: SessionOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-4 rounded-xl transition-colors ${color}`}
    >
      <div className="font-black text-xl text-navy">{title}</div>
      <div className="text-sm text-gray-600 leading-tight">{desc}</div>
    </button>
  );
}
