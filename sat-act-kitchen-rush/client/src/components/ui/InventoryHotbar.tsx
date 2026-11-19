import { useGameStore } from '@store/gameStore';

const ITEM_EMOJIS: Record<string, string> = {
  'lettuce': '🥬',
  'sliced-lettuce': '🥗',
  'tomato': '🍅',
  'sliced-tomato': '🍅',
  'cheese': '🧀',
  'sliced-cheese': '🧀',
  'beef': '🥩',
  'sliced-beef': '🥩',
  'cooked-beef': '🍔',
  'chicken': '🍗',
  'sliced-chicken': '🍗',
  'cooked-chicken': '🍗',
  'fish': '🐟',
  'sliced-fish': '🐟',
  'cooked-fish': '🐟',
  'baked-fish': '🐟',
  'bacon': '🥓',
  'cooked-bacon': '🥓',
  'eggs': '🥚',
  'cooked-eggs': '🍳',
  'pasta': '🍝',
  'cooked-pasta': '🍝',
  'potato': '🥔',
  'sliced-potato': '🥔',
  'fries': '🍟',
  'fried-chicken': '🍗',
  'fried-fish': '🐟',
  'drink-cup': '🥤',
  'full-drink': '🥤',
  'cake-base': '🍰',
  'cake': '🎂',
  'finished-dessert': '🍰',
  'bread': '🍞',
  'toasted-bread': '🥪',
};

export function InventoryHotbar() {
  const { inventory } = useGameStore();

  // Create 9 slots
  const slots = Array(9).fill(null);
  inventory.forEach((item, i) => {
    if (i < 9) slots[i] = item;
  });

  // Only show if there are items in inventory
  const hasItems = inventory.length > 0;

  return (
    <div className={`fixed bottom-4 left-4 z-40 transition-opacity ${hasItems ? 'opacity-100' : 'opacity-50'}`}>
      <div className="bg-gray-900/95 backdrop-blur-sm p-2 rounded-lg border-2 border-gray-600 shadow-xl">
        <h3 className="text-white text-[10px] font-bold mb-1.5 uppercase tracking-wider text-center">Inventory</h3>
        <div className="grid grid-cols-3 gap-1">
          {slots.map((item, i) => (
            <div
              key={i}
              className={`
                group relative w-10 h-10 rounded border-2 flex items-center justify-center text-xl transition-all
                ${item ? 'bg-gray-600 border-gray-400 hover:scale-110 hover:z-10' : 'bg-gray-800/50 border-gray-700'}
              `}
            >
              {item && (ITEM_EMOJIS[item] || '❓')}

              {/* Tooltip for item name */}
              {item && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.replace(/-/g, ' ').toUpperCase()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
