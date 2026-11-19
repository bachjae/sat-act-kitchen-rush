# Claude Code Prompt - Fix Interactions, Add Mechanics & Generate Pixel Art

I need you to fix 6 critical issues with my game. You have access to pixel art generation through MCP - use it to create all visual assets.

---

## 🎯 Issues to Fix

1. ❌ Questions no longer appearing when reaching stations
2. ❌ Ticket station doesn't show recipe/order details
3. ❌ Stations have no interactive mechanics (just questions)
4. ❌ Bad pixel art for kitchen/stations
5. ❌ Chef only faces one direction, bad sprite
6. ❌ Pathfinding goes straight into obstacles

---

## 🔧 FIX 1: Debug & Fix Station Interaction

### File to modify: `client/src/game/engine/GameEngine.ts`

**Problem:** Questions aren't triggering when player reaches station.

**Add comprehensive debugging:**

```typescript
private checkCollisions() {
  if (!this.player) return;
  
  const playerPos = this.player.position;
  
  console.log(`🎮 Player position: (${Math.round(playerPos.x)}, ${Math.round(playerPos.y)})`);
  
  KITCHEN_LAYOUT.stations.forEach(station => {
    const dx = station.position.x - playerPos.x;
    const dy = station.position.y - playerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Log distance to each station
    if (distance < 150) { // Only log nearby stations
      console.log(`📍 Distance to ${station.type}: ${Math.round(distance)}px`);
    }
    
    const INTERACTION_DISTANCE = 80; // Increase from 50 to 80
    
    if (distance <= INTERACTION_DISTANCE) {
      console.log(`✅ IN RANGE of ${station.type} station!`);
      
      this.highlightStation(station.id, true);
      
      // Check if this station needs interaction
      this.attemptStationInteraction(station);
    } else {
      this.highlightStation(station.id, false);
    }
  });
}

private attemptStationInteraction(station: any) {
  // Prevent multiple triggers
  if (this.currentInteractingStation === station.id) {
    return; // Already interacting
  }
  
  console.log(`🎯 Attempting interaction with ${station.type}`);
  
  const gameState = useGameStore.getState();
  
  // Special case: Ticket Board
  if (station.type === 'ticket') {
    console.log('📋 At Ticket Board');
    this.currentInteractingStation = station.id;
    this.showOrderPickupUI();
    return;
  }
  
  // Special case: Serving Window
  if (station.type === 'serving') {
    console.log('🍽️ At Serving Window');
    this.currentInteractingStation = station.id;
    this.completeOrder();
    return;
  }
  
  // For question stations
  const activeOrder = gameState.orders.find(o => o.status === 'in_progress');
  
  if (!activeOrder) {
    console.log('⚠️ No active order');
    return;
  }
  
  const nextStep = activeOrder.steps.find(s => s.status === 'active');
  
  if (!nextStep) {
    console.log('⚠️ No active step in order');
    return;
  }
  
  if (nextStep.stationType === station.type) {
    console.log(`✅ Correct station! Opening interaction for ${station.type}`);
    this.currentInteractingStation = station.id;
    
    // Open station mechanic immediately (no delay)
    this.openStationMechanic(station, nextStep);
  } else {
    console.log(`❌ Wrong station! Need: ${nextStep.stationType}, At: ${station.type}`);
  }
}

private openStationMechanic(station: any, step: OrderStep) {
  console.log(`🎮 Opening mechanic for ${station.type}`);
  
  // Set active station and step in store
  const gameState = useGameStore.getState();
  gameState.setActiveStation(station);
  gameState.setActiveStep(step);
  
  // Fetch question for this station
  fetchQuestions({ count: 1, stationType: station.type }).then(questions => {
    if (questions.length > 0) {
      gameState.setActiveQuestion(questions[0]);
      console.log('✅ Question loaded and modal should appear');
    }
  });
}

// Clear interaction when player moves away
private clearInteractionIfFarAway() {
  if (!this.currentInteractingStation || !this.player) return;
  
  const station = KITCHEN_LAYOUT.stations.find(s => s.id === this.currentInteractingStation);
  if (!station) return;
  
  const dx = station.position.x - this.player.position.x;
  const dy = station.position.y - this.player.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > 100) {
    console.log('👋 Player moved away, clearing interaction');
    this.currentInteractingStation = null;
  }
}
```

**Update gameLoop:**
```typescript
private gameLoop = () => {
  // ... existing code
  
  this.checkCollisions();
  this.clearInteractionIfFarAway(); // Add this
  
  // ... rest
};
```

---

## 🔧 FIX 2: Add Recipe Ticket System

### Create Recipe Data

**File: `client/src/data/recipes.json`**

