// @ts-nocheck
import { Application, Assets, Graphics, Sprite, Text, TextStyle, Texture, Container } from 'pixi.js';
import { KITCHEN_LAYOUT, GRID } from '@game/config/kitchen-layout';
import { PlayerEntity } from '@game/entities/PlayerEntity';
import { InputManager } from '@game/engine/InputManager';
import { CollisionSystem } from '@game/systems/CollisionSystem';
import { useGameStore } from '@store/gameStore';
import type { Recipe } from '@store/gameStore';
import { fetchQuestions } from '@services/questions.service';
import type { Station } from '@app-types/game.types';
import recipesData from '@data/recipes.json';
import { pathfindingSystem } from '@game/systems/PathfindingSystem';

// Vite static imports for pixel art assets
import playerChefUrl from '@/assets/player-chef.png';
import ticketBoardUrl from '@/assets/ticket-board.png';
import fridgeUrl from '@/assets/fridge.png';
import prepStationUrl from '@/assets/prep-station.png';
import stoveUrl from '@/assets/stove.png';
import ovenUrl from '@/assets/oven.png';
import platingStationUrl from '@/assets/plating-station.png';
import servingWindowUrl from '@/assets/serving-window.png';

const STATION_TEXTURE_MAP: Record<string, string> = {
  'ticket-board': ticketBoardUrl,
  'fridge': fridgeUrl,
  'prep-station': prepStationUrl,
  'stove': stoveUrl,
  'oven': ovenUrl,
  'plating-station': platingStationUrl,
  'serving-window': servingWindowUrl,
};

const STATION_COLORS: Record<string, number> = {
  ticket: 0xFFD60A,
  fridge: 0xA8DADC,
  prep: 0x06D6A0,
  stove: 0xE63946,
  grill: 0xD62828,
  fry: 0xFCBF49,
  oven: 0xF77F00,
  plating: 0xF77F00,
  dessert: 0xFFC0CB,
  drinks: 0x457B9D,
  serving: 0x457B9D,
  utility: 0x6C757D,
};

const INTERACTION_DISTANCE = 100;

export class GameEngine {
  public app: Application;
  private running = false;
  private lastTime = 0;
  private player: PlayerEntity | null = null;
  private inputManager: InputManager | null = null;
  private stationSprites: Map<string, Container> = new Map();
  private currentStation: Station | null = null;
  private interactionTimeout: ReturnType<typeof setTimeout> | null = null;
  private interactedStations: Set<string> = new Set();
  private textures: Map<string, Texture> = new Map();

  constructor(app: Application) {
    this.app = app;
  }

  public async init() {
    await this.loadAssets();
    this.setupKitchen();
    this.setupPlayer();
    this.setupInput();
  }

  private async loadAssets() {
    try {
      if (playerChefUrl) {
        const playerTexture = await Assets.load(playerChefUrl);
        this.textures.set('player-chef', playerTexture);
      }
    } catch (e) {
      console.warn('Failed to load player texture, using fallback');
    }

    for (const [key, url] of Object.entries(STATION_TEXTURE_MAP)) {
      try {
        if (url) {
          const texture = await Assets.load(url);
          this.textures.set(key, texture);
        }
      } catch (e) {
        console.warn(`Failed to load texture for ${key}, using fallback`);
      }
    }
  }

  private setupKitchen() {
    const floor = new Graphics();
    floor.rect(0, 0, 1280, 720);
    floor.fill(0xEDF2F4);

    for (let x = 0; x < 1280; x += 64) {
      floor.moveTo(x, 0);
      floor.lineTo(x, 720);
      floor.stroke({ width: 1, color: 0xD1D5DB, alpha: 0.5 });
    }
    for (let y = 0; y < 720; y += 64) {
      floor.moveTo(0, y);
      floor.lineTo(1280, y);
      floor.stroke({ width: 1, color: 0xD1D5DB, alpha: 0.5 });
    }
    this.app.stage.addChild(floor);

    const walls = new Graphics();
    walls.rect(0, 0, 1280, KITCHEN_LAYOUT.header.height);
    walls.fill(0x1D3557);
    walls.rect(0, KITCHEN_LAYOUT.footer.y, 1280, KITCHEN_LAYOUT.footer.height);
    walls.fill(0x1D3557);
    walls.rect(0, 0, 32, 720);
    walls.fill(0x1D3557);
    walls.rect(1248, 0, 32, 720);
    walls.fill(0x1D3557);
    this.app.stage.addChild(walls);

    this.drawStations();
  }

