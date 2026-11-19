# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SAT/ACT Kitchen Rush is a gamified educational web game where students answer standardized test questions while managing a virtual kitchen (Overcooked meets Duolingo). Players move through kitchen stations answering SAT/ACT questions to complete food orders. Currently in Phase 2 (Core Engine) — solo mode with 50 mock questions.

## Commands

All commands run from `sat-act-kitchen-rush/client/`:

```bash
npm run dev        # Start Vite dev server on http://localhost:3000
npm run build      # TypeScript check + Vite production build
npm run lint       # ESLint
npm run preview    # Preview production build
npx playwright test                    # Run all E2E tests (auto-starts dev server)
npx playwright test --headed           # Run tests with visible browser
npx playwright test tests/kitchen-game.spec.ts  # Run specific test file
```

## Tech Stack

- **Frontend**: React 19 + TypeScript 5.9 + Vite 7
- **Game Engine**: PixiJS 8 (2D WebGL, 1280x720 canvas, 32x32 tile grid)
- **State**: Zustand (single `gameStore`)
- **Styling**: Tailwind CSS 3 with custom pixel-art theme (font: "Press Start 2P")
- **UI**: Radix UI primitives
- **Backend** (planned, `server/` is empty): Express + Socket.io + Firebase Admin
- **Testing**: Playwright (Chromium with SwiftShader for headless WebGL)
- **Data**: Firebase client SDK (currently using mock JSON)

## Architecture

### Directory Structure

```
sat-act-kitchen-rush/
├── client/src/
│   ├── game/
│   │   ├── engine/
│   │   │   ├── GameEngine.ts         # PixiJS app, game loop, station rendering
│   │   │   └── InputManager.ts       # Mouse/touch input handling
│   │   ├── entities/PlayerEntity.ts  # Player sprite with click-to-move pathfinding
│   │   ├── systems/
│   │   │   ├── CollisionSystem.ts    # Station bounding box collision
│   │   │   └── PathfindingSystem.ts  # A* pathfinding for player movement
│   │   └── config/kitchen-layout.ts  # Station coordinates and collision boxes
│   ├── components/
│   │   ├── game/Kitchen.tsx          # React wrapper that initializes PixiJS canvas
│   │   ├── mechanics/                # Station minigame components (Fridge, Prep, Stove, Oven, etc.)
│   │   └── ui/                       # QuestionModal, TicketSidebar, InventoryHotbar, view screens
│   ├── store/gameStore.ts            # Zustand: view state, active mechanic, orders, inventory, score
│   ├── services/
│   │   ├── questions.service.ts      # Loads/filters/shuffles mock questions
│   │   └── firebase.ts               # Firebase app initialization
│   ├── types/                        # TypeScript interfaces (game, question, user, session, multiplayer)
│   └── data/                         # mock-questions.json, skills.json, recipes.json
├── server/                           # Empty — planned for Phase 3+
└── shared/src/types/                 # Duplicated type definitions for future server sharing
```

### View State Machine

The app uses `gameStore.view` to manage screens: `main-menu` → `mode-select` → `skill-select` → `playing`. Each view is a React component in `components/ui/`.

### Station & Mechanic System

11 station types: ticket, fridge, prep, stove, grill, fry, oven, plating, dessert, drinks, serving. When player interacts with a station, `gameStore.activeMechanic` is set, rendering the corresponding `*Mechanic.tsx` component as an overlay.

### Data Flow

1. Player clicks canvas → `InputManager` triggers pathfinding to clicked position
2. Player reaches station → `CollisionSystem` detects overlap, triggers interaction
3. `gameStore.setActiveMechanic()` opens the station's mechanic component
4. Mechanic shows questions via `questions.service.ts`
5. Answer submission updates score → item added to inventory → mechanic closes

### Path Aliases (tsconfig + vite.config.ts)

`@/*` → `src/*`, `@game/*` → `src/game/*`, `@components/*` → `src/components/*`, `@store/*` → `src/store/*`, `@app-types/*` → `src/types/*`, `@services/*` → `src/services/*`, `@data/*` → `src/data/*`

Note: types alias is `@app-types` (not `@types`) to avoid conflicts with DefinitelyTyped.

### Game Engine

- `GameEngine` is initialized inside `Kitchen.tsx` and manages the PixiJS Application
- Uses `requestAnimationFrame` game loop with delta-time updates
- Canvas is 1280x720 (16:9), stations use pixel art sprites from `src/assets/`
- Station layout defined in `kitchen-layout.ts` with precise collision boxes

### Key Design Decisions

- Questions/mechanics are React modals overlaying the canvas, not rendered inside PixiJS
- Station coordinates are pixel-exact from PIXEL_MAP.md — changes must match that spec
- The `shared/` types mirror `client/src/types/` for future server use
- Vite proxies `/api` and `/socket.io` to `localhost:5000` for future backend

## Reference Documentation

- `PIXEL_MAP.md` — Station coordinates, tile grid, sprite specs, color palette
- `DEVELOPMENT_GUIDE.md` — Phase-by-phase implementation roadmap
- `PROJECT_SETUP.md` — Environment setup, Firebase config, dependency versions
- `PLAYWRIGHT_TESTS.md` — Test strategy and coverage plans

## Platform

Windows 11, Node.js 20+, npm. Use PowerShell-compatible commands.