```json
{
  "recipes": [
    {
      "id": "recipe-001",
      "name": "Classic Burger",
      "description": "Juicy beef burger with all the fixings",
      "difficulty": 2,
      "stations": ["fridge", "prep", "stove", "plating"],
      "ingredients": [
        { "name": "Beef Patty", "station": "fridge" },
        { "name": "Lettuce", "station": "fridge" },
        { "name": "Tomato", "station": "fridge" },
        { "name": "Bun", "station": "prep" },
        { "name": "Cook Patty", "station": "stove" },
        { "name": "Assemble", "station": "plating" }
      ],
      "estimatedTime": 180
    },
    {
      "id": "recipe-002",
      "name": "Caesar Salad",
      "description": "Fresh romaine with parmesan and croutons",
      "difficulty": 1,
      "stations": ["fridge", "prep", "plating"],
      "ingredients": [
        { "name": "Romaine Lettuce", "station": "fridge" },
        { "name": "Parmesan", "station": "fridge" },
        { "name": "Chop Lettuce", "station": "prep" },
        { "name": "Add Dressing", "station": "plating" }
      ],
      "estimatedTime": 120
    },
    {
      "id": "recipe-003",
      "name": "Spaghetti Carbonara",
      "description": "Creamy pasta with bacon and egg",
      "difficulty": 3,
      "stations": ["fridge", "prep", "stove", "plating"],
      "ingredients": [
        { "name": "Pasta", "station": "fridge" },
        { "name": "Bacon", "station": "fridge" },
        { "name": "Eggs", "station": "fridge" },
        { "name": "Chop Bacon", "station": "prep" },
        { "name": "Boil Pasta", "station": "stove" },
        { "name": "Cook Bacon", "station": "stove" },
        { "name": "Mix Together", "station": "plating" }
      ],
      "estimatedTime": 200
    },
    {
      "id": "recipe-004",
      "name": "Grilled Chicken",
      "description": "Seasoned chicken breast with vegetables",
      "difficulty": 2,
      "stations": ["fridge", "prep", "stove", "plating"],
      "ingredients": [
        { "name": "Chicken Breast", "station": "fridge" },
        { "name": "Bell Peppers", "station": "fridge" },
        { "name": "Season Chicken", "station": "prep" },
        { "name": "Chop Vegetables", "station": "prep" },
        { "name": "Grill Chicken", "station": "stove" },
        { "name": "Sauté Vegetables", "station": "stove" },
        { "name": "Plate & Garnish", "station": "plating" }
      ],
      "estimatedTime": 180
    },
    {
      "id": "recipe-005",
      "name": "Fish Tacos",
      "description": "Crispy fish with fresh slaw",
      "difficulty": 2,
      "stations": ["fridge", "prep", "stove", "plating"],
      "ingredients": [
        { "name": "Fish Fillets", "station": "fridge" },
        { "name": "Cabbage", "station": "fridge" },
        { "name": "Tortillas", "station": "fridge" },
        { "name": "Make Slaw", "station": "prep" },
        { "name": "Fry Fish", "station": "stove" },
        { "name": "Assemble Tacos", "station": "plating" }
      ],
      "estimatedTime": 150
    }
  ]
}
```

### Create Recipe Ticket UI Component

**File: `client/src/components/ui/RecipeTicketModal.tsx`**

```typescript
import React from 'react';
import { useGameStore } from '@store/gameStore';

export function RecipeTicketModal() {
  const { activeRecipe, dismissRecipe } = useGameStore();
  
  if (!activeRecipe) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-amber-50 rounded-lg shadow-2xl max-w-md w-full mx-4 border-4 border-amber-800">
        {/* Ticket Header */}
        <div className="bg-amber-800 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">ORDER TICKET</h2>
            <span className="text-3xl">📋</span>
          </div>
        </div>
        
        {/* Recipe Details */}
        <div className="p-6">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {activeRecipe.name}
          </h3>
          <p className="text-gray-600 italic mb-4">
            {activeRecipe.description}
          </p>
          
          {/* Difficulty */}
          <div className="mb-4">
            <span className="text-sm font-semibold text-gray-700">Difficulty: </span>
            <span className="text-yellow-600">
              {'⭐'.repeat(activeRecipe.difficulty)}
            </span>
          </div>
          
          {/* Estimated Time */}
          <div className="mb-6">
            <span className="text-sm font-semibold text-gray-700">Time Limit: </span>
            <span className="text-red-600 font-bold">
              {Math.floor(activeRecipe.estimatedTime / 60)}:{(activeRecipe.estimatedTime % 60).toString().padStart(2, '0')}
            </span>
          </div>
          
          {/* Ingredients/Steps */}
          <div className="bg-white rounded-lg p-4 border-2 border-gray-300 mb-6">
            <h4 className="font-bold text-gray-800 mb-3">Required Steps:</h4>
            <div className="space-y-2">
              {activeRecipe.ingredients.map((ingredient, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xl">
                    {ingredient.station === 'fridge' && '❄️'}
                    {ingredient.station === 'prep' && '🔪'}
                    {ingredient.station === 'stove' && '🔥'}
                    {ingredient.station === 'plating' && '🍽️'}
                  </span>
                  <span className="text-gray-700">{ingredient.name}</span>
                  <span className="text-xs text-gray-500 ml-auto uppercase">
                    {ingredient.station}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Station Path */}
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
            <h4 className="font-bold text-blue-800 mb-2">Station Order:</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {activeRecipe.stations.map((station, idx) => (
                <React.Fragment key={idx}>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold uppercase">
                    {station}
                  </span>
                  {idx < activeRecipe.stations.length - 1 && (
                    <span className="text-blue-600">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        
        {/* Accept Button */}
        <div className="p-4 bg-gray-100 rounded-b-lg">
          <button
            onClick={dismissRecipe}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg transition-colors"
          >
            ✓ Accept Order
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Add to Kitchen.tsx:**
```typescript
import { RecipeTicketModal } from '@components/ui/RecipeTicketModal';