  private drawStations() {
    for (const station of KITCHEN_LAYOUT.stations) {
      const stationGroup = new Container();
      const centerX = station.collisionBox.x + station.collisionBox.width / 2;
      const centerY = station.collisionBox.y + station.collisionBox.height / 2;
      stationGroup.position.set(centerX, centerY);

      const box = new Graphics();
      const color = STATION_COLORS[station.type] ?? 0xFFFFFF;
      box.rect(
        -station.collisionBox.width / 2,
        -station.collisionBox.height / 2,
        station.collisionBox.width,
        station.collisionBox.height,
      );
      box.fill(color);
      box.stroke({ width: 2, color: 0x000000 });
      stationGroup.addChild(box);

      const texture = this.textures.get(station.sprite.texture);
      if (texture) {
        const pixelSprite = new Sprite(texture);
        pixelSprite.anchor.set(0.5);
        pixelSprite.position.set(0, 0);
        pixelSprite.width = station.collisionBox.width;
        pixelSprite.height = station.collisionBox.height;
        stationGroup.addChild(pixelSprite);
      }

      const style = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 0xFFFFFF,
        fontWeight: 'bold',
        align: 'center',
        stroke: { color: 0x000000, width: 3 },
        wordWrap: true,
        wordWrapWidth: station.collisionBox.width + 16,
      });
      const label = new Text({ text: station.name.toUpperCase(), style });
      label.anchor.set(0.5, 0);
      label.position.set(0, station.collisionBox.height / 2 + 2);
      stationGroup.addChild(label);

