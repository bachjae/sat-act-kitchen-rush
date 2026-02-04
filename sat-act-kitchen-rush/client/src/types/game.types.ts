export type StationType = 'ticket' | 'fridge' | 'prep' | 'stove' | 'plating' | 'serving';

export interface Position {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteInfo {
  texture: string;
  anchor: Position;
  scale: number;
}

export interface Station {
  id: string;
  type: StationType;
  name: string;
  position: Position;
  collisionBox: BoundingBox;
  interactionZone: BoundingBox;
  sprite: SpriteInfo;
  overlayAnchor: Position;
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

export type GameStatus = 'idle' | 'playing' | 'paused' | 'ended';

export interface KitchenLayout {
  canvas: { width: number; height: number };
  header: BoundingBox;
  footer: BoundingBox;
  playArea: BoundingBox;
  stations: Station[];
  playerSpawn: Position;
  door: Position;
}

export interface GridConfig {
  TILE_SIZE: number;
  CANVAS_WIDTH: number;
  CANVAS_HEIGHT: number;
  TILES_X: number;
  TILES_Y: number;
}

export interface QuestionAttempt {
  questionId: string;
  stem: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTaken: number;
  stationType: StationType;
  skillId: string;
}

export interface StationStat {
  attempted: number;
  correct: number;
  totalTime: number;
}

export interface SessionStats {
  totalOrdersGenerated: number;
  totalOrdersCompleted: number;
  totalOrdersFailed: number;
  totalQuestionsAttempted: number;
  totalCorrectAnswers: number;
  totalCoinsEarned: number;
  totalXpEarned: number;
  stationBreakdown: Record<StationType, StationStat>;
  questionReview: QuestionAttempt[];
}
