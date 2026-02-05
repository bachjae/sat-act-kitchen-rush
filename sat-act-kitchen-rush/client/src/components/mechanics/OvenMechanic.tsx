import { useState, useEffect } from 'react';
import { useGameStore } from '@store/gameStore';

interface OvenMechanicProps {
  onComplete: (success: boolean) => void;
}

export function OvenMechanic({ onComplete }: OvenMechanicProps) {
  const { setActiveMechanic, addToInventory, removeFromInventory, inventory } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(25);
  const [timerSet, setTimerSet] = useState<number>(10);
  const [ovenActive, setOvenActive] = useState(false);
  const [bakeProgress, setBakeProgress] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [onOven, setOnOven] = useState<string | null>(null);

  useEffect(() => {
    const bakeable = inventory.find(i => i === 'bread' || i === 'pasta' || i === 'cake-base' || i === 'fish');
    if (bakeable) setOnOven(bakeable);
  }, [inventory]);

  useEffect(() => {
    if (gameOver || !onOven || !ovenActive) return;
    const interval = setInterval(() => {
      setBakeProgress(p => {
        const next = p + 0.8;
        if (next >= 120) { setGameOver(true); onComplete(false); }
        return next;
      });
      setTimeLeft(t => Math.max(0, t - 0.1));
    }, 100);
    return () => clearInterval(interval);
  }, [gameOver, onOven, ovenActive, onComplete]);

  const handleOpen = () => {
    if (!ovenActive) return;
    setGameOver(true);
    const success = bakeProgress >= 85 && bakeProgress <= 105;
    if (success && onOven) {
      removeFromInventory(onOven);
      const output = onOven === 'bread' ? 'toasted-bread' : (onOven === 'cake-base' ? 'cake' : `cooked-${onOven}`);
      addToInventory(output);
    }
    onComplete(success);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 select-none">
      <div className="bg-orange-50 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden relative border-4 border-orange-600">
        <button onClick={() => setActiveMechanic(null)} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-orange-800 bg-opacity-20 text-orange-900 hover:bg-red-500 hover:text-white transition-colors z-10">✕</button>
        <div className="bg-orange-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><span>⏲️</span> Oven Station</h2>
          <div className="bg-orange-800 px-3 py-1 rounded-full font-mono">{Math.ceil(timeLeft)}s</div>
        </div>
        <div className="p-6 space-y-6">
          {!onOven ? <div className="text-center py-12 text-orange-800 font-bold opacity-50 uppercase italic">Need dough or pasta</div> : (
            <>
              <div className="relative h-48 bg-gray-800 rounded-lg border-8 border-gray-700 flex items-center justify-center overflow-hidden">
                <div className={`absolute inset-0 bg-orange-500 transition-opacity duration-1000 ${ovenActive ? 'opacity-20' : 'opacity-0'}`} />
                <div className={`text-6xl ${ovenActive ? 'animate-pulse' : ''}`}>🍞</div>
              </div>
              <div className="space-y-4">
                <button onClick={() => setOvenActive(true)} disabled={ovenActive} className={`w-full py-3 rounded-lg font-black text-white ${ovenActive ? 'bg-gray-400' : 'bg-green-600 shadow-lg'}`}>START BAKE</button>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden border">
                  <div className={`h-full transition-all ${bakeProgress >= 85 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(100, bakeProgress)}%` }} />
                </div>
                <button onClick={handleOpen} disabled={!ovenActive} className={`w-full py-4 rounded-xl font-black text-white ${ovenActive ? 'bg-orange-500 shadow-lg' : 'bg-gray-400'}`}>OPEN & REMOVE</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
