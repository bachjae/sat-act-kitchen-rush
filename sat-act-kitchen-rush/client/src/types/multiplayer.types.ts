import type { Position } from './game.types';

export interface Room {
  id: string;
  code: string;
  hostId: string;
  players: RoomPlayer[];
  status: 'waiting' | 'playing' | 'ended';
  maxPlayers: number;
  createdAt: Date;
}

export interface RoomPlayer {
  id: string;
  displayName: string;
  color: string;
  position: Position;
  score: number;
  isReady: boolean;
  isHost: boolean;
}
