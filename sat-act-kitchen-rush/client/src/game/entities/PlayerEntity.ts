import { Container, Graphics } from 'pixi.js';

export class PlayerEntity {
  public id: string;
  public sprite: Container;
  public position: { x: number; y: number };
  public targetPosition: { x: number; y: number } | null = null;
  public speed = 150; // pixels per second

  constructor(id: string, startX: number, startY: number) {
    this.id = id;
    this.position = { x: startX, y: startY };

    // Create simple circle sprite as placeholder
    this.sprite = new Container();
    const circle = new Graphics();
    circle.circle(0, 0, 16);
    circle.fill(0x457B9D);
    circle.stroke({ width: 2, color: 0x1D3557 });
    this.sprite.addChild(circle);
    this.sprite.position.set(startX, startY);
  }

  public moveTo(x: number, y: number) {
    this.targetPosition = { x, y };
  }

  public update(deltaTime: number) {
    if (!this.targetPosition) return;

    const dx = this.targetPosition.x - this.position.x;
    const dy = this.targetPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 2) {
      // Snap to target
      this.position.x = this.targetPosition.x;
      this.position.y = this.targetPosition.y;
      this.targetPosition = null;
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
