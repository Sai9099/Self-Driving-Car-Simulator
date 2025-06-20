export interface Position {
  x: number;
  y: number;
}

export interface GridCell {
  x: number;
  y: number;
  isWalkable: boolean;
  tower?: Tower;
  cost: number; // For pathfinding - higher cost = more dangerous
}

export interface Tower {
  id: string;
  x: number;
  y: number;
  type: 'basic' | 'laser' | 'missile';
  level: number;
  damage: number;
  range: number;
  fireRate: number;
  lastFired: number;
  cost: number;
  upgradeCost: number;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  health: number;
  maxHealth: number;
  speed: number;
  reward: number;
  type: 'fast' | 'tank' | 'stealth';
  path: Position[];
  pathIndex: number;
  aiStrategy: 'shortest' | 'safest' | 'adaptive';
  lastPathUpdate: number;
  color: string;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  damage: number;
  speed: number;
  type: 'bullet' | 'laser' | 'missile';
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GameState {
  grid: GridCell[][];
  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  particles: Particle[];
  wave: number;
  gold: number;
  lives: number;
  score: number;
  gameRunning: boolean;
  selectedTowerType: Tower['type'] | null;
  waveInProgress: boolean;
  pathfindingCache: Map<string, Position[]>;
}