// In JSX:
<RecipeTicketModal />
```

---

## 🔧 FIX 3: Add Interactive Station Mechanics

### Create Station Mechanic Components

**File: `client/src/components/game/mechanics/FridgeMechanic.tsx`**

```typescript
import React, { useState } from 'react';

export function FridgeMechanic({ onComplete }: { onComplete: () => void }) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const availableItems = [
    { id: 'lettuce', name: 'Lettuce', emoji: '🥬' },
    { id: 'tomato', name: 'Tomato', emoji: '🍅' },
    { id: 'cheese', name: 'Cheese', emoji: '🧀' },
    { id: 'meat', name: 'Beef', emoji: '🥩' },
    { id: 'chicken', name: 'Chicken', emoji: '🍗' },
    { id: 'fish', name: 'Fish', emoji: '🐟' },
  ];
  
  const requiredItems = ['lettuce', 'tomato', 'meat']; // Based on recipe
  
  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  const checkComplete = () => {
    const hasAll = requiredItems.every(item => selectedItems.includes(item));
    if (hasAll) {
      onComplete();
    } else {
      alert('Missing required ingredients!');
    }
  };
  
  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-4">🧊 Grab Ingredients from Fridge</h3>
      <p className="text-gray-600 mb-6">Click to grab the items you need:</p>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {availableItems.map(item => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${selectedItems.includes(item.id)
                ? 'border-green-500 bg-green-50 scale-95'
                : 'border-gray-300 hover:border-blue-400'
              }
            `}
          >
            <div className="text-4xl mb-2">{item.emoji}</div>
            <div className="text-sm font-semibold">{item.name}</div>
            {selectedItems.includes(item.id) && (
              <div className="text-green-600 mt-1">✓</div>
            )}
          </button>
        ))}
      </div>
      
      <button
        onClick={checkComplete}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
      >
        Continue with Selected Items
      </button>
    </div>
  );
}
```

**File: `client/src/components/game/mechanics/PrepMechanic.tsx`**

```typescript
import React, { useState, useEffect } from 'react';

export function PrepMechanic({ onComplete }: { onComplete: () => void }) {
  const [chops, setChops] = useState(0);
  const [targetReached, setTargetReached] = useState(false);
  const targetChops = 10;
  
  const handleChop = () => {
    const newChops = chops + 1;
    setChops(newChops);
    
    if (newChops >= targetChops) {
      setTargetReached(true);
      setTimeout(() => onComplete(), 1000);
    }
  };
  
  return (
    <div className="p-6 text-center">
      <h3 className="text-2xl font-bold mb-4">🔪 Chop Ingredients</h3>
      <p className="text-gray-600 mb-6">Click rapidly to chop!</p>
      
      <div className="mb-8">
        <div className="text-6xl mb-4">🥕</div>
        <div className="text-4xl font-bold text-blue-600">
          {chops} / {targetChops}
        </div>
        <div className="w-full bg-gray-200 h-8 rounded-full mt-4">
          <div
            className="bg-green-500 h-full rounded-full transition-all"
            style={{ width: `${(chops / targetChops) * 100}%` }}
          />
        </div>
      </div>
      
      {!targetReached ? (
        <button
          onClick={handleChop}
          className="px-12 py-6 bg-orange-500 hover:bg-orange-600 text-white text-2xl font-bold rounded-lg active:scale-95 transition-transform"
        >
          CHOP!
        </button>
      ) : (
        <div className="text-green-600 text-3xl font-bold">
          ✓ Chopped!
        </div>
      )}
    </div>
  );
}
```

**File: `client/src/components/game/mechanics/StoveMechanic.tsx`**

```typescript
import React, { useState, useEffect } from 'react';

export function StoveMechanic({ onComplete }: { onComplete: () => void }) {
  const [temperature, setTemperature] = useState(50);
  const [cookTime, setCookTime] = useState(0);
  const targetTemp = 75;
  const targetTime = 10; // seconds
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Check if temperature is in range
      if (Math.abs(temperature - targetTemp) <= 10) {
        setCookTime(prev => prev + 0.1);
      } else {
        setCookTime(prev => Math.max(0, prev - 0.2)); // Lose progress if wrong temp
      }
      
      if (cookTime >= targetTime) {
        onComplete();
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [temperature, cookTime]);
  
  const adjustTemp = (delta: number) => {
    setTemperature(prev => Math.max(0, Math.min(100, prev + delta)));
  };
  
  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-4">🔥 Control Temperature</h3>
      <p className="text-gray-600 mb-6">Keep temperature around {targetTemp}°</p>
      
      {/* Thermometer */}
      <div className="mb-8">
        <div className="relative h-64 w-32 mx-auto bg-gray-200 rounded-full">
          <div
            className={`absolute bottom-0 w-full rounded-full transition-all ${
              Math.abs(temperature - targetTemp) <= 10
                ? 'bg-green-500'
                : 'bg-red-500'
            }`}
            style={{ height: `${temperature}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-white mix-blend-difference">
              {temperature}°
            </span>
          </div>
        </div>
        
        {/* Target range indicator */}
        <div className="text-center mt-4">
          <div className="text-sm text-gray-600">Target: {targetTemp - 10}° - {targetTemp + 10}°</div>
        </div>
      </div>
      
      {/* Cook Progress */}
      <div className="mb-6">
        <div className="text-lg font-semibold mb-2">Cooking Progress:</div>
        <div className="w-full bg-gray-200 h-8 rounded-full">
          <div
            className="bg-blue-500 h-full rounded-full transition-all"
            style={{ width: `${(cookTime / targetTime) * 100}%` }}
          />
        </div>
        <div className="text-center mt-2 text-sm text-gray-600">
          {cookTime.toFixed(1)}s / {targetTime}s
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={() => adjustTemp(-5)}
          className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg"
        >
          ❄️ Lower Heat
        </button>
        <button
          onClick={() => adjustTemp(5)}
          className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg"
        >
          🔥 Raise Heat
        </button>
      </div>
    </div>
  );
}
```

**File: `client/src/components/game/mechanics/PlatingMechanic.tsx`**

```typescript
import React, { useState } from 'react';

