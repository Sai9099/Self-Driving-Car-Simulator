import { Tower, Enemy, Position, GridCell, Projectile, Particle } from './types';

export const GRID_SIZE = 25;
export const CELL_SIZE = 20;

export const TOWER_CONFIGS = {
  basic: {
    cost: 50,
    damage: 20,
    range: 3,
    fireRate: 1000, // ms
    upgradeCost: 30,
    color: '#3B82F6'
  },
  laser: {
    cost: 100,
    damage: 35,
    range: 4,
    fireRate: 800,
    upgradeCost: 50,
    color: '#10B981'
  },
  missile: {
    cost: 150,
    damage: 60,
    range: 5,
    fireRate: 1500,
    upgradeCost: 75,
    color: '#F59E0B'
  }
};

export const ENEMY_CONFIGS = {
  fast: {
    health: 50,
    speed: 2,
    reward: 15,
    color: '#EF4444',
    aiStrategy: 'shortest' as const
  },
  tank: {
    health: 150,
    speed: 0.8,
    reward: 30,
    color: '#8B5CF6',
    aiStrategy: 'adaptive' as const
  },
  stealth: {
    health: 80,
    speed: 1.5,
    reward: 25,
    color: '#06B6D4',
    aiStrategy: 'safest' as const
  }
};

export function createTower(x: number, y: number, type: Tower['type'], id: string): Tower {
  const config = TOWER_CONFIGS[type];
  return {
    id,
    x,
    y,
    type,
    level: 1,
    damage: config.damage,
    range: config.range,
    fireRate: config.fireRate,
    lastFired: 0,
    cost: config.cost,
    upgradeCost: config.upgradeCost
  };
}

export function createEnemy(id: string, type: Enemy['type'], path: Position[]): Enemy {
  const config = ENEMY_CONFIGS[type];
  const startPos = path[0] || { x: 0, y: 0 };
  
  return {
    id,
    x: startPos.x,
    y: startPos.y,
    targetX: startPos.x,
    targetY: startPos.y,
    health: config.health,
    maxHealth: config.health,
    speed: config.speed,
    reward: config.reward,
    type,
    path,
    pathIndex: 0,
    aiStrategy: config.aiStrategy,
    lastPathUpdate: 0,
    color: config.color
  };
}

export function createProjectile(
  id: string,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  damage: number,
  type: Projectile['type']
): Projectile {
  return {
    id,
    x: startX,
    y: startY,
    targetX,
    targetY,
    damage,
    speed: type === 'laser' ? 15 : type === 'missile' ? 8 : 12,
    type
  };
}

export function createParticles(x: number, y: number, color: string, count: number = 8): Particle[] {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    
    particles.push({
      id: `particle-${Date.now()}-${i}`,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30 + Math.random() * 20,
      maxLife: 30 + Math.random() * 20,
      color,
      size: 2 + Math.random() * 3
    });
  }
  
  return particles;
}

export function getDistance(pos1: Position, pos2: Position): number {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
}

export function isInRange(tower: Tower, enemy: Enemy): boolean {
  return getDistance(tower, enemy) <= tower.range;
}

export function createInitialGrid(): GridCell[][] {
  const grid: GridCell[][] = [];
  
  for (let y = 0; y < GRID_SIZE; y++) {
    grid[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      grid[y][x] = {
        x,
        y,
        isWalkable: true,
        cost: 0
      };
    }
  }
  
  return grid;
}

export function updateGridCosts(grid: GridCell[][], towers: Tower[]): GridCell[][] {
  // Reset costs
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      grid[y][x].cost = 0;
    }
  }
  
  // Add tower threat costs
  towers.forEach(tower => {
    for (let y = Math.max(0, tower.y - tower.range); y <= Math.min(GRID_SIZE - 1, tower.y + tower.range); y++) {
      for (let x = Math.max(0, tower.x - tower.range); x <= Math.min(GRID_SIZE - 1, tower.x + tower.range); x++) {
        const distance = getDistance(tower, { x, y });
        if (distance <= tower.range) {
          const threat = (tower.damage * tower.level) * (1 - distance / tower.range);
          grid[y][x].cost += threat / 10; // Scale down for pathfinding
        }
      }
    }
  });
  
  return grid;
}