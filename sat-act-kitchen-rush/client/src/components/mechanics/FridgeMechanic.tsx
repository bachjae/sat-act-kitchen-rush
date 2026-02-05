import { useState, useEffect } from 'react';
import { useGameStore } from '@store/gameStore';

interface FridgeMechanicProps {
  onComplete: (success: boolean) => void;
  requiredIngredients?: string[];
}

const AVAILABLE_INGREDIENTS = [
  { id: 'lettuce', name: 'Lettuce', emoji: '🥬', color: 'bg-green-400' },
  { id: 'tomato', name: 'Tomato', emoji: '🍅', color: 'bg-red-400' },
  { id: 'cheese', name: 'Cheese', emoji: '🧀', color: 'bg-yellow-400' },
  { id: 'beef', name: 'Beef Patty', emoji: '🥩', color: 'bg-red-600' },
  { id: 'chicken', name: 'Chicken', emoji: '🍗', color: 'bg-orange-300' },
  { id: 'fish', name: 'Fish', emoji: '🐟', color: 'bg-blue-300' },
  { id: 'eggs', name: 'Eggs', emoji: '🥚', color: 'bg-amber-100' },
  { id: 'pasta', name: 'Pasta', emoji: '🍝', color: 'bg-yellow-200' },
  { id: 'bacon', name: 'Bacon', emoji: '🥓', color: 'bg-red-300' },
];

export function FridgeMechanic({ onComplete, requiredIngredients }: FridgeMechanicProps) {
  const { setActiveMechanic, addToInventory } = useGameStore();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameOver, setGameOver] = useState(false);

  const [required] = useState(() => {
    if (requiredIngredients && requiredIngredients.length > 0) {
      return requiredIngredients;
    }
    const shuffled = [...AVAILABLE_INGREDIENTS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map(i => i.id);
  });

  useEffect(() => {
    if (gameOver) return;
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
  }, [gameOver]);

  const toggleIngredient = (id: string) => {
    if (gameOver) return;
    setSelectedIngredients(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    const correct = required.every(r => selectedIngredients.includes(r)) && selectedIngredients.length === required.length;
    if (correct) { selectedIngredients.forEach(ing => addToInventory(ing)); }
    setGameOver(true);
    onComplete(correct);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-teal-50 rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden relative">
        <button onClick={() => setActiveMechanic(null)} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-teal-800 bg-opacity-20 text-teal-900 hover:bg-red-500 hover:text-white transition-colors z-10">✕</button>
        <div className="bg-teal-600 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2"><span>🧊</span> Fridge Station</h2>
            <div className={`px-3 py-1 rounded-full font-mono text-lg ${timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-teal-700'}`}>{timeLeft}s</div>
          </div>
        </div>
        <div className="px-6 py-4 bg-teal-100 border-b border-teal-200">
          <p className="text-teal-800 font-medium text-xs uppercase tracking-widest mb-2">Required Ingredients:</p>
          <div className="flex flex-wrap gap-2">
            {required.map(id => {
              const ing = AVAILABLE_INGREDIENTS.find(i => i.id === id);
              return <span key={id} className={`px-2 py-1 rounded text-sm font-medium ${selectedIngredients.includes(id) ? 'bg-green-500 text-white' : 'bg-white text-teal-800'}`}>{ing?.emoji} {ing?.name}</span>;
            })}
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-3">
            {AVAILABLE_INGREDIENTS.map(ingredient => (
              <button key={ingredient.id} onClick={() => toggleIngredient(ingredient.id)} disabled={gameOver} className={`p-4 rounded-lg border-2 transition-all transform ${selectedIngredients.includes(ingredient.id) ? 'border-teal-500 bg-teal-100 scale-105 ring-2 ring-teal-300' : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50'} ${gameOver ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <div className="text-3xl mb-1">{ingredient.emoji}</div>
                <div className="text-xs font-medium text-gray-700">{ingredient.name}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="px-6 pb-6">
          <button onClick={handleSubmit} disabled={gameOver || selectedIngredients.length === 0} className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${gameOver ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600 text-white'}`}>
            {gameOver ? "Time's Up!" : `Grab Items`}
          </button>
        </div>
      </div>
    </div>
  );
}
