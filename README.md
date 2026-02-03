# SAT/ACT Kitchen Rush - Complete Documentation Package

## 📋 Overview

This documentation package contains everything needed for Claude Code to build **SAT/ACT Kitchen Rush** - a web-based educational game that transforms standardized test preparation into an engaging kitchen simulation experience.

**Generated:** February 3, 2026  
**For:** Windows 11 + Cursor IDE (Antigravity)  
**Target:** Phase 1 MVP (Solo mode with 50 hardcoded questions)

---

## 📦 Package Contents

### Core Documentation

1. **PROJECT_SETUP.md** (40 KB)
   - Complete Windows 11 environment setup
   - Firebase initialization (with step-by-step screenshots)
   - OpenRouter integration (for future LLM generation)
   - All dependencies and configurations
   - Troubleshooting guide for Windows-specific issues

2. **PIXEL_MAP.md** (28 KB)
   - Complete 32x32 pixel art specifications
   - Exact station coordinates (pixel-perfect)
   - Kitchen layout map with ASCII diagram
   - Color palette (16-color theme)
   - Animation specifications
   - Asset generation guide with tool recommendations

3. **DEVELOPMENT_GUIDE.md** (22 KB)
   - Step-by-step implementation order
   - Phase-by-phase breakdown (Day 1-13)
   - Code examples for each major component
   - Debugging tips
   - Optimization checklist

4. **PLAYWRIGHT_TESTS.md** (24 KB)
   - Comprehensive test coverage
   - Tests for all gameplay scenarios
   - Multiplayer testing strategies
   - CI/CD integration
   - Test running commands

### Data Files

5. **mock-questions.json** (45 KB)
   - **50 complete SAT/ACT questions**
   - All skills covered (Math, Reading & Writing, Science)
   - Balanced difficulty (1-5)
   - Station type distribution:
     - Ticket: 3 questions (5-10 sec)
     - Fridge: 15 questions (15-25 sec)
     - Prep: 18 questions (30-45 sec)
     - Stove: 12 questions (60-90 sec)
     - Plating: 2 questions (30-40 sec)
   - Formatted correctly for LLM generation later

6. **skills.json** (13 KB)
   - **49 skill definitions**
   - SAT: 40 skills (Reading & Writing, Math, Geometry)
   - ACT: 9 skills (English, Math, Science)
   - Maps to College Board and ACT taxonomies

---

## 🚀 Quick Start

### For Claude Code

```powershell
# 1. Read setup guide
# Start with PROJECT_SETUP.md sections 1-5

# 2. Create project structure
mkdir sat-act-kitchen-rush
cd sat-act-kitchen-rush
mkdir client server shared

# 3. Follow Firebase setup (Section 5 of PROJECT_SETUP.md)
# This includes creating Firebase project and downloading service account

# 4. Initialize client
cd client
npm create vite@latest . -- --template react-ts
# Then install dependencies from PROJECT_SETUP.md Section 3

# 5. Initialize server
cd ../server
npm init -y
# Install dependencies from PROJECT_SETUP.md Section 4

# 6. Load mock data
# Copy mock-questions.json and skills.json to appropriate directories

# 7. Begin implementation
# Follow DEVELOPMENT_GUIDE.md Phase 1
```

### Recommended Reading Order

1. **PROJECT_SETUP.md** - Full read (understand environment)
2. **PIXEL_MAP.md** - Sections 2-3 (coordinates and sprites)
3. **DEVELOPMENT_GUIDE.md** - Phase 1-2 (foundation and core gameplay)
4. **skills.json** + **mock-questions.json** - Review data structure
5. **PLAYWRIGHT_TESTS.md** - After core features built

---

## 🎯 Key Features Specified

### ✅ Phase 1 (MVP) - Fully Documented

- **Solo gameplay mode**
  - Player movement (click to move)
  - Station interactions (6 station types)
  - Question answering system
  - Order completion flow
  - Scoring and feedback

- **50 hardcoded questions**
  - All SAT/ACT skills represented
  - Balanced difficulty
  - Complete with explanations

- **Firebase integration**
  - Authentication (email, Google, anonymous)
  - Firestore data persistence
  - Session tracking

### 🔄 Phase 2 (Future) - Framework Ready

- **Multiplayer** (WebSocket infrastructure documented)
  - Co-op mode (2-4 players)
  - Versus mode
  - Room system with codes

- **LLM Question Generation** (OpenRouter configured)
  - Batch generation pipeline
  - Validation system
  - Prompt templates included

