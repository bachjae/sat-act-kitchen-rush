import { useState, useEffect } from 'react';

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

  // Target positions (relative to plate)
  const targetPositions = [
    { x: 50, y: 50, name: 'center' },    // Protein goes center
    { x: 25, y: 40, name: 'left' },      // Veggie left
    { x: 75, y: 40, name: 'right' },     // Starch right
    { x: 50, y: 20, name: 'top' },       // Garnish top
    { x: 50, y: 80, name: 'bottom' },    // Sauce bottom
  ];

  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameOver(true);
          clearInterval(timer);
          const placedCount = items.filter(i => i.placed).length;
          onComplete(placedCount >= 4);
          return 0;
        }
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

    setItems(prev => prev.map(item =>
      item.id === selectedItem
        ? { ...item, placed: true, position: { x, y } }
        : item
    ));
    setSelectedItem(null);

    // Check if all items placed
    const newItems = items.map(item =>
      item.id === selectedItem
        ? { ...item, placed: true, position: { x, y } }
        : item
    );

    if (newItems.every(i => i.placed)) {
      setGameOver(true);
      onComplete(true);
    }
  };

  const handleItemClick = (id: string) => {
    if (gameOver) return;
    const item = items.find(i => i.id === id);
    if (item && !item.placed) {
      setSelectedItem(id);
    }
  };

  const placedCount = items.filter(i => i.placed).length;
  const progress = (placedCount / items.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-orange-50 rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-orange-600 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>🍽️</span> Plating Station
            </h2>
            <div className={`px-3 py-1 rounded-full font-mono text-lg ${
              timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-orange-700'
            }`}>
              {timeLeft}s
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-6 py-3 bg-orange-100 border-b border-orange-200">
          <p className="text-orange-800 font-medium text-center">
            {selectedItem
              ? `Click on the plate to place the ${items.find(i => i.id === selectedItem)?.name}!`
              : 'Select an item below, then click on the plate to place it!'}
          </p>
        </div>

        {/* Plate Area */}
        <div className="p-6">
          <div
            onClick={handlePlateClick}
            className={`
              relative mx-auto w-64 h-64 rounded-full
              bg-gradient-to-br from-white to-gray-100
              border-8 border-gray-200 shadow-inner
              cursor-crosshair transition-all
              ${selectedItem ? 'ring-4 ring-orange-300' : ''}
            `}
          >
            {/* Plate decoration rings */}
            <div className="absolute inset-4 rounded-full border border-gray-200" />
            <div className="absolute inset-8 rounded-full border border-gray-100" />

            {/* Target zones (visual guides) */}
            {!gameOver && targetPositions.map((pos, i) => (
              <div
                key={i}
                className="absolute w-8 h-8 rounded-full border-2 border-dashed border-orange-200 opacity-50"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}

            {/* Placed items */}
            {items.filter(i => i.placed && i.position).map(item => (
              <div
                key={item.id}
                className="absolute text-3xl transform -translate-x-1/2 -translate-y-1/2 transition-all animate-bounce-once"
                style={{
                  left: `${item.position!.x}%`,
                  top: `${item.position!.y}%`,
                }}
              >
                {item.emoji}
              </div>
            ))}
          </div>

          {/* Item Selection */}
          <div className="mt-6">
            <div className="text-sm text-orange-700 mb-2 font-medium">
              Items to place:
            </div>
            <div className="flex justify-center gap-3">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  disabled={gameOver || item.placed}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${item.placed
                      ? 'bg-gray-100 border-gray-200 opacity-50'
                      : selectedItem === item.id
                        ? 'bg-orange-200 border-orange-500 scale-110 ring-2 ring-orange-300'
                        : 'bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    }
                  `}
                >
                  <div className="text-2xl">{item.emoji}</div>
                  <div className="text-xs mt-1 text-gray-600">{item.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-orange-700 mb-1">
              <span>Progress</span>
              <span>{placedCount}/{items.length}</span>
            </div>
            <div className="h-3 bg-orange-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  progress >= 100 ? 'bg-green-500' : 'bg-orange-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Result */}
          {gameOver && (
            <div className={`mt-4 p-4 rounded-lg text-center font-bold text-lg ${
              placedCount >= 4 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {placedCount >= 4 ? '✅ Beautiful Presentation!' : '❌ Incomplete Plate'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
