import { useState, useEffect, useMemo } from 'react';
import { useGameStore, getActiveOrder } from '@store/gameStore';

interface PlatingMechanicProps {
  onComplete: (success: boolean) => void;
}

// Map inventory items to plate display
const INVENTORY_TO_PLATE: Record<string, { emoji: string; name: string }> = {
  // Raw items
  'beef': { emoji: '🥩', name: 'Beef' },
  'chicken': { emoji: '🍗', name: 'Chicken' },
  'fish': { emoji: '🐟', name: 'Fish' },
  'lettuce': { emoji: '🥬', name: 'Lettuce' },
  'tomato': { emoji: '🍅', name: 'Tomato' },
  'potato': { emoji: '🥔', name: 'Potato' },
  'cheese': { emoji: '🧀', name: 'Cheese' },
  'bacon': { emoji: '🥓', name: 'Bacon' },
  'eggs': { emoji: '🥚', name: 'Eggs' },
  'pasta': { emoji: '🍝', name: 'Pasta' },
  'bread': { emoji: '🍞', name: 'Bread' },
  'cake-base': { emoji: '🍰', name: 'Cake' },
  // Cooked items
  'cooked-beef': { emoji: '🍔', name: 'Burger Patty' },
  'cooked-chicken': { emoji: '🍗', name: 'Grilled Chicken' },
  'cooked-fish': { emoji: '🐟', name: 'Cooked Fish' },
  'cooked-pasta': { emoji: '🍝', name: 'Cooked Pasta' },
  'cooked-bacon': { emoji: '🥓', name: 'Crispy Bacon' },
  'cooked-eggs': { emoji: '🍳', name: 'Fried Eggs' },
  // Baked items
  'baked-fish': { emoji: '🐟', name: 'Baked Fish' },
  'baked-bread': { emoji: '🍞', name: 'Toast' },
  'toasted-bread': { emoji: '🍞', name: 'Toast' },
  // Sliced items
  'sliced-lettuce': { emoji: '🥬', name: 'Chopped Lettuce' },
  'sliced-tomato': { emoji: '🍅', name: 'Sliced Tomato' },
  'sliced-cheese': { emoji: '🧀', name: 'Sliced Cheese' },
  'sliced-potato': { emoji: '🥔', name: 'Sliced Potato' },
  'sliced-bacon': { emoji: '🥓', name: 'Chopped Bacon' },
  // Other
  'fries': { emoji: '🍟', name: 'Fries' },
  'full-drink': { emoji: '🥤', name: 'Drink' },
  'finished-dessert': { emoji: '🍰', name: 'Dessert' },
  'grilled-beef': { emoji: '🍔', name: 'Grilled Patty' },
  'grilled-chicken': { emoji: '🍗', name: 'Grilled Chicken' },
};

function getIngredientInfo(item: string): { emoji: string; name: string } {
  // Check exact match first
  if (INVENTORY_TO_PLATE[item]) {
    return INVENTORY_TO_PLATE[item];
  }

  // Check partial matches
  for (const [key, value] of Object.entries(INVENTORY_TO_PLATE)) {
    if (item.includes(key) || key.includes(item)) {
      return value;
    }
  }

  // Default fallback
  return { emoji: '🍽️', name: item };
}

