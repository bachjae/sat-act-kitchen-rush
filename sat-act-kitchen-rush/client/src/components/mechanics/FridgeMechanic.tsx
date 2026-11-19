import { useState, useEffect, useMemo } from 'react';
import { useGameStore, getActiveOrder } from '@store/gameStore';

interface FridgeMechanicProps {
  onComplete: (success: boolean) => void;
}

const ALL_INGREDIENTS = [
  { id: 'lettuce', name: 'Lettuce', emoji: '🥬', color: 'bg-green-400' },
  { id: 'tomato', name: 'Tomato', emoji: '🍅', color: 'bg-red-400' },
  { id: 'cheese', name: 'Cheese', emoji: '🧀', color: 'bg-yellow-400' },
  { id: 'beef', name: 'Beef Patty', emoji: '🥩', color: 'bg-red-600' },
  { id: 'chicken', name: 'Chicken', emoji: '🍗', color: 'bg-orange-300' },
  { id: 'fish', name: 'Fish Fillets', emoji: '🐟', color: 'bg-blue-300' },
  { id: 'eggs', name: 'Eggs', emoji: '🥚', color: 'bg-amber-100' },
  { id: 'pasta', name: 'Pasta', emoji: '🍝', color: 'bg-yellow-200' },
  { id: 'bacon', name: 'Bacon', emoji: '🥓', color: 'bg-red-300' },
  { id: 'potato', name: 'Potato', emoji: '🥔', color: 'bg-amber-200' },
  { id: 'bread', name: 'Bread', emoji: '🍞', color: 'bg-amber-300' },
  { id: 'cake-base', name: 'Cake Base', emoji: '🍰', color: 'bg-pink-200' },
];

// Helper to normalize ingredient names for comparison
function normalizeIngredientName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Helper to find matching ingredient from ALL_INGREDIENTS
function findIngredientMatch(name: string): typeof ALL_INGREDIENTS[0] | undefined {
  const normalized = normalizeIngredientName(name);
  return ALL_INGREDIENTS.find(ing => {
    const ingNormalized = normalizeIngredientName(ing.name);
    const ingIdNormalized = normalizeIngredientName(ing.id);
    return ingNormalized === normalized ||
           ingIdNormalized === normalized ||
           normalized.includes(ingNormalized) ||
           ingNormalized.includes(normalized);
  });
}

