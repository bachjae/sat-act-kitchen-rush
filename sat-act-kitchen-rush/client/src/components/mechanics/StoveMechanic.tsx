import { useState, useEffect } from 'react';
import { useGameStore } from '@store/gameStore';

interface StoveMechanicProps {
  onComplete: (success: boolean) => void;
}

export function StoveMechanic({ onComplete }: StoveMechanicProps) {
  const { setActiveMechanic, addToInventory, removeFromInventory, inventory } = useGameStore();
  const [heat, setHeat] = useState(20);
  const [progress, setProgress] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isAddingHeat, setIsAddingHeat] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [onPan, setOnPan] = useState<string | null>(null);

  const PERFECT_HEAT_MIN = 65;
  const PERFECT_HEAT_MAX = 85;

  useEffect(() => {
    const rawItem = inventory.find(i => i === 'beef' || i === 'chicken' || i === 'fish' || i.startsWith('sliced-'));
    if (rawItem) setOnPan(rawItem);
  }, [inventory]);

  useEffect(() => {
    if (gameOver || !onPan) return;
    const interval = setInterval(() => {
      setHeat(h => {
        const next = Math.max(0, Math.min(100, h + (isAddingHeat ? 3 : -1.5)));
        if (next >= 100) { setGameOver(true); onComplete(false); }
        return next;
      });
      if (heat >= PERFECT_HEAT_MIN && heat <= PERFECT_HEAT_MAX) {
        setProgress(p => {
          const next = p + ((p >= 50 && !flipped) ? 0.2 : 1);
          if (next >= 100) {
            setGameOver(true);
            if (flipped) {
              removeFromInventory(onPan);
              addToInventory(`cooked-${onPan}`);
              setTimeout(() => onComplete(true), 500);
            } else { onComplete(false); }
          }
          return next;
        });
      }
      setTimeLeft(t => {
        if (t <= 0) { setGameOver(true); onComplete(false); return 0; }
        return t - 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [heat, isAddingHeat, gameOver, onPan, flipped, onComplete, removeFromInventory, addToInventory]);

  const handleFlip = () => { if (progress >= 40 && progress <= 60) setFlipped(true); };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 select-none">
      <div className="bg-red-50 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden relative border-4 border-red-600">
        <button onClick={() => setActiveMechanic(null)} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-red-800 bg-opacity-20 text-red-900 hover:bg-red-500 hover:text-white transition-colors z-10">✕</button>
        <div className="bg-red-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><span>🔥</span> Stove Station</h2>
          <div className="bg-red-800 px-3 py-1 rounded-full font-mono">{Math.ceil(timeLeft)}s</div>
        </div>
        <div className="p-6 space-y-6">
          {!onPan ? <div className="text-center py-12 text-red-800 font-bold uppercase italic opacity-50">No ingredient on pan</div> : (
            <>
              <div className="relative h-40 bg-gray-800 rounded-full border-8 border-gray-700 flex items-center justify-center">
                <div className="text-6xl transition-transform duration-300" style={{ transform: flipped ? 'rotateX(180deg)' : '' }}>🥘</div>
                {isAddingHeat && <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse rounded-full" />}
              </div>
              <div className="h-6 bg-gray-200 rounded-full relative overflow-hidden border-2 border-gray-300">
                <div className="absolute h-full bg-green-400 opacity-50" style={{ left: `${PERFECT_HEAT_MIN}%`, width: `${PERFECT_HEAT_MAX - PERFECT_HEAT_MIN}%` }} />
                <div className={`h-full transition-all duration-100 ${heat > PERFECT_HEAT_MAX ? 'bg-red-500' : heat < PERFECT_HEAT_MIN ? 'bg-blue-400' : 'bg-green-500'}`} style={{ width: `${heat}%` }} />
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onMouseDown={() => setIsAddingHeat(true)} onMouseUp={() => setIsAddingHeat(false)} onMouseLeave={() => setIsAddingHeat(false)} className="py-4 bg-red-600 text-white rounded-xl font-black shadow-lg active:scale-95 transition-all">HEAT</button>
                <button onClick={handleFlip} disabled={flipped || progress < 40 || progress > 65} className={`py-4 rounded-xl font-black text-white transition-all ${!flipped && progress >= 40 && progress <= 60 ? 'bg-blue-600 animate-bounce shadow-lg' : 'bg-gray-400'}`}>FLIP</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
