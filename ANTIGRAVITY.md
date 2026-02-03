# ANTIGRAVITY.md - Project Understanding & Status

## 🚀 Project Overview: SAT/ACT Kitchen Rush

**SAT/ACT Kitchen Rush** is a gamified educational platform that transforms standardized test preparation into a fast-paced kitchen simulation. Players move through a virtual kitchen, interacting with various "stations" that present specific SAT/ACT questions (e.g., Grammar at the Stove, Math at the Fridge).

### Key Objectives

- **Gamification**: Make test prep engaging through time-pressure and simulation mechanics.
- **Skill Tracking**: Map performance to specific SAT/ACT categories (Math, Reading, Writing, Science).
- **Multiplayer (Planned)**: Co-op and Versus modes to encourage social learning.
- **AI-Driven (Planned)**: OpenRouter integration for dynamic question generation.

---

## ✅ What's Currently Done

### 1. Documentation & Specification (100% Complete)

- **PROJECT_SETUP.md**: Comprehensive environment and Firebase setup guide.
- **PIXEL_MAP.md**: Exact coordinates, layout, and art specs for the kitchen.
- **DEVELOPMENT_GUIDE.md**: Phase-by-phase implementation roadmap.
- **PLAYWRIGHT_TESTS.md**: Testing strategies and coverage plans.

### 2. Data & Shared Resources

- **mock-questions.json**: 50 high-quality SAT/ACT questions categorized by station.
- **skills.json**: Detailed taxonomy of 49 SAT/ACT skills.
- **Shared Types**: Standardized interfaces for Game, Question, User, and Session in `shared/src/types`.

### 3. Client Implementation (Phase 2: Core Engine)

- **PixiJS Rendering**: Interactive canvas (1280x720) with kitchen floor, walls, and station placeholders.
- **Player Movement**: Smooth click-to-move logic with delta-time updates.
- **Station Interaction**: Collision detection and click events for all 6 kitchen stations.
- **Question Flow**: Integration with `zustand` store to load and display questions in a React modal.
- **Mock Service**: `questions.service.ts` successfully filtering and delivering mock data.

---

## 🏗️ What Else Needs to Be Done

### 1. Server-Side Infrastructure (0% Started)

- **Initialize Express/Socket.io**: The `server` directory is currently empty.
- **Firebase Admin SDK**: Set up backend authentication and Firestore management.
- **Room Management**: Socket.io logic for handling multiplayer rooms and state synchronization.

### 2. Core Game Systems (Phase 2: Remaining)

- **Order System**: Implementation of `OrderSystem.ts` to generate "recipes" (sequences of questions).
- **HUD & UI**: Development of the in-game HUD (Score, Timers, Active Orders).
- **Session Flow**: Starting a game, timer countdowns, and session termination logic.
- **Recap Screen**: End-of-session analytics and progress feedback.

### 3. Assets & Polish

- **Pixel Art Assets**: Replacing the colored rectangle placeholders with actual sprites (Player, Kitchen, Items).
- **Sound Effects & Music**: Integrating the audio engine.
- **Animations**: Adding feedback animations for correct/incorrect answers and order completions.

### 4. Verification & Deployment

- **Playwright Testing**: Writing and running the actual test suites.
- **Firebase Deployment**: Setting up Hosting and Firestore rules for the production environment.

---

## 🎯 Immediate Next Steps

1. **Initialize the Server**: Set up the Node.js/Express environment with basic Socket.io connectivity.
2. **Implement the Order System**: Bridge the gap between individual questions and gameplay "recipes."
3. **Connect real Firebase**: Move from mock question loading to Firestore-backed data.