export function PlatingMechanic({ onComplete }: PlatingMechanicProps) {
  const { setActiveMechanic, inventory, advanceOrderStep, activeRecipe } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [placedItems, setPlacedItems] = useState<Array<{ id: string; emoji: string; position: { x: number; y: number } }>>([]);

  // Get plating tasks from recipe
  const platingTasks = useMemo(() => {
    if (!activeRecipe) return [];
    return activeRecipe.ingredients
      .filter(ing => ing.station === 'plating')
      .map(ing => ing.name);
  }, [activeRecipe]);

  // Build plateable items from inventory
  const plateableItems = useMemo(() => {
    return inventory.map((item, idx) => {
      const info = getIngredientInfo(item);
      return {
        id: `${item}-${idx}`,
        inventoryItem: item,
        emoji: info.emoji,
        name: info.name,
      };
    });
  }, [inventory]);

  // Track unplaced items
  const unplacedItems = useMemo(() => {
    const placedIds = new Set(placedItems.map(p => p.id));
    return plateableItems.filter(item => !placedIds.has(item.id));
  }, [plateableItems, placedItems]);

  const allPlaced = unplacedItems.length === 0 && plateableItems.length > 0;

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          clearInterval(timer);
          const success = placedItems.length >= Math.min(plateableItems.length, 2);
          if (success) {
            const activeOrder = getActiveOrder();
            if (activeOrder) {
              advanceOrderStep(activeOrder.id, 'plating');
            }
          }
          onComplete(success);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, placedItems, plateableItems, onComplete, advanceOrderStep]);

  const handlePlateClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameOver || !selectedItem) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const item = plateableItems.find(i => i.id === selectedItem);
    if (item) {
      setPlacedItems(prev => [...prev, { id: item.id, emoji: item.emoji, position: { x, y } }]);
    }
    setSelectedItem(null);

    // Check if all items are placed
    if (placedItems.length + 1 >= plateableItems.length && plateableItems.length > 0) {
      setGameOver(true);
      const activeOrder = getActiveOrder();
      if (activeOrder) {
        advanceOrderStep(activeOrder.id, 'plating');
      }
      setTimeout(() => onComplete(true), 500);
    }
  };

  const handleComplete = () => {
    const activeOrder = getActiveOrder();
    if (activeOrder) {
      advanceOrderStep(activeOrder.id, 'plating');
    }
    setActiveMechanic(null);
    onComplete(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-orange-50 rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden relative border-4 border-orange-600">
        <button
          onClick={() => setActiveMechanic(null)}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-orange-800 bg-opacity-20 text-orange-900 hover:bg-red-500 hover:text-white transition-colors z-10"
        >
          ✕
        </button>

        {/* Header */}
        <div className="bg-orange-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>🍽️</span> Plating Station
          </h2>
          <div className={`px-3 py-1 rounded-full font-mono ${timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-orange-800'}`}>
            {timeLeft}s
          </div>
        </div>

        {/* Plating tasks from recipe */}
        {platingTasks.length > 0 && (
          <div className="px-6 py-3 bg-orange-100 border-b border-orange-200">
            <p className="text-orange-800 font-bold text-xs uppercase tracking-widest mb-2">Tasks:</p>
            <div className="flex flex-wrap gap-2">
              {platingTasks.map((task, idx) => (
                <span key={idx} className="px-2 py-1 bg-white text-orange-800 rounded text-sm font-medium border border-orange-300">
                  {task}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="p-6">
          {plateableItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📦</div>
              <p className="text-orange-700 font-bold mb-2">No items to plate!</p>
              <p className="text-sm text-orange-600 mb-4">Complete the previous stations first.</p>
              <button
                onClick={() => setActiveMechanic(null)}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold"
              >
                Go Back
              </button>
            </div>
          ) : (
            <>
              <p className="text-center text-orange-700 mb-4 text-sm">
                {selectedItem ? 'Click on the plate to place the item!' : 'Select an item below, then click the plate'}
              </p>

              {/* The plate */}
              <div
                onClick={handlePlateClick}
                className={`relative mx-auto w-64 h-64 rounded-full bg-white border-8 border-gray-200 shadow-inner cursor-crosshair transition-all ${
                  selectedItem ? 'ring-4 ring-orange-300 animate-pulse' : ''
                }`}
              >
                {/* Placed items */}
                {placedItems.map(item => (
                  <div
                    key={item.id}
                    className="absolute text-3xl transform -translate-x-1/2 -translate-y-1/2 transition-all"
                    style={{ left: `${item.position.x}%`, top: `${item.position.y}%` }}
                  >
                    {item.emoji}
                  </div>
                ))}
                {/* Center decoration */}
                {placedItems.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-200 text-6xl opacity-30">
                    🍽️
                  </div>
                )}
              </div>

              {/* Items to plate */}
              <div className="mt-6">
                <p className="text-xs text-orange-700 font-bold uppercase tracking-widest mb-2 text-center">
                  Your Ingredients ({placedItems.length}/{plateableItems.length} placed)
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {plateableItems.map(item => {
                    const isPlaced = placedItems.some(p => p.id === item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => !isPlaced && !gameOver && setSelectedItem(item.id)}
                        disabled={gameOver || isPlaced}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center min-w-[60px] ${
                          isPlaced
                            ? 'opacity-30 grayscale border-gray-200'
                            : selectedItem === item.id
                            ? 'bg-orange-200 border-orange-500 scale-110 shadow-lg'
                            : 'bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                        title={item.name}
                      >
                        <span className="text-2xl">{item.emoji}</span>
                        <span className="text-[10px] text-gray-600 mt-1">{item.name.slice(0, 8)}</span>
                        {isPlaced && <span className="text-green-500 text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-3 bg-orange-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(placedItems.length / Math.max(plateableItems.length, 1)) * 100}%` }}
                />
              </div>

              {/* Complete button */}
              {(allPlaced || placedItems.length >= 2) && (
                <button
                  onClick={handleComplete}
                  className="mt-4 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold"
                >
                  ✅ Complete Plating
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
