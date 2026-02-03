import { Application, Graphics, Text, TextStyle, Container } from 'pixi.js';
import { KITCHEN_LAYOUT } from '@game/config/kitchen-layout';
import { PlayerEntity } from '@game/entities/PlayerEntity';
import { useGameStore } from '@store/gameStore';
import { fetchQuestions } from '@services/questions.service';
import { OrderSystem } from '@game/systems/OrderSystem';
import type { Station } from '@app-types/game.types';

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
  private stationGraphics: Map<string, Graphics> = new Map();

  constructor(app: Application) {
    this.app = app;
    this.setupKitchen();
    this.setupPlayer();
    this.setupInput();

    // Initial order
    const order = OrderSystem.getInstance().generateOrder();
    useGameStore.getState().addOrder(order);
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
      
      const gfx = new Graphics();
      const color = STATION_COLORS[station.type] ?? 0xFFFFFF;

      // Base Countertop
      gfx.rect(
        station.collisionBox.x,
        station.collisionBox.y + 20,
        station.collisionBox.width,
        station.collisionBox.height - 20
      );
      gfx.fill(0x6C757D); // Gray counter
      gfx.stroke({ width: 2, color: 0x1D3557 });

      // Station-specific top
      gfx.rect(
        station.collisionBox.x + 4,
        station.collisionBox.y,
        station.collisionBox.width - 8,
        32
      );
      gfx.fill(color);
      gfx.stroke({ width: 2, color: 0x1D3557 });

      // Visual details based on type
      this.addStationDetails(gfx, station);

      // Make interactive
      this.makeStationInteractive(gfx, station);
      this.stationGraphics.set(station.id, gfx);

      stationGroup.addChild(gfx);

      // Add text label (above station)
      const style = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 0x1D3557,
        fontWeight: 'bold',
        align: 'center',
      });
      const label = new Text({ text: station.name, style });
      label.anchor.set(0.5);
      label.position.set(
        station.collisionBox.x + station.collisionBox.width / 2,
        station.collisionBox.y - 10
      );
      stationGroup.addChild(label);

      this.app.stage.addChild(stationGroup);
    }
  }

  private addStationDetails(gfx: Graphics, station: Station) {
    const { x, y, width } = station.collisionBox;
    const centerX = x + width / 2;

    switch (station.type) {
      case 'ticket':
        // Clipboard
        gfx.rect(centerX - 10, y + 5, 20, 20);
        gfx.fill(0xFFFFFF);
        gfx.rect(centerX - 8, y + 10, 16, 2);
        gfx.fill(0x000000);
        break;
      case 'fridge':
        // Handle
        gfx.rect(x + width - 15, y + 40, 4, 20);
        gfx.fill(0x1D3557);
        break;
      case 'prep':
        // Knife/Board
        gfx.rect(centerX - 15, y + 25, 30, 5);
        gfx.fill(0x8B5A3C);
        break;
      case 'stove':
        // Burners
        gfx.circle(centerX - 15, y + 16, 8);
        gfx.circle(centerX + 15, y + 16, 8);
        gfx.fill(0x333333);
        break;
      case 'plating':
        // Plate
        gfx.circle(centerX, y + 16, 12);
        gfx.fill(0xFFFFFF);
        break;
    }
  }

  private makeStationInteractive(graphics: Graphics, station: Station) {
    graphics.eventMode = 'static';
    graphics.cursor = 'pointer';

    graphics.on('pointerover', () => {
      graphics.tint = 0xCCCCCC; // Highlight on hover
    });

    graphics.on('pointerout', () => {
      graphics.tint = 0xFFFFFF; // Reset tint
    });

    graphics.on('pointerdown', (e) => {
      e.stopPropagation(); // Prevent canvas click from firing
      console.log('Station graphic clicked directly:', station.type);
      this.onStationClick(station);
    });
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
    const canvas = this.app.canvas;
    canvas.addEventListener('click', (e: MouseEvent) => {
      if (!this.player) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = 1280 / rect.width;
      const scaleY = 720 / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      console.log(`\n🖱️ Canvas clicked at (${Math.round(x)}, ${Math.round(y)})`);

      // First, check if clicking a station
      const station = this.checkStationCollision(x, y);
      if (station) {
        console.log(`🎯 Station clicked! Type: ${station.type}`);
        this.onStationClick(station);
        return; // Don't move player to the click point if it's a station
      }

      // Otherwise move player
      console.log('👟 Moving player to clicked location');
      this.player.moveTo(x, y);
    });
  }

  private checkStationCollision(x: number, y: number): Station | null {
    const stations = KITCHEN_LAYOUT.stations;

    for (const station of stations) {
      const zone = station.interactionZone;
      if (
        x >= zone.x &&
        x <= zone.x + zone.width &&
        y >= zone.y &&
        y <= zone.y + zone.height
      ) {
        console.log(`✅ Hit station: ${station.type}`);
        return station;
      }
    }
    return null;
  }

  private async onStationClick(station: Station) {
    console.log(`🎯 Station clicked: ${station.type} (${station.name})`);

    // Move player toward station
    this.player?.moveTo(
      station.interactionZone.x + station.interactionZone.width / 2,
      station.interactionZone.y + station.interactionZone.height / 2
    );

    // Don't fetch for serving window (no questions there)
    if (station.type === 'serving') {
      console.log('Serving window - no question');
      return;
    }

    try {
      const questions = await fetchQuestions({
        count: 1,
        stationType: station.type,
      });

      if (questions && questions.length > 0) {
        console.log('📝 Question loaded:', questions[0].stem.substring(0, 50) + '...');

        // Set in store
        const { setActiveQuestion } = useGameStore.getState();
        setActiveQuestion(questions[0]);

        console.log('✅ Active question set in store');
      } else {
        console.error('❌ No questions returned for station:', station.type);
      }
    } catch (error) {
      console.error('❌ Error loading question:', error);
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

  private checkProximity() {
    if (!this.player) return;

    const playerX = this.player.position.x;
    const playerY = this.player.position.y;

    for (const station of KITCHEN_LAYOUT.stations) {
      const gfx = this.stationGraphics.get(station.id);
      if (!gfx) continue;

      const dx = playerX - (station.interactionZone.x + station.interactionZone.width / 2);
      const dy = playerY - (station.interactionZone.y + station.interactionZone.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Highlight if within 100 pixels
      if (distance < 120) {
        gfx.alpha = 0.8;
      } else {
        gfx.alpha = 1.0;
      }
    }
  }

  private gameLoop = () => {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Update player movement
    this.player?.update(deltaTime);
    this.checkProximity();

    // Tick the game store
    useGameStore.getState().tick(deltaTime);

    requestAnimationFrame(this.gameLoop);
  };
}
