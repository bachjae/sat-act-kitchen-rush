# Claude Code Prompt - Fix Gameplay & Kitchen Layout Issues

I need you to fix 5 critical gameplay issues in my SAT/ACT Kitchen Rush game. Work through these systematically.

---

## 🎯 Overview of Fixes Needed

1. ✅ Add WASD/Arrow key movement
2. ✅ Player must reach station before question appears
3. ✅ Add proper collision detection
4. ✅ Redesign Ticket/Serving stations (no questions)
5. ✅ Improve kitchen layout to feel like real restaurant

---

## 🔧 FIX 1: Add Keyboard Movement (WASD + Arrow Keys)

### File to modify: `client/src/game/engine/InputManager.ts`

**Create this new file if it doesn't exist:**

```typescript
import { PlayerEntity } from '@game/entities/PlayerEntity';

export class InputManager {
  private keys: Map<string, boolean> = new Map();
  private player: PlayerEntity;
  
  constructor(player: PlayerEntity) {
    this.player = player;
    this.setupKeyboardListeners();
  }
  
  private setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys.set(e.key.toLowerCase(), true);
      
      // Prevent page scrolling with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys.set(e.key.toLowerCase(), false);
    });
  }
  
  public update(deltaTime: number) {
    let dx = 0;
    let dy = 0;
    
    // WASD
    if (this.keys.get('w') || this.keys.get('arrowup')) dy -= 1;
    if (this.keys.get('s') || this.keys.get('arrowdown')) dy += 1;
    if (this.keys.get('a') || this.keys.get('arrowleft')) dx -= 1;
    if (this.keys.get('d') || this.keys.get('arrowright')) dx += 1;
    
    // Normalize diagonal movement
    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;
      
      // Clear click-to-move target when using keyboard
      this.player.clearTarget();
      
      // Move player
      this.player.moveByDirection(dx, dy, deltaTime);
    }
  }
  
  public destroy() {
    // Remove listeners
    window.removeEventListener('keydown', () => {});
    window.removeEventListener('keyup', () => {});
  }
}
```

### Update PlayerEntity

**Modify `client/src/game/entities/PlayerEntity.ts`:**

Add these new methods:

```typescript
export class PlayerEntity {
  // ... existing properties
  private velocity: { x: number; y: number } = { x: 0, y: 0 };
  
  // Clear click-to-move target
  public clearTarget() {
    this.targetPosition = null;
  }
  
  // Move by keyboard direction
  public moveByDirection(dx: number, dy: number, deltaTime: number) {
    const moveSpeed = this.speed * deltaTime;
    
    this.velocity.x = dx * moveSpeed;
    this.velocity.y = dy * moveSpeed;
    
    // Apply movement (collision will be checked in GameEngine)
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    // Update sprite
    this.sprite.position.set(this.position.x, this.position.y);
  }
}
```

### Update GameEngine to use InputManager

**Modify `client/src/game/engine/GameEngine.ts`:**

```typescript
export class GameEngine {
  private inputManager: InputManager | null = null;
  
  constructor(app: Application) {
    // ... existing setup
  }
  
  private setupPlayer() {
    this.player = new PlayerEntity('player1', 640, 480);
    this.app.stage.addChild(this.player.sprite);
    
    // Create input manager AFTER player exists
    this.inputManager = new InputManager(this.player);
  }
  
  private gameLoop = () => {
    if (!this.running) return;
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    // Update input first
    this.inputManager?.update(deltaTime);
    
    // Then update player
    this.player?.update(deltaTime);
    
    // Check collisions AFTER movement
    this.checkCollisions();
    
    requestAnimationFrame(this.gameLoop);
  };
  
  public stop() {
    this.running = false;
    this.inputManager?.destroy();
  }
}
```

---

## 🔧 FIX 2: Question Only Appears When Player Reaches Station

### Update GameEngine collision detection

