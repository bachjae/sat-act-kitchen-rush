import { WAYPOINTS, KITCHEN_LAYOUT } from '@game/config/kitchen-layout';
import type { Position } from '@app-types/game.types';

interface WaypointNode {
  id: string;
  position: Position;
  connections: string[];
}

// Define waypoint connections (which waypoints connect to each other)
const WAYPOINT_GRAPH: Record<string, string[]> = {
  CENTER: ['TICKET_APPROACH', 'FRIDGE_APPROACH', 'PREP_APPROACH', 'STOVE_APPROACH', 'OVEN_APPROACH', 'PLATING_APPROACH', 'WINDOW_APPROACH'],
  TICKET_APPROACH: ['CENTER', 'FRIDGE_APPROACH'],
  FRIDGE_APPROACH: ['CENTER', 'TICKET_APPROACH', 'PREP_APPROACH'],
  PREP_APPROACH: ['CENTER', 'FRIDGE_APPROACH', 'STOVE_APPROACH'],
  STOVE_APPROACH: ['CENTER', 'PREP_APPROACH', 'OVEN_APPROACH'],
  OVEN_APPROACH: ['CENTER', 'STOVE_APPROACH', 'PLATING_APPROACH'],
  PLATING_APPROACH: ['CENTER', 'OVEN_APPROACH', 'WINDOW_APPROACH'],
  WINDOW_APPROACH: ['CENTER', 'PLATING_APPROACH'],
};

export class PathfindingSystem {
  private waypoints: Map<string, WaypointNode> = new Map();

  constructor() {
    this.initializeWaypoints();
  }

  private initializeWaypoints() {
    for (const [id, position] of Object.entries(WAYPOINTS)) {
      this.waypoints.set(id, {
        id,
        position,
        connections: WAYPOINT_GRAPH[id] || [],
      });
    }
  }

  /**
   * Find the nearest waypoint to a given position
   */
  public findNearestWaypoint(position: Position): string | null {
    let nearestId: string | null = null;
    let nearestDist = Infinity;

    for (const [id, waypoint] of this.waypoints) {
      const dist = this.distance(position, waypoint.position);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestId = id;
      }
    }

    return nearestId;
  }

  /**
   * Find waypoint near a station
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

  /**
   * Find a path from start position to target position using BFS
   */
  public findPath(start: Position, target: Position): Position[] {
    const startWaypoint = this.findNearestWaypoint(start);
    const targetWaypoint = this.findNearestWaypoint(target);

    if (!startWaypoint || !targetWaypoint) {
      // Direct path if no waypoints found
      return [target];
    }

    if (startWaypoint === targetWaypoint) {
      // Already at the target waypoint area
      return [target];
    }

    // BFS to find shortest path through waypoints
    const path = this.bfsPath(startWaypoint, targetWaypoint);

    if (path.length === 0) {
      // No path found, go direct
      return [target];
    }

    // Convert waypoint IDs to positions, skip the first if we're close to it
    const positions: Position[] = [];

    for (const waypointId of path) {
      const waypoint = this.waypoints.get(waypointId);
      if (waypoint) {
        positions.push(waypoint.position);
      }
    }

    // Add final target position
    positions.push(target);

    return positions;
  }

  /**
   * BFS pathfinding through waypoint graph
   */
  private bfsPath(startId: string, targetId: string): string[] {
    const queue: string[][] = [[startId]];
    const visited = new Set<string>();
    visited.add(startId);

    while (queue.length > 0) {
      const currentPath = queue.shift()!;
      const currentId = currentPath[currentPath.length - 1];

      if (currentId === targetId) {
        // Skip the start waypoint since we're already there
        return currentPath.slice(1);
      }

      const current = this.waypoints.get(currentId);
      if (!current) continue;

      for (const neighborId of current.connections) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push([...currentPath, neighborId]);
        }
      }
    }

    return []; // No path found
  }

  /**
   * Calculate distance between two positions
   */
  private distance(a: Position, b: Position): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get waypoint position by ID
   */
  public getWaypointPosition(id: string): Position | null {
    return this.waypoints.get(id)?.position || null;
  }

  /**
   * Get all waypoints for debugging
   */
  public getAllWaypoints(): WaypointNode[] {
    return Array.from(this.waypoints.values());
  }
}

// Singleton instance
export const pathfindingSystem = new PathfindingSystem();
