import { Container, Graphics } from 'pixi.js';

export class PlayerEntity {
  public id: string;
  public sprite: Container;
  public position: { x: number; y: number };
  public targetPosition: { x: number; y: number } | null = null;
  public speed = 150; // pixels per second
  private body: Graphics;
  private hat: Graphics;
  private animTimer = 0;

  constructor(id: string, startX: number, startY: number) {
    this.id = id;
    this.position = { x: startX, y: startY };

    this.sprite = new Container();

    // Body (Chef)
    this.body = new Graphics();
    this.body.rect(-12, -24, 24, 32);
    this.body.fill(0x457B9D); // Blue apron
    this.body.stroke({ width: 2, color: 0x1D3557 });

    // Head
    this.body.circle(0, -32, 10);
    this.body.fill(0xF1FAEE);
    this.body.stroke({ width: 2, color: 0x1D3557 });

    // Chef Hat
    this.hat = new Graphics();
    this.hat.rect(-10, -50, 20, 12);
    this.hat.fill(0xFFFFFF);
    this.hat.stroke({ width: 2, color: 0x1D3557 });

    this.sprite.addChild(this.body);
    this.sprite.addChild(this.hat);
    this.sprite.position.set(startX, startY);
  }

  public moveTo(x: number, y: number) {
    this.targetPosition = { x, y };
  }

  public update(deltaTime: number) {
    if (!this.targetPosition) {
      // Idle animation (gentle bobbing)
      this.animTimer += deltaTime * 2;
      this.sprite.y = this.position.y + Math.sin(this.animTimer) * 2;
      return;
    }

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

      // Walking animation (wobble)
      this.animTimer += deltaTime * 10;
      this.sprite.rotation = Math.sin(this.animTimer) * 0.1;
    }

    // Update sprite position
    this.sprite.position.set(this.position.x, this.position.y);
  }
}