**Modify `client/src/game/engine/GameEngine.ts`:**

```typescript
private checkCollisions() {
  if (!this.player) return;
  
  const playerPos = this.player.position;
  const INTERACTION_DISTANCE = 50; // pixels
  
  KITCHEN_LAYOUT.stations.forEach(station => {
    // Calculate distance from player to station center
    const dx = station.position.x - playerPos.x;
    const dy = station.position.y - playerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if player is close enough to interact
    if (distance <= INTERACTION_DISTANCE) {
      // Highlight station
      this.highlightStation(station.id, true);
      
      // Check if station needs interaction
      this.checkStationInteraction(station);
    } else {
      this.highlightStation(station.id, false);
    }
  });
}

private highlightStation(stationId: string, highlight: boolean) {
  // Find station sprite and change tint/alpha
  const stationSprite = this.stationSprites.get(stationId);
  if (stationSprite) {
    stationSprite.alpha = highlight ? 0.8 : 1.0;
    // Add a glow effect when highlighted
  }
}

private checkStationInteraction(station: any) {
  // Get current active order
  const gameState = useGameStore.getState();
  const activeOrder = gameState.orders.find(o => o.status === 'in_progress');
  
  if (!activeOrder) {
    console.log('No active order, cannot interact with station');
    return;
  }
  
  // Find the next step in the order
  const nextStep = activeOrder.steps.find(s => s.status === 'active');
  
  if (!nextStep) {
    console.log('No active step in order');
    return;
  }
  
  // Check if this is the correct station for the next step
  if (nextStep.stationType === station.type) {
    // Player reached the correct station!
    console.log(`✅ Player reached ${station.type} station`);
    
    // Show interaction prompt
    this.showInteractionPrompt(station);
  } else {
    console.log(`⚠️ Wrong station! Need ${nextStep.stationType}, at ${station.type}`);
  }
}

private showInteractionPrompt(station: any) {
  // Store which station player is at
  this.currentStation = station;
  
  // Show UI prompt: "Press E to interact" or auto-trigger
  // For now, auto-trigger after 0.5 second
  if (!this.interactionTimeout) {
    this.interactionTimeout = setTimeout(() => {
      this.triggerStationInteraction(station);
      this.interactionTimeout = null;
    }, 500);
  }
}

private async triggerStationInteraction(station: any) {
  // This replaces the old onStationClick
  console.log(`🎯 Interacting with ${station.type} station`);
  
  // Fetch and show question
  const questions = await fetchQuestions({ 
    count: 1, 
    stationType: station.type 
  });
  
  if (questions && questions.length > 0) {
    useGameStore.getState().setActiveQuestion(questions[0]);
  }
}
```

### Remove click-to-open-question behavior

**Update your station click handler:**

```typescript
private setupInput() {
  this.app.view.addEventListener('click', (e) => {
    if (!this.player) return;
    
    const rect = this.app.view.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking a station
    const station = this.checkStationCollision(x, y);
    
    if (station) {
      // Don't open question directly!
      // Instead, move player TO the station
      console.log(`🎯 Moving to ${station.type} station`);
      this.player.moveTo(station.position.x, station.position.y);
    } else {
      // Move to clicked location
      this.player.moveTo(x, y);
    }
  });
}
```

---

## 🔧 FIX 3: Add Proper Collision Detection

### Create CollisionSystem

**New file: `client/src/game/systems/CollisionSystem.ts`:**

