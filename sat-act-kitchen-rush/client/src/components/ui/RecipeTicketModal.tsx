import { useGameStore } from '@store/gameStore';

// Emoji mapping for ingredients
const INGREDIENT_EMOJI: Record<string, string> = {
  'lettuce': '🥬',
  'tomato': '🍅',
  'cheese': '🧀',
  'beef': '🥩',
  'chicken': '🍗',
  'fish': '🐟',
  'eggs': '🥚',
  'pasta': '🍝',
  'bacon': '🥓',
  'potato': '🥔',
  'bread': '🍞',
  'cake-base': '🍰',
};

function getIngredientEmoji(ingredientId: string): string {
  const id = ingredientId.toLowerCase().replace(/\s+/g, '-');
  return INGREDIENT_EMOJI[id] || '🍴';
}

export function RecipeTicketModal() {
  const { activeRecipe, dismissRecipe, orders, inventory } = useGameStore();

  // Get active order
  const activeOrder = orders.find(o => o.status === 'in_progress');

  // Don't show if no active order or recipe
  if (!activeOrder || !activeRecipe) {
    return null;
  }

  const completedSteps = activeOrder.steps.filter(s => s.status === 'completed').length;
  const totalSteps = activeOrder.steps.length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  // Check which ingredients player has collected
  const checkIngredientCollected = (ingredientName: string): boolean => {
    const normalizedName = ingredientName.toLowerCase().replace(/\s+/g, '-');
    return inventory.some(item => {
      const normalizedItem = item.toLowerCase().replace(/\s+/g, '-');
      return normalizedItem === normalizedName ||
             normalizedItem.includes(normalizedName) ||
             normalizedName.includes(normalizedItem);
    });
  };

  return (
    <div className="fixed top-4 right-4 z-40 w-72">
      <div className="bg-amber-50 border-4 border-amber-900 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-amber-900 text-amber-50 px-4 py-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono opacity-75">ORDER #{activeOrder.id.slice(-4)}</span>
              <h2 className="text-lg font-bold leading-tight">{activeRecipe.name}</h2>
            </div>
            <button
              onClick={dismissRecipe}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-amber-800 hover:bg-red-500 text-white transition-colors text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Timer Bar */}
        <div className={`px-4 py-2 flex items-center justify-between ${
          activeOrder.timeRemaining < 30 ? 'bg-red-500 animate-pulse' : 'bg-amber-700'
        }`}>
          <span className="text-white text-xs font-bold">TIME LEFT</span>
          <span className="text-white font-mono font-bold text-lg">
            {Math.floor(activeOrder.timeRemaining / 60)}:{String(Math.floor(activeOrder.timeRemaining % 60)).padStart(2, '0')}
          </span>
        </div>

        <div className="p-4 space-y-4">
          {/* Ingredients Section with Checkmarks */}
          <div>
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-2 flex items-center gap-1">
              <span>📦</span> Ingredients Needed
            </h3>
            <div className="bg-white rounded-lg border-2 border-amber-200 p-3 space-y-2">
              {activeRecipe.ingredients.map((ing, i) => {
                const hasIngredient = checkIngredientCollected(ing.name);
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`text-lg ${hasIngredient ? 'text-green-500' : 'text-gray-300'}`}>
                      {hasIngredient ? '✅' : '⬜'}
                    </span>
                    <span className="text-lg">{getIngredientEmoji(ing.name)}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium block truncate ${
                        hasIngredient ? 'line-through text-gray-400' : 'text-gray-800'
                      }`}>
                        {ing.name}
                      </span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      ing.station === 'fridge' ? 'bg-teal-100 text-teal-700' :
                      ing.station === 'prep' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {ing.station}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Station Progress */}
          <div>
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-2 flex items-center gap-1">
              <span>🏪</span> Station Progress
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {activeOrder.steps
                .filter(s => s.stationType !== 'ticket')
                .map((step, idx) => (
                  <span
                    key={idx}
                    className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase transition-all ${
                      step.status === 'completed'
                        ? 'bg-green-500 text-white'
                        : step.status === 'active'
                        ? 'bg-blue-500 text-white ring-2 ring-blue-300 animate-pulse'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.stationType === 'serving' ? '🍽️' : ''} {step.stationType}
                  </span>
                ))
              }
            </div>
          </div>

          {/* Next Instruction */}
          <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-3 text-center">
            {(() => {
              const activeStep = activeOrder.steps.find(s => s.status === 'active');
              if (!activeStep) {
                return <p className="text-green-700 font-bold">All stations complete!</p>;
              }
              return (
                <p className="text-amber-900">
                  <span className="text-xs block mb-1">NEXT STATION:</span>
                  <span className="text-lg font-bold uppercase">{activeStep.stationType}</span>
                </p>
              );
            })()}
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-[10px] text-amber-700 mb-1">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Decorative torn edge */}
        <div className="h-3 bg-amber-50 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 flex justify-around">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-amber-100 rounded-full -mt-1" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
