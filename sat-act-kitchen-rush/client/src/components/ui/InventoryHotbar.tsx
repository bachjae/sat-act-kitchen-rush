import { useGameStore } from '@store/gameStore';

const ITEM_EMOJIS: Record<string, string> = {
  'lettuce': '🥬',
  'sliced-lettuce': '🥗',
  'tomato': '🍅',
  'sliced-tomato': '🥗',
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
  'bacon': '🥓',
  'cooked-bacon': '🥓',
  'eggs': '🥚',
  'cooked-eggs': '🍳',
  'pasta': '🍝',
  'cooked-pasta': '🍝',
  'potato': '🥔',
  'fries': '🍟',
  'drink-cup': '🥤',
  'full-drink': '🥤',
  'cake-base': '🍰',
  'finished-dessert': '🍰',
};

export function InventoryHotbar() {
  const { inventory } = useGameStore();

  // Create 9 slots
  const slots = Array(9).fill(null);
  inventory.forEach((item, i) => {
    if (i < 9) slots[i] = item;
  });

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1 p-2 bg-gray-900 bg-opacity-80 rounded-lg border-4 border-gray-700">
      {slots.map((item, i) => (
        <div
          key={i}
          className={`
            w-14 h-14 rounded-md border-4 flex items-center justify-center text-3xl
            ${item ? 'bg-gray-600 border-gray-400' : 'bg-gray-800 border-gray-700'}
          `}
        >
          {item && (ITEM_EMOJIS[item] || '❓')}

          {/* Tooltip for item name */}
          {item && (
            <div className="absolute -top-10 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {item.replace('-', ' ').toUpperCase()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
