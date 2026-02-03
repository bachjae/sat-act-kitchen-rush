# SAT/ACT Kitchen Rush - Complete Setup Guide (Windows 11)

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Initialization](#project-initialization)
3. [Frontend Setup](#frontend-setup)
4. [Backend Setup](#backend-setup)
5. [Firebase Setup & Initialization](#firebase-setup--initialization)
6. [Mock Data & OpenRouter Integration](#mock-data--openrouter-integration)
7. [Development Workflow](#development-workflow)
8. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### Required Software (Windows 11)

**Node.js & npm:**
```powershell
# Download Node.js v20.x LTS from https://nodejs.org/
# After installation, verify:
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x
```

**Git for Windows:**
```powershell
# Download from https://git-scm.com/download/win
# Verify:
git --version
```

**Cursor IDE (Antigravity):**
- Already installed on your Windows 11 laptop
- Ensure it's updated to the latest version

**Windows Terminal (Recommended):**
```powershell
# Install from Microsoft Store or use PowerShell
# Recommended for better command line experience
```

### Required Accounts
- **Firebase Account**: https://console.firebase.google.com
- **OpenRouter Account**: https://openrouter.ai (for future LLM integration)
- **GitHub Account**: For version control (optional)

---

## 2. Project Initialization

### Create Project Structure

```powershell
# Open Windows Terminal or PowerShell
# Navigate to your projects folder
cd C:\Users\YourUsername\Projects

# Create project directory
mkdir sat-act-kitchen-rush
cd sat-act-kitchen-rush

# Initialize git
git init

# Create folder structure
mkdir client, server, shared

# Create root-level files
New-Item -Path "README.md" -ItemType File
New-Item -Path ".gitignore" -ItemType File
```

### Root .gitignore

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json

# Environment variables
.env
.env.local
.env.*.local
*.env

# Firebase
firebase-service-account.json
.firebase/
.firebaserc

# Build outputs
dist/
build/
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
desktop.ini

# Logs
logs/
*.log

# Testing
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
```

---

## 3. Frontend Setup (React + Vite + PixiJS)

### Initialize Client

```powershell
cd client

# Create Vite React TypeScript project
npm create vite@latest . -- --template react-ts

# Answer prompts:
# ? Current directory is not empty. Remove existing files and continue? › Yes
```

### Install All Dependencies

```powershell
# Core dependencies
npm install

# Game rendering
npm install pixi.js@8.0.0

# State management
npm install zustand@4.5.0

# Routing
npm install react-router-dom@6.21.0

# UI components
npm install @radix-ui/react-dialog@1.0.5
npm install @radix-ui/react-select@2.0.0
npm install @radix-ui/react-tabs@1.0.4
npm install @radix-ui/react-toast@1.1.5
npm install lucide-react@0.294.0

# Styling
npm install tailwindcss@3.4.0 postcss@8.4.32 autoprefixer@10.4.16
npm install -D @tailwindcss/typography

# Firebase client
npm install firebase@10.8.0

# Multiplayer (for future)
npm install socket.io-client@4.6.1

# Utilities
npm install clsx@2.0.0
npm install date-fns@3.0.6

# Dev dependencies
npm install -D @types/node@20.10.0
npm install -D eslint-plugin-react-hooks@4.6.0
```

### Initialize Tailwind CSS

```powershell
npx tailwindcss init -p
```

### Configure Tailwind

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kitchen: {
          red: '#E63946',
          cream: '#F1FAEE',
          teal: '#A8DADC',
          blue: '#457B9D',
          navy: '#1D3557',
          orange: '#F77F00',
          green: '#06D6A0',
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

**src/index.css:**
```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-kitchen-cream text-kitchen-navy antialiased;
  }
  
  * {
    @apply border-kitchen-navy;
  }
}

@layer utilities {
  .pixel-perfect {
    image-rendering: -moz-crisp-edges;
    image-rendering: -webkit-crisp-edges;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }
  
  .text-shadow-pixel {
    text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.3);
  }
}

@layer components {
  .btn-primary {
    @apply bg-kitchen-blue hover:bg-kitchen-navy text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg;
  }
  
  .btn-secondary {
    @apply bg-kitchen-teal hover:bg-kitchen-blue text-kitchen-navy hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-xl shadow-lg p-6 border-2 border-kitchen-navy;
  }
}
```

### Create Project Structure

```powershell
# Create directory structure
mkdir src\components\game
mkdir src\components\ui
mkdir src\components\shared
mkdir src\game\engine
mkdir src\game\entities
mkdir src\game\systems
mkdir src\game\config
mkdir src\store
mkdir src\services
mkdir src\data
mkdir src\types
mkdir src\utils
mkdir src\hooks
mkdir public\assets\sprites\characters
mkdir public\assets\sprites\kitchen
mkdir public\assets\sprites\items
mkdir public\assets\sprites\effects
mkdir public\assets\audio
```

**Complete file structure:**
```
client/
├── public/
│   ├── assets/
│   │   ├── sprites/
│   │   │   ├── characters/        # Player sprites
│   │   │   ├── kitchen/           # Kitchen tiles, stations
│   │   │   ├── items/             # Ingredients, dishes
│   │   │   └── effects/           # Particles, animations
│   │   └── audio/
│   │       ├── sfx/               # Sound effects
│   │       └── music/             # Background music
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── Kitchen.tsx        # Main game canvas
│   │   │   ├── Player.tsx         # Player representation
│   │   │   ├── Station.tsx        # Station overlay
│   │   │   ├── Order.tsx          # Order display
│   │   │   └── HUD.tsx            # Score, timer, etc.
│   │   ├── ui/
│   │   │   ├── QuestionModal.tsx  # Question popup
│   │   │   ├── RecapScreen.tsx    # End-of-session analytics
│   │   │   ├── MainMenu.tsx       # Home screen
│   │   │   ├── LobbyScreen.tsx    # Multiplayer lobby
│   │   │   ├── SettingsModal.tsx  # Settings
│   │   │   └── ProfileScreen.tsx  # User profile
│   │   └── shared/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       └── LoadingSpinner.tsx
│   ├── game/
│   │   ├── engine/
│   │   │   ├── GameEngine.ts      # Core game loop
│   │   │   ├── Renderer.ts        # PixiJS rendering
│   │   │   └── InputManager.ts    # Input handling
│   │   ├── entities/
│   │   │   ├── Entity.ts          # Base entity class
│   │   │   ├── PlayerEntity.ts
│   │   │   ├── StationEntity.ts
│   │   │   └── OrderEntity.ts
│   │   ├── systems/
│   │   │   ├── System.ts          # Base system class
│   │   │   ├── MovementSystem.ts
│   │   │   ├── CollisionSystem.ts
│   │   │   ├── OrderSystem.ts
│   │   │   ├── TimerSystem.ts
│   │   │   └── RenderSystem.ts
│   │   └── config/
│   │       ├── kitchen-layout.ts  # Station positions
│   │       ├── stations.ts        # Station definitions
│   │       └── recipes.ts         # Recipe configs
│   ├── store/
│   │   ├── gameStore.ts           # Game state
│   │   ├── userStore.ts           # User state
│   │   ├── questionStore.ts       # Question cache
│   │   └── multiplayerStore.ts    # Multiplayer state
│   ├── services/
│   │   ├── firebase.ts            # Firebase initialization
│   │   ├── auth.service.ts        # Authentication
│   │   ├── questions.service.ts   # Question fetching
│   │   ├── session.service.ts     # Session management
│   │   ├── user.service.ts        # User CRUD
│   │   ├── analytics.service.ts   # Analytics tracking
│   │   └── multiplayer.service.ts # WebSocket wrapper
│   ├── data/
│   │   ├── mock-questions.json    # 50 hardcoded questions
│   │   ├── skills.json            # Skills taxonomy
│   │   └── recipes.json           # Dish recipes
│   ├── types/
│   │   ├── game.types.ts
│   │   ├── question.types.ts
│   │   ├── user.types.ts
│   │   ├── session.types.ts
│   │   └── multiplayer.types.ts
│   ├── utils/
│   │   ├── skillMastery.ts        # EMA calculation
│   │   ├── scoring.ts             # Score calculation
│   │   ├── validation.ts          # Input validation
│   │   └── formatters.ts          # Data formatting
│   ├── hooks/
│   │   ├── useGame.ts
│   │   ├── useAuth.ts
│   │   ├── useMultiplayer.ts
│   │   └── useAnalytics.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── .env.local
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

### Configure TypeScript

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@game/*": ["./src/game/*"],
      "@components/*": ["./src/components/*"],
      "@services/*": ["./src/services/*"],
      "@store/*": ["./src/store/*"],
      "@types/*": ["./src/types/*"],
      "@utils/*": ["./src/utils/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@data/*": ["./src/data/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Configure Vite

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@game': path.resolve(__dirname, './src/game'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@data': path.resolve(__dirname, './src/data'),
    }
  },
  server: {
    port: 3000,
    open: true, // Auto-open browser on Windows
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'pixi-vendor': ['pixi.js'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        }
      }
    }
  }
})
```

### Environment Variables Template

**client/.env.example:**
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# API Configuration
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000

# Feature Flags
VITE_ENABLE_MULTIPLAYER=false
VITE_USE_MOCK_QUESTIONS=true

# OpenRouter (for future LLM integration)
VITE_OPENROUTER_API_KEY=your_openrouter_key_here
```

---

## 4. Backend Setup (Node.js + Express + Socket.io)

### Initialize Server

```powershell
cd ..\server

# Initialize package.json
npm init -y

# Core dependencies
npm install express@4.18.2
npm install cors@2.8.5
npm install dotenv@16.3.1

# Firebase Admin
npm install firebase-admin@12.0.0

# Multiplayer
npm install socket.io@4.6.1

# Utilities
npm install uuid@9.0.1
npm install joi@17.11.0

# OpenRouter integration
npm install openai@4.24.0

# TypeScript
npm install -D typescript@5.3.0
npm install -D @types/node@20.10.0
npm install -D @types/express@4.17.21
npm install -D @types/cors@2.8.17
npm install -D @types/uuid@9.0.7
npm install -D ts-node@10.9.2
npm install -D nodemon@3.0.2

# Development utilities
npm install -D concurrently@8.2.2
```

### TypeScript Configuration

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Update package.json

**server/package.json scripts:**
```json
{
  "name": "sat-kitchen-server",
  "version": "1.0.0",
  "description": "Backend server for SAT/ACT Kitchen Rush",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "test": "echo \"No tests yet\" && exit 0"
  },
  "keywords": ["sat", "act", "game", "education"],
  "author": "",
  "license": "MIT"
}
```

### Create Server Structure

```powershell
mkdir src\config
mkdir src\services
mkdir src\sockets\handlers
mkdir src\sockets\middleware
mkdir src\routes
mkdir src\utils
mkdir src\types
mkdir src\llm
```

**Complete server structure:**
```
server/
├── src/
│   ├── config/
│   │   ├── firebase.ts           # Firebase Admin init
│   │   ├── env.ts                # Environment config
│   │   └── openrouter.ts         # OpenRouter config
│   ├── services/
│   │   ├── question.service.ts   # Question CRUD
│   │   ├── session.service.ts    # Session management
│   │   ├── user.service.ts       # User operations
│   │   ├── room.service.ts       # Multiplayer rooms
│   │   └── mastery.service.ts    # Skill mastery calculations
│   ├── sockets/
│   │   ├── handlers/
│   │   │   ├── room.handler.ts   # Room events
│   │   │   ├── game.handler.ts   # Game events
│   │   │   └── player.handler.ts # Player events
│   │   └── middleware/
│   │       └── auth.middleware.ts # Socket auth
│   ├── routes/
│   │   ├── questions.route.ts
│   │   ├── sessions.route.ts
│   │   ├── users.route.ts
│   │   └── health.route.ts
│   ├── llm/
│   │   ├── generator.ts          # Question generation
│   │   ├── validator.ts          # Question validation
│   │   └── prompts.ts            # LLM prompts
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   └── helpers.ts
│   ├── types/
│   │   ├── socket.types.ts
│   │   └── api.types.ts
│   └── index.ts
├── firebase-service-account.json  # (gitignored!)
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── nodemon.json
```

### Nodemon Configuration

**nodemon.json:**
```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.spec.ts"],
  "exec": "ts-node src/index.ts",
  "env": {
    "NODE_ENV": "development"
  }
}
```

### Environment Variables Template

**server/.env.example:**
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# CORS
CORS_ORIGIN=http://localhost:3000

# OpenRouter API (for LLM question generation)
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Question Generation Settings
ENABLE_LLM_GENERATION=false
QUESTIONS_PER_BATCH=30
```

---

## 5. Firebase Setup & Initialization

### Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Open https://console.firebase.google.com
   - Sign in with your Google account

2. **Create New Project**
   - Click "Add project"
   - Project name: `SAT-ACT-Kitchen-Rush`
   - Enable Google Analytics: **Optional** (recommended: Yes)
   - Choose Analytics account or create new
   - Click "Create project" (wait 30-60 seconds)

### Step 2: Enable Authentication

1. **Navigate to Authentication**
   - Left sidebar → Build → Authentication
   - Click "Get started"

2. **Enable Sign-in Methods**
   - Click "Sign-in method" tab
   - Enable:
     - ✅ **Email/Password** (click, toggle enable, save)
     - ✅ **Google** (click, enable, add support email, save)
     - ✅ **Anonymous** (click, toggle enable, save)

### Step 3: Create Firestore Database

1. **Navigate to Firestore**
   - Left sidebar → Build → Firestore Database
   - Click "Create database"

2. **Choose Mode**
   - Select: **Start in test mode** (for development)
   - Click "Next"

3. **Choose Location**
   - Select: `us-central1` (or closest to you)
   - Click "Enable"
   - Wait for database to provision (~30 seconds)

### Step 4: Create Collections (Initial Setup)

In Firestore console, manually create these collections:

```
Collections to create:
- users
- questions
- skills
- sessions
- questionAttempts
- userSkillMastery
- rooms (for multiplayer)
```

For each collection:
1. Click "Start collection"
2. Collection ID: (e.g., `users`)
3. Add a dummy document (can delete later):
   - Document ID: `dummy`
   - Field: `created` Type: `timestamp` Value: (auto)
4. Click "Save"

### Step 5: Configure Security Rules

In Firestore → Rules tab, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if false;
    }
    
    // Questions collection (read-only for clients)
    match /questions/{questionId} {
      allow read: if isAuthenticated();
      allow write: if false; // Server-only writes
    }
    
    // Skills collection (public read)
    match /skills/{skillId} {
      allow read: if true;
      allow write: if false;
    }
    
    // Sessions collection
    match /sessions/{sessionId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }
    
    // Question attempts
    match /questionAttempts/{attemptId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }
    
    // User skill mastery (server-managed)
    match /userSkillMastery/{masteryId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow write: if false; // Server-only
    }
    
    // Rooms (multiplayer)
    match /rooms/{roomId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated() && resource.data.hostId == request.auth.uid;
    }
  }
}
```

Click "Publish"

### Step 6: Get Web App Configuration

1. **Register Web App**
   - Project Overview (top left) → Project settings (gear icon)
   - Scroll to "Your apps"
   - Click Web icon `</>`

2. **Register App**
   - App nickname: `SAT Kitchen Rush Web`
   - ✅ Also set up Firebase Hosting
   - Click "Register app"

3. **Copy Configuration**
   - You'll see a config object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

4. **Save to client/.env.local**
   ```powershell
   cd C:\Users\YourUsername\Projects\sat-act-kitchen-rush\client
   
   # Create .env.local file
   @"
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   
   VITE_API_URL=http://localhost:5000
   VITE_WS_URL=http://localhost:5000
   
   VITE_ENABLE_MULTIPLAYER=false
   VITE_USE_MOCK_QUESTIONS=true
   "@ | Out-File -FilePath .env.local -Encoding UTF8
   ```

### Step 7: Get Service Account (Backend)

1. **Generate Service Account Key**
   - Project settings → Service accounts tab
   - Click "Generate new private key"
   - Confirm: "Generate key"
   - JSON file downloads automatically

2. **Move to Server Directory**
   ```powershell
   # Move the downloaded JSON file
   Move-Item -Path "$env:USERPROFILE\Downloads\your-project-firebase-adminsdk-*.json" -Destination "C:\Users\YourUsername\Projects\sat-act-kitchen-rush\server\firebase-service-account.json"
   ```

3. **Create server/.env**
   ```powershell
   cd ..\server
   
   @"
   NODE_ENV=development
   PORT=5000
   
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   
   CORS_ORIGIN=http://localhost:3000
   
   OPENROUTER_API_KEY=
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   
   ENABLE_LLM_GENERATION=false
   QUESTIONS_PER_BATCH=30
   "@ | Out-File -FilePath .env -Encoding UTF8
   ```

### Step 8: Initialize Firebase in Code

**client/src/services/firebase.ts:**
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Development: Use emulators (optional, comment out for production Firebase)
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

export default app;
```

**server/src/config/firebase.ts:**
```typescript
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccountPath = path.resolve(
  __dirname,
  '../..',
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json'
);

let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.error('❌ Failed to load Firebase service account:', error);
  process.exit(1);
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const db = getFirestore();
export const auth = admin.auth();

// Enable offline persistence (optional)
db.settings({
  ignoreUndefinedProperties: true,
});

console.log('✅ Firebase Admin initialized successfully');

export default admin;
```

### Step 9: Verify Firebase Connection

**Test script (server/src/test-firebase.ts):**
```typescript
import { db } from './config/firebase';

async function testFirebase() {
  try {
    // Try to write a test document
    const testRef = db.collection('_test').doc('connection');
    await testRef.set({
      timestamp: new Date(),
      message: 'Firebase connection successful!',
    });
    
    // Try to read it back
    const doc = await testRef.get();
    console.log('✅ Firebase test successful:', doc.data());
    
    // Clean up
    await testRef.delete();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    process.exit(1);
  }
}

testFirebase();
```

Run test:
```powershell
cd server
npx ts-node src/test-firebase.ts
```

### Step 10: Seed Initial Data

Create seeding script to populate skills and initial questions.

**server/src/seed-data.ts:**
```typescript
import { db } from './config/firebase';
import skillsData from '../data/skills.json';
import questionsData from '../data/mock-questions.json';

async function seedDatabase() {
  console.log('🌱 Starting database seed...');
  
  try {
    // Seed skills
    const skillsRef = db.collection('skills');
    for (const skill of skillsData) {
      await skillsRef.doc(skill.id).set(skill);
      console.log(`✅ Seeded skill: ${skill.id}`);
    }
    
    // Seed questions
    const questionsRef = db.collection('questions');
    for (const question of questionsData) {
      await questionsRef.doc(question.id).set(question);
      console.log(`✅ Seeded question: ${question.id}`);
    }
    
    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedDatabase();
```

---

## 6. Mock Data & OpenRouter Integration

### Mock Questions Setup

The project starts with 50 hardcoded questions in `client/src/data/mock-questions.json` and `server/data/mock-questions.json` (same file, duplicated for convenience).

**Enable mock mode in development:**
```env
# client/.env.local
VITE_USE_MOCK_QUESTIONS=true
```

When `VITE_USE_MOCK_QUESTIONS=true`, the app loads questions from the local JSON file instead of Firestore.

### OpenRouter Integration (Future LLM Generation)

**Get OpenRouter API Key:**
1. Visit https://openrouter.ai
2. Sign up / Login
3. Go to API Keys section
4. Generate new API key
5. Copy key to `.env` files

**server/.env:**
```env
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
ENABLE_LLM_GENERATION=false  # Set to true when ready
```

**OpenRouter Configuration (server/src/config/openrouter.ts):**
```typescript
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export const openrouter = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000', // Your app URL
    'X-Title': 'SAT/ACT Kitchen Rush',
  },
});

// Free tier models you can use:
export const FREE_MODELS = {
  // Fast and capable
  SONNET: 'anthropic/claude-3.5-sonnet',
  HAIKU: 'anthropic/claude-3-haiku',
  
  // Free alternatives
  MIXTRAL: 'mistralai/mixtral-8x7b-instruct',
  LLAMA: 'meta-llama/llama-3.1-8b-instruct:free',
};

export const DEFAULT_MODEL = FREE_MODELS.LLAMA; // Use free model

export const isLLMEnabled = () => {
  return process.env.ENABLE_LLM_GENERATION === 'true' && !!process.env.OPENROUTER_API_KEY;
};
```

**Question Generation Service (server/src/llm/generator.ts):**
```typescript
import { openrouter, DEFAULT_MODEL, isLLMEnabled } from '../config/openrouter';
import { generateQuestionPrompt } from './prompts';
import { validateGeneratedQuestion } from './validator';

export interface QuestionGenerationParams {
  skillId: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  stationType: 'ticket' | 'fridge' | 'prep' | 'stove' | 'plating';
  count: number;
}

export async function generateQuestions(params: QuestionGenerationParams) {
  if (!isLLMEnabled()) {
    throw new Error('LLM generation is not enabled. Check OPENROUTER_API_KEY and ENABLE_LLM_GENERATION');
  }
  
  const prompt = generateQuestionPrompt(params);
  
  try {
    const completion = await openrouter.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert SAT/ACT test question writer. Generate high-quality, valid test questions in JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }, // Force JSON output
    });
    
    const responseText = completion.choices[0].message.content || '{}';
    const generated = JSON.parse(responseText);
    
    // Validate each question
    const validQuestions = [];
    for (const q of generated.questions || []) {
      const validation = validateGeneratedQuestion(q);
      if (validation.valid) {
        validQuestions.push(q);
      } else {
        console.warn('Invalid question generated:', validation.errors);
      }
    }
    
    return {
      success: true,
      questions: validQuestions,
      totalGenerated: generated.questions?.length || 0,
      totalValid: validQuestions.length,
    };
    
  } catch (error) {
    console.error('Question generation failed:', error);
    return {
      success: false,
      questions: [],
      error: error.message,
    };
  }
}
```

**LLM Prompts (server/src/llm/prompts.ts):**
```typescript
import { QuestionGenerationParams } from './generator';

export function generateQuestionPrompt(params: QuestionGenerationParams): string {
  const { skillId, difficulty, stationType, count } = params;
  
  const timeBudgets = {
    ticket: '5-10 seconds',
    fridge: '15-25 seconds',
    prep: '30-45 seconds',
    stove: '60-90 seconds',
    plating: '30-40 seconds',
  };
  
  return `Generate ${count} SAT/ACT test questions with the following specifications:

**Requirements:**
- Skill ID: ${skillId}
- Difficulty: ${difficulty}/5 (1=easiest, 5=hardest)
- Station type: ${stationType}
- Time budget: ${timeBudgets[stationType]}
- Format: Multiple choice with 4 options (A, B, C, D)

**Output JSON Schema:**
{
  "questions": [
    {
      "stem": "The question text",
      "passage": "Optional reading passage if needed (for longer questions)",
      "choices": [
        { "id": "A", "text": "Choice A text" },
        { "id": "B", "text": "Choice B text" },
        { "id": "C", "text": "Choice C text" },
        { "id": "D", "text": "Choice D text" }
      ],
      "correctChoiceId": "B",
      "explanation": "Why B is correct and others are wrong",
      "difficulty": ${difficulty},
      "skillId": "${skillId}",
      "stationType": "${stationType}"
    }
  ]
}

**Quality Guidelines:**
1. Questions must be clear and unambiguous
2. Distractors (wrong answers) should be plausible
3. Difficulty should match the specified level
4. Time to solve should fit the station type
5. Follow official SAT/ACT style and conventions
6. Explanation should be educational and helpful

Generate ${count} unique questions following these specifications. Return ONLY valid JSON.`;
}
```

### Switching Between Mock and Real Data

**client/src/services/questions.service.ts:**
```typescript
import { db } from './firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import mockQuestions from '@data/mock-questions.json';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_QUESTIONS === 'true';

export async function fetchQuestions(params: {
  count: number;
  skills?: string[];
  difficulty?: number[];
}): Promise<Question[]> {
  // Use mock data in development
  if (USE_MOCK) {
    console.log('📦 Using mock questions');
    return filterMockQuestions(mockQuestions, params);
  }
  
  // Fetch from Firestore
  console.log('🔥 Fetching questions from Firestore');
  const questionsRef = collection(db, 'questions');
  let q = query(questionsRef, limit(params.count));
  
  if (params.skills && params.skills.length > 0) {
    q = query(q, where('skillId', 'in', params.skills.slice(0, 10)));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
}

function filterMockQuestions(questions: any[], params: any): Question[] {
  let filtered = [...questions];
  
  if (params.skills && params.skills.length > 0) {
    filtered = filtered.filter(q => params.skills.includes(q.skillId));
  }
  
  if (params.difficulty && params.difficulty.length > 0) {
    filtered = filtered.filter(q => params.difficulty.includes(q.difficulty));
  }
  
  // Shuffle and limit
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, params.count);
}
```

---

## 7. Development Workflow

### Start Development Servers

**Option 1: Separate Terminals**

Terminal 1 (Backend):
```powershell
cd C:\Users\YourUsername\Projects\sat-act-kitchen-rush\server
npm run dev
```

Terminal 2 (Frontend):
```powershell
cd C:\Users\YourUsername\Projects\sat-act-kitchen-rush\client
npm run dev
```

**Option 2: Concurrent (from root)**

Create **package.json** in root:
```json
{
  "name": "sat-act-kitchen-rush",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "build": "npm run build:server && npm run build:client",
    "build:server": "cd server && npm run build",
    "build:client": "cd client && npm run build"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

Install concurrently in root:
```powershell
cd C:\Users\YourUsername\Projects\sat-act-kitchen-rush
npm install
```

Then run both:
```powershell
npm run dev
```

### Accessing the App

- **Frontend**: http://localhost:3000 (auto-opens in browser)
- **Backend API**: http://localhost:5000
- **WebSocket**: ws://localhost:5000

### Hot Reload

- **Frontend**: Vite provides instant HMR (Hot Module Replacement)
- **Backend**: Nodemon auto-restarts on file changes

### Building for Production

```powershell
# Build server
cd server
npm run build

# Build client
cd ..\client
npm run build

# Output:
# server/dist/  - Compiled JavaScript
# client/dist/  - Static files for hosting
```

---

## 8. Troubleshooting (Windows 11)

### Issue: Port Already in Use

```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process by PID (replace 1234 with actual PID)
taskkill /PID 1234 /F

# Or change port in server/.env
PORT=5001
```

### Issue: Firebase Connection Error

```
Error: Failed to load Firebase service account
```

**Fix:**
1. Verify `firebase-service-account.json` exists in `server/` directory
2. Check `.env` file has correct path:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```
3. Ensure JSON file is valid (not corrupted)

### Issue: Module Resolution Errors

```
Cannot find module '@/components/...'
```

**Fix:**
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# In client/, also clear Vite cache
Remove-Item -Recurse -Force .vite
npm run dev
```

### Issue: TypeScript Path Aliases Not Working in Cursor

**Fix:**
1. Open Cursor settings (Ctrl+,)
2. Search for "typescript"
3. Ensure "TypeScript: Enable Project Wide Intellisense" is checked
4. Restart Cursor IDE
5. Open any `.ts` file to trigger TypeScript server

### Issue: Firestore Security Rules Denying Access

```
FirebaseError: Missing or insufficient permissions
```

**Fix:**
1. Check Firestore Rules in Firebase Console
2. Temporarily use test mode rules:
   ```javascript
   allow read, write: if request.time < timestamp.date(2025, 12, 31);
   ```
3. Ensure user is authenticated before accessing Firestore

### Issue: OpenRouter API Not Working

```
Error: Invalid API key
```

**Fix:**
1. Verify API key is correct in `.env`
2. Check OpenRouter dashboard for usage limits
3. Ensure `ENABLE_LLM_GENERATION=true`
4. Try using free model: `meta-llama/llama-3.1-8b-instruct:free`

### Issue: WebSocket Connection Failed

```
WebSocket connection failed
```

**Fix:**
1. Ensure backend is running on port 5000
2. Check Windows Firewall isn't blocking ports
3. Verify `VITE_WS_URL=http://localhost:5000` in client/.env.local
4. For multiplayer, temporarily disable Windows Firewall for testing

### Issue: PixiJS Not Rendering

```
Black screen or canvas not appearing
```

**Fix:**
1. Check browser console for WebGL errors
2. Update graphics drivers
3. Try different browser (Chrome recommended)
4. Ensure canvas element exists in DOM before initializing PixiJS

---

## 9. Next Steps

✅ **Setup Complete!** Now proceed to:

1. **Load Initial Data**
   ```powershell
   cd server
   npx ts-node src/seed-data.ts
   ```

2. **Review Architecture**
   - Read `ARCHITECTURE.md` for system design
   - Understand data flow and component structure

3. **Check Pixel Map**
   - Open `PIXEL_MAP.md` for kitchen layout
   - Review sprite coordinates

4. **Load Question Bank**
   - Review `mock-questions.json` (50 questions)
   - All skills covered, balanced distribution

5. **Start Building**
   - Follow `DEVELOPMENT_GUIDE.md` for step-by-step implementation
   - Start with core game loop

6. **Run Tests**
   - See `PLAYWRIGHT_TESTS.md` for testing strategy
   - Tests cover full gameplay flow

---

## 10. Quick Reference

### Common Commands

```powershell
# Start dev servers
npm run dev  # (from root with concurrently)

# Or separately:
cd server && npm run dev
cd client && npm run dev

# Build production
npm run build

# Seed database
cd server && npx ts-node src/seed-data.ts

# Test Firebase connection
cd server && npx ts-node src/test-firebase.ts

# Generate questions with LLM (after setup)
cd server && npx ts-node src/llm/test-generation.ts
```

### File Locations

- Frontend code: `client/src/`
- Backend code: `server/src/`
- Mock data: `client/src/data/mock-questions.json`
- Sprites: `client/public/assets/sprites/`
- Environment vars: `client/.env.local`, `server/.env`

### Important URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Firebase Console: https://console.firebase.google.com
- OpenRouter Dashboard: https://openrouter.ai/keys

---

**Setup documentation complete! Ready for Claude Code to start building.** 🚀
