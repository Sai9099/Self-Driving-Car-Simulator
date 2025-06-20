import { Position, GridCell } from './types';

interface PathNode {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic cost to end
  f: number; // Total cost
  parent: PathNode | null;
}

export class Pathfinder {
  private grid: GridCell[][];
  private width: number;
  private height: number;

  constructor(grid: GridCell[][]) {
    this.grid = grid;
    this.height = grid.length;
    this.width = grid[0]?.length || 0;
  }

  updateGrid(grid: GridCell[][]) {
    this.grid = grid;
  }

  // A* pathfinding with danger awareness
  findPath(
    start: Position, 
    end: Position, 
    strategy: 'shortest' | 'safest' | 'adaptive' = 'adaptive'
  ): Position[] {
    const openSet: PathNode[] = [];
    const closedSet: Set<string> = new Set();

    const startNode: PathNode = {
      x: start.x,
      y: start.y,
      g: 0,
      h: this.heuristic(start, end),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;

    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest f score
      openSet.sort((a, b) => a.f - b.f);
      const currentNode = openSet.shift()!;

      const nodeKey = `${currentNode.x},${currentNode.y}`;
      if (closedSet.has(nodeKey)) continue;
      closedSet.add(nodeKey);

      // Check if we reached the goal
      if (currentNode.x === end.x && currentNode.y === end.y) {
        return this.reconstructPath(currentNode);
      }

      // Check all neighbors
      const neighbors = this.getNeighbors(currentNode.x, currentNode.y);
      
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        if (closedSet.has(neighborKey)) continue;

        const moveCost = this.getMoveCost(currentNode, neighbor, strategy);
        const tentativeG = currentNode.g + moveCost;

        const existingNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
        
        if (!existingNode) {
          const newNode: PathNode = {
            x: neighbor.x,
            y: neighbor.y,
            g: tentativeG,
            h: this.heuristic(neighbor, end),
            f: 0,
            parent: currentNode
          };
          newNode.f = newNode.g + newNode.h;
          openSet.push(newNode);
        } else if (tentativeG < existingNode.g) {
          existingNode.g = tentativeG;
          existingNode.f = existingNode.g + existingNode.h;
          existingNode.parent = currentNode;
        }
      }
    }

    return []; // No path found
  }

  private getNeighbors(x: number, y: number): Position[] {
    const neighbors: Position[] = [];
    const directions = [
      { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, // Cardinal
      { x: -1, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 } // Diagonal
    ];

    for (const dir of directions) {
      const newX = x + dir.x;
      const newY = y + dir.y;

      if (this.isValidPosition(newX, newY) && this.grid[newY][newX].isWalkable) {
        neighbors.push({ x: newX, y: newY });
      }
    }

    return neighbors;
  }

  private getMoveCost(from: PathNode, to: Position, strategy: string): number {
    const diagonal = Math.abs(from.x - to.x) === 1 && Math.abs(from.y - to.y) === 1;
    let baseCost = diagonal ? 1.414 : 1; // √2 for diagonal movement

    const cell = this.grid[to.y][to.x];
    
    switch (strategy) {
      case 'shortest':
        return baseCost;
      case 'safest':
        return baseCost + (cell.cost * 2); // Heavily weight dangerous areas
      case 'adaptive':
      default:
        return baseCost + cell.cost; // Balance speed and safety
    }
  }

  private heuristic(a: Position, b: Position): number {
    // Euclidean distance
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  }

  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  private reconstructPath(node: PathNode): Position[] {
    const path: Position[] = [];
    let current: PathNode | null = node;

    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }

    return path;
  }

  // Calculate danger level around towers for AI decision making
  calculateDangerMap(): number[][] {
    const dangerMap = Array(this.height).fill(null).map(() => Array(this.width).fill(0));

    // Find all towers and calculate their threat zones
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        if (cell.tower) {
          this.addTowerThreat(dangerMap, cell.tower, x, y);
        }
      }
    }

    return dangerMap;
  }

  private addTowerThreat(dangerMap: number[][], tower: any, towerX: number, towerY: number) {
    const range = tower.range;
    const threat = tower.damage * tower.level;

    for (let y = Math.max(0, towerY - range); y <= Math.min(this.height - 1, towerY + range); y++) {
      for (let x = Math.max(0, towerX - range); x <= Math.min(this.width - 1, towerX + range); x++) {
        const distance = Math.sqrt(Math.pow(x - towerX, 2) + Math.pow(y - towerY, 2));
        if (distance <= range) {
          const threatLevel = threat * (1 - distance / range); // Closer = more dangerous
          dangerMap[y][x] += threatLevel;
        }
      }
    }
  }
}