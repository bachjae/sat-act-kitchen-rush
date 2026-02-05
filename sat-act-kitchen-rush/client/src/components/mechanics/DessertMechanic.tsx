import { useState, useEffect } from 'react';
import { useGameStore } from '@store/gameStore';

interface DessertMechanicProps {
  onComplete: (success: boolean) => void;
}

export function DessertMechanic({ onComplete }: DessertMechanicProps) {
  const { setActiveMechanic, addToInventory, removeFromInventory } = useGameStore();
  const [layers, setLayers] = useState<string[]>([]);
  const [targetLayers] = useState(['cake', 'cream', 'berry']);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0) { setGameOver(true); onComplete(false); return 0; }
        return t - 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [gameOver, onComplete]);

  const addLayer = (type: string) => {
    if (gameOver) return;
    const newLayers = [...layers, type];
    setLayers(newLayers);
    if (newLayers.length === targetLayers.length) {
      const success = newLayers.every((l, i) => l === targetLayers[i]);
      setGameOver(true);
      if (success) { removeFromInventory('cake'); addToInventory('finished-dessert'); }
      onComplete(success);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 select-none">
      <div className="bg-pink-50 rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden relative border-4 border-pink-400">
        <button onClick={() => setActiveMechanic(null)} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-pink-800 bg-opacity-20 text-pink-900 hover:bg-red-500 hover:text-white transition-colors z-10">✕</button>
        <div className="bg-pink-400 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><span>🍰</span> Dessert Assembly</h2>
          <div className="bg-pink-600 px-3 py-1 rounded-full font-mono">{Math.ceil(timeLeft)}s</div>
        </div>
        <div className="p-6 flex flex-col items-center space-y-8">
          <div className="relative w-48 h-48 bg-white rounded-full border-4 border-pink-200 flex flex-col-reverse items-center p-4">
            {layers.map((l, i) => <div key={i} className="text-6xl -mb-4 animate-bounce" style={{ zIndex: i }}>{l === 'cake' ? '🍰' : l === 'cream' ? '☁️' : '🍓'}</div>)}
          </div>
          <div className="grid grid-cols-3 gap-3 w-full">
            {['cake', 'cream', 'berry'].map(type => (
              <button key={type} onClick={() => addLayer(type)} className="flex flex-col items-center p-3 bg-white border-2 border-pink-200 rounded-xl hover:border-pink-400">
                <span className="text-3xl">{type === 'cake' ? '🍰' : type === 'cream' ? '☁️' : '🍓'}</span>
                <span className="text-[10px] font-bold uppercase mt-1">{type}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
