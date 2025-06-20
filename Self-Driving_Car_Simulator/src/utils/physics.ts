import { Vector2, Car, Wall } from '../types';

export function updateCarPhysics(car: Car, controls: { forward: boolean; backward: boolean; left: boolean; right: boolean }, deltaTime: number): void {
  if (!car.alive) return;

  // Apply controls
  if (controls.forward) {
    car.speed = Math.min(car.speed + car.acceleration * deltaTime, car.maxSpeed);
  } else if (controls.backward) {
    car.speed = Math.max(car.speed - car.acceleration * deltaTime, -car.maxSpeed * 0.5);
  } else {
    car.speed *= car.friction;
  }

  // Turning (only when moving)
  if (Math.abs(car.speed) > 0.1) {
    if (controls.left) {
      car.angle -= car.turnSpeed * deltaTime * Math.abs(car.speed) / car.maxSpeed;
    }
    if (controls.right) {
      car.angle += car.turnSpeed * deltaTime * Math.abs(car.speed) / car.maxSpeed;
    }
  }

  // Update velocity based on angle and speed
  car.velocity.x = Math.cos(car.angle) * car.speed;
  car.velocity.y = Math.sin(car.angle) * car.speed;

  // Update position
  car.position.x += car.velocity.x * deltaTime;
  car.position.y += car.velocity.y * deltaTime;

  // Update distance traveled
  const distance = Math.sqrt(car.velocity.x * car.velocity.x + car.velocity.y * car.velocity.y) * deltaTime;
  car.distanceTraveled += distance;
}

export function checkCollision(car: Car, walls: Wall[]): boolean {
  const carRadius = 8;
  
  for (const wall of walls) {
    const distance = distanceToLineSegment(car.position, wall.start, wall.end);
    if (distance < carRadius) {
      return true;
    }
  }
  
  return false;
}

export function distanceToLineSegment(point: Vector2, lineStart: Vector2, lineEnd: Vector2): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return Math.sqrt(A * A + B * B);
  
  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));

  const xx = lineStart.x + param * C;
  const yy = lineStart.y + param * D;

  const dx = point.x - xx;
  const dy = point.y - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
}

export function raycast(start: Vector2, angle: number, length: number, walls: Wall[]): { distance: number; hit: boolean } {
  const end: Vector2 = {
    x: start.x + Math.cos(angle) * length,
    y: start.y + Math.sin(angle) * length
  };

  let minDistance = length;
  let hit = false;

  for (const wall of walls) {
    const intersection = lineIntersection(start, end, wall.start, wall.end);
    if (intersection) {
      const distance = Math.sqrt(
        Math.pow(intersection.x - start.x, 2) + Math.pow(intersection.y - start.y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        hit = true;
      }
    }
  }

  return { distance: minDistance, hit };
}

function lineIntersection(p1: Vector2, p2: Vector2, p3: Vector2, p4: Vector2): Vector2 | null {
  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y;
  const x4 = p4.x, y4 = p4.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-10) return null;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    };
  }

  return null;
}