      this.makeStationInteractive(stationGroup, station);
      this.stationSprites.set(station.id, stationGroup);
      this.app.stage.addChild(stationGroup);
    }
  }

  private makeStationInteractive(container: Container, station: Station) {
    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('pointerover', () => { container.alpha = 0.8; });
    container.on('pointerout', () => { container.alpha = 1.0; });
    container.on('pointerdown', (e) => {
      e.stopPropagation();
      this.movePlayerToStation(station);
    });
  }

  private movePlayerToStation(station: Station) {
    if (!this.player) return;
    const targetX = station.collisionBox.x + station.collisionBox.width / 2;
    const targetY = station.collisionBox.y + station.collisionBox.height + 24;
    this.player.moveTo(targetX, targetY);
  }

  private setupPlayer() {
    const playerTexture = this.textures.get('player-chef');
    this.player = new PlayerEntity(
      'player1',
      KITCHEN_LAYOUT.playerSpawn.x,
      KITCHEN_LAYOUT.playerSpawn.y,
      playerTexture,
    );
    this.app.stage.addChild(this.player.sprite);
    this.inputManager = new InputManager(this.player);
  }

  private setupInput() {
    const canvas = this.app.canvas;
    canvas.addEventListener('click', (e: MouseEvent) => {
      if (!this.player) return;
      const gameState = useGameStore.getState();
      if (gameState.activeMechanic || gameState.activeQuestion || gameState.activeRecipe) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = 1280 / rect.width;
      const scaleY = 720 / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const station = this.checkClickOnStation(x, y);
      if (station) {
        this.movePlayerToStation(station);
        return;
      }
      this.player.moveTo(x, y);
    });
  }

  private checkClickOnStation(x: number, y: number): Station | null {
    for (const station of KITCHEN_LAYOUT.stations) {
      const box = station.collisionBox;
      if (x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height) {
        return station;
      }
    }
    return null;
  }

  private checkProximity() {
    if (!this.player) return;
    const playerPos = this.player.position;
    let nearestStation: Station | null = null;
    let nearestDist = Infinity;

    for (const station of KITCHEN_LAYOUT.stations) {
      const stationCenterX = station.collisionBox.x + station.collisionBox.width / 2;
      const stationCenterY = station.collisionBox.y + station.collisionBox.height / 2;
      const dx = stationCenterX - playerPos.x;
      const dy = stationCenterY - playerPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const sprite = this.stationSprites.get(station.id);
      if (sprite) {
        if (distance <= INTERACTION_DISTANCE) {
          sprite.alpha = 1.2;
          sprite.scale.set(1.05);
        } else {
          sprite.alpha = 1.0;
          sprite.scale.set(1.0);
        }
      }

      if (distance <= INTERACTION_DISTANCE && distance < nearestDist) {
        nearestStation = station;
        nearestDist = distance;
      }
    }

    if (nearestStation) {
      if (this.currentStation?.id !== nearestStation.id) {
        this.currentStation = nearestStation;
        this.clearInteractionTimeout();
        this.interactedStations.delete(nearestStation.id);
        this.interactionTimeout = setTimeout(() => {
          if (this.currentStation?.id === nearestStation!.id) {
            this.triggerStationInteraction(nearestStation!);
          }
        }, 400);
      }
    } else if (this.currentStation) {
      this.currentStation = null;
      this.clearInteractionTimeout();
    }
  }

  private clearInteractionTimeout() {
    if (this.interactionTimeout) {
      clearTimeout(this.interactionTimeout);
      this.interactionTimeout = null;
    }
  }

  private async triggerStationInteraction(station: Station) {
    if (this.interactedStations.has(station.id)) return;
    this.interactedStations.add(station.id);
    const gameState = useGameStore.getState();

    if (station.type === 'ticket') { this.showOrderPickup(); return; }
    if (station.type === 'serving') { this.completeOrder(); return; }

    gameState.setActiveStation(station.type);
    const processStations = ['fridge', 'prep', 'stove', 'grill', 'fry', 'oven', 'dessert', 'drinks', 'plating'];
    if (processStations.includes(station.type)) {
      gameState.setActiveMechanic(station.type as any);
    } else {
      await this.showQuestionForStation(station.type);
    }
  }

  public async showQuestionForStation(stationType: string) {
    const gameState = useGameStore.getState();
    try {
      const questions = await fetchQuestions({ count: 1, stationType: stationType });
      if (questions && questions.length > 0) {
        gameState.setActiveQuestion(questions[0]);
      }
    } catch (error) {
      console.error('Error loading question:', error);
    }
  }

  private showOrderPickup() {
    const gameState = useGameStore.getState();
    if (gameState.activeRecipe) return;
    const recipes = recipesData.recipes as Recipe[];
    const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
    gameState.setActiveRecipe(randomRecipe);
    const newOrder = this.generateOrderFromRecipe(randomRecipe);
    gameState.addOrder(newOrder);
    gameState.startOrder(newOrder.id);
  }

  private generateOrderFromRecipe(recipe: Recipe) {
    const steps = [
      { stationType: 'ticket' as const, questionId: '', status: 'completed' as const },
      ...recipe.stations.map((st, i) => ({
        stationType: st as any,
        questionId: '',
        status: (i === 0 ? 'active' : 'locked') as 'active' | 'locked',
      })),
      { stationType: 'serving' as const, questionId: '', status: 'locked' as const },
    ];
    return {
      id: `order-${Date.now()}`,
      dishName: recipe.name,
      steps,
      deadline: recipe.estimatedTime,
      timeRemaining: recipe.estimatedTime,
      status: 'pending' as const,
      qualityScore: 0,
    };
  }

  private completeOrder() {
    const gameState = useGameStore.getState();
    const activeOrder = gameState.orders.find(o => o.status === 'in_progress');
    if (!activeOrder) return;
    const questionSteps = activeOrder.steps.filter(s => s.stationType !== 'ticket' && s.stationType !== 'serving');
    if (questionSteps.every(s => s.status === 'completed')) {
      gameState.completeOrder(activeOrder.id);
      gameState.updateScore(250);
      gameState.clearInventory();
    }
  }

  public start() {
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  public stop() {
    this.running = false;
    this.inputManager?.destroy();
    this.clearInteractionTimeout();
  }

  private gameLoop = () => {
    if (!this.running) return;
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    const gameState = useGameStore.getState();
    const isPaused = gameState.activeMechanic || gameState.activeQuestion || gameState.activeRecipe;

    if (this.player && !isPaused) {
      const prevPos = { x: this.player.position.x, y: this.player.position.y };
      this.inputManager?.update(deltaTime);
      if (CollisionSystem.checkPlayerCollisions(this.player)) {
        CollisionSystem.resolveCollision(this.player, prevPos);
      }
      const prevPos2 = { x: this.player.position.x, y: this.player.position.y };
      this.player.update(deltaTime);
      if (CollisionSystem.checkPlayerCollisions(this.player)) {
        CollisionSystem.resolveCollision(this.player, prevPos2);
        this.player.clearTarget();
      }
      this.checkProximity();
    } else if (this.player && isPaused) {
      this.player.clearTarget();
    }

    requestAnimationFrame(this.gameLoop);
  };
}