```typescript
import { PlayerEntity } from '@game/entities/PlayerEntity';
import { KITCHEN_LAYOUT } from '@game/config/kitchen-layout';

export class CollisionSystem {
  // AABB (Axis-Aligned Bounding Box) collision
  static checkAABB(
    pos1: { x: number; y: number },
    size1: { width: number; height: number },
    pos2: { x: number; y: number },
    size2: { width: number; height: number }
  ): boolean {
    return (
      pos1.x < pos2.x + size2.width &&
      pos1.x + size1.width > pos2.x &&
      pos1.y < pos2.y + size2.height &&
      pos1.y + size1.height > pos2.y
    );
  }
  
  static checkPlayerCollisions(player: PlayerEntity): boolean {
    const playerBox = {
      x: player.position.x - 16, // Player is 32px wide
      y: player.position.y - 16,
      width: 32,
      height: 32,
    };
    
    // Check wall collisions
    const walls = [
      { x: 0, y: 128, width: 32, height: 480 },      // Left wall
      { x: 1248, y: 128, width: 32, height: 480 },   // Right wall
      { x: 0, y: 128, width: 1280, height: 32 },     // Top wall
      { x: 0, y: 608, width: 1280, height: 32 },     // Bottom wall
    ];
    
    for (const wall of walls) {
      if (this.checkAABB(playerBox, playerBox, wall, wall)) {
        return true; // Collision detected
      }
    }
    
    // Check station collisions
    for (const station of KITCHEN_LAYOUT.stations) {
      const stationBox = station.collisionBox;
      
      if (this.checkAABB(
        playerBox,
        { width: playerBox.width, height: playerBox.height },
        { x: stationBox.x, y: stationBox.y },
        { width: stationBox.width, height: stationBox.height }
      )) {
        return true; // Collision with station
      }
    }
    
    return false; // No collision
  }
  
  static resolveCollision(player: PlayerEntity, previousPosition: { x: number; y: number }) {
    // Simple resolution: move player back to previous position
    player.position.x = previousPosition.x;
    player.position.y = previousPosition.y;
    player.sprite.position.set(previousPosition.x, previousPosition.y);
  }
}
```

### Apply collision detection in GameEngine

**Update `client/src/game/engine/GameEngine.ts`:**

```typescript
import { CollisionSystem } from '@game/systems/CollisionSystem';

private gameLoop = () => {
  // ... existing code
  
  // Store previous position
  const prevPos = { 
    x: this.player!.position.x, 
    y: this.player!.position.y 
  };
  
  // Update input/movement
  this.inputManager?.update(deltaTime);
  this.player?.update(deltaTime);
  
  // Check collisions AFTER movement
  if (CollisionSystem.checkPlayerCollisions(this.player!)) {
    // Collision detected, revert position
    CollisionSystem.resolveCollision(this.player!, prevPos);
  }
  
  // ... rest of loop
};
```

### Add simple pathfinding for click-to-move

**For now, use simple waypoint system:**

```typescript
private findPathToStation(station: any): { x: number; y: number }[] {
  // Simple waypoint approach:
  // 1. Move to center of kitchen
  // 2. Move to station
  
  const waypoints = [];
  
  // If station is blocked, add waypoint to navigate around
  const centerPoint = { x: 640, y: 400 };
  
  // Check if direct line is blocked
  if (this.isPathBlocked(this.player!.position, station.position)) {
    waypoints.push(centerPoint); // Go through center
  }
  
  waypoints.push(station.position);
  
  return waypoints;
}

private isPathBlocked(from: { x: number; y: number }, to: { x: number; y: number }): boolean {
  // Simple line-of-sight check
  // For now, just return false (direct path)
  // TODO: Implement proper pathfinding in Priority 5
  return false;
}
```

---

## 🔧 FIX 4: Redesign Ticket/Serving Stations (No Questions)

### Update Order Flow

**Modify `client/src/game/systems/OrderSystem.ts`:**

