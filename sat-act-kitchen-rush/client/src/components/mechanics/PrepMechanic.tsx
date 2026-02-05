import { useState, useEffect, useCallback } from 'react';

interface PrepMechanicProps {
  onComplete: (success: boolean) => void;
}

export function PrepMechanic({ onComplete }: PrepMechanicProps) {
  const [chops, setChops] = useState(0);
  const [targetChops] = useState(() => Math.floor(Math.random() * 5) + 8); // 8-12 chops
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [knife, setKnife] = useState({ x: 50, chopping: false });

  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          clearInterval(timer);
          onComplete(chops >= targetChops);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, chops, targetChops, onComplete]);

  const handleChop = useCallback(() => {
    if (gameOver) return;

    setKnife(k => ({ ...k, chopping: true }));
    setChops(c => {
      const newChops = c + 1;
      if (newChops >= targetChops) {
        setGameOver(true);
        setTimeout(() => onComplete(true), 300);
      }
      return newChops;
    });

    // Reset animation
    setTimeout(() => {
      setKnife(k => ({ ...k, chopping: false }));
    }, 100);
  }, [gameOver, targetChops, onComplete]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleChop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleChop]);

  const progress = Math.min((chops / targetChops) * 100, 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-green-50 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>🔪</span> Prep Station
            </h2>
            <div className={`px-3 py-1 rounded-full font-mono text-lg ${
              timeLeft <= 3 ? 'bg-red-500 animate-pulse' : 'bg-green-700'
            }`}>
              {timeLeft}s
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-6 py-3 bg-green-100 border-b border-green-200">
          <p className="text-green-800 font-medium text-center">
            Click or press SPACE to chop! Get {targetChops} chops!
          </p>
        </div>

        {/* Chopping Area */}
        <div className="p-6">
          <div className="relative h-48 bg-amber-100 rounded-xl border-4 border-amber-300 overflow-hidden">
            {/* Cutting Board */}
            <div className="absolute inset-4 bg-amber-200 rounded-lg border-2 border-amber-400 flex items-center justify-center">
              {/* Vegetable */}
              <div className="text-6xl">🥬</div>

              {/* Chop marks */}
              <div className="absolute inset-0 flex items-center justify-center">
                {Array.from({ length: Math.min(chops, 12) }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-16 bg-amber-600 opacity-30"
                    style={{
                      left: `${20 + (i * 5)}%`,
                      transform: 'rotate(-5deg)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Knife */}
            <div
              className={`absolute text-5xl transition-transform duration-75 ${
                knife.chopping ? 'translate-y-4' : '-translate-y-2'
              }`}
              style={{
                left: '50%',
                top: '20%',
                transform: `translateX(-50%) rotate(-45deg) ${knife.chopping ? 'translateY(1rem)' : ''}`,
              }}
            >
              🔪
            </div>
          </div>

          {/* Click Area */}
          <button
            onClick={handleChop}
            disabled={gameOver}
            className={`
              w-full mt-4 py-6 rounded-xl font-bold text-xl transition-all
              ${gameOver
                ? 'bg-gray-300 text-gray-500'
                : 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white active:scale-95'
              }
            `}
          >
            {gameOver
              ? chops >= targetChops ? '✅ Perfect Chop!' : '❌ Not Enough!'
              : `CHOP! (${chops}/${targetChops})`
            }
          </button>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-4 bg-green-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  progress >= 100 ? 'bg-green-500' : 'bg-green-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
