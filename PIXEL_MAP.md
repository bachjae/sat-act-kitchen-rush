# SAT/ACT Kitchen Rush - Pixel Map & Sprite Specifications

## Table of Contents
1. [Art Style & Technical Specs](#art-style--technical-specs)
2. [Kitchen Layout Map](#kitchen-layout-map)
3. [Station Coordinates](#station-coordinates)
4. [Sprite Specifications](#sprite-specifications)
5. [Color Palette](#color-palette)
6. [Animation Specifications](#animation-specifications)
7. [Asset Generation Guide](#asset-generation-guide)

---

## 1. Art Style & Technical Specs

### Core Specifications
- **Tile Size**: 32x32 pixels
- **Canvas**: 1280x720 pixels (40x22.5 tiles)
- **Style**: Top-down pixel art, 16-color palette
- **Rendering**: Pixel-perfect (no anti-aliasing)
- **Inspiration**: Stardew Valley meets Overcooked

### CSS Rendering
```css
.pixel-canvas {
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
```

### Grid System
```typescript
export const GRID = {
  TILE_SIZE: 32,
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  TILES_X: 40,
  TILES_Y: 22.5,
};
```

---

## 2. Kitchen Layout Map

### Full Kitchen Map (ASCII)

```
Scale: 1 character = 1 tile (32px)
Canvas: 40 tiles wide × 22.5 tiles tall

Y
│ ┌─────────────────────────────────────────────────────────────────────────────┐
│ │                       HEADER UI (Score, Timer, Orders)                       │ 0-2
│ ├─────────────────────────────────────────────────────────────────────────────┤
│ │                                                                               │ 3
│ │ ████████████████████████████████████████████████████████████████████████████ │ 4
│ │ ██         ██         ██         ██         ██         ██         ██      ██ │ 5
│ │ ██    T    ██         ██         ██         ██         ██    W    ██   D  ██ │ 6
│ │ ██  [1]    ██         ██         ██         ██         ██   [6]   ██      ██ │ 7
│ │ ████████████         ██         ██         ██         ██████████████████████ │ 8
│ │ ██                                                                         ██ │ 9
│ │ ██         ██    F    ██    P    ██    S    ██    L    ██                 ██ │ 10
│ │ ██         ██   [2]   ██   [3]   ██   [4]   ██   [5]   ██                 ██ │ 11
│ │ ██         ██         ██         ██         ██         ██                 ██ │ 12
│ │ ██                                                                         ██ │ 13
│ │ ██         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░            ██ │ 14
│ │ ██         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░            ██ │ 15
│ │ ██         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░            ██ │ 16
│ │ ██         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░            ██ │ 17
│ │ ██         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░            ██ │ 18
│ │ ████████████████████████████████████████████████████████████████████████████ │ 19
│ │                                                                               │ 20-22
│ └─────────────────────────────────────────────────────────────────────────────┘
  └──────────────────────────────────────────────────────────────────────────── X
   0         10        20        30        40

Legend:
█ = Wall/Counter (impassable)
░ = Floor tile (walkable)
T = Ticket Board [1]
F = Fridge/Pantry [2]
P = Prep Station [3]
S = Stove [4]
L = Plating Station [5]
W = Serving Window [6]
D = Door (entrance/exit)
```

### Collision Map

```typescript
export const COLLISION_MAP = {
  // Outer walls
  TOP_WALL: { y: 4, xStart: 0, xEnd: 40 },
  BOTTOM_WALL: { y: 19, xStart: 0, xEnd: 40 },
  LEFT_WALL: { x: 0, yStart: 4, yEnd: 19 },
  RIGHT_WALL: { x: 39, yStart: 4, yEnd: 19 },
  
  // Top counter row
  COUNTER_ROW_TOP: { y: 8, xStart: 1, xEnd: 38 },
  
  // Station counters (impassable areas)
  TICKET_COUNTER: { x: 3, y: 5, width: 3, height: 3 },
  FRIDGE_COUNTER: { x: 10, y: 10, width: 3, height: 3 },
  PREP_COUNTER: { x: 17, y: 10, width: 3, height: 3 },
  STOVE_COUNTER: { x: 24, y: 10, width: 3, height: 3 },
  PLATING_COUNTER: { x: 31, y: 10, width: 3, height: 3 },
  WINDOW_COUNTER: { x: 37, y: 5, width: 2, height: 3 },
  
  // Walkable floor area
  FLOOR_AREA: { x: 1, y: 13, width: 36, height: 6 },
};
```

---

## 3. Station Coordinates

### Exact Pixel Coordinates

```typescript
export const KITCHEN_LAYOUT = {
  canvas: {
    width: 1280,
    height: 720,
  },
  
  // UI areas
  header: {
    x: 0,
    y: 0,
    width: 1280,
    height: 80, // 2.5 tiles
  },
  
  footer: {
    x: 0,
    y: 640,
    width: 1280,
    height: 80, // 2.5 tiles
  },
  
  // Playable kitchen area
  playArea: {
    x: 32,        // 1 tile margin
    y: 128,       // 4 tiles from top
    width: 1216,  // 38 tiles
    height: 512,  // 16 tiles
  },
  
  // Station definitions
  stations: [
    {
      id: 'ticket-board',
      type: 'ticket' as StationType,
      name: 'Ticket Board',
      
      // Visual position (center of station)
      position: { x: 144, y: 224 }, // Tile (4.5, 7)
      
      // Collision box (counter area - impassable)
      collisionBox: {
        x: 96,   // Tile 3
        y: 160,  // Tile 5
        width: 96,  // 3 tiles wide
        height: 96, // 3 tiles tall
      },
      
      // Interaction zone (where player stands to interact)
      interactionZone: {
        x: 96,
        y: 256,  // Below counter
        width: 96,
        height: 64, // 2 tiles tall
      },
      
      // Sprite info
      sprite: {
        texture: 'ticket-board',
        anchor: { x: 0.5, y: 1 }, // Bottom-center
        scale: 1,
      },
      
      // UI overlay position
      overlayAnchor: { x: 144, y: 160 },
    },
    
    {
      id: 'fridge',
      type: 'fridge' as StationType,
      name: 'Fridge & Pantry',
      position: { x: 368, y: 384 }, // Tile (11.5, 12)
      collisionBox: {
        x: 320, // Tile 10
        y: 320, // Tile 10
        width: 96,
        height: 96,
      },
      interactionZone: {
        x: 288,
        y: 416, // Below and left
        width: 128,
        height: 64,
      },
      sprite: {
        texture: 'fridge',
        anchor: { x: 0.5, y: 1 },
        scale: 1,
      },
      overlayAnchor: { x: 368, y: 320 },
    },
    
    {
      id: 'prep-station',
      type: 'prep' as StationType,
      name: 'Prep Station',
      position: { x: 592, y: 384 }, // Tile (18.5, 12)
      collisionBox: {
        x: 544, // Tile 17
        y: 320, // Tile 10
        width: 96,
        height: 96,
      },
      interactionZone: {
        x: 512,
        y: 416,
        width: 128,
        height: 64,
      },
      sprite: {
        texture: 'prep-station',
        anchor: { x: 0.5, y: 1 },
        scale: 1,
      },
      overlayAnchor: { x: 592, y: 320 },
    },
    
    {
      id: 'stove',
      type: 'stove' as StationType,
      name: 'Stove & Oven',
      position: { x: 816, y: 384 }, // Tile (25.5, 12)
      collisionBox: {
        x: 768, // Tile 24
        y: 320, // Tile 10
        width: 96,
        height: 96,
      },
      interactionZone: {
        x: 736,
        y: 416,
        width: 128,
        height: 64,
      },
      sprite: {
        texture: 'stove',
        anchor: { x: 0.5, y: 1 },
        scale: 1,
      },
      overlayAnchor: { x: 816, y: 320 },
    },
    
    {
      id: 'plating-station',
      type: 'plating' as StationType,
      name: 'Plating Station',
      position: { x: 1040, y: 384 }, // Tile (32.5, 12)
      collisionBox: {
        x: 992, // Tile 31
        y: 320, // Tile 10
        width: 96,
        height: 96,
      },
      interactionZone: {
        x: 960,
        y: 416,
        width: 128,
        height: 64,
      },
      sprite: {
        texture: 'plating-station',
        anchor: { x: 0.5, y: 1 },
        scale: 1,
      },
      overlayAnchor: { x: 1040, y: 320 },
    },
    
    {
      id: 'serving-window',
      type: 'serving' as StationType,
      name: 'Serving Window',
      position: { x: 1200, y: 224 }, // Tile (37.5, 7)
      collisionBox: {
        x: 1184, // Tile 37
        y: 160,  // Tile 5
        width: 64,  // 2 tiles wide
        height: 96, // 3 tiles tall
      },
      interactionZone: {
        x: 1120,
        y: 256,
        width: 96,
        height: 64,
      },
      sprite: {
        texture: 'serving-window',
        anchor: { x: 0.5, y: 1 },
        scale: 1,
      },
      overlayAnchor: { x: 1200, y: 160 },
    },
  ],
  
  // Player spawn point
  playerSpawn: {
    x: 640, // Center of kitchen
    y: 480,
  },
  
  // Door entrance
  door: {
    x: 1232, // Right side
    y: 224,
  },
};
```

### Pathfinding Grid

```typescript
// For A* pathfinding or simple waypoint navigation
export const WAYPOINTS = {
  CENTER: { x: 640, y: 480 },
  TICKET_APPROACH: { x: 144, y: 352 },
  FRIDGE_APPROACH: { x: 352, y: 480 },
  PREP_APPROACH: { x: 576, y: 480 },
  STOVE_APPROACH: { x: 800, y: 480 },
  PLATING_APPROACH: { x: 1024, y: 480 },
  WINDOW_APPROACH: { x: 1120, y: 320 },
};

// Movement paths (for smooth navigation)
export const MOVEMENT_PATHS = {
  TICKET_TO_FRIDGE: [
    { x: 144, y: 352 },
    { x: 320, y: 480 },
    { x: 352, y: 480 },
  ],
  FRIDGE_TO_PREP: [
    { x: 352, y: 480 },
    { x: 576, y: 480 },
  ],
  PREP_TO_STOVE: [
    { x: 576, y: 480 },
    { x: 800, y: 480 },
  ],
  STOVE_TO_PLATING: [
    { x: 800, y: 480 },
    { x: 1024, y: 480 },
  ],
  PLATING_TO_WINDOW: [
    { x: 1024, y: 480 },
    { x: 1120, y: 352 },
    { x: 1120, y: 320 },
  ],
};
```

---

## 4. Sprite Specifications

### Character Sprites

#### Player Character
**File**: `characters/player-chef.png`
**Size**: 32x32 pixels per frame
**Frames**: 4 directions × 3 animation frames = 12 frames total

```
Spritesheet layout (96x128 pixels):

┌────────┬────────┬────────┐
│ Down 1 │ Down 2 │ Down 3 │  Y: 0-31
├────────┼────────┼────────┤
│ Up 1   │ Up 2   │ Up 3   │  Y: 32-63
├────────┼────────┼────────┤
│ Left 1 │ Left 2 │ Left 3 │  Y: 64-95
├────────┼────────┼────────┤
│ Right 1│ Right 2│ Right 3│  Y: 96-127
└────────┴────────┴────────┘
 X: 0-31  32-63    64-95

Animation timing: 150ms per frame (walking)
```

**Pixel art description**:
- White chef hat (8px tall)
- Peach skin tone
- Blue shirt/apron
- Black pants
- Simple features (2px eyes, no mouth visible)
- Idle: Frame 2 (middle frame)
- Walking: Cycle frames 1→2→3→2

**Color codes**:
```
Hat: #FFFFFF
Skin: #FFD1A3
Shirt: #457B9D
Pants: #1D3557
Outline: #000000 (1px)
```

#### Multiplayer Character Colors
For co-op, use same base sprite with color variations:
- Player 1: Blue (#457B9D) - default
- Player 2: Red (#E63946)
- Player 3: Green (#06D6A0)
- Player 4: Orange (#F77F00)

### Station Sprites

#### 1. Ticket Board
**File**: `kitchen/ticket-board.png`
**Size**: 96x96 pixels (3×3 tiles)

```
Description:
- Wooden board mounted on wall
- Cork texture (brown)
- Metal frame corners
- Pinned papers visible (white rectangles)
- Active state: Papers glow yellow
```

**Pixel layout**:
```
Row 0-31: Top edge with metal corners
Row 32-63: Cork texture + papers
Row 64-95: Bottom edge
```

#### 2. Fridge
**File**: `kitchen/fridge.png`
**Size**: 96x96 pixels

```
Description:
- Stainless steel fridge (gray/white)
- Double doors with handles
- Small freezer section on top
- Open state: Door swings open, interior light visible
```

**States**:
- `fridge-closed.png`: Default
- `fridge-open.png`: When player interacts

#### 3. Prep Station
**File**: `kitchen/prep-station.png`
**Size**: 96x96 pixels

```
Description:
- Wooden cutting board on counter
- Knife holder on left
- Vegetables visible (carrots, tomatoes)
- Bowls and utensils
- Active state: Knife animated (chopping)
```

#### 4. Stove
**File**: `kitchen/stove.png`
**Size**: 96x96 pixels

```
Description:
- 4-burner gas stove
- Silver/chrome finish
- Oven door below burners
- Pots/pans on burners
- Active state: Flames visible (animated)
```

**Animation**:
- `stove-idle.png`: No flames
- `stove-cooking.png`: Animated flames (3 frames, 200ms each)

#### 5. Plating Station
**File**: `kitchen/plating-station.png`
**Size**: 96x96 pixels

```
Description:
- Clean white counter
- Stack of plates (left side)
- Garnish station (herbs, sauces)
- Utensils for plating
- Active state: Plate slides in from left
```

#### 6. Serving Window
**File**: `kitchen/serving-window.png`
**Size**: 64x96 pixels (2×3 tiles)

```
Description:
- Kitchen pass-through window
- Wooden frame
- Shelf for finished dishes
- Bell on counter (for ringing)
- Active state: Bell dings (sparkle effect)
```

### Floor & Wall Tiles

#### Floor Tile
**File**: `kitchen/floor-tile.png`
**Size**: 32x32 pixels

```
Description:
- Checkered pattern (light gray / medium gray)
- Slight texture for variation
- Seamless tileable
```

**Colors**:
- Light: #E8E8E8
- Medium: #D0D0D0
- Grout lines: #B0B0B0 (1px between tiles)

#### Wall Tile
**File**: `kitchen/wall-tile.png`
**Size**: 32x32 pixels

```
Description:
- White subway tile pattern
- Horizontal rectangles
- Subtle shadow/depth
- Seamless tileable
```

#### Counter Tile
**File**: `kitchen/counter-tile.png`
**Size**: 32x32 pixels

```
Description:
- Granite texture (speckled gray)
- Darker than walls
- Seamless tileable
```

### Ingredient Sprites

Each ingredient: 16x16 pixels (half-tile for items)

**Files**: `items/ingredients/`
- `tomato.png`: Red circle, green stem
- `lettuce.png`: Green leafy
- `cheese.png`: Yellow triangle
- `meat-raw.png`: Pink/red slab
- `meat-cooked.png`: Brown cooked
- `bread.png`: Brown loaf
- `egg.png`: White oval
- `pasta.png`: Yellow spirals

**Item states**:
- `{item}-perfect.png`: Sparkle effect
- `{item}-normal.png`: Standard
- `{item}-spoiled.png`: Gray/brown, wavy stink lines

### Dish Sprites

Completed dishes: 24x24 pixels

**Files**: `items/dishes/`
- `salad.png`: Bowl with greens
- `burger.png`: Stacked burger
- `pasta-dish.png`: Plate with pasta
- `steak.png`: Plate with steak
- `soup.png`: Bowl with liquid

**Quality indicators**:
- 5-star: Gold plate rim, sparkles
- 3-star: Silver plate rim
- 1-star: Plain plate, slight darkness

### Effect Sprites

#### Particle Effects
**File**: `effects/particles.png`
**Frames**: 8x8 pixels each

```
Spritesheet (64x64 pixels):
- Star sparkle (8 frames)
- Smoke puff (6 frames)
- Fire flame (4 frames)
- Steam (4 frames)
- Splash (5 frames)
```

#### UI Icons
**File**: `effects/icons.png`
**Size**: 16x16 pixels each

```
Icons needed:
- Checkmark (green)
- X mark (red)
- Clock (timer)
- Coin (yellow)
- Star (rating)
- Arrow (directional)
```

---

## 5. Color Palette

### Primary Colors (16-color palette)

```typescript
export const PALETTE = {
  // Base colors
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  
  // Kitchen theme
  CREAM: '#F1FAEE',        // Walls, backgrounds
  NAVY: '#1D3557',         // Dark accents, text
  BLUE: '#457B9D',         // Primary player color
  TEAL: '#A8DADC',         // Secondary accents
  
  // Feedback colors
  RED: '#E63946',          // Wrong answer, danger
  GREEN: '#06D6A0',        // Correct answer, success
  ORANGE: '#F77F00',       // Warning, medium quality
  YELLOW: '#FFD60A',       // Perfect, highlight
  
  // Material colors
  BROWN: '#8B5A3C',        // Wood
  GRAY: '#6C757D',         // Metal, stone
  LIGHT_GRAY: '#D0D0D0',   // Floor
  PINK: '#FFC0CB',         // Raw meat
  
  // Food colors
  TOMATO_RED: '#FF6347',
  LETTUCE_GREEN: '#90EE90',
};
```

### Usage Guidelines

```typescript
// Station status colors
const STATION_STATES = {
  idle: PALETTE.CREAM,        // Station available
  active: PALETTE.YELLOW,     // Player interacting
  occupied: PALETTE.ORANGE,   // Another player using (multiplayer)
  correct: PALETTE.GREEN,     // Correct answer glow
  incorrect: PALETTE.RED,     // Wrong answer flash
};

// Order status colors
const ORDER_STATES = {
  pending: PALETTE.WHITE,
  in_progress: PALETTE.BLUE,
  completed: PALETTE.GREEN,
  failed: PALETTE.RED,
  perfect: PALETTE.YELLOW,
};
```

---

## 6. Animation Specifications

### Player Animations

```typescript
export const PLAYER_ANIMATIONS = {
  idle_down: {
    frames: [1],
    frameRate: 0, // Static
  },
  walk_down: {
    frames: [0, 1, 2, 1],
    frameRate: 6.67, // ~150ms per frame
    loop: true,
  },
  idle_up: {
    frames: [4],
    frameRate: 0,
  },
  walk_up: {
    frames: [3, 4, 5, 4],
    frameRate: 6.67,
    loop: true,
  },
  idle_left: {
    frames: [7],
    frameRate: 0,
  },
  walk_left: {
    frames: [6, 7, 8, 7],
    frameRate: 6.67,
    loop: true,
  },
  idle_right: {
    frames: [10],
    frameRate: 0,
  },
  walk_right: {
    frames: [9, 10, 11, 10],
    frameRate: 6.67,
    loop: true,
  },
};
```

### Station Animations

```typescript
export const STATION_ANIMATIONS = {
  stove_cooking: {
    frames: ['stove-cooking-1', 'stove-cooking-2', 'stove-cooking-3'],
    frameRate: 5, // 200ms per frame
    loop: true,
  },
  fridge_open: {
    frames: ['fridge-closed', 'fridge-opening', 'fridge-open'],
    frameRate: 10, // 100ms per frame
    loop: false,
  },
  plating_slide: {
    frames: ['plate-1', 'plate-2', 'plate-3', 'plate-4'],
    frameRate: 8,
    loop: false,
  },
  ticket_glow: {
    frames: ['ticket-dim', 'ticket-bright'],
    frameRate: 2, // 500ms (slow pulse)
    loop: true,
  },
};
```

### Particle Effects

```typescript
export const PARTICLE_EFFECTS = {
  correct_answer: {
    type: 'sparkle',
    count: 8,
    speed: 50,
    lifetime: 1000, // 1 second
    color: PALETTE.YELLOW,
    scale: { start: 1, end: 0 },
  },
  wrong_answer: {
    type: 'smoke',
    count: 5,
    speed: 30,
    lifetime: 800,
    color: PALETTE.RED,
    alpha: { start: 1, end: 0 },
  },
  cooking: {
    type: 'steam',
    count: 3,
    speed: 20,
    lifetime: 2000,
    color: PALETTE.WHITE,
    continuous: true, // Emit while cooking
  },
  dish_complete: {
    type: 'star',
    count: 12,
    speed: 80,
    lifetime: 1500,
    color: PALETTE.GREEN,
    burst: true, // All at once
  },
};
```

---

## 7. Asset Generation Guide

### Tools Recommended

**For Pixel Art:**
- **Aseprite** (paid, best): https://www.aseprite.org/
- **Piskel** (free, web-based): https://www.piskelapp.com/
- **Pixelorama** (free, open-source): https://orama-interactive.itch.io/pixelorama

**For Spritesheets:**
- **TexturePacker**: https://www.codeandweb.com/texturepacker
- **Free Texture Packer**: http://free-tex-packer.com/

### Step-by-Step: Creating Player Sprite

1. **Open Aseprite**
   - New sprite: 96x128 pixels (for 12 frames)
   - Background: Transparent

2. **Draw Base Character (Down-facing, Frame 1)**
   - Grid: 32x32
   - Start at pixel (0, 0) to (31, 31)
   - Draw in this order:
     1. Chef hat outline (white)
     2. Head oval (peach)
     3. Body rectangle (blue)
     4. Legs (navy)
     5. Add 1px black outline around everything
     6. Add details (eyes, buttons)

3. **Create Walking Frames**
   - Duplicate frame → Shift legs forward
   - Frame 2: Idle (legs together)
   - Frame 3: Other leg forward
   - Keep upper body mostly static

4. **Rotate for Other Directions**
   - Copy Down frames to Up row
   - Flip vertically, adjust hat
   - Copy to Left/Right rows
   - Adjust arm positions for side views

5. **Export**
   - File → Export Sprite Sheet
   - Layout: Horizontal Strip or Grid
   - Format: PNG with transparency
   - File: `player-chef.png`

### Step-by-Step: Creating Station Sprite

1. **Open Aseprite**
   - New sprite: 96x96 pixels
   - Background: Transparent

2. **Draw Station (e.g., Stove)**
   - Layer 1: Counter base (brown/gray)
   - Layer 2: Stove body (silver)
   - Layer 3: Burners (black circles)
   - Layer 4: Details (knobs, handles)
   - Layer 5: Highlights (lighter gray for shine)

3. **Add States**
   - Frame 1: Idle (no flames)
   - Frame 2: Cooking-1 (small flames)
   - Frame 3: Cooking-2 (medium flames)
   - Frame 4: Cooking-3 (large flames)

4. **Export**
   - Export as sprite sheet or separate files
   - `stove-idle.png`, `stove-cooking.png` (animated)

### Placeholder Assets (Quick Start)

For rapid prototyping, create simple colored rectangles:

```typescript
// Generate programmatically with PixiJS Graphics
const createPlaceholderStation = (color: number, width: number, height: number) => {
  const graphics = new PIXI.Graphics();
  graphics.beginFill(color);
  graphics.drawRect(0, 0, width, height);
  graphics.endFill();
  graphics.lineStyle(2, 0x000000);
  graphics.drawRect(0, 0, width, height);
  return graphics;
};

// Placeholder colors
const PLACEHOLDER_COLORS = {
  ticket: 0xFFD60A,    // Yellow
  fridge: 0xA8DADC,    // Teal
  prep: 0x06D6A0,      // Green
  stove: 0xE63946,     // Red
  plating: 0xF77F00,   // Orange
  serving: 0x457B9D,   // Blue
};
```

### Asset Checklist

Before starting development, create at minimum:

- [ ] Player sprite (1 direction, 3 frames) = 96x32 px
- [ ] 6 station sprites (can be colored boxes) = 96x96 px each
- [ ] Floor tile (seamless) = 32x32 px
- [ ] Wall tile (seamless) = 32x32 px
- [ ] 3 ingredient sprites = 16x16 px each
- [ ] 1 dish sprite = 24x24 px
- [ ] Sparkle effect (3 frames) = 8x8 px each

**Total minimum**: ~10-12 small sprites to start prototyping

---

## 8. PixiJS Integration

### Loading Sprites

```typescript
import { Assets } from 'pixi.js';

export async function loadAssets() {
  // Add sprites to assets
  Assets.add('player-chef', '/assets/sprites/characters/player-chef.png');
  Assets.add('ticket-board', '/assets/sprites/kitchen/ticket-board.png');
  Assets.add('fridge', '/assets/sprites/kitchen/fridge.png');
  Assets.add('floor-tile', '/assets/sprites/kitchen/floor-tile.png');
  // ... add all assets
  
  // Load all at once
  const textures = await Assets.load([
    'player-chef',
    'ticket-board',
    'fridge',
    'floor-tile',
  ]);
  
  return textures;
}
```

### Creating Tiled Background

```typescript
import { TilingSprite, Texture } from 'pixi.js';

export function createKitchenFloor(texture: Texture, width: number, height: number) {
  const tilingSprite = new TilingSprite(texture, width, height);
  tilingSprite.tileScale.set(1, 1); // 1:1 for pixel-perfect
  return tilingSprite;
}
```

### Station Sprite with Interaction

```typescript
import { Sprite, Texture } from 'pixi.js';

export function createStationSprite(
  texture: Texture,
  position: { x: number; y: number },
  interactive: boolean = true
) {
  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5, 1); // Bottom-center
  sprite.position.set(position.x, position.y);
  sprite.interactive = interactive;
  sprite.buttonMode = true;
  sprite.cursor = 'pointer';
  
  // Add glow filter for active state
  // sprite.filters = [glowFilter]; // Add when active
  
  return sprite;
}
```

---

## 9. Final Asset Export Structure

```
client/public/assets/sprites/
├── characters/
│   ├── player-chef.png          (96x128, 12 frames)
│   ├── player-red.png           (multiplayer variant)
│   ├── player-green.png
│   └── player-orange.png
├── kitchen/
│   ├── floor-tile.png           (32x32, tileable)
│   ├── wall-tile.png            (32x32, tileable)
│   ├── counter-tile.png         (32x32, tileable)
│   ├── ticket-board.png         (96x96)
│   ├── ticket-board-active.png  (96x96, glowing)
│   ├── fridge-closed.png        (96x96)
│   ├── fridge-open.png          (96x96)
│   ├── prep-station.png         (96x96)
│   ├── prep-active.png          (96x96, animated knife)
│   ├── stove-idle.png           (96x96)
│   ├── stove-cooking.png        (96x96, 3 frames animated)
│   ├── plating-station.png      (96x96)
│   ├── serving-window.png       (64x96)
│   └── door.png                 (32x64)
├── items/
│   ├── ingredients/
│   │   ├── tomato-perfect.png   (16x16)
│   │   ├── tomato-normal.png
│   │   ├── tomato-spoiled.png
│   │   ├── lettuce-perfect.png
│   │   ├── lettuce-normal.png
│   │   ├── lettuce-spoiled.png
│   │   └── ... (other ingredients)
│   └── dishes/
│       ├── salad-5star.png      (24x24)
│       ├── salad-3star.png
│       ├── salad-1star.png
│       └── ... (other dishes)
└── effects/
    ├── particles.png            (64x64, multiple frames)
    ├── icons.png                (64x64, multiple icons)
    └── glow-overlay.png         (128x128, radial gradient)
```

---

## 10. Testing Sprites in Game

```typescript
// Test script to verify all sprites load correctly
import { Application, Assets, Sprite } from 'pixi.js';

async function testSprites() {
  const app = new Application({
    width: 1280,
    height: 720,
    backgroundColor: 0xF1FAEE,
  });
  
  document.body.appendChild(app.view);
  
  // Load all textures
  const textures = await loadAssets();
  
  // Test player sprite
  const player = new Sprite(textures['player-chef']);
  player.position.set(640, 360);
  player.anchor.set(0.5);
  app.stage.addChild(player);
  
  // Test station sprites
  const stations = ['ticket-board', 'fridge', 'prep-station', 'stove', 'plating-station', 'serving-window'];
  stations.forEach((name, index) => {
    const station = new Sprite(textures[name]);
    station.position.set(100 + index * 150, 500);
    station.anchor.set(0.5);
    app.stage.addChild(station);
  });
  
  console.log('✅ All sprites loaded successfully!');
}

testSprites();
```

---

**Pixel map complete! Ready to generate art and start rendering.** 🎨
