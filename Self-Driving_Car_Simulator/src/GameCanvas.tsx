import React, { useRef, useEffect } from 'react';
import { GameState, Tower, Enemy, Projectile, Particle } from './types';
import { CELL_SIZE, TOWER_CONFIGS } from './gameUtils';

interface GameCanvasProps {
  gameState: GameState;
  onCellClick: (x: number, y: number) => void;
  onTowerClick: (tower: Tower) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  onCellClick,
  onTowerClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid(ctx, gameState);
    
    // Draw towers
    gameState.towers.forEach(tower => drawTower(ctx, tower));
    
    // Draw enemies
    gameState.enemies.forEach(enemy => drawEnemy(ctx, enemy));
    
    // Draw projectiles
    gameState.projectiles.forEach(projectile => drawProjectile(ctx, projectile));
    
    // Draw particles
    gameState.particles.forEach(particle => drawParticle(ctx, particle));
    
    // Draw tower ranges if tower is selected
    if (gameState.selectedTowerType) {
      drawTowerPreview(ctx, gameState);
    }
  }, [gameState]);

  const drawGrid = (ctx: CanvasRenderingContext2D, gameState: GameState) => {
    const { grid } = gameState;
    
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        const pixelX = x * CELL_SIZE;
        const pixelY = y * CELL_SIZE;
        
        // Draw cell background
        if (cell.cost > 0) {
          const intensity = Math.min(cell.cost / 10, 1);
          ctx.fillStyle = `rgba(239, 68, 68, ${intensity * 0.3})`;
          ctx.fillRect(pixelX, pixelY, CELL_SIZE, CELL_SIZE);
        }
        
        // Draw grid lines
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(pixelX, pixelY, CELL_SIZE, CELL_SIZE);
        
        // Highlight walkable path
        if (!cell.tower && cell.isWalkable) {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
          ctx.fillRect(pixelX + 1, pixelY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        }
      }
    }
  };

  const drawTower = (ctx: CanvasRenderingContext2D, tower: Tower) => {
    const pixelX = tower.x * CELL_SIZE + CELL_SIZE / 2;
    const pixelY = tower.y * CELL_SIZE + CELL_SIZE / 2;
    const config = TOWER_CONFIGS[tower.type];
    
    // Tower shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(pixelX + 2, pixelY + 2, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Tower body
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Tower level indicator
    if (tower.level > 1) {
      ctx.fillStyle = '#FFF';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(tower.level.toString(), pixelX, pixelY + 3);
    }
    
    // Tower type indicator
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    switch (tower.type) {
      case 'basic':
        ctx.moveTo(pixelX - 4, pixelY - 4);
        ctx.lineTo(pixelX + 4, pixelY + 4);
        ctx.moveTo(pixelX + 4, pixelY - 4);
        ctx.lineTo(pixelX - 4, pixelY + 4);
        break;
      case 'laser':
        ctx.rect(pixelX - 3, pixelY - 3, 6, 6);
        break;
      case 'missile':
        ctx.moveTo(pixelX, pixelY - 5);
        ctx.lineTo(pixelX - 4, pixelY + 3);
        ctx.lineTo(pixelX + 4, pixelY + 3);
        ctx.closePath();
        break;
    }
    ctx.stroke();
  };

  const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
    const pixelX = enemy.x * CELL_SIZE + CELL_SIZE / 2;
    const pixelY = enemy.y * CELL_SIZE + CELL_SIZE / 2;
    
    // Enemy shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(pixelX + 1, pixelY + 1, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Enemy body
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Health bar
    const healthRatio = enemy.health / enemy.maxHealth;
    const barWidth = 12;
    const barHeight = 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(pixelX - barWidth / 2, pixelY - 10, barWidth, barHeight);
    
    ctx.fillStyle = healthRatio > 0.5 ? '#10B981' : healthRatio > 0.25 ? '#F59E0B' : '#EF4444';
    ctx.fillRect(pixelX - barWidth / 2, pixelY - 10, barWidth * healthRatio, barHeight);
    
    // AI strategy indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    
    const strategySymbol = enemy.aiStrategy === 'shortest' ? '⚡' : 
                          enemy.aiStrategy === 'safest' ? '🛡️' : '🧠';
    ctx.fillText(strategySymbol, pixelX, pixelY - 12);
  };

  const drawProjectile = (ctx: CanvasRenderingContext2D, projectile: Projectile) => {
    const pixelX = projectile.x * CELL_SIZE + CELL_SIZE / 2;
    const pixelY = projectile.y * CELL_SIZE + CELL_SIZE / 2;
    
    ctx.fillStyle = projectile.type === 'laser' ? '#10B981' : 
                    projectile.type === 'missile' ? '#F59E0B' : '#3B82F6';
    
    if (projectile.type === 'laser') {
      // Laser beam
      ctx.beginPath();
      ctx.arc(pixelX, pixelY, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      // Regular projectile
      ctx.beginPath();
      ctx.arc(pixelX, pixelY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    const pixelX = particle.x * CELL_SIZE + CELL_SIZE / 2;
    const pixelY = particle.y * CELL_SIZE + CELL_SIZE / 2;
    const alpha = particle.life / particle.maxLife;
    
    ctx.fillStyle = particle.color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, particle.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawTowerPreview = (ctx: CanvasRenderingContext2D, gameState: GameState) => {
    // This would show range preview when placing towers
    // Implementation depends on mouse position tracking
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((event.clientY - rect.top) / CELL_SIZE);

    // Check if clicking on a tower
    const clickedTower = gameState.towers.find(tower => tower.x === x && tower.y === y);
    if (clickedTower) {
      onTowerClick(clickedTower);
    } else {
      onCellClick(x, y);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={gameState.grid[0]?.length * CELL_SIZE || 500}
      height={gameState.grid.length * CELL_SIZE || 500}
      onClick={handleCanvasClick}
      className="border border-slate-600 rounded-lg cursor-crosshair bg-slate-900"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};