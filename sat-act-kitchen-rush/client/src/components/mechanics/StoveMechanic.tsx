import { useState, useEffect, useCallback } from 'react';

interface StoveMechanicProps {
  onComplete: (success: boolean) => void;
}

type CookingState = 'raw' | 'cooking' | 'perfect' | 'burnt';

export function StoveMechanic({ onComplete }: StoveMechanicProps) {
  const [cookingProgress, setCookingProgress] = useState(0);
  const [cookingState, setCookingState] = useState<CookingState>('raw');
  const [isHeating, setIsHeating] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);

  // Cooking zones: 0-30 raw, 30-70 cooking, 70-90 perfect, 90+ burnt
  const PERFECT_MIN = 70;
  const PERFECT_MAX = 90;

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      if (isHeating) {
        setCookingProgress(prev => {
          const next = Math.min(prev + 2, 100);

          // Update cooking state
          if (next < 30) setCookingState('raw');
          else if (next < 70) setCookingState('cooking');
          else if (next < 90) setCookingState('perfect');
          else {
            setCookingState('burnt');
            // Auto fail if burnt
            setGameOver(true);
            setResult('fail');
            onComplete(false);
          }

          return next;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isHeating, gameOver, onComplete]);

  const handleServe = useCallback(() => {
    if (gameOver) return;

    setGameOver(true);
    const success = cookingProgress >= PERFECT_MIN && cookingProgress <= PERFECT_MAX;
    setResult(success ? 'success' : 'fail');
    onComplete(success);
  }, [gameOver, cookingProgress, onComplete]);

  const getProgressColor = () => {
    if (cookingProgress < 30) return 'bg-blue-400';
    if (cookingProgress < 70) return 'bg-yellow-400';
    if (cookingProgress < 90) return 'bg-green-500';
    return 'bg-red-600';
  };

  const getStateEmoji = () => {
    switch (cookingState) {
      case 'raw': return '🥶';
      case 'cooking': return '🍳';
      case 'perfect': return '✨';
      case 'burnt': return '🔥';
    }
  };

  const getFoodEmoji = () => {
    if (cookingProgress < 30) return '🥩'; // Raw
    if (cookingProgress < 70) return '🍖'; // Cooking
    if (cookingProgress < 90) return '🥘'; // Perfect
    return '💨'; // Burnt/smoke
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-red-50 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>🔥</span> Stove Station
            </h2>
            <div className="text-2xl">{getStateEmoji()}</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-6 py-3 bg-red-100 border-b border-red-200">
          <p className="text-red-800 font-medium text-center">
            Hold to cook! Release in the GREEN zone!
          </p>
        </div>

        {/* Cooking Area */}
        <div className="p-6">
          {/* Stove Visual */}
          <div className="relative h-40 bg-gray-800 rounded-xl mb-4 flex items-center justify-center">
            {/* Burner glow */}
            <div className={`absolute inset-4 rounded-full transition-all duration-300 ${
              isHeating
                ? 'bg-gradient-radial from-orange-500 via-red-600 to-transparent animate-pulse'
                : 'bg-gray-700'
            }`} />

            {/* Pan */}
            <div className="relative z-10 text-6xl">
              {getFoodEmoji()}
            </div>

            {/* Steam/smoke when cooking */}
            {isHeating && cookingProgress > 30 && (
              <div className="absolute top-2 text-2xl animate-bounce">
                {cookingProgress > 85 ? '💨' : '♨️'}
              </div>
            )}
          </div>

          {/* Temperature Gauge */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1 font-medium">
              <span className="text-blue-500">RAW</span>
              <span className="text-yellow-500">COOKING</span>
              <span className="text-green-500">PERFECT</span>
              <span className="text-red-500">BURNT</span>
            </div>
            <div className="h-8 bg-gradient-to-r from-blue-300 via-yellow-300 via-green-400 to-red-500 rounded-full relative overflow-hidden">
              {/* Perfect zone indicator */}
              <div
                className="absolute top-0 bottom-0 border-2 border-white bg-green-400 bg-opacity-30"
                style={{ left: '70%', width: '20%' }}
              />

              {/* Progress indicator */}
              <div
                className="absolute top-0 bottom-0 w-2 bg-white border-2 border-gray-800 rounded-full transition-all duration-100"
                style={{ left: `${cookingProgress}%`, transform: 'translateX(-50%)' }}
              />
            </div>
            <div className="text-center mt-2 text-lg font-bold text-gray-700">
              {Math.round(cookingProgress)}% Cooked
            </div>
          </div>

          {/* Control Buttons */}
          <div className="space-y-3">
            <button
              onMouseDown={() => !gameOver && setIsHeating(true)}
              onMouseUp={() => setIsHeating(false)}
              onMouseLeave={() => setIsHeating(false)}
              onTouchStart={() => !gameOver && setIsHeating(true)}
              onTouchEnd={() => setIsHeating(false)}
              disabled={gameOver}
              className={`
                w-full py-6 rounded-xl font-bold text-xl transition-all select-none
                ${gameOver
                  ? 'bg-gray-300 text-gray-500'
                  : isHeating
                    ? 'bg-orange-600 text-white scale-95'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }
              `}
            >
              {gameOver
                ? result === 'success' ? '✅ Perfectly Cooked!' : '❌ Cooking Failed!'
                : isHeating ? '🔥 COOKING...' : 'HOLD TO COOK'
              }
            </button>

            {!gameOver && cookingProgress >= 30 && (
              <button
                onClick={handleServe}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg transition-all
                  ${cookingState === 'perfect'
                    ? 'bg-green-500 hover:bg-green-600 text-white animate-pulse'
                    : 'bg-gray-400 hover:bg-gray-500 text-white'
                  }
                `}
              >
                🍽️ SERVE NOW
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
