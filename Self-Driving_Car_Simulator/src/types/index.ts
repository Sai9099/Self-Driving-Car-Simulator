export interface Vector2 {
  x: number;
  y: number;
}

export interface Car {
  id: string;
  position: Vector2;
  velocity: Vector2;
  angle: number;
  speed: number;
  maxSpeed: number;
  acceleration: number;
  friction: number;
  turnSpeed: number;
  sensors: Sensor[];
  brain: NeuralNetwork;
  fitness: number;
  alive: boolean;
  distanceTraveled: number;
  checkpointsPassed: number;
  lastCheckpoint: number;
  color: string;
  isPlayer?: boolean;
}

export interface Sensor {
  angle: number;
  length: number;
  distance: number;
  hit: boolean;
}

export interface Track {
  id: string;
  name: string;
  walls: Wall[];
  checkpoints: Checkpoint[];
  startPosition: Vector2;
  startAngle: number;
  width: number;
  height: number;
}

export interface Wall {
  start: Vector2;
  end: Vector2;
}

export interface Checkpoint {
  id: number;
  start: Vector2;
  end: Vector2;
  passed: boolean;
}

export interface NeuralNetwork {
  weights: number[][][];
  biases: number[][];
  layers: number[];
}

export interface SimulationState {
  cars: Car[];
  track: Track;
  generation: number;
  bestFitness: number;
  isRunning: boolean;
  speed: number;
  showSensors: boolean;
  selectedTrack: string;
  populationSize: number;
}