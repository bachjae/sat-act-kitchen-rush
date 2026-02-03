# Claude Code Prompt - Phase 2: Game Engine Implementation

Copy and paste this prompt into Claude Code (Cursor IDE):

---

Excellent work on the foundation setup! The project structure is ready. Now we'll build the core game engine with PixiJS rendering and player movement.

## What We're Building Next

**Phase 1, Days 3-4:** Core Game Engine
- PixiJS canvas initialization
- Kitchen rendering (floor, walls, stations)
- Player character entity
- Click-to-move functionality
- Basic game loop

## Documentation to Reference

Please read these sections before starting:
1. **DEVELOPMENT_GUIDE.md** - Section 2.1 and 2.2 (PixiJS Canvas Setup & Player Movement)
2. **PIXEL_MAP.md** - Section 2 (Kitchen Layout Map) and Section 3 (Station Coordinates)
3. **PIXEL_MAP.md** - Section 5 (Color Palette) for the exact hex colors

## Step 11: Create Kitchen Component (React)

Create `client/src/components/game/Kitchen.tsx`:

**Requirements:**
- React component with canvas ref
- Initializes PixiJS Application on mount
- Canvas size: 1280x720 pixels
- Background color: #F1FAEE (kitchen cream)
- Pixel-perfect rendering (antialias: false)
- Creates and starts GameEngine
- Cleanup on unmount
- Add CSS classes: "pixel-perfect border-4 border-kitchen-navy shadow-2xl"

**Reference:** DEVELOPMENT_GUIDE.md Section 2.1 has the exact code structure

## Step 12: Create GameEngine Class

Create `client/src/game/engine/GameEngine.ts`:

**Requirements:**
- Accept PixiJS Application in constructor
- Property: `running: boolean`
- Property: `lastTime: number` (for delta time calculation)
- Method: `start()` - begins game loop
- Method: `stop()` - stops game loop
- Method: `gameLoop()` - recursive with requestAnimationFrame
- Private method: `setupKitchen()` - renders initial kitchen
- Private method: `drawStations()` - renders all 6 stations

**Kitchen Rendering Details:**
1. Draw floor rectangle: 
   - Color: #E8E8E8 (light gray)
   - Full canvas: 0, 0, 1280, 720

