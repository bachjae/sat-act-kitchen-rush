import type { KitchenLayout, GridConfig, StationType, Position } from '@app-types/game.types';

export const GRID: GridConfig = {
  TILE_SIZE: 32,
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  TILES_X: 40,
  TILES_Y: 22.5,
};

/*
  Kitchen Layout Diagram:
  ┌─────────────────────────────────────────────────────────┐
  │                    CUSTOMER AREA (header)                │
  ├─────────────────────────────────────────────────────────┤
  │  TICKET    [  Customer Counter / Pass-Through  ] SERVING │
  │  BOARD                                          WINDOW   │
  ├─────────────────────────────────────────────────────────┤
  │                                                          │
  │  ┌──────┐  ┌──────┐     ┌──────┐  ┌──────┐  ┌──────┐  │
  │  │FRIDGE│  │ COLD │     │STOVE │  │ OVEN │  │PLATING│  │
  │  │      │  │ PREP │     │      │  │      │  │       │  │
  │  └──────┘  └──────┘     └──────┘  └──────┘  └──────┘  │
  │                                                          │
  │              [Main Kitchen Floor - Walkable]             │
  │                                                          │
  └─────────────────────────────────────────────────────────┘

  Flow: Ticket → Fridge → Prep → Stove → Plating → Serving
*/

export const KITCHEN_LAYOUT: KitchenLayout = {
  canvas: {
    width: 1280,
    height: 720,
  },

  header: {
    x: 0,
    y: 0,
    width: 1280,
    height: 80,
  },

  footer: {
    x: 0,
    y: 640,
    width: 1280,
    height: 80,
  },

  playArea: {
    x: 32,
    y: 160,
    width: 1216,
    height: 480,
  },

  stations: [
    // === FRONT OF HOUSE (Top row) ===

    // Ticket Board — left side, where orders come in
    {
      id: 'ticket-board',
      type: 'ticket' as StationType,
      name: 'Order Tickets',
      position: { x: 160, y: 200 },
      collisionBox: { x: 112, y: 168, width: 96, height: 72 },
      interactionZone: { x: 112, y: 168, width: 96, height: 96 },
      sprite: { texture: 'ticket-board', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 160, y: 168 },
    },

    // Serving Window — right side, where completed orders go
    {
      id: 'serving-window',
      type: 'serving' as StationType,
      name: 'Serving Window',
      position: { x: 1120, y: 200 },
      collisionBox: { x: 1072, y: 168, width: 96, height: 72 },
      interactionZone: { x: 1072, y: 168, width: 96, height: 96 },
      sprite: { texture: 'serving-window', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 1120, y: 168 },
    },

    // === COLD PREP AREA (Left side) ===

    // Walk-in Fridge / Cooler
    {
      id: 'fridge',
      type: 'fridge' as StationType,
      name: 'Walk-in Cooler',
      position: { x: 200, y: 380 },
      collisionBox: { x: 152, y: 336, width: 96, height: 88 },
      interactionZone: { x: 132, y: 316, width: 136, height: 128 },
      sprite: { texture: 'fridge', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 200, y: 336 },
    },

    // Cold Prep Station (next to fridge)
    {
      id: 'prep-station',
      type: 'prep' as StationType,
      name: 'Prep Station',
      position: { x: 400, y: 380 },
      collisionBox: { x: 352, y: 336, width: 96, height: 88 },
      interactionZone: { x: 332, y: 316, width: 136, height: 128 },
      sprite: { texture: 'prep-station', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 400, y: 336 },
    },

    // === HOT LINE (Center) ===

    // Stove & Grill
    {
      id: 'stove',
      type: 'stove' as StationType,
      name: 'Stove & Grill',
      position: { x: 640, y: 380 },
      collisionBox: { x: 592, y: 336, width: 96, height: 88 },
      interactionZone: { x: 572, y: 316, width: 136, height: 128 },
      sprite: { texture: 'stove', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 640, y: 336 },
    },

    // Oven (next to stove)
    {
      id: 'oven',
      type: 'stove' as StationType,
      name: 'Oven',
      position: { x: 820, y: 380 },
      collisionBox: { x: 772, y: 336, width: 96, height: 88 },
      interactionZone: { x: 752, y: 316, width: 136, height: 128 },
      sprite: { texture: 'oven', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 820, y: 336 },
    },

    // === FINISHING AREA (Right side) ===

    // Plating Station
    {
      id: 'plating-station',
      type: 'plating' as StationType,
      name: 'Plating Station',
      position: { x: 1020, y: 380 },
      collisionBox: { x: 972, y: 336, width: 96, height: 88 },
      interactionZone: { x: 952, y: 316, width: 136, height: 128 },
      sprite: { texture: 'plating-station', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 1020, y: 336 },
    },
  ],

  playerSpawn: {
    x: 640,
    y: 520,
  },

  door: {
    x: 1232,
    y: 200,
  },
};

export const WAYPOINTS: Record<string, Position> = {
  CENTER: { x: 640, y: 520 },
  TICKET_APPROACH: { x: 160, y: 280 },
  FRIDGE_APPROACH: { x: 200, y: 460 },
  PREP_APPROACH: { x: 400, y: 460 },
  STOVE_APPROACH: { x: 640, y: 460 },
  OVEN_APPROACH: { x: 820, y: 460 },
  PLATING_APPROACH: { x: 1020, y: 460 },
  WINDOW_APPROACH: { x: 1120, y: 280 },
};

export const PALETTE = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  CREAM: '#F1FAEE',
  NAVY: '#1D3557',
  BLUE: '#457B9D',
  TEAL: '#A8DADC',
  RED: '#E63946',
  GREEN: '#06D6A0',
  ORANGE: '#F77F00',
  YELLOW: '#FFD60A',
  BROWN: '#8B5A3C',
  GRAY: '#6C757D',
  LIGHT_GRAY: '#D0D0D0',
  PINK: '#FFC0CB',
  TOMATO_RED: '#FF6347',
  LETTUCE_GREEN: '#90EE90',
} as const;
