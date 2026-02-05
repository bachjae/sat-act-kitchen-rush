import { Application, Assets, Graphics, Sprite, Text, TextStyle, Texture, Container } from 'pixi.js';
import { KITCHEN_LAYOUT } from '@game/config/kitchen-layout';
import { PlayerEntity } from '@game/entities/PlayerEntity';
import { InputManager } from '@game/engine/InputManager';
import { CollisionSystem } from '@game/systems/CollisionSystem';
import { useGameStore } from '@store/gameStore';
import type { Recipe } from '@store/gameStore';
import { fetchQuestions } from '@services/questions.service';
import type { Station } from '@app-types/game.types';
import recipesData from '@data/recipes.json';

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
  plating: 0xF77F00,
  serving: 0x457B9D,
  utility: 0x6C757D,
};

const INTERACTION_DISTANCE = 100; // pixels from station center to trigger interaction

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
    // Load player texture
    try {
      const playerTexture = await Assets.load(playerChefUrl);
      this.textures.set('player-chef', playerTexture);
    } catch (e) {
      console.warn('Failed to load player texture, using fallback');
    }

    // Load station textures
    for (const [key, url] of Object.entries(STATION_TEXTURE_MAP)) {
      try {
        const texture = await Assets.load(url);
        this.textures.set(key, texture);
      } catch (e) {
        console.warn(`Failed to load texture for ${key}, using fallback`);
      }
    }
  }

  private setupKitchen() {
    // Draw floor
    const floor = new Graphics();
    floor.rect(0, 0, 1280, 720);
    floor.fill(0xE8E8E8);
    this.app.stage.addChild(floor);

    // Draw walls (navy)
    const walls = new Graphics();
    walls.rect(0, 128, 1280, 32);
    walls.fill(0x1D3557);
    walls.rect(0, 608, 1280, 32);
    walls.fill(0x1D3557);
    walls.rect(0, 128, 32, 512);
    walls.fill(0x1D3557);
    walls.rect(1248, 128, 32, 512);
    walls.fill(0x1D3557);
    this.app.stage.addChild(walls);

    // Draw stations
    this.drawStations();
  }

  private drawStations() {
    for (const station of KITCHEN_LAYOUT.stations) {
      const stationGroup = new Container();

      // Draw colored background rectangle
      const box = new Graphics();
      const color = STATION_COLORS[station.type] ?? 0xFFFFFF;
      box.rect(
        station.collisionBox.x,
        station.collisionBox.y,
        station.collisionBox.width,
        station.collisionBox.height,
      );
      box.fill(color);
      box.stroke({ width: 2, color: 0x000000 });
      stationGroup.addChild(box);

      // Overlay pixel art sprite if loaded
      const texture = this.textures.get(station.sprite.texture);
      if (texture) {
        const pixelSprite = new Sprite(texture);
        pixelSprite.anchor.set(0.5);
        pixelSprite.position.set(
          station.collisionBox.x + station.collisionBox.width / 2,
          station.collisionBox.y + station.collisionBox.height / 2,
        );
        pixelSprite.width = station.collisionBox.width;
        pixelSprite.height = station.collisionBox.height;
        stationGroup.addChild(pixelSprite);
      }

      // Add text label below the sprite
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
      label.position.set(
        station.collisionBox.x + station.collisionBox.width / 2,
        station.collisionBox.y + station.collisionBox.height + 2,
      );
      stationGroup.addChild(label);

      // Make interactive — clicking a station moves player toward it
      this.makeStationInteractive(stationGroup, station);

      // Store reference for highlight effects
      this.stationSprites.set(station.id, stationGroup);

      this.app.stage.addChild(stationGroup);
    }
  }

  private makeStationInteractive(container: Container, station: Station) {
    container.eventMode = 'static';
    container.cursor = 'pointer';

    container.on('pointerover', () => {
      container.alpha = 0.8;
    });

    container.on('pointerout', () => {
      container.alpha = 1.0;
    });

    container.on('pointerdown', (e) => {
      e.stopPropagation();
      // Clicking a station moves the player toward it (no instant question)
      this.movePlayerToStation(station);
    });
  }

  private movePlayerToStation(station: Station) {
    if (!this.player) return;
    console.log(`Moving to ${station.type} station`);

    // Move player to the approach point (just below the station)
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

      const rect = canvas.getBoundingClientRect();
      const scaleX = 1280 / rect.width;
      const scaleY = 720 / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      // Check if clicking a station — move toward it instead of opening question
      const station = this.checkClickOnStation(x, y);
      if (station) {
        this.movePlayerToStation(station);
        return;
      }

      // Otherwise move player to clicked location
      this.player.moveTo(x, y);
    });
  }

  private checkClickOnStation(x: number, y: number): Station | null {
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

  // --- Proximity-based station interaction (Fix 2) ---

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

      // Visual feedback - brighten/highlight stations when close
      const sprite = this.stationSprites.get(station.id);
      if (sprite) {
        if (distance <= INTERACTION_DISTANCE) {
          sprite.alpha = 1.2; // Brighten when in range
          sprite.scale.set(1.05); // Slight scale up
        } else if (distance <= INTERACTION_DISTANCE * 1.5) {
          sprite.alpha = 1.0; // Normal
          sprite.scale.set(1.0);
        } else {
          sprite.alpha = 0.9; // Slight dim when far
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
        // Entered a new station's range
        console.log(`📍 Entered range of ${nearestStation.name} (${Math.round(nearestDist)}px)`);
        this.currentStation = nearestStation;
        this.clearInteractionTimeout();
        this.interactedStations.delete(nearestStation.id);

        // Auto-trigger after a short delay
        this.interactionTimeout = setTimeout(() => {
          if (this.currentStation?.id === nearestStation!.id) {
            console.log(`⏰ Auto-triggering ${nearestStation!.name} interaction`);
            this.triggerStationInteraction(nearestStation!);
          }
        }, 400);
      }
    } else {
      // Player left all stations
      if (this.currentStation) {
        console.log(`👋 Left range of ${this.currentStation.name}`);
        this.currentStation = null;
        this.clearInteractionTimeout();
      }
    }
  }

  private clearInteractionTimeout() {
    if (this.interactionTimeout) {
      clearTimeout(this.interactionTimeout);
      this.interactionTimeout = null;
    }
  }

  private async triggerStationInteraction(station: Station) {
    // Don't re-trigger if already interacted and haven't left
    if (this.interactedStations.has(station.id)) {
      console.log(`🔒 Already interacted with ${station.name}`);
      return;
    }
    this.interactedStations.add(station.id);

    const gameState = useGameStore.getState();
    console.log(`🎯 Triggering interaction with ${station.name} (${station.type})`);

    // Ticket board: pick up an order
    if (station.type === 'ticket') {
      this.showOrderPickup();
      return;
    }

    // Serving window: deliver order
    if (station.type === 'serving') {
      this.completeOrder();
      return;
    }

    // Utility stations: no interaction
    if (station.type === ('utility' as any)) {
      return;
    }

    // Question stations: fridge, prep, stove, plating
    const activeOrder = gameState.orders.find(o => o.status === 'in_progress');

    // If there's an active order, check if this is the right station
    if (activeOrder) {
      const nextStep = activeOrder.steps.find(s => s.status === 'active');
      if (nextStep && nextStep.stationType !== station.type) {
        console.log(`⚠️ Wrong station! Need ${nextStep.stationType}, at ${station.type}`);
        // Allow interaction anyway in "practice" mode
      }
    }

    // Store the current station for question fetching after mechanic
    gameState.setActiveStation(station.type);

    // 50% chance for mechanic mini-game, 50% chance for direct question
    const showMechanic = Math.random() < 0.5;

    if (showMechanic && ['fridge', 'prep', 'stove', 'plating'].includes(station.type)) {
      console.log(`🎮 Starting ${station.type} mechanic`);
      gameState.setActiveMechanic(station.type as 'fridge' | 'prep' | 'stove' | 'plating');
    } else {
      // Show question directly
      await this.showQuestionForStation(station.type);
    }
  }

  public async showQuestionForStation(stationType: string) {
    const gameState = useGameStore.getState();

    try {
      console.log(`📦 Fetching question for ${stationType} station...`);
      const questions = await fetchQuestions({
        count: 1,
        stationType: stationType,
      });

      console.log(`📋 Got ${questions?.length || 0} questions`);

      if (questions && questions.length > 0) {
        console.log(`✅ Setting active question: ${questions[0].id}`);
        gameState.setActiveQuestion(questions[0]);
      } else {
        console.warn(`⚠️ No questions available for ${stationType}`);
      }
    } catch (error) {
      console.error('❌ Error loading question:', error);
    }
  }

  // --- Order management (Fix 4) ---

  private showOrderPickup() {
    const gameState = useGameStore.getState();

    // Check if there's already an active recipe being worked on
    if (gameState.activeRecipe) {
      console.log('📋 Already have an active recipe');
      return;
    }

    // Pick a random recipe from the recipes data
    const recipes = recipesData.recipes as Recipe[];
    const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];

    console.log(`🎫 Picked up order: ${randomRecipe.name}`);

    // Set the active recipe to show the modal
    gameState.setActiveRecipe(randomRecipe);

    // Also generate an order for tracking
    const newOrder = this.generateOrderFromRecipe(randomRecipe);
    gameState.addOrder(newOrder);
    gameState.startOrder(newOrder.id);
  }

  private generateOrderFromRecipe(recipe: Recipe) {
    const questionStations = recipe.stations.filter(
      s => s !== 'ticket' && s !== 'serving'
    ) as Array<'fridge' | 'prep' | 'stove' | 'plating'>;

    const steps = [
      // Step 1: Ticket (no question, just pickup) - already done
      {
        stationType: 'ticket' as const,
        questionId: '',
        status: 'completed' as const,
      },
      // Steps for each station in the recipe
      ...questionStations.map((st, i) => ({
        stationType: st,
        questionId: '',
        status: (i === 0 ? 'active' : 'locked') as 'active' | 'locked',
      })),
      // Final step: Serving (no question)
      {
        stationType: 'serving' as const,
        questionId: '',
        status: 'locked' as const,
      },
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

    if (!activeOrder) {
      console.log('No active order to deliver');
      return;
    }

    // Check if all question steps are complete
    const questionSteps = activeOrder.steps.filter(
      s => s.stationType !== 'ticket' && s.stationType !== 'serving'
    );
    const allComplete = questionSteps.every(s => s.status === 'completed');

    if (allComplete) {
      gameState.completeOrder(activeOrder.id);
      gameState.updateScore(250);
      console.log('Order delivered successfully! +250 points');
    } else {
      console.log('Order not complete yet — finish all stations first');
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

    if (this.player) {
      // Store previous position for collision resolution
      const prevPos = { x: this.player.position.x, y: this.player.position.y };

      // Update keyboard input
      this.inputManager?.update(deltaTime);

      // Check collisions after keyboard movement
      if (CollisionSystem.checkPlayerCollisions(this.player)) {
        CollisionSystem.resolveCollision(this.player, prevPos);
      }

      // Store position again before click-to-move update
      const prevPos2 = { x: this.player.position.x, y: this.player.position.y };

      // Update click-to-move movement
      this.player.update(deltaTime);

      // Check collisions after click-to-move
      if (CollisionSystem.checkPlayerCollisions(this.player)) {
        CollisionSystem.resolveCollision(this.player, prevPos2);
        this.player.clearTarget(); // Stop trying to move into collision
      }

      // Check proximity to stations
      this.checkProximity();
    }

    requestAnimationFrame(this.gameLoop);
  };
}
