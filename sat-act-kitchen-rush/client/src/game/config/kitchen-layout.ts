import type { KitchenLayout, GridConfig, StationType, Position } from '@app-types/game.types';

export const GRID: GridConfig = {
  TILE_SIZE: 32,
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  TILES_X: 40,
  TILES_Y: 22.5,
};

/*
  Redesigned Kitchen Layout:
  ┌─────────────────────────────────────────────────────────┐
  │                    CUSTOMER AREA (Top)                   │
  ├─────────────────────────────────────────────────────────┤
  │ [TICKET]                                      [SERVING] │
  │                                                         │
  │ [FRIDGE]      [PREP]        [PLATING]         [DRINKS]  │
  │                                                         │
  │                                               [DESSERT] │
  │                                                         │
  │      [STOVE]    [GRILL]    [OVEN]    [FRY]              │
  └─────────────────────────────────────────────────────────┘
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
    y: 128,
    width: 1216,
    height: 512,
  },

  stations: [
    // === EXPO / PASS (Top Row) ===
    {
      id: 'ticket-board',
      type: 'ticket',
      name: 'Order Tickets',
      position: { x: 160, y: 160 },
      collisionBox: { x: 112, y: 128, width: 96, height: 64 },
      interactionZone: { x: 96, y: 128, width: 128, height: 128 },
      sprite: { texture: 'ticket-board', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 160, y: 128 },
    },
    {
      id: 'serving-window',
      type: 'serving',
      name: 'Serving Window',
      position: { x: 1120, y: 160 },
      collisionBox: { x: 1072, y: 128, width: 96, height: 64 },
      interactionZone: { x: 1056, y: 128, width: 128, height: 128 },
      sprite: { texture: 'serving-window', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 1120, y: 128 },
    },

    // === STORAGE (Left) ===
    {
      id: 'fridge',
      type: 'fridge',
      name: 'Walk-in Cooler',
      position: { x: 100, y: 350 },
      collisionBox: { x: 52, y: 300, width: 96, height: 128 },
      interactionZone: { x: 32, y: 280, width: 160, height: 160 },
      sprite: { texture: 'fridge', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 100, y: 300 },
    },

    // === PREP (Mid-Left) ===
    {
      id: 'prep-station',
      type: 'prep',
      name: 'Prep Station',
      position: { x: 350, y: 350 },
      collisionBox: { x: 302, y: 302, width: 128, height: 96 },
      interactionZone: { x: 280, y: 280, width: 180, height: 180 },
      sprite: { texture: 'prep-station', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 350, y: 302 },
    },

    // === HOT LINE (Bottom Row) ===
    {
      id: 'stove',
      type: 'stove',
      name: 'Stove',
      position: { x: 400, y: 580 },
      collisionBox: { x: 352, y: 532, width: 96, height: 96 },
      interactionZone: { x: 332, y: 512, width: 136, height: 136 },
      sprite: { texture: 'stove', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 400, y: 532 },
    },
    {
      id: 'grill',
      type: 'grill',
      name: 'Grill',
      position: { x: 550, y: 580 },
      collisionBox: { x: 502, y: 532, width: 96, height: 96 },
      interactionZone: { x: 482, y: 512, width: 136, height: 136 },
      sprite: { texture: 'grill', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 550, y: 532 },
    },
    {
      id: 'oven',
      type: 'oven',
      name: 'Oven',
      position: { x: 700, y: 580 },
      collisionBox: { x: 652, y: 532, width: 96, height: 96 },
      interactionZone: { x: 632, y: 512, width: 136, height: 136 },
      sprite: { texture: 'oven', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 700, y: 532 },
    },
    {
      id: 'fry',
      type: 'fry',
      name: 'Fryer',
      position: { x: 850, y: 580 },
      collisionBox: { x: 802, y: 532, width: 96, height: 96 },
      interactionZone: { x: 782, y: 512, width: 136, height: 136 },
      sprite: { texture: 'fry', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 850, y: 532 },
    },

    // === FINISHING & OTHERS (Right) ===
    {
      id: 'plating-station',
      type: 'plating',
      name: 'Plating Station',
      position: { x: 750, y: 350 },
      collisionBox: { x: 702, y: 302, width: 128, height: 96 },
      interactionZone: { x: 680, y: 280, width: 180, height: 180 },
      sprite: { texture: 'plating-station', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 750, y: 302 },
    },
    {
      id: 'drinks',
      type: 'drinks',
      name: 'Drink Station',
      position: { x: 1050, y: 350 },
      collisionBox: { x: 1002, y: 302, width: 96, height: 96 },
      interactionZone: { x: 982, y: 280, width: 136, height: 136 },
      sprite: { texture: 'drinks', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 1050, y: 302 },
    },
    {
      id: 'dessert',
      type: 'dessert',
      name: 'Dessert Station',
      position: { x: 1050, y: 500 },
      collisionBox: { x: 1002, y: 452, width: 96, height: 96 },
      interactionZone: { x: 982, y: 432, width: 136, height: 136 },
      sprite: { texture: 'dessert', anchor: { x: 0.5, y: 1 }, scale: 1 },
      overlayAnchor: { x: 1050, y: 452 },
    },
  ],

  playerSpawn: {
    x: 640,
    y: 450,
  },

  door: {
    x: 1232,
    y: 200,
  },
};

export const WAYPOINTS: Record<string, Position> = {
  CENTER: { x: 640, y: 450 },
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
