import { useState, useEffect } from 'react';
import { useGameStore } from '@store/gameStore';

interface GrillMechanicProps {
  onComplete: (success: boolean) => void;
}

export function GrillMechanic({ onComplete }: GrillMechanicProps) {
  const { setActiveMechanic, addToInventory, removeFromInventory, inventory } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(25);
  const [sear, setSear] = useState(0);
  const [smoke, setSmoke] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [onGrill, setOnGrill] = useState<string | null>(null);

  useEffect(() => {
    const grillable = inventory.find(i => i === 'beef' || i === 'chicken' || i === 'fish' || i === 'bacon');
    if (grillable) setOnGrill(grillable);
  }, [inventory]);

  useEffect(() => {
    if (gameOver || !onGrill) return;
    const interval = setInterval(() => {
      if (pressing) { setSear(s => s + 2); setSmoke(sm => Math.min(100, sm + 1.5)); }
      else { setSear(s => s + 0.5); setSmoke(sm => Math.max(0, sm - 1)); }
      if (sear >= 100 || smoke >= 100) { setGameOver(true); onComplete(false); }
      setTimeLeft(t => Math.max(0, t - 0.1));
    }, 100);
    return () => clearInterval(interval);
  }, [gameOver, onGrill, pressing, sear, smoke, onComplete]);

  const handleFinish = () => {
    if (gameOver) return;
    setGameOver(true);
    const success = sear >= 70 && sear < 100 && smoke < 80;
    if (success && onGrill) { removeFromInventory(onGrill); addToInventory(`cooked-${onGrill}`); }
    onComplete(success);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 select-none">
      <div className="bg-red-50 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden relative border-4 border-red-800">
        <button onClick={() => setActiveMechanic(null)} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-red-900 bg-opacity-20 text-red-900 hover:bg-red-500 hover:text-white transition-colors z-10">✕</button>
        <div className="bg-red-800 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><span>🏁</span> Grill Station</h2>
          <div className="bg-red-950 px-3 py-1 rounded-full font-mono">{Math.ceil(timeLeft)}s</div>
        </div>
        <div className="p-6 space-y-6">
          {!onGrill ? <div className="text-center py-12 text-red-900 font-bold opacity-50 uppercase italic">No protein on grill</div> : (
            <>
              <div className="relative h-48 bg-gray-900 rounded border-b-8 border-gray-800 flex items-center justify-center">
                <div className={`text-7xl transition-all ${pressing ? 'scale-y-75 translate-y-2' : ''}`}>🥩</div>
                <div className="absolute inset-0 bg-gray-400 pointer-events-none transition-opacity" style={{ opacity: smoke / 150 }} />
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden border">
                <div className={`h-full transition-all ${sear >= 70 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${sear}%` }} />
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full transition-all ${smoke > 80 ? 'bg-red-600' : 'bg-gray-400'}`} style={{ width: `${smoke}%` }} />
              </div>
              <div className="flex flex-col gap-3">
                <button onMouseDown={() => setPressing(true)} onMouseUp={() => setPressing(false)} onMouseLeave={() => setPressing(false)} className="py-6 bg-red-800 text-white rounded-xl font-black shadow-lg">PRESS</button>
                <button onClick={handleFinish} disabled={sear < 50} className={`py-3 rounded-xl font-bold text-white ${sear >= 70 ? 'bg-green-600 shadow-lg' : 'bg-gray-400'}`}>FINISH</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
