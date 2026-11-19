import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useGameStore, getActiveOrder } from '@store/gameStore';

interface PrepMechanicProps {
  onComplete: (success: boolean) => void;
}

// Items that can be prepped (chopped/sliced)
const PREPPABLE_ITEMS = ['lettuce', 'tomato', 'beef', 'cheese', 'potato', 'fish', 'chicken', 'bacon', 'bread'];

export function PrepMechanic({ onComplete }: PrepMechanicProps) {
  const { inventory, addToInventory, removeFromInventory, setActiveMechanic, advanceOrderStep, activeRecipe } = useGameStore();
  const [chops, setChops] = useState(0);
  const [targetChops] = useState(8);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [knife, setKnife] = useState({ chopping: false });
  const [onBoard, setOnBoard] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [processedCount, setProcessedCount] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);

  // Get prep tasks from the active recipe
  const prepTasks = useMemo(() => {
    if (!activeRecipe) return [];
    return activeRecipe.ingredients
      .filter(ing => ing.station === 'prep')
      .map(ing => ing.name);
  }, [activeRecipe]);

  // Filter inventory to show only items that can be prepped (not already sliced)
  const preppableInventory = useMemo(() =>
    inventory.filter(item => {
      // Don't show already sliced/cooked items
      if (item.startsWith('sliced-') || item.startsWith('cooked-') || item.startsWith('prepped-')) return false;
      // Check if item is preppable
      return PREPPABLE_ITEMS.some(p => item.includes(p));
    }),
  [inventory]);

  // Check if all prep work is done (used for button text logic)
  void (preppableInventory.length === 0 && processedCount > 0); // allPrepDone check inline

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          onComplete(processedCount > 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, onComplete, processedCount]);

  const handleChop = useCallback(() => {
    if (gameOver || !onBoard) return;
    setKnife({ chopping: true });
    setChops(c => {
      const newChops = c + 1;
      if (newChops >= targetChops) {
        // Item is done being chopped
        removeFromInventory(onBoard);
        addToInventory(`sliced-${onBoard}`);
        setProcessedCount(p => p + 1);
        setOnBoard(null);
        setChops(0);

        // Check if there are more items to prep
        const remainingItems = inventory.filter(item =>
          !item.startsWith('sliced-') &&
          !item.startsWith('cooked-') &&
          !item.startsWith('prepped-') &&
          item !== onBoard &&
          PREPPABLE_ITEMS.some(p => item.includes(p))
        );

        if (remainingItems.length === 0) {
          // All items prepped, complete the station
          setGameOver(true);
          const activeOrder = getActiveOrder();
          if (activeOrder) {
            advanceOrderStep(activeOrder.id, 'prep');
          }
          setTimeout(() => onComplete(true), 500);
        }
        return 0;
      }
      return newChops;
    });
    setTimeout(() => setKnife({ chopping: false }), 100);
  }, [gameOver, onBoard, targetChops, onComplete, removeFromInventory, addToInventory, inventory, advanceOrderStep]);

  const handleMouseDown = (item: string, e: React.MouseEvent) => {
    setDragItem(item);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragItem) setMousePos({ x: e.clientX, y: e.clientY });
  };

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
    if (item.includes('potato')) return '🥔';
    if (item.includes('fish')) return '🐟';
    if (item.includes('chicken')) return '🍗';
    if (item.includes('bacon')) return '🥓';
    if (item.includes('pasta')) return '🍝';
    if (item.includes('bread')) return '🍞';
    if (item.includes('eggs')) return '🥚';
    return '🥕';
  };

  // Allow leaving station with "Continue" button
  const handleLeaveStation = () => {
    if (processedCount > 0) {
      const activeOrder = getActiveOrder();
      if (activeOrder) {
        advanceOrderStep(activeOrder.id, 'prep');
      }
      onComplete(true);
    } else {
      onComplete(false);
    }
    setActiveMechanic(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 select-none" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div className="bg-green-50 rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden relative border-4 border-green-600">
        <button
          onClick={() => setActiveMechanic(null)}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-green-800 bg-opacity-20 text-green-900 hover:bg-red-500 hover:text-white transition-colors z-10"
        >
          ✕
        </button>

        {/* Header */}
        <div className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>🔪</span> Prep Station
          </h2>
          <div className={`px-3 py-1 rounded-full font-mono text-lg ${timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-green-700'}`}>
            {timeLeft}s
          </div>
        </div>

        {/* Prep tasks from recipe */}
        {prepTasks.length > 0 && (
          <div className="px-6 py-3 bg-green-100 border-b border-green-200">
            <p className="text-green-800 font-bold text-xs uppercase tracking-widest mb-2">Tasks to Complete:</p>
            <div className="flex flex-wrap gap-2">
              {prepTasks.map((task, idx) => (
                <span key={idx} className="px-2 py-1 bg-white text-green-800 rounded text-sm font-medium border border-green-300">
                  {task}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex">
          {/* Ingredients sidebar */}
          <div className="w-40 bg-green-100 p-4 border-r border-green-200 min-h-[300px]">
            <h3 className="text-[10px] font-bold text-green-800 mb-3 uppercase tracking-widest">Your Ingredients</h3>
            {preppableInventory.length === 0 ? (
              <div className="text-center py-4 text-green-600 text-xs">
                {processedCount > 0 ? (
                  <div>
                    <div className="text-2xl mb-2">✅</div>
                    <div>All done!</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl mb-2">📦</div>
                    <div>No items to prep</div>
                    <div className="text-[10px] mt-1 text-green-500">Get ingredients from fridge first!</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {preppableInventory.map((item, idx) => (
                  <div
                    key={idx}
                    onMouseDown={(e) => handleMouseDown(item, e)}
                    className="w-12 h-12 bg-white rounded-lg shadow flex flex-col items-center justify-center text-2xl cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                    title={item}
                  >
                    {getEmoji(item)}
                    <span className="text-[8px] text-gray-500 truncate w-full text-center">{item.slice(0, 6)}</span>
                  </div>
                ))}
              </div>
            )}
            {processedCount > 0 && (
              <div className="mt-4 text-xs text-green-700 text-center bg-green-200 rounded py-1">
                Prepped: {processedCount} item(s)
              </div>
            )}
          </div>

          {/* Cutting board area */}
          <div className="flex-1 p-6">
            <p className="text-green-800 font-medium text-center mb-4">
              {!onBoard ? 'Drag an ingredient to the board!' : 'Click rapidly to chop!'}
            </p>

            <div
              ref={boardRef}
              onClick={handleChop}
              className={`relative h-48 bg-amber-100 rounded-xl border-4 transition-colors ${
                onBoard ? 'border-amber-400 cursor-pointer hover:bg-amber-50' : 'border-dashed border-green-300'
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {onBoard ? (
                  <div className="relative">
                    <div className={`text-7xl transition-transform ${knife.chopping ? 'scale-95' : ''}`}>
                      {getEmoji(onBoard)}
                    </div>
                    {/* Chop marks */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {Array.from({ length: chops }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-20 bg-black opacity-20"
                          style={{ left: `${20 + (i * 10)}%`, transform: 'rotate(15deg)' }}
                        />
                      ))}
                    </div>
                    {/* Progress bar for chopping */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40">
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${(chops / targetChops) * 100}%` }}
                        />
                      </div>
                      <div className="text-center text-xs text-green-700 mt-1">
                        {chops}/{targetChops} chops
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-green-300 font-black text-2xl opacity-20 uppercase italic">
                    Cutting Board
                  </div>
                )}
              </div>
              {onBoard && (
                <div
                  className={`absolute text-5xl transition-transform duration-75 pointer-events-none ${
                    knife.chopping ? 'translate-y-8 rotate-0' : '-translate-y-4 -rotate-45'
                  }`}
                  style={{ left: '50%', top: '0', transform: `translateX(-50%)` }}
                >
                  🔪
                </div>
              )}
            </div>

            {/* Leave station button */}
            {(preppableInventory.length === 0 || processedCount > 0) && !onBoard && (
              <button
                onClick={handleLeaveStation}
                className="mt-8 w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"
              >
                {preppableInventory.length === 0
                  ? processedCount > 0
                    ? '✅ Done - Continue to Next Station'
                    : 'Leave Station'
                  : 'Continue / Leave'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dragging item */}
      {dragItem && (
        <div
          className="fixed pointer-events-none text-4xl z-[100] transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: mousePos.x, top: mousePos.y }}
        >
          {getEmoji(dragItem)}
        </div>
      )}
    </div>
  );
}