```typescript
export async function generateOrder(): Promise<Order> {
  // Only generate questions for: Fridge, Prep, Stove, Plating
  const questionStations: StationType[] = ['fridge', 'prep', 'stove', 'plating'];
  
  const steps: OrderStep[] = [];
  
  // Step 1: Ticket Board (no question, just pick up order)
  steps.push({
    stationType: 'ticket',
    questionId: null, // No question!
    status: 'active', // First step is always active
    action: 'pickup-order',
  });
  
  // Steps 2-5: Question stations
  for (const stationType of questionStations) {
    const questions = await fetchQuestions({ count: 1, stationType });
    if (questions.length > 0) {
      steps.push({
        stationType,
        questionId: questions[0].id,
        status: 'locked',
        action: 'answer-question',
      });
    }
  }
  
  // Step 6: Serving Window (no question, just deliver)
  steps.push({
    stationType: 'serving',
    questionId: null,
    status: 'locked',
    action: 'deliver-order',
  });
  
  return {
    id: uuidv4(),
    dishName: getRandomDishName(),
    steps,
    deadline: 180, // 3 minutes
    timeRemaining: 180,
    status: 'pending',
    qualityScore: 0,
  };
}
```

### Handle Ticket Board Interaction

**In GameEngine collision check:**

```typescript
private checkStationInteraction(station: any) {
  const gameState = useGameStore.getState();
  
  // Special handling for Ticket Board
  if (station.type === 'ticket') {
    // Show available orders to pick up
    this.showOrderPickupUI();
    return;
  }
  
  // Special handling for Serving Window
  if (station.type === 'serving') {
    // Complete current order
    this.completeOrder();
    return;
  }
  
  // For other stations, proceed with question
  // ... existing question logic
}

private showOrderPickupUI() {
  console.log('📋 At Ticket Board - Pick up an order');
  
  const gameState = useGameStore.getState();
  const availableOrders = gameState.orders.filter(o => o.status === 'pending');
  
  if (availableOrders.length > 0) {
    // Auto-accept first pending order
    const order = availableOrders[0];
    gameState.startOrder(order.id);
    
    console.log(`✅ Picked up order: ${order.dishName}`);
    
    // Show notification
    // TODO: Add visual feedback
  }
}

private completeOrder() {
  console.log('🎉 At Serving Window - Delivering order');
  
  const gameState = useGameStore.getState();
  const activeOrder = gameState.orders.find(o => o.status === 'in_progress');
  
  if (activeOrder) {
    // Check if all steps are complete
    const allComplete = activeOrder.steps.every(s => s.status === 'completed');
    
    if (allComplete) {
      gameState.completeOrder(activeOrder.id);
      console.log('✅ Order delivered successfully!');
      
      // Play success sound
      // Show +points animation
    } else {
      console.log('❌ Order not complete yet!');
    }
  }
}
```

---

## 🔧 FIX 5: Redesign Kitchen Layout (Real Restaurant Flow)

### New Kitchen Layout

**Update `client/src/game/config/kitchen-layout.ts`:**

