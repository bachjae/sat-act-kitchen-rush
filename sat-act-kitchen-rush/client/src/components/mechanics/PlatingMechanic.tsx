import { useState, useEffect } from 'react';
import { useGameStore } from '@store/gameStore';

interface PlatingMechanicProps {
  onComplete: (success: boolean) => void;
}

interface PlateItem {
  id: string;
  emoji: string;
  name: string;
  placed: boolean;
  position: { x: number; y: number } | null;
}

export function PlatingMechanic({ onComplete }: PlatingMechanicProps) {
  const { setActiveMechanic } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [items, setItems] = useState<PlateItem[]>([
    { id: 'protein', emoji: '🥩', name: 'Protein', placed: false, position: null },
    { id: 'veggie1', emoji: '🥦', name: 'Vegetables', placed: false, position: null },
    { id: 'starch', emoji: '🍚', name: 'Starch', placed: false, position: null },
    { id: 'garnish', emoji: '🌿', name: 'Garnish', placed: false, position: null },
    { id: 'sauce', emoji: '🫗', name: 'Sauce', placed: false, position: null },
  ]);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setGameOver(true); clearInterval(timer); onComplete(items.filter(i => i.placed).length >= 4); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, items, onComplete]);

  const handlePlateClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameOver || !selectedItem) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newItems = items.map(item => item.id === selectedItem ? { ...item, placed: true, position: { x, y } } : item);
    setItems(newItems);
    setSelectedItem(null);
    if (newItems.every(i => i.placed)) { setGameOver(true); onComplete(true); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-orange-50 rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden relative border-4 border-orange-600">
        <button onClick={() => setActiveMechanic(null)} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-orange-800 bg-opacity-20 text-orange-900 hover:bg-red-500 hover:text-white transition-colors z-10">✕</button>
        <div className="bg-orange-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><span>🍽️</span> Plating Station</h2>
          <div className="bg-orange-800 px-3 py-1 rounded-full font-mono">{timeLeft}s</div>
        </div>
        <div className="p-6">
          <div onClick={handlePlateClick} className={`relative mx-auto w-64 h-64 rounded-full bg-white border-8 border-gray-200 shadow-inner cursor-crosshair transition-all ${selectedItem ? 'ring-4 ring-orange-300' : ''}`}>
            {items.filter(i => i.placed && i.position).map(item => (
              <div key={item.id} className="absolute text-3xl transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${item.position!.x}%`, top: `${item.position!.y}%` }}>{item.emoji}</div>
            ))}
          </div>
          <div className="mt-6 flex justify-center gap-3">
            {items.map(item => (
              <button key={item.id} onClick={() => !item.placed && setSelectedItem(item.id)} disabled={gameOver || item.placed} className={`p-3 rounded-lg border-2 transition-all ${item.placed ? 'opacity-20 grayscale' : selectedItem === item.id ? 'bg-orange-200 border-orange-500 scale-110' : 'bg-white'}`}>{item.emoji}</button>
            ))}
          </div>
          <div className="mt-4 h-3 bg-orange-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${(items.filter(i => i.placed).length / items.length) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