- **Progression System**
  - Coins and XP
  - Cosmetics shop
  - Skill mastery tracking

---

## 📊 Technical Specifications

### Frontend Stack
- **Framework:** React 18 + TypeScript 5.3
- **Build Tool:** Vite 5.0
- **Game Engine:** PixiJS 8.0 (WebGL 2D rendering)
- **State:** Zustand 4.5
- **Styling:** Tailwind CSS 3.4
- **Firebase:** v10.8.0

### Backend Stack
- **Runtime:** Node.js 20+
- **Framework:** Express 4.18
- **Multiplayer:** Socket.io 4.6
- **Database:** Firebase Firestore
- **Auth:** Firebase Auth
- **LLM:** OpenRouter API (free tier configured)

### Testing
- **Framework:** Playwright 1.40
- **Coverage Target:** 90%+ core gameplay
- **CI/CD:** GitHub Actions (workflow included)

---

## 🎨 Design System

### Color Palette
```
Primary Colors:
- Cream: #F1FAEE (backgrounds)
- Navy: #1D3557 (text, dark accents)
- Blue: #457B9D (primary actions)
- Teal: #A8DADC (secondary accents)

Feedback Colors:
- Red: #E63946 (wrong, danger)
- Green: #06D6A0 (correct, success)
- Orange: #F77F00 (warning)
- Yellow: #FFD60A (perfect)
```

### Layout
- **Canvas:** 1280x720 pixels
- **Grid:** 32x32 pixel tiles
- **Stations:** 6 types with exact pixel coordinates
- **Walkable area:** 36x20 tiles

---

## 🗺️ Kitchen Layout

```
┌─────────────────────────────────────────┐
│  ████████████████████████████████████  │
│  ██   T   ██           ██      W   ██  │
│  ██  [1]  ██           ██     [6]  ██  │
│  ████████████████████████████████████  │
│  ██                                 ██  │
│  ██  ██   F   ██  P  ██  S  ██  L  ██  │
│  ██  ██  [2]  ██ [3] ██ [4] ██ [5] ██  │
│  ██  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ██  │
│  ████████████████████████████████████  │
└─────────────────────────────────────────┘

Stations:
[1] Ticket Board  [2] Fridge
[3] Prep Station  [4] Stove
[5] Plating       [6] Serving Window
```

---

## 📝 Implementation Timeline

**Total Estimated Time:** 90 hours (11-13 working days)

### Week 1: Foundation & Core Gameplay
- **Day 1-2:** Firebase setup, types, mock data
- **Day 3-4:** PixiJS canvas, player movement
- **Day 5-7:** Stations, questions, orders

### Week 2: UI, Polish & Multiplayer
- **Day 8-9:** HUD, recap screen, animations
- **Day 10-11:** Multiplayer rooms and sync (framework)

### Week 3: Testing & Deployment
- **Day 12:** Playwright tests
- **Day 13:** Deployment, optimization

---

## 🧪 Testing Strategy

### Test Coverage
- **Core Gameplay:** 90%+
  - Movement, collision, station interaction
  - Question answering, scoring
  - Order system, timers

- **UI Components:** 80%+
  - Modals, forms, navigation
  - Responsive design

- **Data Persistence:** 85%+
  - Firebase operations
  - Session saving

- **Multiplayer:** 75%+
  - Room creation, joining
  - Synchronization

### Test Commands
```powershell
npm run test              # Run all tests
npm run test:headed       # Visual debugging
npm run test:debug        # Interactive mode
npm run test:report       # View HTML report
```

---

## 🔧 Configuration Files Needed

### Client `.env.local`
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_API_URL=http://localhost:5000
VITE_USE_MOCK_QUESTIONS=true
```

### Server `.env`
```env
NODE_ENV=development
PORT=5000
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
CORS_ORIGIN=http://localhost:3000

