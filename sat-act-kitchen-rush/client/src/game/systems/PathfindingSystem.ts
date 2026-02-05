import { KITCHEN_LAYOUT, GRID } from '@game/config/kitchen-layout';
import type { Position } from '@app-types/game.types';

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

export class PathfindingSystem {
  private tileSize: number;
  private gridWidth: number;
  private gridHeight: number;

  constructor() {
    this.tileSize = GRID.TILE_SIZE;
    this.gridWidth = Math.ceil(GRID.CANVAS_WIDTH / this.tileSize);
    this.gridHeight = Math.ceil(GRID.CANVAS_HEIGHT / this.tileSize);
  }

  /**
   * Find a path from start position to target position using A*
   */
  public findPath(start: Position, target: Position): Position[] {
    const startNode = this.posToNode(start);
    const targetNode = this.posToNode(target);

    // If target is unwalkable, find nearest walkable tile
    if (!this.isWalkable(targetNode.x, targetNode.y)) {
      const nearestWalkable = this.findNearestWalkable(targetNode.x, targetNode.y);
      if (nearestWalkable) {
        targetNode.x = nearestWalkable.x;
        targetNode.y = nearestWalkable.y;
      } else {
        return [target]; // Fallback to direct movement if stuck
      }
    }

    const openList: Node[] = [];
    const closedList: boolean[][] = Array.from({ length: this.gridHeight }, () =>
      new Array(this.gridWidth).fill(false)
    );

    startNode.g = 0;
    startNode.h = this.heuristic(startNode, targetNode);
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    while (openList.length > 0) {
      // Get node with lowest f score
      let currentIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[currentIndex].f) {
          currentIndex = i;
        }
      }

      const current = openList[currentIndex];

      // Found the target
      if (current.x === targetNode.x && current.y === targetNode.y) {
        const path: Position[] = [];
        let curr: Node | null = current;
        while (curr) {
          path.push(this.nodeToPos(curr));
          curr = curr.parent;
        }
        // Add exact target position as the final point
        const finalPath = path.reverse();
        finalPath[finalPath.length - 1] = target;
        return finalPath;
      }

      // Move current from open to closed
      openList.splice(currentIndex, 1);
      closedList[current.y][current.x] = true;

      // Check neighbors
      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (closedList[neighbor.y][neighbor.x]) continue;

        const gScore = current.g + 1;
        let bestG = false;

        const existingOpen = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);
        if (!existingOpen) {
          bestG = true;
          neighbor.h = this.heuristic(neighbor, targetNode);
          openList.push(neighbor);
        } else if (gScore < existingOpen.g) {
          bestG = true;
          existingOpen.g = gScore;
          existingOpen.f = gScore + existingOpen.h;
          existingOpen.parent = current;
        }

        if (bestG && !existingOpen) {
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
        }
      }
    }

    // No path found
    return [target];
  }

  private heuristic(a: Node, b: Node): number {
    // Manhattan distance
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  private getNeighbors(node: Node): Node[] {
    const neighbors: Node[] = [];
    const dirs = [
      { x: 0, y: -1 }, { x: 0, y: 1 },
      { x: -1, y: 0 }, { x: 1, y: 0 }
    ];

    for (const dir of dirs) {
      const nx = node.x + dir.x;
      const ny = node.y + dir.y;

      if (this.isValid(nx, ny) && this.isWalkable(nx, ny)) {
        neighbors.push({ x: nx, y: ny, g: 0, h: 0, f: 0, parent: null });
      }
    }

    return neighbors;
  }

  private isValid(x: number, y: number): boolean {
    return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
  }

  private isWalkable(x: number, y: number): boolean {
    const px = x * this.tileSize;
    const py = y * this.tileSize;
    const margin = 4; // Slight margin for better feel

    // Check against header/footer
    if (py < KITCHEN_LAYOUT.header.height || py + this.tileSize > KITCHEN_LAYOUT.footer.y) {
      return false;
    }

    // Check against stations
    for (const station of KITCHEN_LAYOUT.stations) {
      const box = station.collisionBox;
      if (
        px + this.tileSize - margin > box.x &&
        px + margin < box.x + box.width &&
        py + this.tileSize - margin > box.y &&
        py + margin < box.y + box.height
      ) {
        return false;
      }
    }

    return true;
  }

  private findNearestWalkable(x: number, y: number): { x: number, y: number } | null {
    for (let radius = 1; radius < 10; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (this.isValid(nx, ny) && this.isWalkable(nx, ny)) {
            return { x: nx, y: ny };
          }
        }
      }
    }
    return null;
  }

  private posToNode(pos: Position): Node {
    return {
      x: Math.floor(pos.x / this.tileSize),
      y: Math.floor(pos.y / this.tileSize),
      g: 0, h: 0, f: 0, parent: null
    };
  }

  private nodeToPos(node: Node): Position {
    return {
      x: node.x * this.tileSize + this.tileSize / 2,
      y: node.y * this.tileSize + this.tileSize / 2
    };
  }

  /**
   * Legacy support if needed
   */
  public findStationWaypoint(stationType: string): string | null {
    const stationWaypointMap: Record<string, string> = {
      ticket: 'TICKET_APPROACH',
      fridge: 'FRIDGE_APPROACH',
      prep: 'PREP_APPROACH',
      stove: 'STOVE_APPROACH',
      oven: 'OVEN_APPROACH',
      plating: 'PLATING_APPROACH',
      serving: 'WINDOW_APPROACH',
    };
    return stationWaypointMap[stationType] || null;
  }
}

// Singleton instance
export const pathfindingSystem = new PathfindingSystem();