export function PlatingMechanic({ onComplete }: { onComplete: () => void }) {
  const [positions, setPositions] = useState<Record<string, {x: number, y: number}>>({});
  
  const items = [
    { id: 'protein', emoji: '🥩', name: 'Protein' },
    { id: 'vegetable', emoji: '🥦', name: 'Vegetable' },
    { id: 'starch', emoji: '🥔', name: 'Starch' },
    { id: 'garnish', emoji: '🌿', name: 'Garnish' },
  ];
  
  const plateZones = [
    { id: 'center', x: 50, y: 50, label: 'Center' },
    { id: 'left', x: 20, y: 50, label: 'Left' },
    { id: 'right', x: 80, y: 50, label: 'Right' },
    { id: 'top', x: 50, y: 20, label: 'Top' },
  ];
  
  const placeItem = (itemId: string, zoneId: string) => {
    const zone = plateZones.find(z => z.id === zoneId);
    if (zone) {
      setPositions({ ...positions, [itemId]: { x: zone.x, y: zone.y } });
    }
  };
  
  const checkComplete = () => {
    if (Object.keys(positions).length === items.length) {
      onComplete();
    } else {
      alert('Place all items on the plate!');
    }
  };
  
  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-4">🍽️ Plate the Dish</h3>
      <p className="text-gray-600 mb-6">Arrange items on the plate:</p>
      
      {/* Plate */}
      <div className="relative w-64 h-64 mx-auto mb-8 bg-white rounded-full border-4 border-gray-300">
        {Object.entries(positions).map(([itemId, pos]) => {
          const item = items.find(i => i.id === itemId);
          return (
            <div
              key={itemId}
              className="absolute text-4xl"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {item?.emoji}
            </div>
          );
        })}
      </div>
      
      {/* Items to place */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {items.map(item => (
          <div key={item.id} className="text-center">
            <div className="text-3xl mb-2">{item.emoji}</div>
            <div className="text-sm font-semibold mb-2">{item.name}</div>
            {!positions[item.id] ? (
              <div className="space-y-1">
                {plateZones.map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => placeItem(item.id, zone.id)}
                    className="w-full py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                  >
                    {zone.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-green-600 font-bold">✓ Placed</div>
            )}
          </div>
        ))}
      </div>
      
      <button
        onClick={checkComplete}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
      >
        ✓ Complete Dish
      </button>
    </div>
  );
}
```

### Update QuestionModal to include mechanics

**Modify `client/src/components/ui/QuestionModal.tsx`:**

```typescript
import { FridgeMechanic } from '@components/game/mechanics/FridgeMechanic';
import { PrepMechanic } from '@components/game/mechanics/PrepMechanic';
import { StoveMechanic } from '@components/game/mechanics/StoveMechanic';
import { PlatingMechanic } from '@components/game/mechanics/PlatingMechanic';

export function QuestionModal() {
  const { activeQuestion, activeStation, setActiveQuestion } = useGameStore();
  const [mechanicComplete, setMechanicComplete] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  
  if (!activeQuestion || !activeStation) return null;
  
  const handleMechanicComplete = () => {
    setMechanicComplete(true);
    setShowQuestion(true);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4">
        {!mechanicComplete ? (
          // Show station-specific mechanic first
          <>
            {activeStation.type === 'fridge' && <FridgeMechanic onComplete={handleMechanicComplete} />}
            {activeStation.type === 'prep' && <PrepMechanic onComplete={handleMechanicComplete} />}
            {activeStation.type === 'stove' && <StoveMechanic onComplete={handleMechanicComplete} />}
            {activeStation.type === 'plating' && <PlatingMechanic onComplete={handleMechanicComplete} />}
          </>
        ) : (
          // Then show the question
          <>
            {/* Existing question modal code */}
          </>
        )}
      </div>
    </div>
  );
}
```

---

## 🔧 FIX 4: Generate Pixel Art for Kitchen & Stations

### Use Your Pixel Art MCP to Generate Assets

**Generate these assets in order. For each one, call your pixel art generation tool with these exact prompts:**

### 4.1: Kitchen Floor Tile (32x32px)

**Prompt for pixel art generation:**
```
Create a 32x32 pixel tileable kitchen floor tile with a black and white checkered pattern. The tile should be perfectly tileable (seamless edges). Use these colors: white (#FFFFFF) and light gray (#E0E0E0) for alternating squares in a 2x2 checkerboard pattern. Add very subtle shading to give slight depth. The tile must repeat seamlessly when tiled.
```

**Save as:** `client/public/assets/sprites/kitchen/floor-tile.png`

### 4.2: Kitchen Wall Tile (32x32px)

**Prompt for pixel art generation:**
```
Create a 32x32 pixel tileable kitchen wall tile in subway tile style. Draw 2 horizontal white rectangular tiles stacked vertically with dark gray grout lines between them (2 pixels wide). Use white (#F8F8F8) for tiles and dark gray (#404040) for grout. Add subtle highlight on top edge of each tile and shadow on bottom edge for 3D effect. Must be seamless/tileable.
```

**Save as:** `client/public/assets/sprites/kitchen/wall-tile.png`

### 4.3: Fridge Station (96x96px)

**Prompt for pixel art generation:**
```
Create a 96x96 pixel top-down view of a professional walk-in cooler/fridge for a restaurant kitchen. Draw a large rectangular stainless steel fridge with:
- Silver/gray metal body (#C0C0C0)
- Darker gray shadows on right and bottom for 3D depth
- Vertical handle on the front (darker gray)
- Small window/porthole on the door showing blue/cold interior
- Subtle highlights on top-left edges (lighter gray #E0E0E0)
- Industrial/commercial kitchen style, not residential
- Top-down perspective, viewed from above at 45-degree angle
```

**Save as:** `client/public/assets/sprites/kitchen/fridge.png`

### 4.4: Prep Station (96x96px)

**Prompt for pixel art generation:**
```
Create a 96x96 pixel top-down view of a commercial kitchen prep station. Draw a wooden cutting board surface with:
- Light brown wood texture (#D4A574)
- Darker wood grain lines
- A large silver knife placed diagonally (blade and handle visible)
- Small chopped vegetables scattered around (green, red, orange pixels)
- Metal bowl in corner (#C0C0C0)
- Shadows and highlights for 3D depth
- Top-down perspective at 45-degree angle
- Professional commercial kitchen style
```

**Save as:** `client/public/assets/sprites/kitchen/prep-station.png`

### 4.5: Stove Station (96x96px)

**Prompt for pixel art generation:**
```
Create a 96x96 pixel top-down view of a commercial restaurant stove/range. Draw:
- 4 burners arranged in 2x2 grid
- Black cast iron grates over each burner
- Stainless steel surface around burners (#B8B8B8)
- Blue flame visible under 2 of the burners (animated look)
- Red-hot elements under burners (glowing red-orange)
- Knobs/controls along the front edge
- Shadows and highlights for 3D industrial look
- Top-down perspective at 45-degree angle
- Professional commercial kitchen equipment style
```

**Save as:** `client/public/assets/sprites/kitchen/stove.png`

### 4.6: Plating Station (96x96px)

**Prompt for pixel art generation:**
```
Create a 96x96 pixel top-down view of a commercial kitchen plating/finishing station. Draw:
- Clean white marble countertop (#F5F5F5) with gray veining
- Stack of white plates on left side
- Small dishes with garnishes (green herbs, red sauce, yellow lemon)
- Plating tools (tongs, small spoons) in silver
- Clean towel folded in corner (white with blue stripe)
- Everything neatly organized
- Shadows and highlights for 3D depth
- Top-down perspective at 45-degree angle
- Professional presentation style
```

**Save as:** `client/public/assets/sprites/kitchen/plating-station.png`

---

## 🔧 FIX 5: Generate 4-Direction Chef Sprite

### 5.1: Chef Sprite Sheet (128x128px = 4 directions × 32x32px)

**Prompt for pixel art generation:**
```
Create a 128x128 pixel sprite sheet of a chef character for a top-down game. Layout: 4 rows × 4 columns (32x32 pixels per frame).

Row 1 (Walking Down/Front):
- Frame 1: Chef facing down, left foot forward
- Frame 2: Chef facing down, standing (idle)
- Frame 3: Chef facing down, right foot forward
- Frame 4: Chef facing down, standing (idle)

Row 2 (Walking Up/Back):
- Frame 1: Chef facing up, left foot forward
- Frame 2: Chef facing up, standing (idle)
- Frame 3: Chef facing up, right foot forward
- Frame 4: Chef facing up, standing (idle)

Row 3 (Walking Left):
- Frame 1: Chef facing left, left foot forward
- Frame 2: Chef facing left, standing (idle)
- Frame 3: Chef facing left, right foot forward
- Frame 4: Chef facing left, standing (idle)

Row 4 (Walking Right):
- Frame 1: Chef facing right, left foot forward
- Frame 2: Chef facing right, standing (idle)
- Frame 3: Chef facing right, right foot forward
- Frame 4: Chef facing right, standing (idle)

Character design:
- Tall white chef's hat (puffy toque)
- Peach/beige skin tone
- White chef's jacket with buttons down the front
- Black checkered pants
- Simple facial features (2 black pixel eyes, small nose)
- Round body shape, cute/chibi style
- Clear outlines (1-2 pixel black stroke around everything)
- Slight bobbing animation in walking frames
- Commercial kitchen professional look but cute/appealing

Use colors: White (#FFFFFF), Peach (#FFD1A3), Black (#000000), Gray (#808080)
```

**Save as:** `client/public/assets/sprites/characters/chef-sprite-sheet.png`

### 5.2: Update PlayerEntity to use animated sprite

**Modify `client/src/game/entities/PlayerEntity.ts`:**

```typescript
import { AnimatedSprite, Texture } from 'pixi.js';

export class PlayerEntity {
  public sprite: AnimatedSprite;
  private direction: 'down' | 'up' | 'left' | 'right' = 'down';
  private animations: Record<string, Texture[]> = {};
  
  constructor(id: string, startX: number, startY: number, spriteSheet: Texture) {
    this.id = id;
    this.position = { x: startX, y: startY };
    
    // Parse sprite sheet into animations
    this.createAnimations(spriteSheet);
    
    // Create animated sprite starting with down idle
    this.sprite = new AnimatedSprite(this.animations['idle-down']);
    this.sprite.anchor.set(0.5);
    this.sprite.position.set(startX, startY);
    this.sprite.animationSpeed = 0.15;
    this.sprite.play();
  }
  
  private createAnimations(spriteSheet: Texture) {
    const frameWidth = 32;
    const frameHeight = 32;
    
    // Extract frames from sprite sheet (4 rows × 4 columns)
    const frames: Texture[] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        frames.push(new Texture(
          spriteSheet.baseTexture,
          new Rectangle(col * frameWidth, row * frameHeight, frameWidth, frameHeight)
        ));
      }
    }
    
    // Organize into animations
    this.animations = {
      'walk-down': [frames[0], frames[1], frames[2], frames[1]],
      'idle-down': [frames[1]],
      'walk-up': [frames[4], frames[5], frames[6], frames[5]],
      'idle-up': [frames[5]],
      'walk-left': [frames[8], frames[9], frames[10], frames[9]],
      'idle-left': [frames[9]],
      'walk-right': [frames[12], frames[13], frames[14], frames[13]],
      'idle-right': [frames[13]],
    };
  }
  
  public moveByDirection(dx: number, dy: number, deltaTime: number) {
    // Determine direction
    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? 'right' : 'left';
    } else if (dy !== 0) {
      this.direction = dy > 0 ? 'down' : 'up';
    }
    
    // Update animation
    this.sprite.textures = this.animations[`walk-${this.direction}`];
    if (!this.sprite.playing) this.sprite.play();
    
    // Apply movement
    const moveSpeed = this.speed * deltaTime;
    this.velocity.x = dx * moveSpeed;
    this.velocity.y = dy * moveSpeed;
    
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    this.sprite.position.set(this.position.x, this.position.y);
  }
  
  public update(deltaTime: number) {
    if (this.targetPosition) {
      // Moving to target
      const dx = this.targetPosition.x - this.position.x;
      const dy = this.targetPosition.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 2) {
        this.targetPosition = null;
        // Switch to idle
        this.sprite.textures = this.animations[`idle-${this.direction}`];
      } else {
        const moveSpeed = this.speed * deltaTime;
        const moveX = (dx / distance) * moveSpeed;
        const moveY = (dy / distance) * moveSpeed;
        
        // Update direction
        if (Math.abs(dx) > Math.abs(dy)) {
          this.direction = dx > 0 ? 'right' : 'left';
        } else {
          this.direction = dy > 0 ? 'down' : 'up';
        }
        
        // Update animation
        this.sprite.textures = this.animations[`walk-${this.direction}`];
        if (!this.sprite.playing) this.sprite.play();
        
        this.position.x += moveX;
        this.position.y += moveY;
        this.sprite.position.set(this.position.x, this.position.y);
      }
    } else {
      // Idle
      this.sprite.textures = this.animations[`idle-${this.direction}`];
    }
  }
}
```

---

## 🔧 FIX 6: Improve Pathfinding (Go Around Obstacles)

### Create Simple Waypoint Pathfinding

**File: `client/src/game/utils/pathfinding.ts`**

```typescript
import { KITCHEN_LAYOUT } from '@game/config/kitchen-layout';

interface Point {
  x: number;
  y: number;
}

export function findPathAroundObstacles(start: Point, end: Point): Point[] {
  // Simple waypoint system
  // If direct path is blocked, add waypoint through center
  
  const obstacles = KITCHEN_LAYOUT.stations.map(s => s.collisionBox);
  
  // Check if direct path intersects any obstacle
  if (isPathClear(start, end, obstacles)) {
    return [end]; // Direct path is clear
  }
  
  // Path is blocked, find waypoint
  const waypoints: Point[] = [];
  
  // Try center of kitchen as waypoint
  const center = { x: 640, y: 400 };
  
  if (isPathClear(start, center, obstacles) && isPathClear(center, end, obstacles)) {
    waypoints.push(center, end);
  } else {
    // Try corners of navigable space
    const corners = [
      { x: 200, y: 300 },  // Top-left
      { x: 1080, y: 300 }, // Top-right
      { x: 200, y: 550 },  // Bottom-left
      { x: 1080, y: 550 }, // Bottom-right
    ];
    
    // Find first corner that creates clear path
    for (const corner of corners) {
      if (isPathClear(start, corner, obstacles) && isPathClear(corner, end, obstacles)) {
        waypoints.push(corner, end);
        break;
      }
    }
    
    // Fallback: just try to get close
    if (waypoints.length === 0) {
      waypoints.push(end);
    }
  }
  
  return waypoints;
}

function isPathClear(start: Point, end: Point, obstacles: any[]): boolean {
  // Simple line-obstacle intersection check
  for (const obstacle of obstacles) {
    if (lineIntersectsRect(start, end, obstacle)) {
      return false;
    }
  }
  return true;
}

function lineIntersectsRect(
  p1: Point,
  p2: Point,
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  // Check if line segment intersects rectangle
  // Simplified: check if either endpoint is inside, or if line crosses any edge
  
  const { x, y, width, height } = rect;
  
  // Check if endpoints are inside rectangle
  if (pointInRect(p1, rect) || pointInRect(p2, rect)) {
    return true;
  }
  
  // Check intersection with each edge of rectangle
  const edges = [
    [{ x, y }, { x: x + width, y }],                    // Top
    [{ x: x + width, y }, { x: x + width, y: y + height }], // Right
    [{ x: x + width, y: y + height }, { x, y: y + height }], // Bottom
    [{ x, y: y + height }, { x, y }],                   // Left
  ];
  
  for (const [e1, e2] of edges) {
    if (lineSegmentsIntersect(p1, p2, e1, e2)) {
      return true;
    }
  }
  
  return false;
}

function pointInRect(p: Point, rect: { x: number; y: number; width: number; height: number }): boolean {
  return (
    p.x >= rect.x &&
    p.x <= rect.x + rect.width &&
    p.y >= rect.y &&
    p.y <= rect.y + rect.height
  );
}

function lineSegmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
  // Line intersection algorithm (CCW method)
  const ccw = (A: Point, B: Point, C: Point) => {
    return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  };
  
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}
```

### Update PlayerEntity to use waypoints

**Modify `client/src/game/entities/PlayerEntity.ts`:**

```typescript
export class PlayerEntity {
  private waypoints: Point[] = [];
  private currentWaypoint = 0;
  
  public moveTo(x: number, y: number) {
    // Use pathfinding to generate waypoints
    this.waypoints = findPathAroundObstacles(this.position, { x, y });
    this.currentWaypoint = 0;
    
    if (this.waypoints.length > 0) {
      this.targetPosition = this.waypoints[0];
    }
  }
  
  public update(deltaTime: number) {
    if (this.targetPosition) {
      // ... existing movement code
      
      if (distance < 2) {
        // Reached current waypoint
        this.currentWaypoint++;
        
        if (this.currentWaypoint < this.waypoints.length) {
          // Move to next waypoint
          this.targetPosition = this.waypoints[this.currentWaypoint];
        } else {
          // Reached final destination
          this.targetPosition = null;
          this.waypoints = [];
          this.sprite.textures = this.animations[`idle-${this.direction}`];
        }
      }
    }
  }
}
```

---

## 📋 Implementation Checklist

### Fix 1: Debug Station Interaction
- [ ] Add comprehensive console logging
- [ ] Increase interaction distance to 80px
- [ ] Test proximity detection
- [ ] Verify question modal appears

### Fix 2: Recipe Ticket System
- [ ] Create recipes.json with 5+ recipes
- [ ] Create RecipeTicketModal component
- [ ] Show recipe at Ticket Board
- [ ] Display ingredients and station order

### Fix 3: Interactive Mechanics
- [ ] Create FridgeMechanic (item selection)
- [ ] Create PrepMechanic (chopping minigame)
- [ ] Create StoveMechanic (temperature control)
- [ ] Create PlatingMechanic (item arrangement)
- [ ] Update QuestionModal to show mechanic first
- [ ] Then show question after mechanic complete

### Fix 4: Generate Pixel Art
- [ ] Generate floor-tile.png (checkered)
- [ ] Generate wall-tile.png (subway tiles)
- [ ] Generate fridge.png (96x96, top-down)
- [ ] Generate prep-station.png (96x96, cutting board)
- [ ] Generate stove.png (96x96, burners)
- [ ] Generate plating-station.png (96x96, plates)
- [ ] Load all assets in GameEngine

### Fix 5: Chef Sprite
- [ ] Generate chef-sprite-sheet.png (128x128, 4×4 grid)
- [ ] Update PlayerEntity to use AnimatedSprite
- [ ] Parse sprite sheet into directional animations
- [ ] Update direction based on movement
- [ ] Test all 4 directions animate correctly

### Fix 6: Pathfinding
- [ ] Create pathfinding.ts with waypoint system
- [ ] Implement lineIntersectsRect collision check
- [ ] Update PlayerEntity.moveTo() to use pathfinding
- [ ] Follow waypoints in sequence
- [ ] Test: Click past obstacle → player goes around

---

## 🎮 Final Testing

After implementing all fixes:

1. **Station Interaction:**
   - Walk to fridge → mechanic appears → complete → question appears
   - Walk to prep → chopping minigame → question
   - Walk to stove → temperature control → question
   - Walk to plating → item arrangement → question

2. **Recipe System:**
   - Walk to ticket board → recipe modal appears
   - Shows dish name, ingredients, station order
   - Accept order → recipe tracked

3. **Visual Quality:**
   - Floor has checkered tile pattern
   - Walls have subway tile texture
   - Stations look 3D and professional
   - Chef sprite faces correct direction
   - Walking animation smooth

4. **Pathfinding:**
   - Click behind station → player walks around
   - No getting stuck on obstacles
   - Smooth navigation through kitchen

---

**Start by generating all pixel art assets first, then implement the code fixes!** 🎨

Use your pixel art MCP with the exact prompts provided above for each asset.

