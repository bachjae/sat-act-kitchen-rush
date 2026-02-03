# Claude Code Prompt - SAT/ACT Kitchen Rush Project Start

Copy and paste this prompt into Claude Code (Cursor IDE):

---

I need you to help me build **SAT/ACT Kitchen Rush**, a web-based educational game where students answer standardized test questions while managing a virtual kitchen. I have complete documentation ready.

## Project Context

**What we're building:** A 2D top-down pixel art game (like Overcooked meets Duolingo) where players move through kitchen stations (Ticket Board → Fridge → Prep → Stove → Plating → Serving), answering SAT/ACT questions at each station to complete food orders.

**Platform:** Windows 11, Node.js 20+, Cursor IDE
**Tech Stack:** React + TypeScript + Vite + PixiJS + Firebase + Zustand
**Current Phase:** Phase 1 MVP - Solo mode with 50 hardcoded questions

## Documentation Available

I have 7 complete documentation files:
1. **README.md** - Overview and quick start
2. **PROJECT_SETUP.md** - Windows 11 setup, Firebase init, all dependencies
3. **PIXEL_MAP.md** - Kitchen layout with exact coordinates, sprite specs
4. **DEVELOPMENT_GUIDE.md** - Step-by-step implementation (Days 1-13)
5. **PLAYWRIGHT_TESTS.md** - Complete test specifications
6. **mock-questions.json** - 50 SAT/ACT questions (pre-generated)
7. **skills.json** - 49 skill definitions

## What I Need You To Do

**START WITH THIS:** Please read the following files in this exact order:
1. First, read **PROJECT_SETUP.md** sections 1-5 to understand the environment
2. Then read **DEVELOPMENT_GUIDE.md** Phase 1 (Day 1-2) to understand what we're building first
3. Then read **PIXEL_MAP.md** sections 2-3 to understand the kitchen layout coordinates

After reading those sections, confirm you understand by summarizing:
- What the folder structure should look like
- What our first 3 implementation steps are
- What the kitchen layout dimensions are

## Then Execute These Steps

### Step 1: Project Structure Creation
Create the root project structure:
```
sat-act-kitchen-rush/
├── client/          (React + Vite frontend)
├── server/          (Node.js + Express backend)
├── shared/          (Shared TypeScript types)
├── .gitignore       (Root level)
└── README.md        (Project readme)
```

### Step 2: Client Initialization
```powershell
cd client
npm create vite@latest . -- --template react-ts
```

Then install ALL dependencies from **PROJECT_SETUP.md Section 3** including:
- Core: pixi.js, zustand, react-router-dom
- UI: @radix-ui components, lucide-react, tailwindcss
- Firebase: firebase client SDK
- All dev dependencies

### Step 3: Configure Tailwind
Set up Tailwind CSS with our custom kitchen theme colors:
- Initialize: `npx tailwindcss init -p`
- Configure with colors from PIXEL_MAP.md (cream, navy, blue, teal, red, green, etc.)
- Set up index.css with pixel-perfect rendering class

### Step 4: Setup Project Structure
Create the complete folder structure from **PROJECT_SETUP.md**:
```
client/src/
├── components/
│   ├── game/ (Kitchen, Player, Station, Order, HUD)
│   ├── ui/ (QuestionModal, RecapScreen, MainMenu, etc.)
│   └── shared/ (Button, Card, Modal, etc.)
├── game/
│   ├── engine/ (GameEngine, Renderer, InputManager)
│   ├── entities/ (PlayerEntity, StationEntity, OrderEntity)
│   ├── systems/ (MovementSystem, CollisionSystem, OrderSystem, etc.)
│   └── config/ (kitchen-layout.ts, stations.ts, recipes.ts)
├── store/ (gameStore, userStore, questionStore, multiplayerStore)
├── services/ (firebase, auth, questions, session, user, analytics, multiplayer)
├── data/ (Copy mock-questions.json and skills.json here)
├── types/ (game.types, question.types, user.types, session.types, multiplayer.types)
├── utils/ (skillMastery, scoring, validation, formatters)
├── hooks/ (useGame, useAuth, useMultiplayer, useAnalytics)
└── public/assets/sprites/ (characters, kitchen, items, effects)
```

### Step 5: TypeScript Configuration
Set up tsconfig.json with path aliases:
- @ → ./src
- @game → ./src/game
- @components → ./src/components
- @services → ./src/services
- @store → ./src/store
- @types → ./src/types
- @utils → ./src/utils
- @hooks → ./src/hooks
- @data → ./src/data

Also configure vite.config.ts with matching aliases.

### Step 6: Create Type Definitions
Create all TypeScript type files in `shared/src/types/`:

**game.types.ts** should include:
- StationType enum
- Station interface (with position, collisionBox, interactionZone)
- Order interface (with steps, deadline, status)
- OrderStep interface

**question.types.ts** should include:
- Question interface (matching mock-questions.json structure)
- Choice interface
- QuestionAttempt interface

Use **mock-questions.json** as the source of truth for the Question type structure.

### Step 7: Load Mock Data
Create `client/src/services/questions.service.ts` that:
- Imports mock-questions.json from @data
- Has a `fetchQuestions()` function that filters/shuffles/returns questions
- Respects `VITE_USE_MOCK_QUESTIONS` env var (defaults to true for now)
- Includes TypeScript types

### Step 8: Kitchen Layout Configuration
Create `client/src/game/config/kitchen-layout.ts` with:
- Complete station definitions from **PIXEL_MAP.md Section 3**
- All 6 stations with exact pixel coordinates
- Collision boxes and interaction zones
- Export as KITCHEN_LAYOUT constant

This file should match the specifications EXACTLY from PIXEL_MAP.md - it's critical for proper game rendering.

### Step 9: Environment Files
Create `.env.local` template (don't fill in yet, I'll do Firebase setup):
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000
VITE_ENABLE_MULTIPLAYER=false
VITE_USE_MOCK_QUESTIONS=true
```

### Step 10: Create .gitignore
Comprehensive .gitignore for Node.js, Firebase, Windows, and IDE files (from PROJECT_SETUP.md).

## After These Steps

Once you complete steps 1-10, stop and let me know. I'll then:
1. Set up Firebase project and get credentials
2. You'll continue with implementing the game engine (Phase 1 Day 3-4)

## Important Notes

- **Use PowerShell commands** - I'm on Windows 11
- **Follow PROJECT_SETUP.md exactly** for dependency versions
- **Use the exact folder structure** specified - it's designed to scale
- **Copy mock-questions.json and skills.json** from my documentation into client/src/data/
- **Don't implement game logic yet** - just setup the foundation
- **Ask questions** if anything in the documentation is unclear

## Verification After Setup

After you finish, I should be able to:
```powershell
cd client
npm run dev
```
And see a blank React app at http://localhost:3000 with no errors.

## If You Need Clarification

If any documentation is unclear or you need more details:
1. Tell me which specific section you need clarification on
2. I can provide the exact section from the docs
3. Or I can help you interpret what's needed

## Ready to Start?

Please confirm you understand the task, then begin with Step 1: Project Structure Creation.

Let's build this! 🚀