```typescript
export const KITCHEN_LAYOUT = {
  canvas: {
    width: 1280,
    height: 720,
  },
  
  stations: [
    // === FRONT OF HOUSE (Top) ===
    
    // Ticket Board - Left side, where orders come in
    {
      id: 'ticket-board',
      type: 'ticket',
      name: 'Order Tickets',
      position: { x: 160, y: 200 },
      collisionBox: { x: 112, y: 160, width: 96, height: 80 },
      interactionZone: { x: 112, y: 240, width: 96, height: 60 },
      sprite: 'ticket-board',
    },
    
    // Serving Window - Right side, where completed orders go
    {
      id: 'serving-window',
      type: 'serving',
      name: 'Serving Window',
      position: { x: 1120, y: 200 },
      collisionBox: { x: 1072, y: 160, width: 96, height: 80 },
      interactionZone: { x: 1072, y: 240, width: 96, height: 60 },
      sprite: 'serving-window',
    },
    
    // === COLD PREP AREA (Left side) ===
    
    // Walk-in Fridge/Cooler
    {
      id: 'fridge',
      type: 'fridge',
      name: 'Walk-in Cooler',
      position: { x: 200, y: 400 },
      collisionBox: { x: 152, y: 352, width: 96, height: 96 },
      interactionZone: { x: 152, y: 448, width: 96, height: 60 },
      sprite: 'fridge',
    },
    
    // Cold Prep Station (next to fridge)
    {
      id: 'prep-cold',
      type: 'prep',
      name: 'Cold Prep',
      position: { x: 360, y: 400 },
      collisionBox: { x: 312, y: 352, width: 96, height: 96 },
      interactionZone: { x: 312, y: 448, width: 96, height: 60 },
      sprite: 'prep-station',
    },
    
    // === HOT LINE (Center) ===
    
    // Grill/Stove
    {
      id: 'stove',
      type: 'stove',
      name: 'Stove & Grill',
      position: { x: 580, y: 400 },
      collisionBox: { x: 532, y: 352, width: 96, height: 96 },
      interactionZone: { x: 532, y: 448, width: 96, height: 60 },
      sprite: 'stove',
    },
    
    // Oven (next to stove)
    {
      id: 'oven',
      type: 'stove',
      name: 'Oven',
      position: { x: 740, y: 400 },
      collisionBox: { x: 692, y: 352, width: 96, height: 96 },
      interactionZone: { x: 692, y: 448, width: 96, height: 60 },
      sprite: 'oven',
    },
    
    // === FINISHING AREA (Right side) ===
    
    // Plating Station
    {
      id: 'plating',
      type: 'plating',
      name: 'Plating Station',
      position: { x: 960, y: 400 },
      collisionBox: { x: 912, y: 352, width: 96, height: 96 },
      interactionZone: { x: 912, y: 448, width: 96, height: 60 },
      sprite: 'plating-station',
    },
    
    // Garnish/Finishing (next to plating)
    {
      id: 'garnish',
      type: 'plating',
      name: 'Garnish Station',
      position: { x: 1120, y: 400 },
      collisionBox: { x: 1072, y: 352, width: 96, height: 96 },
      interactionZone: { x: 1072, y: 448, width: 96, height: 60 },
      sprite: 'garnish-station',
    },
    
    // === UTILITY (Bottom) ===
    
    // Dish Wash (bottom left)
    {
      id: 'dish-wash',
      type: 'utility',
      name: 'Dish Wash',
      position: { x: 200, y: 580 },
      collisionBox: { x: 152, y: 532, width: 96, height: 96 },
      interactionZone: { x: 152, y: 480, width: 96, height: 60 },
      sprite: 'dish-wash',
      isOptional: true, // Not required for orders
    },
    
    // Dry Storage (bottom right)
    {
      id: 'storage',
      type: 'utility',
      name: 'Dry Storage',
      position: { x: 1080, y: 580 },
      collisionBox: { x: 1032, y: 532, width: 96, height: 96 },
      interactionZone: { x: 1032, y: 480, width: 96, height: 60 },
      sprite: 'storage',
      isOptional: true,
    },
  ],
  
  // Define walkable floor area
  floorArea: {
    x: 64,
    y: 280, // Below ticket/serving area
    width: 1152,
    height: 360,
  },
  
  // Walls
  walls: [
    { x: 0, y: 160, width: 1280, height: 32 },     // Top wall
    { x: 0, y: 640, width: 1280, height: 32 },     // Bottom wall
    { x: 0, y: 160, width: 64, height: 480 },      // Left wall
    { x: 1216, y: 160, width: 64, height: 480 },   // Right wall
  ],
};
```

### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CUSTOMER AREA                        │
├─────────────────────────────────────────────────────────┤
│  TICKET    [Customer Counter/Pass-Through]    SERVING  │
│  BOARD                                         WINDOW   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────┐  ┌──────┐     ┌──────┐  ┌──────┐           │
│  │FRIDGE│  │ COLD │     │STOVE │  │ OVEN │  ┌──────┐ │
│  │      │  │ PREP │     │      │  │      │  │PLATING│ │
│  └──────┘  └──────┘     └──────┘  └──────┘  └──────┘ │
│                                                         │
│           [Main Kitchen Floor - Walkable]              │
│                                                         │
│  ┌──────┐                              ┌──────┐       │
│  │ DISH │                              │STORAGE│       │
│  │ WASH │                              │      │       │
│  └──────┘                              └──────┘       │
└─────────────────────────────────────────────────────────┘