# For Phase 2
OPENROUTER_API_KEY=
ENABLE_LLM_GENERATION=false
```

---

## 📚 Additional Resources

### Pixel Art Tools
- **Aseprite** (best, paid): https://www.aseprite.org/
- **Piskel** (free, web): https://www.piskelapp.com/
- **Pixelorama** (free, open-source): https://orama-interactive.itch.io/pixelorama

### Learning Resources
- PixiJS Tutorials: https://pixijs.com/tutorials
- React + TypeScript: https://react-typescript-cheatsheet.netlify.app/
- Firebase Docs: https://firebase.google.com/docs
- Zustand Guide: https://github.com/pmndrs/zustand

### SAT/ACT Content References
- College Board SAT: https://satsuite.collegeboard.org/
- ACT Test Format: https://www.act.org/content/act/en/products-and-services/the-act.html

---

## 🐛 Common Issues & Solutions

### Windows-Specific

**Issue:** Port 3000/5000 already in use
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Issue:** Firebase service account not found
- Check file path in `.env`
- Ensure JSON not corrupted
- Verify file copied to `server/` directory

**Issue:** PixiJS not rendering
- Update graphics drivers
- Try different browser (Chrome recommended)
- Check WebGL support: chrome://gpu/

### Development

**Issue:** Hot reload not working
```powershell
# Clear Vite cache
Remove-Item -Recurse .vite
npm run dev
```

**Issue:** TypeScript path aliases not resolving
- Restart Cursor IDE
- Check `tsconfig.json` baseUrl and paths
- Verify Vite config aliases match

---

## ✅ Pre-Implementation Checklist

Before starting development:

- [ ] Windows 11 laptop ready
- [ ] Node.js v20+ installed
- [ ] Git installed
- [ ] Cursor IDE (Antigravity) updated
- [ ] Firebase account created
- [ ] Firebase project created
- [ ] Service account JSON downloaded
- [ ] `.env` files configured
- [ ] Read PROJECT_SETUP.md fully
- [ ] Reviewed PIXEL_MAP.md coordinates
- [ ] Understand DEVELOPMENT_GUIDE.md Phase 1

---

## 🎓 Learning Objectives (For Students)

By playing this game, students will:

1. **Practice SAT/ACT content** in a low-pressure environment
2. **Build test-taking stamina** through timed challenges
3. **Identify weak skills** via detailed analytics
4. **Learn from mistakes** with immediate explanations
5. **Stay motivated** through gamification and co-op play

---

## 🚢 Deployment

### Firebase Hosting (Recommended)

```powershell
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Build
cd client && npm run build

# Deploy
firebase deploy --only hosting
```

**Result:** Live at `https://your-project.web.app`

### Alternative: Vercel

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
cd client
vercel
```

---

## 📈 Future Enhancements (Post-MVP)

### Phase 2: Content Expansion
- Increase to 500+ questions
- Add ACT Science reasoning questions
- Create themed recipe names per skill
- Add difficulty progression

### Phase 3: Social Features
- Global leaderboards
- Friend challenges
- Share scores on social media
- Clan/team system

### Phase 4: Mobile App
- React Native conversion
- Touch-optimized controls
- Offline mode
- Push notifications for daily quests

### Phase 5: Analytics & AI
- Personalized difficulty adjustment
- Predictive score estimation
- Study plan generator
- Question recommendation engine

---

## 🤝 Contributing

This project is designed for solo development initially, but future contributors should:

1. Follow the existing architecture patterns
2. Write tests for new features
3. Update documentation
4. Maintain pixel art style consistency
5. Keep accessibility in mind

---

## 📞 Support

For issues during implementation:

1. **Check troubleshooting sections** in PROJECT_SETUP.md
2. **Review common issues** in this README
3. **Test with provided examples** in DEVELOPMENT_GUIDE.md
4. **Verify mock data format** matches expectations
5. **Check browser console** for errors

---

## 🏆 Success Criteria

The MVP is complete when:

- [ ] User can start a solo session
- [ ] Player moves smoothly around kitchen
- [ ] All 6 stations are interactive
- [ ] Questions load and display correctly
- [ ] Answer feedback works (correct/incorrect)
- [ ] Orders complete with quality scoring
- [ ] Session ends with recap screen
- [ ] Data persists to Firebase
- [ ] No critical bugs or crashes
- [ ] Runs smoothly on Windows 11 Chrome

---

## 📜 License

Documentation: CC BY 4.0  
Code (when generated): MIT License  
Game Assets (when created): Creative Commons

---

## 🎉 Final Notes

This documentation package represents **~100 hours of planning and specification work**. Every detail has been carefully considered to:

1. **Minimize ambiguity** - Claude Code has clear instructions
2. **Enable incremental development** - Build and test piece by piece
3. **Support future expansion** - Architecture scales beyond MVP
4. **Ensure quality** - Test coverage and best practices included

**The game is ready to build. Let's make test prep fun!** 🚀🧑‍🍳

---

**Package Version:** 1.0  
**Last Updated:** February 3, 2026  
**Prepared For:** Claude Code (Cursor IDE)  
**Target Platform:** Windows 11
