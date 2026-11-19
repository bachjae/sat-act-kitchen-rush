import { useState, useEffect, useMemo } from 'react';
import { useGameStore, getActiveOrder } from '@store/gameStore';

interface FryMechanicProps {
  onComplete: (success: boolean) => void;
}

// Items that can be fried
const FRYABLE_ITEMS = ['potato', 'chicken', 'fish', 'sliced-potato'];

export function FryMechanic({ onComplete }: FryMechanicProps) {
  const { setActiveMechanic, addToInventory, removeFromInventory, inventory, advanceOrderStep } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(20);
  const [basketLowered, setBasketLowered] = useState(false);
  const [fryProgress, setFryProgress] = useState(0);
  const [oilTemp, setOilTemp] = useState(50);
  const [gameOver, setGameOver] = useState(false);
  const [onFryer, setOnFryer] = useState<string | null>(null);

  // Find fryable items in inventory
  const fryableItems = useMemo(() =>
    inventory.filter(item => !item.startsWith('fries') && !item.startsWith('fried-') && FRYABLE_ITEMS.some(f => item === f || item.includes(f))),
  [inventory]);

  useEffect(() => {
    if (fryableItems.length > 0 && !onFryer) {
      setOnFryer(fryableItems[0]);
    }
  }, [fryableItems, onFryer]);

  useEffect(() => {
    if (gameOver || !onFryer) return;
    const interval = setInterval(() => {
      setOilTemp(t => Math.max(0, Math.min(100, t + (Math.random() - 0.5) * 4)));
      if (basketLowered) {
        setFryProgress(p => p + (oilTemp >= 70 && oilTemp <= 90 ? 2 : 0.5));
      }
      setTimeLeft(t => {
        if (t <= 0) { setGameOver(true); onComplete(false); return 0; }
        return t - 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [gameOver, onFryer, basketLowered, oilTemp, onComplete]);

  const handleLift = () => {
    if (gameOver) return;
    setGameOver(true);
    const success = fryProgress >= 80 && fryProgress <= 110;
    if (success && onFryer) {
      removeFromInventory(onFryer);
      // Transform: potato/sliced-potato -> fries, others -> fried-X
      const output = onFryer.includes('potato') ? 'fries' : `fried-${onFryer.replace('sliced-', '')}`;
      addToInventory(output);

      // Advance order step
      const activeOrder = getActiveOrder();
      if (activeOrder) {
        advanceOrderStep(activeOrder.id, 'fry');
      }
    }
    onComplete(success);
  };

  const getEmoji = (item: string) => {
    if (item.includes('potato')) return '🥔';
    if (item.includes('chicken')) return '🍗';
    if (item.includes('fish')) return '🐟';
    return '🍟';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-yellow-50 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden relative border-4 border-yellow-500">
        <button onClick={() => setActiveMechanic(null)} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-yellow-800 bg-opacity-20 text-yellow-900 hover:bg-red-500 hover:text-white transition-colors z-10">✕</button>
        <div className="bg-yellow-500 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><span>🍟</span> Fryer Station</h2>
          <div className="bg-yellow-700 px-3 py-1 rounded-full font-mono">{Math.ceil(timeLeft)}s</div>
        </div>
        <div className="p-6 space-y-6">
          {!onFryer ? (
            <div className="text-center py-12">
              <div className="text-yellow-800 font-bold italic opacity-50 mb-4">No item to fry</div>
              <p className="text-sm text-yellow-700">Get potato, chicken, or fish first!</p>
              <button onClick={() => setActiveMechanic(null)} className="mt-4 px-6 py-2 bg-yellow-600 text-white rounded-lg">Leave Station</button>
            </div>
          ) : (
            <>
              <div className="relative h-48 bg-gray-700 rounded-lg border-4 border-gray-600 flex flex-col items-center justify-center overflow-hidden">
                <div className={`absolute inset-0 bg-yellow-500 opacity-30 ${basketLowered ? 'animate-pulse' : ''}`} />
                <div className={`relative transition-transform duration-500 ${basketLowered ? 'translate-y-8' : '-translate-y-12'}`}>
                  <div className="w-24 h-16 border-4 border-gray-400 rounded-b-lg flex items-center justify-center bg-gray-800 bg-opacity-40 text-4xl">{getEmoji(onFryer)}</div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden border">
                <div className={`h-full transition-all ${fryProgress >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min(100, fryProgress)}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setBasketLowered(!basketLowered)} className="py-4 bg-yellow-600 text-white rounded-xl font-black">{basketLowered ? 'RAISE' : 'LOWER'}</button>
                <button onClick={handleLift} disabled={basketLowered && fryProgress < 80} className={`py-4 rounded-xl font-black text-white ${!basketLowered && fryProgress >= 80 ? 'bg-green-500 shadow-lg' : 'bg-gray-400'}`}>SERVE</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
