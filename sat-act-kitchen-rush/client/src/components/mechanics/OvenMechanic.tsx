import { useState, useEffect, useMemo } from 'react';
import { useGameStore, getActiveOrder } from '@store/gameStore';

interface OvenMechanicProps {
  onComplete: (success: boolean) => void;
}

// Items that can be baked
const BAKEABLE_ITEMS = ['bread', 'cake-base', 'fish', 'sliced-fish'];

export function OvenMechanic({ onComplete }: OvenMechanicProps) {
  const { setActiveMechanic, addToInventory, removeFromInventory, inventory, advanceOrderStep } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(25);
  const [ovenActive, setOvenActive] = useState(false);
  const [bakeProgress, setBakeProgress] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [onOven, setOnOven] = useState<string | null>(null);

  // Find bakeable items in inventory
  const bakeableItems = useMemo(() =>
    inventory.filter(item => !item.startsWith('cooked-') && !item.startsWith('toasted-') && BAKEABLE_ITEMS.some(b => item === b || item.includes(b))),
  [inventory]);

  useEffect(() => {
    if (bakeableItems.length > 0 && !onOven) {
      setOnOven(bakeableItems[0]);
    }
  }, [bakeableItems, onOven]);

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
      // Transform based on item type
      const output = onOven === 'bread' ? 'toasted-bread'
        : onOven === 'cake-base' ? 'cake'
        : onOven.startsWith('sliced-') ? `baked-${onOven.replace('sliced-', '')}`
        : `baked-${onOven}`;
      addToInventory(output);

      // Advance order step
      const activeOrder = getActiveOrder();
      if (activeOrder) {
        advanceOrderStep(activeOrder.id, 'oven');
      }
    }
    onComplete(success);
  };

  const getEmoji = (item: string) => {
    if (item.includes('bread')) return '🍞';
    if (item.includes('cake')) return '🎂';
    if (item.includes('fish')) return '🐟';
    return '🥧';
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
          {!onOven ? (
            <div className="text-center py-12">
              <div className="text-orange-800 font-bold opacity-50 uppercase italic mb-4">No item to bake</div>
              <p className="text-sm text-orange-700">Get bread, cake base, or fish first!</p>
              <button onClick={() => setActiveMechanic(null)} className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg">Leave Station</button>
            </div>
          ) : (
            <>
              <div className="relative h-48 bg-gray-800 rounded-lg border-8 border-gray-700 flex items-center justify-center overflow-hidden">
                <div className={`absolute inset-0 bg-orange-500 transition-opacity duration-1000 ${ovenActive ? 'opacity-20' : 'opacity-0'}`} />
                <div className={`text-6xl ${ovenActive ? 'animate-pulse' : ''}`}>{getEmoji(onOven)}</div>
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
