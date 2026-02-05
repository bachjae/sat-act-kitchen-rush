import { useState, useEffect } from 'react';
import { useGameStore } from '@store/gameStore';

interface DrinkMechanicProps {
  onComplete: (success: boolean) => void;
}

export function DrinkMechanic({ onComplete }: DrinkMechanicProps) {
  const { setActiveMechanic, addToInventory } = useGameStore();
  const [fill, setFill] = useState(0);
  const [pouring, setPouring] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      if (pouring) {
        setFill(f => {
          const next = f + 2;
          if (next >= 100) { setGameOver(true); onComplete(false); }
          return next;
        });
      }
      setTimeLeft(t => {
        if (t <= 0) { setGameOver(true); onComplete(false); return 0; }
        return t - 0.1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [gameOver, pouring, onComplete]);

  const handleFinish = () => {
    if (gameOver) return;
    setGameOver(true);
    const success = fill >= 85 && fill <= 95;
    if (success) { addToInventory('full-drink'); }
    onComplete(success);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 select-none">
      <div className="bg-blue-50 rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden relative border-4 border-blue-500">
        <button onClick={() => setActiveMechanic(null)} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-blue-800 bg-opacity-20 text-blue-900 hover:bg-red-500 hover:text-white transition-colors z-10">✕</button>
        <div className="bg-blue-500 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><span>🥤</span> Drink Station</h2>
          <div className="bg-blue-700 px-3 py-1 rounded-full font-mono">{Math.ceil(timeLeft)}s</div>
        </div>
        <div className="p-6 flex flex-col items-center space-y-8">
          <div className="relative w-32 h-48 bg-white border-x-4 border-b-4 border-blue-200 rounded-b-xl overflow-hidden shadow-inner">
            <div className="absolute bottom-0 left-0 right-0 bg-amber-900 transition-all" style={{ height: `${fill}%` }} />
            <div className="absolute left-0 right-0 border-t-4 border-dashed border-red-500 opacity-50" style={{ bottom: '90%' }} />
          </div>
          <div className="w-full space-y-4">
            <button onMouseDown={() => setPouring(true)} onMouseUp={() => setPouring(false)} onMouseLeave={() => setPouring(false)} className="w-full py-6 bg-blue-600 text-white rounded-xl font-black text-xl shadow-lg">POUR</button>
            <button onClick={handleFinish} disabled={fill < 50} className={`w-full py-3 rounded-xl font-bold text-white ${fill >= 85 ? 'bg-green-500 shadow-lg' : 'bg-gray-400'}`}>SERVE</button>
          </div>
        </div>
      </div>
    </div>
  );
}
