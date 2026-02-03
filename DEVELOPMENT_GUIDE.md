# SAT/ACT Kitchen Rush - Development Guide

## Table of Contents
1. [Implementation Order](#implementation-order)
2. [Phase 1: Foundation](#phase-1-foundation)
3. [Phase 2: Core Gameplay](#phase-2-core-gameplay)
4. [Phase 3: UI & Polish](#phase-3-ui--polish)
5. [Phase 4: Multiplayer](#phase-4-multiplayer)
6. [Phase 5: Testing & Deployment](#phase-5-testing--deployment)

---

## 1. Implementation Order

### Priority Matrix

| Phase | Component | Priority | Estimated Time |
|-------|-----------|----------|----------------|
| 1 | Firebase Setup | CRITICAL | 2 hours |
| 1 | Type Definitions | CRITICAL | 3 hours |
| 1 | Mock Data Loading | CRITICAL | 2 hours |
| 2 | PixiJS Canvas Setup | HIGH | 4 hours |
| 2 | Player Movement | HIGH | 6 hours |
| 2 | Station Interactions | HIGH | 8 hours |
| 2 | Question Modal | HIGH | 6 hours |
| 2 | Order System | HIGH | 8 hours |
| 3 | HUD & UI Components | MEDIUM | 6 hours |
| 3 | Recap Screen | MEDIUM | 4 hours |
| 3 | Animations & Polish | LOW | 8 hours |
| 4 | WebSocket Setup | MEDIUM | 4 hours |
| 4 | Multiplayer Rooms | MEDIUM | 8 hours |
| 4 | Synchronization | MEDIUM | 6 hours |
| 5 | Testing | HIGH | 12 hours |
| 5 | Deployment | HIGH | 4 hours |

**Total Estimated Time: ~90 hours (11-12 working days)**

---

## 2. Phase 1: Foundation (Day 1-2)

### Step 1.1: Firebase Initialization

**Goal**: Connect to Firebase and verify access

**Files to create:**
- `client/src/services/firebase.ts`
- `server/src/config/firebase.ts`

**Implementation:**

```typescript
// client/src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**Verification:**
```powershell
cd client
npm run dev
# Check browser console - no Firebase errors
```

### Step 1.2: Type Definitions

**Goal**: Define all TypeScript interfaces

**Files to create:**
- `shared/src/types/game.types.ts`
- `shared/src/types/question.types.ts`
- `shared/src/types/user.types.ts`
- `shared/src/types/session.types.ts`

**Key types:**

```typescript
// shared/src/types/game.types.ts
export type StationType = 'ticket' | 'fridge' | 'prep' | 'stove' | 'plating' | 'serving';

export interface Station {
  id: string;
  type: StationType;
  name: string;
  position: { x: number; y: number };
  collisionBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  interactionZone: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Order {
  id: string;
  dishName: string;
  steps: OrderStep[];
  deadline: number;
  timeRemaining: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  qualityScore: number;
}

export interface OrderStep {
  stationType: StationType;
  questionId: string;
  status: 'locked' | 'active' | 'completed' | 'failed';
  timeTaken?: number;
  isCorrect?: boolean;
}

// Add more types...
```

### Step 1.3: Load Mock Data

**Goal**: Load questions from JSON without Firebase

**Files to create:**
- `client/src/data/mock-questions.json`
- `client/src/services/questions.service.ts`

**Implementation:**

```typescript
// client/src/services/questions.service.ts
import mockQuestions from '@data/mock-questions.json';
import { Question } from '@types/question.types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_QUESTIONS === 'true';

export async function fetchQuestions(params: {
  count: number;
  skills?: string[];
  stationType?: StationType;
}): Promise<Question[]> {
  if (USE_MOCK) {
    return filterAndShuffle(mockQuestions.questions, params);
  }
  
  // TODO: Fetch from Firestore later
  return [];
}

function filterAndShuffle(questions: any[], params: any): Question[] {
  let filtered = [...questions];
  
  if (params.stationType) {
    filtered = filtered.filter(q => q.stationType === params.stationType);
  }
  
  if (params.skills && params.skills.length > 0) {
    filtered = filtered.filter(q => params.skills.includes(q.skillId));
  }
  
  // Shuffle
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, params.count);
}
```

**Verification:**
```typescript
// Test in console
const questions = await fetchQuestions({ count: 10 });
console.log(questions); // Should show 10 random questions
```

---

## 3. Phase 2: Core Gameplay (Day 3-7)

### Step 2.1: PixiJS Canvas Setup

**Goal**: Render basic kitchen layout

**Files to create:**
- `client/src/game/engine/GameEngine.ts`
- `client/src/game/engine/Renderer.ts`
- `client/src/components/game/Kitchen.tsx`

**Implementation:**

```typescript
// client/src/components/game/Kitchen.tsx
import React, { useEffect, useRef } from 'react';
import { Application } from 'pixi.js';
import { GameEngine } from '@game/engine/GameEngine';

export function Kitchen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize PixiJS
    const app = new Application({
      view: canvasRef.current,
      width: 1280,
      height: 720,
      backgroundColor: 0xF1FAEE,
      antialias: false, // Pixel-perfect
    });
    
    // Create game engine
    engineRef.current = new GameEngine(app);
    engineRef.current.start();
    
    return () => {
      engineRef.current?.stop();
      app.destroy(true);
    };
  }, []);
  
  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-kitchen-cream">
      <canvas
        ref={canvasRef}
        className="pixel-perfect border-4 border-kitchen-navy shadow-2xl"
      />
    </div>
  );
}
```

```typescript
// client/src/game/engine/GameEngine.ts
import { Application, Graphics } from 'pixi.js';
import { KITCHEN_LAYOUT } from '@game/config/kitchen-layout';

export class GameEngine {
  private app: Application;
  private running: boolean = false;
  
  constructor(app: Application) {
    this.app = app;
    this.setupKitchen();
  }
  
  private setupKitchen() {
    // Draw floor
    const floor = new Graphics();
    floor.beginFill(0xE8E8E8);
    floor.drawRect(0, 0, 1280, 720);
    floor.endFill();
    this.app.stage.addChild(floor);
    
    // Draw walls
    const walls = new Graphics();
    walls.beginFill(0x1D3557);
    
    // Top wall
    walls.drawRect(0, 128, 1280, 32);
    // Bottom wall
    walls.drawRect(0, 608, 1280, 32);
    // Left wall
    walls.drawRect(0, 128, 32, 480);
    // Right wall
    walls.drawRect(1248, 128, 32, 480);
    
    walls.endFill();
    this.app.stage.addChild(walls);
    
    // Draw station placeholders
    this.drawStations();
  }
  
  private drawStations() {
    KITCHEN_LAYOUT.stations.forEach(station => {
      const box = new Graphics();
      box.beginFill(this.getStationColor(station.type));
      box.drawRect(
        station.collisionBox.x,
        station.collisionBox.y,
        station.collisionBox.width,
        station.collisionBox.height
      );
      box.endFill();
      
      // Add label
      // TODO: Add text label
      
      this.app.stage.addChild(box);
    });
  }
  
  private getStationColor(type: string): number {
    const colors = {
      ticket: 0xFFD60A,
      fridge: 0xA8DADC,
      prep: 0x06D6A0,
      stove: 0xE63946,
      plating: 0xF77F00,
      serving: 0x457B9D,
    };
    return colors[type] || 0xFFFFFF;
  }
  
  public start() {
    this.running = true;
    this.gameLoop();
  }
  
  public stop() {
    this.running = false;
  }
  
  private gameLoop = () => {
    if (!this.running) return;
    
    // Update game state
    // TODO: Add systems
    
    requestAnimationFrame(this.gameLoop);
  };
}
```

**Verification:**
- Run dev server
- Should see kitchen with colored rectangles for stations
- No errors in console

### Step 2.2: Player Movement

**Goal**: Click to move player character

**Files to create:**
- `client/src/game/entities/PlayerEntity.ts`
- `client/src/game/systems/MovementSystem.ts`
- `client/src/game/systems/InputSystem.ts`

**Implementation:**

```typescript
// client/src/game/entities/PlayerEntity.ts
import { Graphics, Container } from 'pixi.js';

export class PlayerEntity {
  public id: string;
  public sprite: Container;
  public position: { x: number; y: number };
  public targetPosition: { x: number; y: number } | null = null;
  public speed: number = 150; // pixels per second
  
  constructor(id: string, startX: number, startY: number) {
    this.id = id;
    this.position = { x: startX, y: startY };
    
    // Create simple circle sprite for now
    this.sprite = new Container();
    const circle = new Graphics();
    circle.beginFill(0x457B9D); // Blue player
    circle.drawCircle(0, 0, 16);
    circle.endFill();
    
    this.sprite.addChild(circle);
    this.sprite.position.set(startX, startY);
  }
  
  public moveTo(x: number, y: number) {
    this.targetPosition = { x, y };
  }
  
  public update(deltaTime: number) {
    if (!this.targetPosition) return;
    
    const dx = this.targetPosition.x - this.position.x;
    const dy = this.targetPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 2) {
      // Reached target
      this.position.x = this.targetPosition.x;
      this.position.y = this.targetPosition.y;
      this.targetPosition = null;
    } else {
      // Move towards target
      const moveDistance = this.speed * deltaTime;
      this.position.x += (dx / distance) * moveDistance;
      this.position.y += (dy / distance) * moveDistance;
    }
    
    // Update sprite
    this.sprite.position.set(this.position.x, this.position.y);
  }
}
```

```typescript
// client/src/game/engine/GameEngine.ts (add to class)
private player: PlayerEntity | null = null;
private lastTime: number = 0;

constructor(app: Application) {
  this.app = app;
  this.setupKitchen();
  this.setupPlayer();
  this.setupInput();
}

private setupPlayer() {
  this.player = new PlayerEntity('player1', 640, 480);
  this.app.stage.addChild(this.player.sprite);
}

private setupInput() {
  this.app.view.addEventListener('click', (e) => {
    if (!this.player) return;
    
    const rect = this.app.view.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.player.moveTo(x, y);
  });
}

private gameLoop = () => {
  if (!this.running) return;
  
  const currentTime = performance.now();
  const deltaTime = (currentTime - this.lastTime) / 1000;
  this.lastTime = currentTime;
  
  // Update player
  this.player?.update(deltaTime);
  
  requestAnimationFrame(this.gameLoop);
};
```

**Verification:**
- Click on canvas
- Player circle should move to clicked location
- Movement should be smooth

### Step 2.3: Station Interactions

**Goal**: Click station to trigger event

**Files to create:**
- `client/src/game/systems/CollisionSystem.ts`
- `client/src/store/gameStore.ts`

**Implementation:**

```typescript
// client/src/store/gameStore.ts
import { create } from 'zustand';
import { Question, Order, Station } from '@types/game.types';

interface GameState {
  status: 'idle' | 'playing' | 'paused' | 'ended';
  activeQuestion: Question | null;
  orders: Order[];
  score: number;
  
  setActiveQuestion: (question: Question | null) => void;
  addOrder: (order: Order) => void;
  updateScore: (points: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  status: 'idle',
  activeQuestion: null,
  orders: [],
  score: 0,
  
  setActiveQuestion: (question) => set({ activeQuestion: question }),
  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
  updateScore: (points) => set((state) => ({ score: state.score + points })),
}));
```

```typescript
// Add to GameEngine.ts
import { useGameStore } from '@store/gameStore';

