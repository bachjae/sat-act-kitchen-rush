import { Container, Sprite } from 'pixi.js';
import { AssetLoader } from '@game/engine/AssetLoader';

import type { Point } from '@game/utils/pathfinding';

export class PlayerEntity {
  public id: string;
  public sprite: Container;
  public position: { x: number; y: number };
  public targetPosition: { x: number; y: number } | null = null;
  public waypoints: Point[] = [];
  public currentWaypointIndex = 0;
  public speed = 150; // pixels per second

  constructor(id: string, startX: number, startY: number) {
    this.id = id;
    this.position = { x: startX, y: startY };

    this.sprite = new Container();

    // Use Sprite from AssetLoader
    const playerSprite = new Sprite(AssetLoader.getTexture('player-chef'));
    playerSprite.anchor.set(0.5, 0.8); // Center horizontally, near bottom vertically
    playerSprite.scale.set(0.5); // Adjust scale if needed

    this.sprite.addChild(playerSprite);
    this.sprite.position.set(startX, startY);
  }

  public moveTo(x: number, y: number, path?: Point[]) {
    if (path && path.length > 0) {
      this.waypoints = path;
      this.currentWaypointIndex = 0;
      this.targetPosition = path[0] ?? null;
    } else {
      this.targetPosition = { x, y };
      this.waypoints = [];
    }
  }

  public update(deltaTime: number) {
    if (!this.targetPosition) return;

    const dx = this.targetPosition.x - this.position.x;
    const dy = this.targetPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 4) {
      // Reached target or waypoint
      if (this.waypoints.length > 0 && this.currentWaypointIndex < this.waypoints.length - 1) {
        this.currentWaypointIndex++;
        this.targetPosition = this.waypoints[this.currentWaypointIndex] ?? null;
      } else {
        // Reached final destination
        this.position.x = this.targetPosition.x;
        this.position.y = this.targetPosition.y;
        this.targetPosition = null;
        this.waypoints = [];
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
}