export function FridgeMechanic({ onComplete }: FridgeMechanicProps) {
  const { setActiveMechanic, addToInventory, advanceOrderStep, inventory, activeRecipe } = useGameStore();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(25);
  const [gameOver, setGameOver] = useState(false);

  // Get required ingredients from fridge based on active recipe
  const requiredIngredients = useMemo(() => {
    if (!activeRecipe) return [];

    // Get all ingredients that need to come from the fridge
    return activeRecipe.ingredients
      .filter(ing => ing.station === 'fridge')
      .map(ing => {
        const match = findIngredientMatch(ing.name);
        return match ? match.id : normalizeIngredientName(ing.name);
      });
  }, [activeRecipe]);

  // Check which required items are already in inventory
  const alreadyCollected = useMemo(() => {
    return requiredIngredients.filter(reqId =>
      inventory.some(invItem => {
        const invNorm = normalizeIngredientName(invItem);
        return invNorm === reqId || invNorm.includes(reqId) || reqId.includes(invNorm);
      })
    );
  }, [requiredIngredients, inventory]);

  // Items still needed
  const stillNeeded = useMemo(() => {
    return requiredIngredients.filter(id => !alreadyCollected.includes(id));
  }, [requiredIngredients, alreadyCollected]);

  // All fridge items already collected?
  const allItemsCollected = stillNeeded.length === 0 && requiredIngredients.length > 0;

  // Get display ingredients (required + some distractors)
  const displayIngredients = useMemo(() => {
    const neededItems = ALL_INGREDIENTS.filter(ing => stillNeeded.includes(ing.id));

    // Add distractors that aren't needed
    const distractors = ALL_INGREDIENTS
      .filter(ing => !requiredIngredients.includes(ing.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.max(3, 6 - neededItems.length));

    // Combine and shuffle
    return [...neededItems, ...distractors].sort(() => Math.random() - 0.5);
  }, [stillNeeded, requiredIngredients]);

  useEffect(() => {
    if (gameOver || allItemsCollected) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver, allItemsCollected]);

  const toggleIngredient = (id: string) => {
    if (gameOver) return;
    setSelectedIngredients(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    // Check if all required items are selected (and no extras)
    const hasAllRequired = stillNeeded.every(r => selectedIngredients.includes(r));
    const noExtras = selectedIngredients.every(s => stillNeeded.includes(s));
    const correct = hasAllRequired && noExtras;

    if (correct || selectedIngredients.length > 0) {
      // Add selected items to inventory
      selectedIngredients.forEach(ing => addToInventory(ing));

      // Advance order step for fridge if correct
      if (correct) {
        const activeOrder = getActiveOrder();
        if (activeOrder) {
          advanceOrderStep(activeOrder.id, 'fridge');
        }
      }
    }

    setGameOver(true);
    onComplete(correct);
  };

  const handleClose = () => {
    setActiveMechanic(null);
  };

  const handleContinue = () => {
    // Advance order step since fridge is complete
    const activeOrder = getActiveOrder();
    if (activeOrder) {
      advanceOrderStep(activeOrder.id, 'fridge');
    }
    handleClose();
    onComplete(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-teal-50 rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-teal-800 bg-opacity-20 text-teal-900 hover:bg-red-500 hover:text-white transition-colors z-10"
        >
          ✕
        </button>

        {/* Header */}
        <div className="bg-teal-600 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>🧊</span> Fridge Station
            </h2>
            <div className={`px-3 py-1 rounded-full font-mono text-lg ${
              timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-teal-700'
            }`}>
              {timeLeft}s
            </div>
          </div>
        </div>

        {/* Required ingredients display */}
        <div className="px-6 py-4 bg-teal-100 border-b border-teal-200">
          <p className="text-teal-800 font-bold text-xs uppercase tracking-widest mb-2">
            Grab These Ingredients:
          </p>
          <div className="flex flex-wrap gap-2">
            {requiredIngredients.map(id => {
              const ing = ALL_INGREDIENTS.find(i => i.id === id);
              const isCollected = alreadyCollected.includes(id);
              const isSelected = selectedIngredients.includes(id);
              return (
                <span
                  key={id}
                  className={`px-2 py-1 rounded text-sm font-medium flex items-center gap-1 ${
                    isCollected ? 'bg-green-500 text-white' :
                    isSelected ? 'bg-blue-500 text-white' :
                    'bg-white text-teal-800 border border-teal-300'
                  }`}
                >
                  {isCollected && '✓ '}
                  {ing?.emoji || '❓'} {ing?.name || id}
                </span>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {allItemsCollected ? (
            <div className="text-center py-8 text-teal-700">
              <div className="text-5xl mb-4">✅</div>
              <p className="text-lg font-bold mb-2">All fridge items collected!</p>
              <p className="text-sm mb-4">Move to the next station.</p>
              <button
                onClick={handleContinue}
                className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-bold"
              >
                Continue
              </button>
            </div>
          ) : (
            <>
              <p className="text-center text-teal-700 mb-4 text-sm">
                Select the ingredients shown above:
              </p>
              <div className="grid grid-cols-3 gap-3">
                {displayIngredients.map(ingredient => (
                  <button
                    key={ingredient.id}
                    onClick={() => toggleIngredient(ingredient.id)}
                    disabled={gameOver}
                    className={`p-4 rounded-lg border-2 transition-all transform ${
                      selectedIngredients.includes(ingredient.id)
                        ? 'border-teal-500 bg-teal-100 scale-105 ring-2 ring-teal-300'
                        : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50'
                    } ${gameOver ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="text-3xl mb-1">{ingredient.emoji}</div>
                    <div className="text-xs font-medium text-gray-700">{ingredient.name}</div>
                    {selectedIngredients.includes(ingredient.id) && (
                      <div className="text-teal-600 text-xs mt-1">✓</div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Submit button */}
        {!allItemsCollected && (
          <div className="px-6 pb-6">
            <button
              onClick={handleSubmit}
              disabled={gameOver || selectedIngredients.length === 0}
              className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
                gameOver
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-teal-500 hover:bg-teal-600 text-white'
              }`}
            >
              {gameOver ? "Time's Up!" : `Grab ${selectedIngredients.length} Item(s)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