private checkStationCollision(x: number, y: number) {
  for (const station of KITCHEN_LAYOUT.stations) {
    const zone = station.interactionZone;
    if (
      x >= zone.x &&
      x <= zone.x + zone.width &&
      y >= zone.y &&
      y <= zone.y + zone.height
    ) {
      this.onStationClick(station);
      return;
    }
  }
}

private onStationClick(station: Station) {
  console.log('Station clicked:', station.type);
  
  // Get a question for this station type
  fetchQuestions({ count: 1, stationType: station.type }).then(questions => {
    if (questions.length > 0) {
      useGameStore.getState().setActiveQuestion(questions[0]);
    }
  });
}

// Update click handler
private setupInput() {
  this.app.view.addEventListener('click', (e) => {
    const rect = this.app.view.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking station
    this.checkStationCollision(x, y);
    
    // Otherwise move player
    if (this.player) {
      this.player.moveTo(x, y);
    }
  });
}
```

**Verification:**
- Click on colored station box
- Console should log "Station clicked: [type]"
- Store should have activeQuestion set

### Step 2.4: Question Modal

**Goal**: Display question UI when station clicked

**Files to create:**
- `client/src/components/ui/QuestionModal.tsx`

**Implementation:**

```typescript
// client/src/components/ui/QuestionModal.tsx
import React, { useState } from 'react';
import { useGameStore } from '@store/gameStore';
import { Dialog, DialogContent } from '@/components/shared/Modal';

