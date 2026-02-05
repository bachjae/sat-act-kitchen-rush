import { PlayerEntity } from '@game/entities/PlayerEntity';

export class InputManager {
  private keys: Map<string, boolean> = new Map();
  private player: PlayerEntity;
  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;

  constructor(player: PlayerEntity) {
    this.player = player;

    this.onKeyDown = (e: KeyboardEvent) => {
      this.keys.set(e.key.toLowerCase(), true);

      // Prevent page scrolling with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };

    this.onKeyUp = (e: KeyboardEvent) => {
      this.keys.set(e.key.toLowerCase(), false);
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  public update(deltaTime: number) {
    let dx = 0;
    let dy = 0;

    // WASD + Arrow keys
    if (this.keys.get('w') || this.keys.get('arrowup')) dy -= 1;
    if (this.keys.get('s') || this.keys.get('arrowdown')) dy += 1;
    if (this.keys.get('a') || this.keys.get('arrowleft')) dx -= 1;
    if (this.keys.get('d') || this.keys.get('arrowright')) dx += 1;

    if (dx !== 0 || dy !== 0) {
      // Normalize diagonal movement
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;

      // Clear click-to-move target when using keyboard
      this.player.clearTarget();

      // Move player
      this.player.moveByDirection(dx, dy, deltaTime);
    }
  }

  public isKeyDown(key: string): boolean {
    return this.keys.get(key.toLowerCase()) ?? false;
  }

  public destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
