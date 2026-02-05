import { useGameStore } from '@store/gameStore';

export function RecipeTicketModal() {
  const { activeRecipe, dismissRecipe, currentStepIndex } = useGameStore();

  console.log('🎫 RecipeTicketModal render:', {
    hasRecipe: !!activeRecipe,
    recipeName: activeRecipe?.name,
    currentStep: currentStepIndex,
  });

  if (!activeRecipe) {
    return null;
  }

  const stations = activeRecipe.stations;
  const currentStation = stations[currentStepIndex] || 'Complete!';
  const progress = Math.min((currentStepIndex / stations.length) * 100, 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-amber-50 border-4 border-amber-800 rounded-xl shadow-2xl max-w-md w-full mx-4 transform rotate-1">
        {/* Ticket Header - looks like a paper ticket */}
        <div className="bg-amber-800 text-amber-50 px-6 py-3 rounded-t-lg">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono">ORDER #{activeRecipe.id.slice(-3)}</span>
            <span className="text-xs font-mono">{activeRecipe.estimatedTime}s</span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6">
          {/* Dish Name */}
          <h2 className="text-2xl font-bold text-amber-900 text-center mb-2">
            {activeRecipe.name}
          </h2>
          <p className="text-amber-700 text-center text-sm mb-4">
            {activeRecipe.description}
          </p>

          {/* Difficulty Stars */}
          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-xl ${star <= activeRecipe.difficulty ? 'text-amber-500' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
          </div>

          {/* Ingredients List */}
          <div className="bg-white rounded-lg p-4 mb-4 border border-amber-200">
            <h3 className="font-bold text-amber-800 mb-2">Ingredients:</h3>
            <ul className="space-y-1">
              {activeRecipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center text-sm">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    getStationColor(ing.station)
                  }`} />
                  <span className="text-gray-700">{ing.name}</span>
                  <span className="text-gray-400 text-xs ml-auto">({ing.station})</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Station Flow */}
          <div className="mb-4">
            <h3 className="font-bold text-amber-800 mb-2">Station Flow:</h3>
            <div className="flex items-center justify-center space-x-2">
              {stations.map((station, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      i < currentStepIndex
                        ? 'bg-green-500 text-white'
                        : i === currentStepIndex
                        ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {station.toUpperCase()}
                  </div>
                  {i < stations.length - 1 && (
                    <span className="text-amber-400 mx-1">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-amber-700 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Instruction */}
          <div className="bg-amber-100 rounded-lg p-3 text-center">
            <p className="text-sm text-amber-700">
              {currentStepIndex < stations.length ? (
                <>
                  <span className="font-bold">Next:</span> Go to the{' '}
                  <span className="font-bold text-amber-900">{currentStation.toUpperCase()}</span>{' '}
                  station
                </>
              ) : (
                <span className="font-bold text-green-600">
                  All steps complete! Head to SERVING!
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6">
          <button
            onClick={dismissRecipe}
            className="w-full py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-lg transition-all shadow-md"
          >
            Got it! Let's Cook!
          </button>
        </div>

        {/* Decorative torn edge */}
        <div className="h-3 bg-amber-50 relative overflow-hidden rounded-b-xl">
          <div className="absolute inset-x-0 top-0 flex justify-around">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-white rounded-full -mt-1.5" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStationColor(station: string): string {
  const colors: Record<string, string> = {
    fridge: 'bg-teal-400',
    prep: 'bg-green-400',
    stove: 'bg-red-400',
    plating: 'bg-orange-400',
    serving: 'bg-blue-400',
    ticket: 'bg-yellow-400',
  };
  return colors[station] || 'bg-gray-400';
}
