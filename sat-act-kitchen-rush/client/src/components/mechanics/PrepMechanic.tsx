import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@store/gameStore';

interface PrepMechanicProps {
  onComplete: (success: boolean) => void;
}

export function PrepMechanic({ onComplete }: PrepMechanicProps) {
  const { inventory, addToInventory, removeFromInventory, setActiveMechanic } = useGameStore();
  const [chops, setChops] = useState(0);
  const [targetChops] = useState(8);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [knife, setKnife] = useState({ chopping: false });
  const [onBoard, setOnBoard] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          onComplete(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, onComplete]);

  const handleChop = useCallback(() => {
    if (gameOver || !onBoard) return;
    setKnife({ chopping: true });
    setChops(c => {
      const newChops = c + 1;
      if (newChops >= targetChops) {
        setGameOver(true);
        removeFromInventory(onBoard);
        addToInventory(`sliced-${onBoard}`);
        setTimeout(() => onComplete(true), 500);
      }
      return newChops;
    });
    setTimeout(() => setKnife({ chopping: false }), 100);
  }, [gameOver, onBoard, targetChops, onComplete, removeFromInventory, addToInventory]);

  const handleMouseDown = (item: string, e: React.MouseEvent) => {
    setDragItem(item);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => { if (dragItem) setMousePos({ x: e.clientX, y: e.clientY }); };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragItem && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        setOnBoard(dragItem);
      }
    }
    setDragItem(null);
  };

  const getEmoji = (item: string) => {
    if (item.includes('lettuce')) return '🥬';
    if (item.includes('tomato')) return '🍅';
    if (item.includes('beef')) return '🥩';
    if (item.includes('cheese')) return '🧀';
    return '🥕';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 select-none" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div className="bg-green-50 rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden relative border-4 border-green-600">
        <button onClick={() => setActiveMechanic(null)} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-green-800 bg-opacity-20 text-green-900 hover:bg-red-500 hover:text-white transition-colors z-10">✕</button>
        <div className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><span>🔪</span> Prep Station</h2>
          <div className={`px-3 py-1 rounded-full font-mono text-lg ${timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-green-700'}`}>{timeLeft}s</div>
        </div>
        <div className="flex">
          <div className="w-40 bg-green-100 p-4 border-r border-green-200 min-h-[300px]">
            <h3 className="text-[10px] font-bold text-green-800 mb-3 uppercase tracking-widest">Ingredients</h3>
            <div className="grid grid-cols-2 gap-2">
              {inventory.filter(i => !i.startsWith('sliced-')).map((item, idx) => (
                <div key={idx} onMouseDown={(e) => handleMouseDown(item, e)} className="w-12 h-12 bg-white rounded-lg shadow flex items-center justify-center text-2xl cursor-grab active:cursor-grabbing hover:scale-105 transition-transform">{getEmoji(item)}</div>
              ))}
            </div>
          </div>
          <div className="flex-1 p-6">
            <p className="text-green-800 font-medium text-center mb-4">{!onBoard ? 'Drag an ingredient to the board!' : 'Click the board to chop!'}</p>
            <div ref={boardRef} onClick={handleChop} className={`relative h-48 bg-amber-100 rounded-xl border-4 transition-colors ${onBoard ? 'border-amber-400 cursor-pointer' : 'border-dashed border-green-300'}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                {onBoard ? (
                  <div className="relative">
                    <div className="text-7xl">{getEmoji(onBoard)}</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {Array.from({ length: chops }).map((_, i) => (
                        <div key={i} className="absolute w-1 h-20 bg-black opacity-20" style={{ left: `${20 + (i * 10)}%`, transform: 'rotate(15deg)' }} />
                      ))}
                    </div>
                  </div>
                ) : <div className="text-green-300 font-black text-2xl opacity-20 uppercase italic">Cutting Board</div>}
              </div>
              {onBoard && <div className={`absolute text-5xl transition-transform duration-75 pointer-events-none ${knife.chopping ? 'translate-y-8 rotate-0' : '-translate-y-4 -rotate-45'}`} style={{ left: '50%', top: '0', transform: `translateX(-50%)` }}>🔪</div>}
            </div>
          </div>
        </div>
      </div>
      {dragItem && <div className="fixed pointer-events-none text-4xl z-[100] transform -translate-x-1/2 -translate-y-1/2" style={{ left: mousePos.x, top: mousePos.y }}>{getEmoji(dragItem)}</div>}
    </div>
  );
}
