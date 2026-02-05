import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { pathfindingSystem } from '@game/systems/PathfindingSystem';
import type { Position } from '@app-types/game.types';

export type Direction = 'down' | 'up' | 'left' | 'right';

export class PlayerEntity {
  public id: string;
  public sprite: Container;
  public position: { x: number; y: number };
  public targetPosition: { x: number; y: number } | null = null;
  public speed = 150; // pixels per second
  public direction: Direction = 'down';

  // Waypoint path queue
  private pathQueue: Position[] = [];

  constructor(id: string, startX: number, startY: number, texture?: Texture) {
    this.id = id;
    this.position = { x: startX, y: startY };

    this.sprite = new Container();

    if (texture) {
      // Use pixel art sprite
      const pixelSprite = new Sprite(texture);
      pixelSprite.anchor.set(0.5);
      pixelSprite.width = 48;
      pixelSprite.height = 48;
      this.sprite.addChild(pixelSprite);
    } else {
      // Fallback circle
      const circle = new Graphics();
      circle.circle(0, 0, 16);
      circle.fill(0x457B9D);
      circle.stroke({ width: 2, color: 0x1D3557 });
      this.sprite.addChild(circle);
    }

    this.sprite.position.set(startX, startY);
  }

  /**
   * Move to a position using waypoint pathfinding
   */
  public moveTo(x: number, y: number) {
    // Use pathfinding to get waypoint path
    const path = pathfindingSystem.findPath(this.position, { x, y });
    this.pathQueue = path;

    // Set first target
    if (this.pathQueue.length > 0) {
      this.targetPosition = this.pathQueue.shift()!;
    }
  }

  /**
   * Move directly to a position (no pathfinding)
   */
  public moveDirectTo(x: number, y: number) {
    this.pathQueue = [];
    this.targetPosition = { x, y };
  }

  public clearTarget() {
    this.targetPosition = null;
    this.pathQueue = [];
  }

  public moveByDirection(dx: number, dy: number, deltaTime: number) {
    // Clear any click-to-move target when using keyboard
    if (dx !== 0 || dy !== 0) {
      this.targetPosition = null;
      this.pathQueue = [];
    }

    const moveSpeed = this.speed * deltaTime;
    this.position.x += dx * moveSpeed;
    this.position.y += dy * moveSpeed;

    // Update direction based on movement
    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? 'right' : 'left';
    } else if (dy !== 0) {
      this.direction = dy > 0 ? 'down' : 'up';
    }

    this.sprite.position.set(this.position.x, this.position.y);
  }

  public update(deltaTime: number) {
    if (!this.targetPosition) return;

    const dx = this.targetPosition.x - this.position.x;
    const dy = this.targetPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Update direction based on movement direction
    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? 'right' : 'left';
    } else {
      this.direction = dy > 0 ? 'down' : 'up';
    }

    if (distance < 4) {
      // Reached current target
      this.position.x = this.targetPosition.x;
      this.position.y = this.targetPosition.y;

      // Get next waypoint from queue
      if (this.pathQueue.length > 0) {
        this.targetPosition = this.pathQueue.shift()!;
      } else {
        this.targetPosition = null;
      }
    } else {
      // Move toward target
      const moveDistance = this.speed * deltaTime;
      this.position.x += (dx / distance) * moveDistance;
      this.position.y += (dy / distance) * moveDistance;
    }

    // Update sprite position
    this.sprite.position.set(this.position.x, this.position.y);
  }

  /**
   * Check if player is currently moving
   */
  public isMoving(): boolean {
    return this.targetPosition !== null || this.pathQueue.length > 0;
  }

  /**
   * Get current direction for animation
   */
  public getDirection(): Direction {
    return this.direction;
  }
}
