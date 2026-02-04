export interface Point {
  x: number;
  y: number;
}

class Node {
  public x: number;
  public y: number;
  public walkable: boolean;
  public g: number;
  public h: number;
  public f: number;
  public parent: Node | null;

  constructor(
    x: number,
    y: number,
    walkable: boolean,
    g: number = 0,
    h: number = 0,
    f: number = 0,
    parent: Node | null = null
  ) {
    this.x = x;
    this.y = y;
    this.walkable = walkable;
    this.g = g;
    this.h = h;
    this.f = f;
    this.parent = parent;
  }
}

export function findPath(
  start: Point,
  end: Point,
  grid: boolean[][], // [y][x] where true is walkable
  tileSize: number = 32
): Point[] {
  const startX = Math.floor(start.x / tileSize);
  const startY = Math.floor(start.y / tileSize);
  const endX = Math.floor(end.x / tileSize);
  const endY = Math.floor(end.y / tileSize);

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  // Clamp target to grid bounds
  const targetX = Math.max(0, Math.min(cols - 1, endX));
  const targetY = Math.max(0, Math.min(rows - 1, endY));

  if (startX === targetX && startY === targetY) return [];

  const openList: Node[] = [];
  const closedList: boolean[][] = Array.from({ length: rows }, () => {
    const row = Array(cols).fill(false) as boolean[];
    return row;
  });

  const startNode = new Node(startX, startY, true);
  openList.push(startNode);

  while (openList.length > 0) {
    // Find node with lowest f
    let lowIdx = 0;
    for (let i = 0; i < openList.length; i++) {
      const node = openList[i];
      const lowNode = openList[lowIdx];
      if (node && lowNode && node.f < lowNode.f) lowIdx = i;
    }
    const currentNode = openList[lowIdx];
    if (!currentNode) break;

    // End case
    if (currentNode.x === targetX && currentNode.y === targetY) {
      const path: Point[] = [];
      let curr: Node | null = currentNode;
      while (curr && curr.parent) {
        path.push({
          x: curr.x * tileSize + tileSize / 2,
          y: curr.y * tileSize + tileSize / 2,
        });
        curr = curr.parent;
      }
      return path.reverse();
    }

    // Normal case
    openList.splice(lowIdx, 1);
    const row = closedList[currentNode.y];
    if (row) row[currentNode.x] = true;

    // Neighbors
    const neighbors = [
      { x: currentNode.x - 1, y: currentNode.y },
      { x: currentNode.x + 1, y: currentNode.y },
      { x: currentNode.x, y: currentNode.y - 1 },
      { x: currentNode.x, y: currentNode.y + 1 },
      // Diagonals
      { x: currentNode.x - 1, y: currentNode.y - 1 },
      { x: currentNode.x + 1, y: currentNode.y - 1 },
      { x: currentNode.x - 1, y: currentNode.y + 1 },
      { x: currentNode.x + 1, y: currentNode.y + 1 },
    ];

    for (const neighbor of neighbors) {
      const neighborRow = grid[neighbor.y];
      const neighborClosedRow = closedList[neighbor.y];
      if (
        neighbor.x < 0 ||
        neighbor.x >= cols ||
        neighbor.y < 0 ||
        neighbor.y >= rows ||
        !neighborRow ||
        !neighborRow[neighbor.x] ||
        !neighborClosedRow ||
        neighborClosedRow[neighbor.x]
      ) {
        continue;
      }

      const gScore = currentNode.g + (neighbor.x !== currentNode.x && neighbor.y !== currentNode.y ? 1.414 : 1);
      let gScoreIsBest = false;

      let neighborNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);

      if (!neighborNode) {
        gScoreIsBest = true;
        neighborNode = new Node(neighbor.x, neighbor.y, true);
        neighborNode.h = Math.abs(neighbor.x - targetX) + Math.abs(neighbor.y - targetY);
        openList.push(neighborNode);
      } else if (gScore < neighborNode.g) {
        gScoreIsBest = true;
      }

      if (gScoreIsBest) {
        neighborNode.parent = currentNode;
        neighborNode.g = gScore;
        neighborNode.f = neighborNode.g + neighborNode.h;
      }
    }
  }

  return []; // No path found
}
