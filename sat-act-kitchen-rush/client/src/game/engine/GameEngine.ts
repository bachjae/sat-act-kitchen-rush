// @ts-nocheck
import { Application, Text, TextStyle, Container, Sprite, TilingSprite } from 'pixi.js';
import { KITCHEN_LAYOUT } from '@game/config/kitchen-layout';
import { PlayerEntity } from '@game/entities/PlayerEntity';
import { useGameStore } from '@store/gameStore';
import { fetchQuestions } from '@services/questions.service';
import { checkAndRefillOrders } from '@game/systems/OrderSystem';
import { AssetLoader } from './AssetLoader';
import { AudioManager } from './AudioManager';
import { findPath } from '@game/utils/pathfinding';
import { GRID } from '@game/config/kitchen-layout';
import type { Station } from '@app-types/game.types';

export class GameEngine {
  public app: Application;
  private running = false;
  private lastTime = 0;
  private player: PlayerEntity | null = null;
  private collisionGrid: boolean[][] = [];

  constructor(app: Application) {
    this.app = app;
  }

  public async init() {
    await AssetLoader.loadAllAssets();
    this.generateCollisionGrid();
    this.setupKitchen();
    this.setupPlayer();
    this.setupInput();
  }

  private generateCollisionGrid() {
    const rows = GRID.TILES_Y;
    const cols = GRID.TILES_X;
    const tileSize = GRID.TILE_SIZE;
    this.collisionGrid = Array.from({ length: rows }, () => Array(cols).fill(true));

    // Mark stations as non-walkable
    for (const station of KITCHEN_LAYOUT.stations) {
      const box = station.collisionBox;
      if (!box) continue;
      const startX = Math.floor(box.x / tileSize);
      const startY = Math.floor(box.y / tileSize);
      const width = Math.ceil(box.width / tileSize);
      const height = Math.ceil(box.height / tileSize);

      for (let y = startY; y < startY + height; y++) {
        const row = this.collisionGrid[y];
        if (!row) continue;
        for (let x = startX; x < startX + width; x++) {
          if (x >= 0 && x < cols) {
            row[x] = false;
          }
        }
      }
    }

    // Mark walls as non-walkable
    // Top & Bottom walls (128-160 and 608-640)
    const topWallY = Math.floor(128 / tileSize);
    const bottomWallY = Math.floor(608 / tileSize);
    for (let x = 0; x < cols; x++) {
      const topRow = this.collisionGrid[topWallY];
      if (topRow) topRow[x] = false;
      const bottomRow = this.collisionGrid[bottomWallY];
      if (bottomRow) bottomRow[x] = false;
    }
  }

  private setupKitchen() {
    // Draw floor using TilingSprite
    const floor = new TilingSprite({
      texture: AssetLoader.getTexture('floor-tile'),
      width: 1280,
      height: 720
    });
    this.app.stage.addChild(floor);

    // Draw walls using TilingSprite
    // Top wall
    const topWall = new TilingSprite({
      texture: AssetLoader.getTexture('wall-tile'),
      width: 1280,
      height: 32
    });
    topWall.position.set(0, 128);
    this.app.stage.addChild(topWall);

    // Bottom wall
    const bottomWall = new TilingSprite({
      texture: AssetLoader.getTexture('wall-tile'),
      width: 1280,
      height: 32
    });
    bottomWall.position.set(0, 608);
    this.app.stage.addChild(bottomWall);

    // Draw stations
    this.drawStations();
  }

  private drawStations() {
    for (const station of KITCHEN_LAYOUT.stations) {
      const stationGroup = new Container();
      
      const sprite = new Sprite(AssetLoader.getTexture(station.type));

      // Position based on collisionBox
      const box = station.collisionBox;
      if (box) {
        sprite.position.set(box.x, box.y);
        sprite.width = box.width;
        sprite.height = box.height;
      }

      // Make interactive
      this.makeStationInteractive(sprite, station);

      stationGroup.addChild(sprite);

      // Add text label
      const style = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0x000000,
        fontWeight: 'bold',
        align: 'center',
      });
      const label = new Text({ text: station.type.toUpperCase(), style });
      label.anchor.set(0.5);
      if (box) {
        label.position.set(
          box.x + box.width / 2,
          box.y + box.height / 2
        );
      }
      stationGroup.addChild(label);

      this.app.stage.addChild(stationGroup);
    }
  }

  private makeStationInteractive(sprite: Sprite, station: Station) {
    sprite.eventMode = 'static';
    sprite.cursor = 'pointer';

    sprite.on('pointerover', () => {
      sprite.tint = 0xCCCCCC; // Highlight on hover
    });

    sprite.on('pointerout', () => {
      sprite.tint = 0xFFFFFF; // Reset tint
    });

    sprite.on('pointerdown', (e) => {
      e.stopPropagation(); // Prevent canvas click from firing
      console.log('Station sprite clicked directly:', station.type);
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
      const player = this.player;
      if (!player) return;

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
      const tileSize = GRID.TILE_SIZE;
      const path = findPath(
        { x: player.position.x, y: player.position.y },
        { x, y },
        this.collisionGrid,
        tileSize
      );
      player.moveTo(x, y, path);
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
    AudioManager.getInstance().playSound('click');

    const player = this.player;
    if (!player) return;

    // Move player toward station interaction zone
    const zone = station.interactionZone;
    const targetX = zone.x + zone.width / 2;
    const targetY = zone.y + zone.height / 2;

    const tileSize = GRID.TILE_SIZE;
    const grid = this.collisionGrid;
    const startPos = { x: player.position.x, y: player.position.y };
    const endPos = { x: targetX, y: targetY };
    const path = (findPath as any)(startPos, endPos, grid, tileSize);

    player.moveTo(targetX, targetY, path);

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
        setActiveQuestion(questions[0] ?? null);

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

    // Initial orders
    checkAndRefillOrders(2);

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

    // Update session timer
    useGameStore.getState().tickSessionTime(deltaTime);

    // Check for order refills every ~2 seconds
    if (Math.floor(currentTime / 2000) !== Math.floor((currentTime - deltaTime * 1000) / 2000)) {
      checkAndRefillOrders();
    }

    requestAnimationFrame(this.gameLoop);
  };
}
