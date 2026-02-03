import type { KitchenLayout, GridConfig, StationType, Position } from '@app-types/game.types';

export const GRID: GridConfig = {
  TILE_SIZE: 32,
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  TILES_X: 40,
  TILES_Y: 22.5,
};

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
    {
      id: 'ticket-board',
      type: 'ticket' as StationType,
      name: 'Ticket Board',
      position: { x: 192, y: 192 },
      collisionBox: { x: 160, y: 160, width: 64, height: 64 },
      interactionZone: { x: 144, y: 144, width: 96, height: 96 },
      sprite: { texture: 'ticket-board', anchor: { x: 0.5, y: 0.5 }, scale: 1 },
      overlayAnchor: { x: 192, y: 160 },
    },
    {
      id: 'fridge',
      type: 'fridge' as StationType,
      name: 'Fridge & Pantry',
      position: { x: 576, y: 192 },
      collisionBox: { x: 544, y: 160, width: 64, height: 64 },
      interactionZone: { x: 528, y: 144, width: 96, height: 96 },
      sprite: { texture: 'fridge', anchor: { x: 0.5, y: 0.5 }, scale: 1 },
      overlayAnchor: { x: 576, y: 160 },
    },
    {
      id: 'prep-station',
      type: 'prep' as StationType,
      name: 'Prep Station',
      position: { x: 960, y: 192 },
      collisionBox: { x: 928, y: 160, width: 64, height: 64 },
      interactionZone: { x: 912, y: 144, width: 96, height: 96 },
      sprite: { texture: 'prep-station', anchor: { x: 0.5, y: 0.5 }, scale: 1 },
      overlayAnchor: { x: 960, y: 160 },
    },
    {
      id: 'stove',
      type: 'stove' as StationType,
      name: 'Stove & Oven',
      position: { x: 192, y: 448 },
      collisionBox: { x: 160, y: 416, width: 64, height: 64 },
      interactionZone: { x: 144, y: 400, width: 96, height: 96 },
      sprite: { texture: 'stove', anchor: { x: 0.5, y: 0.5 }, scale: 1 },
      overlayAnchor: { x: 192, y: 416 },
    },
    {
      id: 'plating-station',
      type: 'plating' as StationType,
      name: 'Plating Station',
      position: { x: 576, y: 448 },
      collisionBox: { x: 544, y: 416, width: 64, height: 64 },
      interactionZone: { x: 528, y: 400, width: 96, height: 96 },
      sprite: { texture: 'plating-station', anchor: { x: 0.5, y: 0.5 }, scale: 1 },
      overlayAnchor: { x: 576, y: 416 },
    },
    {
      id: 'serving-window',
      type: 'serving' as StationType,
      name: 'Serving Window',
      position: { x: 960, y: 448 },
      collisionBox: { x: 928, y: 416, width: 64, height: 64 },
      interactionZone: { x: 912, y: 400, width: 96, height: 96 },
      sprite: { texture: 'serving-window', anchor: { x: 0.5, y: 0.5 }, scale: 1 },
      overlayAnchor: { x: 960, y: 416 },
    },
  ],

  playerSpawn: {
    x: 640,
    y: 360,
  },

  door: {
    x: 1232,
    y: 224,
  },
};

export const WAYPOINTS: Record<string, Position> = {
  CENTER: { x: 640, y: 360 },
  TICKET_APPROACH: { x: 192, y: 300 },
  FRIDGE_APPROACH: { x: 576, y: 300 },
  PREP_APPROACH: { x: 960, y: 300 },
  STOVE_APPROACH: { x: 192, y: 550 },
  PLATING_APPROACH: { x: 576, y: 550 },
  WINDOW_APPROACH: { x: 960, y: 550 },
};

export const COLLISION_MAP = {
  TOP_WALL: { y: 4, xStart: 0, xEnd: 40 },
  BOTTOM_WALL: { y: 19, xStart: 0, xEnd: 40 },
  LEFT_WALL: { x: 0, yStart: 4, yEnd: 19 },
  RIGHT_WALL: { x: 39, yStart: 4, yEnd: 19 },

  COUNTER_ROW_TOP: { y: 8, xStart: 1, xEnd: 38 },

  TICKET_COUNTER: { x: 3, y: 5, width: 3, height: 3 },
  FRIDGE_COUNTER: { x: 10, y: 10, width: 3, height: 3 },
  PREP_COUNTER: { x: 17, y: 10, width: 3, height: 3 },
  STOVE_COUNTER: { x: 24, y: 10, width: 3, height: 3 },
  PLATING_COUNTER: { x: 31, y: 10, width: 3, height: 3 },
  WINDOW_COUNTER: { x: 37, y: 5, width: 2, height: 3 },

  FLOOR_AREA: { x: 1, y: 13, width: 36, height: 6 },
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
