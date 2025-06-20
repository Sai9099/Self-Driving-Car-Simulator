import React, { useRef, useEffect } from 'react';
import { SimulationState, Car, Wall, Checkpoint } from '../types';

interface SimulationCanvasProps {
  simulationState: SimulationState;
  onSpeedChange: (speed: number) => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  simulationState,
  onSpeedChange
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

    // Draw track
    drawTrack(ctx, simulationState);
    
    // Draw cars
    simulationState.cars.forEach(car => drawCar(ctx, car, simulationState.showSensors));
    
    // Draw UI overlay
    drawOverlay(ctx, simulationState);
  }, [simulationState]);

  const drawTrack = (ctx: CanvasRenderingContext2D, state: SimulationState) => {
    const { track } = state;
    
    // Draw walls
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    track.walls.forEach(wall => {
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.stroke();
    });

    // Draw checkpoints
    track.checkpoints.forEach((checkpoint, index) => {
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      
      ctx.beginPath();
      ctx.moveTo(checkpoint.start.x, checkpoint.start.y);
      ctx.lineTo(checkpoint.end.x, checkpoint.end.y);
      ctx.stroke();
      
      // Checkpoint number
      ctx.fillStyle = '#10B981';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        index.toString(),
        (checkpoint.start.x + checkpoint.end.x) / 2,
        (checkpoint.start.y + checkpoint.end.y) / 2 + 4
      );
    });
    
    ctx.setLineDash([]);

    // Draw start position
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(track.startPosition.x, track.startPosition.y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFF';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('START', track.startPosition.x, track.startPosition.y - 15);
  };

  const drawCar = (ctx: CanvasRenderingContext2D, car: Car, showSensors: boolean) => {
    if (!car.alive) return;

    ctx.save();
    ctx.translate(car.position.x, car.position.y);
    ctx.rotate(car.angle);

    // Draw sensors
    if (showSensors && !car.isPlayer) {
      car.sensors.forEach(sensor => {
        ctx.strokeStyle = sensor.hit ? '#EF4444' : '#10B981';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
          Math.cos(sensor.angle) * sensor.distance,
          Math.sin(sensor.angle) * sensor.distance
        );
        ctx.stroke();
        
        // Sensor endpoint
        ctx.fillStyle = sensor.hit ? '#EF4444' : '#10B981';
        ctx.beginPath();
        ctx.arc(
          Math.cos(sensor.angle) * sensor.distance,
          Math.sin(sensor.angle) * sensor.distance,
          2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    // Car body
    ctx.fillStyle = car.isPlayer ? '#3B82F6' : car.color;
    ctx.fillRect(-8, -5, 16, 10);
    
    // Car direction indicator
    ctx.fillStyle = '#FFF';
    ctx.fillRect(6, -2, 4, 4);
    
    // Player indicator
    if (car.isPlayer) {
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(-10, -7, 20, 14);
    }

    ctx.restore();

    // Car info (for best performers)
    if (!car.isPlayer && car.fitness > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(car.position.x - 25, car.position.y - 25, 50, 15);
      
      ctx.fillStyle = '#FFF';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        `F: ${Math.floor(car.fitness)}`,
        car.position.x,
        car.position.y - 15
      );
    }
  };

  const drawOverlay = (ctx: CanvasRenderingContext2D, state: SimulationState) => {
    // Generation info
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 200, 80);
    
    ctx.fillStyle = '#FFF';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Generation: ${state.generation}`, 20, 30);
    ctx.fillText(`Cars Alive: ${state.cars.filter(c => c.alive).length}`, 20, 50);
    ctx.fillText(`Best Fitness: ${Math.floor(state.bestFitness)}`, 20, 70);
    
    // Speed control
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 100, 150, 40);
    
    ctx.fillStyle = '#FFF';
    ctx.fillText(`Speed: ${state.speed}x`, 20, 120);
    
    // Status
    if (!state.isRunning) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.fillRect(state.track.width / 2 - 50, state.track.height / 2 - 20, 100, 40);
      
      ctx.fillStyle = '#FFF';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', state.track.width / 2, state.track.height / 2 + 5);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <canvas
        ref={canvasRef}
        width={simulationState.track.width}
        height={simulationState.track.height}
        className="border border-slate-600 rounded-lg bg-slate-900 w-full"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};