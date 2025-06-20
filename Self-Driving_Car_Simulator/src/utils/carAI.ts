import { Car, Sensor, Track, Checkpoint } from '../types';
import { raycast } from './physics';
import { feedForward } from './neuralNetwork';

export function updateCarSensors(car: Car, track: Track): void {
  for (const sensor of car.sensors) {
    const sensorAngle = car.angle + sensor.angle;
    const result = raycast(car.position, sensorAngle, sensor.length, track.walls);
    
    sensor.distance = result.distance;
    sensor.hit = result.hit;
  }
}

export function getCarControls(car: Car): { forward: boolean; backward: boolean; left: boolean; right: boolean } {
  if (car.isPlayer) {
    // Player controls would be handled elsewhere
    return { forward: false, backward: false, left: false, right: false };
  }

  // Prepare neural network inputs
  const inputs: number[] = [];
  
  // Sensor distances (normalized)
  for (const sensor of car.sensors) {
    inputs.push(sensor.distance / sensor.length);
  }
  
  // Car speed (normalized)
  inputs.push(car.speed / car.maxSpeed);
  
  // Angle to next checkpoint
  const nextCheckpoint = getNextCheckpoint(car);
  if (nextCheckpoint) {
    const dx = nextCheckpoint.start.x - car.position.x;
    const dy = nextCheckpoint.start.y - car.position.y;
    const targetAngle = Math.atan2(dy, dx);
    let angleDiff = targetAngle - car.angle;
    
    // Normalize angle difference to [-π, π]
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    
    inputs.push(angleDiff / Math.PI);
  } else {
    inputs.push(0);
  }

  // Get neural network output
  const outputs = feedForward(car.brain, inputs);
  
  return {
    forward: outputs[0] > 0.5,
    backward: outputs[1] > 0.5,
    left: outputs[2] > 0.5,
    right: outputs[3] > 0.5
  };
}

function getNextCheckpoint(car: Car): Checkpoint | null {
  // This would need access to track checkpoints
  // For now, return null - this should be passed from the simulation
  return null;
}

export function calculateFitness(car: Car, track: Track): number {
  let fitness = 0;
  
  // Base fitness from distance traveled
  fitness += car.distanceTraveled * 0.1;
  
  // Bonus for checkpoints passed
  fitness += car.checkpointsPassed * 1000;
  
  // Bonus for staying alive longer
  fitness += car.alive ? 500 : 0;
  
  // Penalty for going too slow
  if (car.speed < 0.1 && car.alive) {
    fitness -= 10;
  }
  
  return Math.max(0, fitness);
}

export function createCarSensors(): Sensor[] {
  const sensors: Sensor[] = [];
  const sensorAngles = [-Math.PI/2, -Math.PI/4, 0, Math.PI/4, Math.PI/2]; // 5 sensors
  const sensorLength = 100;
  
  for (const angle of sensorAngles) {
    sensors.push({
      angle,
      length: sensorLength,
      distance: sensorLength,
      hit: false
    });
  }
  
  return sensors;
}