export function QuestionModal() {
  const { activeQuestion, setActiveQuestion } = useGameStore();
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  if (!activeQuestion) return null;
  
  const handleSubmit = () => {
    setShowFeedback(true);
  };
  
  const handleContinue = () => {
    setActiveQuestion(null);
    setShowFeedback(false);
    setSelectedChoice(null);
  };
  
  const isCorrect = selectedChoice === activeQuestion.correctChoiceId;
  
  return (
    <Dialog open={!!activeQuestion} onOpenChange={() => handleContinue()}>
      <DialogContent className="max-w-2xl">
        <div className="p-6">
          {!showFeedback ? (
            <>
              <div className="mb-4">
                <span className="text-sm font-semibold text-kitchen-blue">
                  {activeQuestion.stationType.toUpperCase()} STATION
                </span>
                <h2 className="text-2xl font-bold mt-2">{activeQuestion.stem}</h2>
              </div>
              
              <div className="space-y-3">
                {activeQuestion.choices.map(choice => (
                  <button
                    key={choice.id}
                    onClick={() => setSelectedChoice(choice.id)}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${selectedChoice === choice.id 
                        ? 'border-kitchen-blue bg-kitchen-teal' 
                        : 'border-gray-300 hover:border-kitchen-blue'
                      }
                    `}
                  >
                    <span className="font-bold">{choice.id}.</span> {choice.text}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!selectedChoice}
                className="btn-primary w-full mt-6"
              >
                Submit Answer
              </button>
            </>
          ) : (
            <>
              <div className={`p-6 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                <h3 className={`text-2xl font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                </h3>
                <p className="mt-4 text-gray-700">{activeQuestion.explanation}</p>
              </div>
              
              <button
                onClick={handleContinue}
                className="btn-primary w-full mt-6"
              >
                Continue
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

```typescript
// Add to Kitchen.tsx
import { QuestionModal } from '@components/ui/QuestionModal';

export function Kitchen() {
  // ... existing code
  
  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-kitchen-cream">
      <canvas ref={canvasRef} className="pixel-perfect border-4 border-kitchen-navy shadow-2xl" />
      
      <QuestionModal />  {/* Add modal */}
    </div>
  );
}
```

**Verification:**
- Click station
- Modal should appear with question
- Can select answer and submit
- Should show feedback

### Step 2.5: Order System

**Goal**: Generate and display orders

**Files to create:**
- `client/src/game/systems/OrderSystem.ts`
- `client/src/components/game/Order.tsx`

**Implementation:**

```typescript
// client/src/game/systems/OrderSystem.ts
import { Order, OrderStep } from '@types/game.types';
import { fetchQuestions } from '@services/questions.service';
import { v4 as uuidv4 } from 'uuid';

const RECIPE_NAMES = [
  'Comma Curry',
  'Quadratic Quiche',
  'Algebra Alfredo',
  'Grammar Gumbo',
  'Calculus Casserole',
];

export async function generateOrder(): Promise<Order> {
  // Generate steps for each station type
  const stationTypes: StationType[] = ['ticket', 'fridge', 'prep', 'stove', 'plating'];
  
  const steps: OrderStep[] = [];
  
  for (const stationType of stationTypes) {
    const questions = await fetchQuestions({ count: 1, stationType });
    if (questions.length > 0) {
      steps.push({
        stationType,
        questionId: questions[0].id,
        status: 'locked',
      });
    }
  }
  
  // Unlock first step
  if (steps.length > 0) {
    steps[0].status = 'active';
  }
  
  return {
    id: uuidv4(),
    dishName: RECIPE_NAMES[Math.floor(Math.random() * RECIPE_NAMES.length)],
    steps,
    deadline: 180, // 3 minutes
    timeRemaining: 180,
    status: 'pending',
    qualityScore: 0,
  };
}
```

```typescript
// Add to gameStore.ts
startSession: async () => {
  set({ status: 'playing' });
  
  // Generate initial orders
  const order1 = await generateOrder();
  const order2 = await generateOrder();
  
  set({ orders: [order1, order2] });
},
```

```typescript
// client/src/components/game/Order.tsx
import React from 'react';
import { Order as OrderType } from '@types/game.types';

interface Props {
  order: OrderType;
}

export function OrderCard({ order }: Props) {
  const completedSteps = order.steps.filter(s => s.status === 'completed').length;
  
  return (
    <div className="card p-4 w-64">
      <h3 className="font-bold text-lg">{order.dishName}</h3>
      
      <div className="mt-2 text-sm text-gray-600">
        Time: {Math.floor(order.timeRemaining / 60)}:{(order.timeRemaining % 60).toString().padStart(2, '0')}
      </div>
      
      <div className="mt-3 space-y-1">
        {order.steps.map((step, idx) => (
          <div
            key={idx}
            className={`
              flex items-center gap-2 text-sm
              ${step.status === 'completed' ? 'text-green-600' : ''}
              ${step.status === 'active' ? 'text-blue-600 font-semibold' : ''}
              ${step.status === 'locked' ? 'text-gray-400' : ''}
            `}
          >
            {step.status === 'completed' && '✓'}
            {step.status === 'active' && '→'}
            {step.status === 'locked' && '○'}
            <span>{step.stationType}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-3">
        Progress: {completedSteps}/{order.steps.length}
      </div>
    </div>
  );
}
```

**Verification:**
- Orders appear on screen
- Steps show progress
- Timers count down

---

## 4. Phase 3: UI & Polish (Day 8-9)

### Step 3.1: HUD Components

**Files to create:**
- `client/src/components/game/HUD.tsx`

### Step 3.2: Recap Screen

**Files to create:**
- `client/src/components/ui/RecapScreen.tsx`

### Step 3.3: Animations

**Files to create:**
- Add animations to existing components

---

## 5. Phase 4: Multiplayer (Day 10-11)

### Step 4.1: WebSocket Setup

**Files to create:**
- `server/src/index.ts` (Socket.io server)
- `client/src/services/multiplayer.service.ts`

### Step 4.2: Room System

**Files to create:**
- `client/src/components/ui/LobbyScreen.tsx`
- `server/src/services/room.service.ts`

---

## 6. Phase 5: Testing & Deployment (Day 12-13)

### Step 5.1: Write Tests

**Follow PLAYWRIGHT_TESTS.md**

### Step 5.2: Deploy to Firebase

```powershell
# Build
cd client
npm run build

# Deploy
firebase deploy --only hosting
```

---

## 7. Debugging Tips

### Common Issues

**1. PixiJS not rendering:**
- Check canvas ref is set
- Verify Application initialized before use
- Check browser console for WebGL errors

**2. Questions not loading:**
- Check mock-questions.json path
- Verify .env has VITE_USE_MOCK_QUESTIONS=true
- Check browser network tab

**3. State not updating:**
- Use React DevTools to inspect Zustand store
- Check if using `useGameStore` correctly
- Verify `set()` calls

**4. TypeScript errors:**
- Run `npm run build` to see all errors
- Check tsconfig.json paths are correct
- Ensure types are exported properly

---

## 8. Optimization Checklist

Before deployment:

- [ ] Minify assets
- [ ] Enable code splitting
- [ ] Lazy load heavy components
- [ ] Optimize images
- [ ] Enable service worker for offline
- [ ] Add error boundaries
- [ ] Implement loading states
- [ ] Test on slow network (3G)
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit

---

## 9. Next Steps After MVP

1. Add more questions (100+)
2. Implement LLM question generation
3. Add daily quests
4. Add cosmetics shop
5. Implement skill mastery tracking
6. Add leaderboards
7. Create mobile app version

---

**Development guide complete! Ready to start building.** 🚀
