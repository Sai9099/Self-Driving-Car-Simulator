import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Tower, Enemy, Position, Projectile, Particle } from './types';
import { GameCanvas } from './GameCanvas';
import { GameUI } from './GameUI';
import { Pathfinder } from './pathfinding';
import {
  createInitialGrid,
  updateGridCosts,
  createTower,
  createEnemy,
  createProjectile,
  createParticles,
  getDistance,
  isInRange,
  GRID_SIZE,
  ENEMY_CONFIGS
} from './gameUtils';

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    grid: createInitialGrid(),
    towers: [],
    enemies: [],
    projectiles: [],
    particles: [],
    wave: 1,
    gold: 200,
    lives: 20,
    score: 0,
    gameRunning: false,
    selectedTowerType: null,
    waveInProgress: false,
    pathfindingCache: new Map()
  }));

  const [selectedTower, setSelectedTower] = useState<Tower | null>(null);
  const pathfinderRef = useRef<Pathfinder>();
  const gameLoopRef = useRef<number>();

  // Initialize pathfinder
  useEffect(() => {
    pathfinderRef.current = new Pathfinder(gameState.grid);
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState.gameRunning) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameRunning]);

  const gameLoop = useCallback(() => {
    setGameState(prevState => {
      let newState = { ...prevState };

      // Update enemies
      newState = updateEnemies(newState);
      
      // Update towers (shooting)
      newState = updateTowers(newState);
      
      // Update projectiles
      newState = updateProjectiles(newState);
      
      // Update particles
      newState = updateParticles(newState);
      
      // Check wave completion
      if (newState.waveInProgress && newState.enemies.length === 0) {
        newState.waveInProgress = false;
        newState.gold += 50 * newState.wave;
        newState.score += 100 * newState.wave;
      }

      return newState;
    });

    if (gameState.gameRunning) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState.gameRunning]);

  const updateEnemies = (state: GameState): GameState => {
    const updatedEnemies = state.enemies.map(enemy => {
      let updatedEnemy = { ...enemy };

      // Check if enemy needs path recalculation (every 2 seconds or when towers change)
      const now = Date.now();
      if (now - enemy.lastPathUpdate > 2000 || enemy.path.length === 0) {
        const startPos = { x: 0, y: Math.floor(GRID_SIZE / 2) };
        const endPos = { x: GRID_SIZE - 1, y: Math.floor(GRID_SIZE / 2) };
        
        if (pathfinderRef.current) {
          const newPath = pathfinderRef.current.findPath(
            { x: Math.floor(enemy.x), y: Math.floor(enemy.y) },
            endPos,
            enemy.aiStrategy
          );
          
          if (newPath.length > 0) {
            updatedEnemy.path = newPath;
            updatedEnemy.pathIndex = 0;
            updatedEnemy.lastPathUpdate = now;
          }
        }
      }

      // Move enemy along path
      if (updatedEnemy.path.length > 0 && updatedEnemy.pathIndex < updatedEnemy.path.length) {
        const target = updatedEnemy.path[updatedEnemy.pathIndex];
        const dx = target.x - updatedEnemy.x;
        const dy = target.y - updatedEnemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 0.1) {
          updatedEnemy.pathIndex++;
          if (updatedEnemy.pathIndex >= updatedEnemy.path.length) {
            // Enemy reached the end
            updatedEnemy.health = 0;
          }
        } else {
          updatedEnemy.x += (dx / distance) * updatedEnemy.speed * 0.016; // 60fps assumption
          updatedEnemy.y += (dy / distance) * updatedEnemy.speed * 0.016;
        }
      }

      return updatedEnemy;
    });

    // Remove dead enemies and subtract lives for escaped enemies
    let newLives = state.lives;
    const aliveEnemies = updatedEnemies.filter(enemy => {
      if (enemy.health <= 0) {
        if (enemy.pathIndex >= enemy.path.length) {
          // Enemy escaped
          newLives--;
        } else {
          // Enemy was killed
          state.gold += enemy.reward;
          state.score += enemy.reward;
        }
        return false;
      }
      return true;
    });

    return {
      ...state,
      enemies: aliveEnemies,
      lives: newLives
    };
  };

  const updateTowers = (state: GameState): GameState => {
    const now = Date.now();
    const newProjectiles = [...state.projectiles];

    state.towers.forEach(tower => {
      if (now - tower.lastFired >= tower.fireRate) {
        // Find closest enemy in range
        const enemiesInRange = state.enemies.filter(enemy => isInRange(tower, enemy));
        
        if (enemiesInRange.length > 0) {
          const target = enemiesInRange.reduce((closest, current) => 
            getDistance(tower, current) < getDistance(tower, closest) ? current : closest
          );

          const projectileId = `proj-${Date.now()}-${Math.random()}`;
          const projectile = createProjectile(
            projectileId,
            tower.x,
            tower.y,
            target.x,
            target.y,
            tower.damage,
            tower.type === 'laser' ? 'laser' : tower.type === 'missile' ? 'missile' : 'bullet'
          );

          newProjectiles.push(projectile);
          tower.lastFired = now;
        }
      }
    });

    return {
      ...state,
      projectiles: newProjectiles
    };
  };

  const updateProjectiles = (state: GameState): GameState => {
    const newParticles = [...state.particles];
    
    const updatedProjectiles = state.projectiles.map(projectile => {
      const dx = projectile.targetX - projectile.x;
      const dy = projectile.targetY - projectile.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 0.3) {
        // Projectile hit - find enemy to damage
        const targetEnemy = state.enemies.find(enemy => 
          Math.abs(enemy.x - projectile.targetX) < 0.5 && 
          Math.abs(enemy.y - projectile.targetY) < 0.5
        );

        if (targetEnemy) {
          targetEnemy.health -= projectile.damage;
          
          // Create hit particles
          const hitParticles = createParticles(
            projectile.x,
            projectile.y,
            targetEnemy.color,
            6
          );
          newParticles.push(...hitParticles);
        }

        return null; // Mark for removal
      }

      return {
        ...projectile,
        x: projectile.x + (dx / distance) * projectile.speed * 0.016,
        y: projectile.y + (dy / distance) * projectile.speed * 0.016
      };
    }).filter(Boolean) as Projectile[];

    return {
      ...state,
      projectiles: updatedProjectiles,
      particles: newParticles
    };
  };

  const updateParticles = (state: GameState): GameState => {
    const updatedParticles = state.particles.map(particle => ({
      ...particle,
      x: particle.x + particle.vx * 0.016,
      y: particle.y + particle.vy * 0.016,
      life: particle.life - 1,
      vx: particle.vx * 0.98, // Friction
      vy: particle.vy * 0.98
    })).filter(particle => particle.life > 0);

    return {
      ...state,
      particles: updatedParticles
    };
  };

  const handleCellClick = (x: number, y: number) => {
    if (gameState.selectedTowerType && x >= 0 && y >= 0 && x < GRID_SIZE && y < GRID_SIZE) {
      const cell = gameState.grid[y][x];
      
      if (cell.isWalkable && !cell.tower) {
        const towerCost = require('./gameUtils').TOWER_CONFIGS[gameState.selectedTowerType].cost;
        
        if (gameState.gold >= towerCost) {
          const towerId = `tower-${Date.now()}`;
          const newTower = createTower(x, y, gameState.selectedTowerType, towerId);
          
          setGameState(prevState => {
            const newGrid = [...prevState.grid];
            newGrid[y][x] = { ...cell, tower: newTower };
            
            const updatedGrid = updateGridCosts(newGrid, [...prevState.towers, newTower]);
            
            // Update pathfinder
            if (pathfinderRef.current) {
              pathfinderRef.current.updateGrid(updatedGrid);
            }

            return {
              ...prevState,
              grid: updatedGrid,
              towers: [...prevState.towers, newTower],
              gold: prevState.gold - towerCost,
              selectedTowerType: null
            };
          });
        }
      }
    }
    
    setSelectedTower(null);
  };

  const handleTowerClick = (tower: Tower) => {
    setSelectedTower(tower);
    setGameState(prev => ({ ...prev, selectedTowerType: null }));
  };

  const handleTowerSelect = (type: Tower['type'] | null) => {
    setGameState(prev => ({ ...prev, selectedTowerType: type }));
    setSelectedTower(null);
  };

  const handleStartWave = () => {
    if (!gameState.waveInProgress) {
      const enemyTypes: Enemy['type'][] = ['fast', 'tank', 'stealth'];
      const enemyCount = 5 + gameState.wave * 2;
      const newEnemies: Enemy[] = [];

      const startPos = { x: 0, y: Math.floor(GRID_SIZE / 2) };
      const endPos = { x: GRID_SIZE - 1, y: Math.floor(GRID_SIZE / 2) };

      for (let i = 0; i < enemyCount; i++) {
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const enemyId = `enemy-${Date.now()}-${i}`;
        
        // Calculate initial path
        let initialPath: Position[] = [];
        if (pathfinderRef.current) {
          initialPath = pathfinderRef.current.findPath(startPos, endPos, ENEMY_CONFIGS[enemyType].aiStrategy);
        }

        const enemy = createEnemy(enemyId, enemyType, initialPath);
        // Stagger enemy spawn
        enemy.x = startPos.x - (i * 0.8);
        newEnemies.push(enemy);
      }

      setGameState(prev => ({
        ...prev,
        enemies: [...prev.enemies, ...newEnemies],
        waveInProgress: true,
        gameRunning: true,
        wave: prev.wave + 1
      }));
    }
  };

  const handlePauseGame = () => {
    setGameState(prev => ({ ...prev, gameRunning: !prev.gameRunning }));
  };

  const handleResetGame = () => {
    setGameState({
      grid: createInitialGrid(),
      towers: [],
      enemies: [],
      projectiles: [],
      particles: [],
      wave: 1,
      gold: 200,
      lives: 20,
      score: 0,
      gameRunning: false,
      selectedTowerType: null,
      waveInProgress: false,
      pathfindingCache: new Map()
    });
    
    setSelectedTower(null);
    
    if (pathfinderRef.current) {
      pathfinderRef.current.updateGrid(createInitialGrid());
    }
  };

  const handleUpgradeTower = (tower: Tower) => {
    if (gameState.gold >= tower.upgradeCost && tower.level < 5) {
      setGameState(prevState => {
        const updatedTowers = prevState.towers.map(t => {
          if (t.id === tower.id) {
            return {
              ...t,
              level: t.level + 1,
              damage: Math.floor(t.damage * 1.5),
              range: Math.min(t.range + 1, 8),
              upgradeCost: Math.floor(t.upgradeCost * 1.4)
            };
          }
          return t;
        });

        const updatedGrid = updateGridCosts(prevState.grid, updatedTowers);
        
        if (pathfinderRef.current) {
          pathfinderRef.current.updateGrid(updatedGrid);
        }

        return {
          ...prevState,
          towers: updatedTowers,
          grid: updatedGrid,
          gold: prevState.gold - tower.upgradeCost
        };
      });

      // Update selected tower reference
      setSelectedTower(prev => prev ? { ...prev, level: prev.level + 1 } : null);
    }
  };

  // Game over check
  useEffect(() => {
    if (gameState.lives <= 0) {
      setGameState(prev => ({ ...prev, gameRunning: false }));
    }
  }, [gameState.lives]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏰 Smart AI Tower Defense
          </h1>
          <p className="text-slate-300">
            Enemies adapt their pathfinding strategies - build smart defenses!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex justify-center">
            <GameCanvas
              gameState={gameState}
              onCellClick={handleCellClick}
              onTowerClick={handleTowerClick}
            />
          </div>
          
          <div className="lg:w-80">
            <GameUI
              gameState={gameState}
              onTowerSelect={handleTowerSelect}
              onStartWave={handleStartWave}
              onPauseGame={handlePauseGame}
              onResetGame={handleResetGame}
              selectedTower={selectedTower}
              onUpgradeTower={handleUpgradeTower}
            />
          </div>
        </div>

        {gameState.lives <= 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-8 text-center max-w-md">
              <h2 className="text-3xl font-bold text-red-400 mb-4">Game Over!</h2>
              <p className="text-slate-300 mb-4">
                Final Score: <span className="text-green-400 font-bold">{gameState.score}</span>
              </p>
              <p className="text-slate-300 mb-6">
                Wave Reached: <span className="text-blue-400 font-bold">{gameState.wave}</span>
              </p>
              <button
                onClick={handleResetGame}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};