2. Draw walls (Navy #1D3557):
   - Top wall: x=0, y=128, width=1280, height=32
   - Bottom wall: x=0, y=608, width=1280, height=32
   - Left wall: x=0, y=128, width=32, height=480
   - Right wall: x=1248, y=128, width=32, height=480

3. Draw station placeholders as colored rectangles:
   - Use `KITCHEN_LAYOUT.stations` array
   - For each station, draw rectangle at `station.collisionBox` coordinates
   - Use these colors (from PIXEL_MAP.md Section 5):
     - ticket: 0xFFD60A (yellow)
     - fridge: 0xA8DADC (teal)
     - prep: 0x06D6A0 (green)
     - stove: 0xE63946 (red)
     - plating: 0xF77F00 (orange)
     - serving: 0x457B9D (blue)

**Reference:** DEVELOPMENT_GUIDE.md Section 2.1 has the complete implementation

## Step 13: Update App.tsx

Modify `client/src/App.tsx` to render the Kitchen component:

```typescript
import { Kitchen } from '@components/game/Kitchen';

function App() {
  return <Kitchen />;
}

export default App;
```

**Test Checkpoint #1:** 
At this point, running `npm run dev` should show:
- A canvas with gray floor
- Navy blue walls on all sides
- 6 colored rectangles representing stations
- No errors in console

## Step 14: Create PlayerEntity Class

Create `client/src/game/entities/PlayerEntity.ts`:

**Requirements:**
- Property: `id: string`
- Property: `sprite: PIXI.Container`
- Property: `position: { x: number; y: number }`
- Property: `targetPosition: { x: number; y: number } | null`
- Property: `speed: number = 150` (pixels per second)
- Constructor: accepts id, startX, startY
- Method: `moveTo(x: number, y: number)` - sets target position
- Method: `update(deltaTime: number)` - moves toward target

**Visual Representation (for now):**
- Create a simple blue circle using PIXI.Graphics
- Radius: 16 pixels
- Color: #457B9D (kitchen blue)
- Center the circle at position

**Movement Logic:**
- Calculate distance to target
- If distance < 2 pixels: snap to target, clear target
- Otherwise: move at `speed * deltaTime` toward target
- Update sprite position after moving

**Reference:** DEVELOPMENT_GUIDE.md Section 2.2 has the complete PlayerEntity code

## Step 15: Add Player to GameEngine

Modify `client/src/game/engine/GameEngine.ts`:

**Add to class:**
- Property: `private player: PlayerEntity | null = null`

**In constructor (after setupKitchen):**
- Call `setupPlayer()`

**New method `setupPlayer()`:**
- Create new PlayerEntity with id "player1"
- Spawn at position: x=640, y=480 (center of kitchen)
- Add player sprite to stage: `this.app.stage.addChild(this.player.sprite)`

**Update gameLoop():**
- Calculate deltaTime: `(currentTime - this.lastTime) / 1000`
- Update `this.lastTime = currentTime`
- Call `this.player?.update(deltaTime)`

**Test Checkpoint #2:**
At this point, you should see a blue circle in the center of the kitchen.

## Step 16: Add Click-to-Move Input

Continue modifying `client/src/game/engine/GameEngine.ts`:

**In constructor (after setupPlayer):**
- Call `setupInput()`

**New method `setupInput()`:**
- Add click event listener to `this.app.view`
- On click:
  1. Get canvas bounding rectangle
  2. Calculate click position relative to canvas
  3. Call `this.player?.moveTo(x, y)`

**Reference:** DEVELOPMENT_GUIDE.md Section 2.2 shows the exact input setup code

**Test Checkpoint #3:**
- Click anywhere on the canvas
- Blue circle should smoothly move to clicked location
- Movement should be smooth and continuous

## Step 17: Add Station Collision Detection

Continue modifying `client/src/game/engine/GameEngine.ts`:

**New method `checkStationCollision(x: number, y: number): Station | null`:**
- Loop through `KITCHEN_LAYOUT.stations`
- For each station, check if point (x, y) is inside `station.interactionZone`
- Interaction zone check:
  ```typescript
  if (x >= zone.x && x <= zone.x + zone.width &&
      y >= zone.y && y <= zone.y + zone.height) {
    return station;
  }
  ```
- Return the station if found, null otherwise

**Update setupInput() click handler:**
- First check: `const station = this.checkStationCollision(x, y)`
- If station found: `console.log('Station clicked:', station.type)`
- Otherwise: move player to clicked position

**Test Checkpoint #4:**
- Click on colored station rectangles
- Console should log: "Station clicked: [type]"
- Click on floor still moves player

## Step 18: Create Zustand Game Store

Create `client/src/store/gameStore.ts`:

**State interface:**
```typescript
interface GameState {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'ended';
  sessionId: string | null;
  activeQuestion: Question | null;
  orders: Order[];
  score: number;
  coinsEarned: number;
  
  // Actions
  setStatus: (status: GameState['status']) => void;
  setActiveQuestion: (question: Question | null) => void;
  addOrder: (order: Order) => void;
  updateScore: (points: number) => void;
}
```

**Implementation:**
- Use `create<GameState>()` from zustand
- Initial state: all properties set to defaults
- Actions update state with `set()`

**Reference:** DEVELOPMENT_GUIDE.md Section 2.3 has the store structure

## Step 19: Connect Station Click to Question Loading

Modify `client/src/game/engine/GameEngine.ts`:

**Import at top:**
```typescript
import { useGameStore } from '@store/gameStore';
import { fetchQuestions } from '@services/questions.service';
```

**New async method `onStationClick(station: Station)`:**
- Log: "Fetching question for station: [station.type]"
- Call: `const questions = await fetchQuestions({ count: 1, stationType: station.type })`
- If questions found: `useGameStore.getState().setActiveQuestion(questions[0])`
- Log the question to console for verification

**Update setupInput():**
- When station clicked, call: `this.onStationClick(station)`

**Test Checkpoint #5:**
- Click on any station
- Console should show: fetched question data
- gameStore.activeQuestion should be populated (check with React DevTools)

## Step 20: Create QuestionModal Component

Create `client/src/components/ui/QuestionModal.tsx`:

**Requirements:**
- Subscribe to `useGameStore()` for `activeQuestion`
- Display modal only when `activeQuestion` is not null
- Show question stem and 4 choices (A, B, C, D)
- Track selected choice with `useState`
- Submit button (disabled if no selection)
- After submit: show feedback (correct/incorrect)
- Show explanation
- Continue button to close modal

**Styling:**
- Use Tailwind classes
- Correct feedback: green background (bg-green-100)
- Incorrect feedback: red background (bg-red-100)
- Choice buttons: highlight selected with blue border
- Add data-testid attributes for testing later

**Reference:** DEVELOPMENT_GUIDE.md Section 2.4 has the complete QuestionModal code

## Step 21: Add QuestionModal to Kitchen

Modify `client/src/components/game/Kitchen.tsx`:

**Import:**
```typescript
import { QuestionModal } from '@components/ui/QuestionModal';
```

**Add to JSX (below canvas):**
```typescript
<QuestionModal />
```

**Test Checkpoint #6 (FINAL TEST):**
1. Click on a station (e.g., Fridge - teal rectangle)
2. Question modal should appear
3. Select an answer choice (A, B, C, or D)
4. Click Submit
5. Should show correct/incorrect feedback with green/red background
6. Should show explanation text
7. Click Continue
8. Modal closes and you can click another station

## Verification Checklist

After completing Steps 11-21, verify:

- [ ] `npm run dev` runs without errors
- [ ] Canvas displays at 1280x720
- [ ] Floor is light gray, walls are navy blue
- [ ] 6 colored station rectangles visible
- [ ] Blue player circle visible in center
- [ ] Clicking floor moves player smoothly
- [ ] Clicking stations shows console log
- [ ] Question modal appears when clicking stations
- [ ] Can select answer and submit
- [ ] Feedback shows correct/incorrect
- [ ] Explanation displays
- [ ] Modal closes on Continue
- [ ] Can open questions from different stations
- [ ] Each station loads appropriate question type

## Important Notes

**Exact Coordinates:**
Use the EXACT coordinates from `KITCHEN_LAYOUT.stations` - don't approximate or adjust them. They're carefully calculated for proper spacing.

**Color Codes:**
Use the EXACT hex colors from PIXEL_MAP.md Section 5. They're part of the design system.

**Delta Time:**
Game loop MUST use delta time for smooth movement regardless of frame rate.

**TypeScript:**
Fix any TypeScript errors as you go. Use proper types from `@types/` imports.

**Testing as You Go:**
After each step, verify it works before moving on. Use `console.log()` liberally.

## Common Issues & Solutions

**Issue: Canvas not rendering**
- Check if canvas ref is properly attached
- Verify PixiJS Application initialized before use
- Check browser console for WebGL errors

**Issue: Player not moving**
- Check delta time calculation is correct
- Verify game loop is running (add console.log)
- Check player.update() is being called

**Issue: Stations not clickable**
- Log the click coordinates and interaction zones
- Verify coordinates match PIXEL_MAP.md specifications
- Check collision detection logic

**Issue: Questions not loading**
- Verify mock-questions.json is in client/src/data/
- Check import path is correct (@data/mock-questions.json)
- Verify .env.local has VITE_USE_MOCK_QUESTIONS=true

**Issue: Modal not showing**
- Check activeQuestion is being set in store
- Use React DevTools to inspect store state
- Verify modal visibility condition

## After Completion

Once all steps work correctly, let me know and we'll move to:
- **Phase 1 Day 5-7:** Order System, Timer System, Score System, Complete Game Flow

You'll have a playable prototype where you can click stations, answer questions, and see feedback!

---

**Ready? Let's build the game engine! Start with Step 11.** 🎮