Flow: Ticket → Fridge → Prep → Stove → Plating → Serving
```

---

## 📋 Implementation Checklist

Work through these in order:

### Fix 1: Keyboard Movement
- [ ] Create InputManager.ts
- [ ] Add keyboard listeners (WASD + Arrows)
- [ ] Update PlayerEntity with moveByDirection()
- [ ] Integrate into GameEngine.update()
- [ ] Test: Can move with WASD
- [ ] Test: Can move with Arrow keys
- [ ] Test: Click-to-move still works

### Fix 2: Reach Station First
- [ ] Remove instant question trigger on click
- [ ] Add proximity detection in collision check
- [ ] Show interaction prompt when near station
- [ ] Auto-trigger after 0.5s or press E
- [ ] Test: Click station → player walks there → question appears

### Fix 3: Collision Detection
- [ ] Create CollisionSystem.ts
- [ ] Add AABB collision check
- [ ] Check walls and stations
- [ ] Resolve collisions by reverting position
- [ ] Test: Can't walk through walls
- [ ] Test: Can't walk through stations
- [ ] Test: Smooth movement around obstacles

### Fix 4: Ticket/Serving Redesign
- [ ] Update generateOrder() - no questions for ticket/serving
- [ ] Add showOrderPickupUI() for ticket board
- [ ] Add completeOrder() for serving window
- [ ] Update step types (pickup-order, answer-question, deliver-order)
- [ ] Test: Ticket board shows orders
- [ ] Test: Serving window completes orders
- [ ] Test: Middle stations still show questions

### Fix 5: Kitchen Layout
- [ ] Update KITCHEN_LAYOUT with new positions
- [ ] Add more stations (8-10 total)
- [ ] Arrange in logical restaurant flow
- [ ] Add floor area definition
- [ ] Add wall definitions
- [ ] Test: Layout looks like real kitchen
- [ ] Test: All stations reachable
- [ ] Test: Flow makes sense

---

## 🎮 Testing Instructions

After implementing all fixes, verify:

1. **Movement Test:**
   - Press W/A/S/D - player moves smoothly
   - Press Arrow keys - player moves smoothly
   - Click floor - player walks to location
   - Movement is smooth, no jittering

2. **Collision Test:**
   - Try to walk through walls - blocked
   - Try to walk through stations - blocked
   - Can navigate around stations
   - No getting stuck in corners

3. **Station Interaction Test:**
   - Click Ticket Board → walk there → order appears
   - Click Fridge → walk there → question appears
   - Answer question → step completes
   - Repeat for all stations
   - Deliver at Serving Window → order complete

4. **Kitchen Flow Test:**
   - Pick up order from Ticket
   - Visit stations in sequence
   - Deliver at Serving Window
   - Feels like working in a kitchen

---

## 🚨 Important Notes

**Priority Order:**
1. Do Fix 1 (keyboard) first - easiest
2. Then Fix 3 (collision) - needed for Fix 2
3. Then Fix 2 (reach station first)
4. Then Fix 4 (ticket/serving)
5. Finally Fix 5 (layout)

**Performance:**
- Collision checks are expensive - only check when player moves
- Cache collision boxes, don't recalculate every frame
- Use spatial partitioning if performance issues arise

**User Experience:**
- Add visual feedback for everything (highlights, prompts)
- Make controls feel responsive (immediate input reaction)
- Show clear affordances (player knows what they can interact with)

---

**Start with Fix 1 (keyboard movement) and work through systematically!** 🎮

