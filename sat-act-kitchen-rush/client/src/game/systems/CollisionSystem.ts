import { PlayerEntity } from '@game/entities/PlayerEntity';
import { KITCHEN_LAYOUT } from '@game/config/kitchen-layout';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Wall definitions matching the drawn walls in GameEngine
const WALLS: Rect[] = [
  { x: 0, y: 128, width: 1280, height: 32 },   // Top wall
  { x: 0, y: 608, width: 1280, height: 32 },   // Bottom wall
  { x: 0, y: 128, width: 32, height: 512 },     // Left wall
  { x: 1248, y: 128, width: 32, height: 512 },  // Right wall
];

export class CollisionSystem {
  static checkAABB(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  static getPlayerBox(player: PlayerEntity): Rect {
    return {
      x: player.position.x - 16,
      y: player.position.y - 16,
      width: 32,
      height: 32,
    };
  }

  static checkPlayerCollisions(player: PlayerEntity): boolean {
    const playerBox = this.getPlayerBox(player);

    // Check wall collisions
    for (const wall of WALLS) {
      if (this.checkAABB(playerBox, wall)) {
        return true;
      }
    }

    // Check station collisions
    for (const station of KITCHEN_LAYOUT.stations) {
      if (this.checkAABB(playerBox, station.collisionBox)) {
        return true;
      }
    }

    return false;
  }

  static resolveCollision(player: PlayerEntity, previousPosition: { x: number; y: number }) {
    player.position.x = previousPosition.x;
    player.position.y = previousPosition.y;
    player.sprite.position.set(previousPosition.x, previousPosition.y);
  }
}
