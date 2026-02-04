import { Assets, Texture } from 'pixi.js';

export class AssetLoader {
  private static textures: Record<string, Texture> = {};

  static async loadAllAssets(): Promise<Record<string, Texture>> {
    const manifest = {
      'floor-tile': '/assets/sprites/kitchen/floor-tile.png',
      'wall-tile': '/assets/sprites/kitchen/wall-tile.png',
      'ticket': '/assets/sprites/kitchen/ticket-board.png',
      'fridge': '/assets/sprites/kitchen/fridge.png',
      'prep': '/assets/sprites/kitchen/prep-station.png',
      'stove': '/assets/sprites/kitchen/stove.png',
      'plating': '/assets/sprites/kitchen/plating-station.png',
      'serving': '/assets/sprites/kitchen/serving-window.png',
      'player-chef': '/assets/sprites/characters/player-chef.png',
    };

    // Add all assets to Assets
    Object.entries(manifest).forEach(([key, path]) => {
      Assets.add({ alias: key, src: path });
    });

    // Load all
    const textures = await Assets.load(Object.keys(manifest));
    this.textures = textures;

    console.log('✅ All assets loaded:', Object.keys(textures));
    return textures;
  }

  static getTexture(key: string): Texture {
    return this.textures[key] || Texture.EMPTY;
  }
}
