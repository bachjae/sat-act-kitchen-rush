import { PlayerEntity } from '@game/entities/PlayerEntity';
import { KITCHEN_LAYOUT } from '@game/config/kitchen-layout';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Wall boundaries are now handled via boundary check in checkPlayerCollisions
// PlayArea: x=32-1248, y=160-608 (32px walls on all sides from header/footer edges)

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

    // Boundary check - keep player in playable area
    const minX = 48;  // Left wall + margin
    const maxX = 1232; // Right wall - margin
    const minY = 144; // Top wall + margin (below header)
    const maxY = 592; // Bottom wall - margin (above footer)

    if (playerBox.x < minX || playerBox.x + playerBox.width > maxX ||
        playerBox.y < minY || playerBox.y + playerBox.height > maxY) {
      return true;
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
