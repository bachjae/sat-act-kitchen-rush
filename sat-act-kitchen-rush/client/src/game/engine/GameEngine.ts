import { Application, Graphics, Text, TextStyle, Container } from 'pixi.js';
import { KITCHEN_LAYOUT } from '@game/config/kitchen-layout';
import { PlayerEntity } from '@game/entities/PlayerEntity';
import { useGameStore } from '@store/gameStore';
import { fetchQuestions } from '@services/questions.service';
import type { Station } from '@types/game.types';

const STATION_COLORS: Record<string, number> = {
  ticket: 0xFFD60A,
  fridge: 0xA8DADC,
  prep: 0x06D6A0,
  stove: 0xE63946,
  plating: 0xF77F00,
  serving: 0x457B9D,
};

export class GameEngine {
  public app: Application;
  private running = false;
  private lastTime = 0;
  private player: PlayerEntity | null = null;

  constructor(app: Application) {
    this.app = app;
    this.setupKitchen();
    this.setupPlayer();
    this.setupInput();
  }

  private setupKitchen() {
    // Draw floor
    const floor = new Graphics();
    floor.rect(0, 0, 1280, 720);
    floor.fill(0xE8E8E8);
    this.app.stage.addChild(floor);

    // Draw walls (navy)
    const walls = new Graphics();
    // Top wall
    walls.rect(0, 128, 1280, 32);
    walls.fill(0x1D3557);
    // Bottom wall
    walls.rect(0, 608, 1280, 32);
    walls.fill(0x1D3557);
    // Left wall
    walls.rect(0, 128, 32, 480);
    walls.fill(0x1D3557);
    // Right wall
    walls.rect(1248, 128, 32, 480);
    walls.fill(0x1D3557);
    this.app.stage.addChild(walls);

    // Draw stations
    this.drawStations();
  }

  private drawStations() {
    for (const station of KITCHEN_LAYOUT.stations) {
      const stationGroup = new Container();
      
      const box = new Graphics();
      const color = STATION_COLORS[station.type] ?? 0xFFFFFF;
      box.rect(
        station.collisionBox.x,
        station.collisionBox.y,
        station.collisionBox.width,
        station.collisionBox.height,
      );
      box.fill(color);
      stationGroup.addChild(box);

      // Add station label
      const style = new TextStyle({
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 11,
        fill: 0x1D3557,
        fontWeight: 'bold',
        align: 'center',
      });
      const label = new Text({ text: station.name, style });
      label.anchor.set(0.5);
      label.x = station.collisionBox.x + station.collisionBox.width / 2;
      label.y = station.collisionBox.y + station.collisionBox.height / 2;
      stationGroup.addChild(label);

      this.app.stage.addChild(stationGroup);
    }
  }

  private setupPlayer() {
    this.player = new PlayerEntity(
      'player1',
      KITCHEN_LAYOUT.playerSpawn.x,
      KITCHEN_LAYOUT.playerSpawn.y,
    );
    this.app.stage.addChild(this.player.sprite);
  }

  private setupInput() {
    const canvas = this.app.canvas as HTMLCanvasElement;
    canvas.addEventListener('click', (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = 1280 / rect.width;
      const scaleY = 720 / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      // Check if clicking a station
      const station = this.checkStationCollision(x, y);
      if (station) {
        this.onStationClick(station);
        return;
      }

      // Otherwise move player
      this.player?.moveTo(x, y);
    });
  }

  private checkStationCollision(x: number, y: number): Station | null {
    for (const station of KITCHEN_LAYOUT.stations) {
      const zone = station.interactionZone;
      if (
        x >= zone.x &&
        x <= zone.x + zone.width &&
        y >= zone.y &&
        y <= zone.y + zone.height
      ) {
        return station;
      }
    }
    return null;
  }

  private async onStationClick(station: Station) {
    console.log('Station clicked:', station.type, station.name);

    // Move player toward station
    this.player?.moveTo(station.interactionZone.x + station.interactionZone.width / 2, station.interactionZone.y + station.interactionZone.height / 2);

    // Don't fetch for serving window (no questions there)
    if (station.type === 'serving') {
      console.log('Serving window - no question');
      return;
    }

    const questions = await fetchQuestions({
      count: 1,
      stationType: station.type,
    });

    if (questions.length > 0) {
      console.log('Question loaded:', questions[0].stem);
      useGameStore.getState().setActiveQuestion(questions[0]);
    } else {
      console.warn('No questions found for station:', station.type);
    }
  }

  public start() {
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  public stop() {
    this.running = false;
  }

  private gameLoop = () => {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Update player movement
    this.player?.update(deltaTime);

    requestAnimationFrame(this.gameLoop);
  };
}
