import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationState, Car, Track } from '../types';
import { SimulationCanvas } from './SimulationCanvas';
import { ControlPanel } from './ControlPanel';
import { StatsPanel } from './StatsPanel';
import { createNeuralNetwork, mutateNetwork, crossoverNetworks } from '../utils/neuralNetwork';
import { updateCarPhysics, checkCollision } from '../utils/physics';
import { updateCarSensors, getCarControls, calculateFitness, createCarSensors } from '../utils/carAI';
import { AVAILABLE_TRACKS } from '../utils/tracks';

export const CarSimulator: React.FC = () => {
  const [simulationState, setSimulationState] = useState<SimulationState>(() => ({
    cars: [],
    track: AVAILABLE_TRACKS[0],
    generation: 1,
    bestFitness: 0,
    isRunning: false,
    speed: 1,
    showSensors: true,
    selectedTrack: 'simple',
    populationSize: 50
  }));

  const [playerControls, setPlayerControls] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false
  });

  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Initialize population
  const initializePopulation = useCallback(() => {
    const cars: Car[] = [];
    const networkLayers = [8, 12, 8, 4]; // 8 inputs, 4 outputs
    
    for (let i = 0; i < simulationState.populationSize; i++) {
      const car: Car = {
        id: `car-${i}`,
        position: { ...simulationState.track.startPosition },
        velocity: { x: 0, y: 0 },
        angle: simulationState.track.startAngle,
        speed: 0,
        maxSpeed: 200,
        acceleration: 300,
        friction: 0.95,
        turnSpeed: 3,
        sensors: createCarSensors(),
        brain: createNeuralNetwork(networkLayers),
        fitness: 0,
        alive: true,
        distanceTraveled: 0,
        checkpointsPassed: 0,
        lastCheckpoint: -1,
        color: `hsl(${(i * 360) / simulationState.populationSize}, 70%, 60%)`,
        isPlayer: i === 0 // First car is player-controlled
      };
      cars.push(car);
    }

    setSimulationState(prev => ({
      ...prev,
      cars
    }));
  }, [simulationState.populationSize, simulationState.track]);

  // Evolution logic
  const evolvePopulation = useCallback(() => {
    const sortedCars = [...simulationState.cars].sort((a, b) => b.fitness - a.fitness);
    const bestFitness = sortedCars[0]?.fitness || 0;
    
    const newCars: Car[] = [];
    const networkLayers = [8, 12, 8, 4];
    
    // Keep top 20% as parents
    const parentCount = Math.floor(simulationState.populationSize * 0.2);
    const parents = sortedCars.slice(0, parentCount);
    
    for (let i = 0; i < simulationState.populationSize; i++) {
      let brain;
      
      if (i < parentCount) {
        // Keep best performers
        brain = parents[i].brain;
      } else if (i < parentCount * 2) {
        // Mutate best performers
        brain = mutateNetwork(parents[i % parentCount].brain, 0.1);
      } else {
        // Crossover and mutate
        const parent1 = parents[Math.floor(Math.random() * parentCount)];
        const parent2 = parents[Math.floor(Math.random() * parentCount)];
        brain = mutateNetwork(crossoverNetworks(parent1.brain, parent2.brain), 0.05);
      }
      
      const car: Car = {
        id: `car-gen${simulationState.generation + 1}-${i}`,
        position: { ...simulationState.track.startPosition },
        velocity: { x: 0, y: 0 },
        angle: simulationState.track.startAngle,
        speed: 0,
        maxSpeed: 200,
        acceleration: 300,
        friction: 0.95,
        turnSpeed: 3,
        sensors: createCarSensors(),
        brain,
        fitness: 0,
        alive: true,
        distanceTraveled: 0,
        checkpointsPassed: 0,
        lastCheckpoint: -1,
        color: `hsl(${(i * 360) / simulationState.populationSize}, 70%, 60%)`,
        isPlayer: i === 0
      };
      newCars.push(car);
    }

    setSimulationState(prev => ({
      ...prev,
      cars: newCars,
      generation: prev.generation + 1,
      bestFitness: Math.max(prev.bestFitness, bestFitness)
    }));
  }, [simulationState.cars, simulationState.generation, simulationState.populationSize, simulationState.track]);

  // Simulation loop
  const simulate = useCallback((currentTime: number) => {
    if (!simulationState.isRunning) return;

    const deltaTime = (currentTime - lastTimeRef.current) / 1000 * simulationState.speed;
    lastTimeRef.current = currentTime;

    if (deltaTime > 0.1) return; // Skip large time jumps

    setSimulationState(prev => {
      const updatedCars = prev.cars.map(car => {
        if (!car.alive) return car;

        const updatedCar = { ...car };

        // Update sensors
        updateCarSensors(updatedCar, prev.track);

        // Get controls (AI or player)
        let controls;
        if (car.isPlayer) {
          controls = playerControls;
        } else {
          controls = getCarControls(updatedCar);
        }

        // Update physics
        updateCarPhysics(updatedCar, controls, deltaTime);

        // Check collisions
        if (checkCollision(updatedCar, prev.track.walls)) {
          updatedCar.alive = false;
        }

        // Check checkpoints
        for (let i = 0; i < prev.track.checkpoints.length; i++) {
          const checkpoint = prev.track.checkpoints[i];
          if (i === (updatedCar.lastCheckpoint + 1) % prev.track.checkpoints.length) {
            const distance = Math.sqrt(
              Math.pow(updatedCar.position.x - checkpoint.start.x, 2) +
              Math.pow(updatedCar.position.y - checkpoint.start.y, 2)
            );
            
            if (distance < 30) {
              updatedCar.checkpointsPassed++;
              updatedCar.lastCheckpoint = i;
            }
          }
        }

        // Calculate fitness
        updatedCar.fitness = calculateFitness(updatedCar, prev.track);

        return updatedCar;
      });

      // Check if all cars are dead
      const aliveCars = updatedCars.filter(car => car.alive);
      if (aliveCars.length === 0) {
        // Evolve to next generation
        setTimeout(() => evolvePopulation(), 100);
      }

      return {
        ...prev,
        cars: updatedCars
      };
    });

    animationRef.current = requestAnimationFrame(simulate);
  }, [simulationState.isRunning, simulationState.speed, playerControls, evolvePopulation]);

  // Start/stop simulation
  const toggleSimulation = () => {
    setSimulationState(prev => ({
      ...prev,
      isRunning: !prev.isRunning
    }));
  };

  // Reset simulation
  const resetSimulation = () => {
    setSimulationState(prev => ({
      ...prev,
      generation: 1,
      bestFitness: 0,
      isRunning: false
    }));
    initializePopulation();
  };

  // Change track
  const changeTrack = (trackId: string) => {
    const track = AVAILABLE_TRACKS.find(t => t.id === trackId);
    if (track) {
      setSimulationState(prev => ({
        ...prev,
        track,
        selectedTrack: trackId,
        isRunning: false
      }));
      setTimeout(initializePopulation, 100);
    }
  };

  // Keyboard controls for player car
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setPlayerControls(prev => ({ ...prev, forward: true }));
          break;
        case 's':
        case 'arrowdown':
          setPlayerControls(prev => ({ ...prev, backward: true }));
          break;
        case 'a':
        case 'arrowleft':
          setPlayerControls(prev => ({ ...prev, left: true }));
          break;
        case 'd':
        case 'arrowright':
          setPlayerControls(prev => ({ ...prev, right: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setPlayerControls(prev => ({ ...prev, forward: false }));
          break;
        case 's':
        case 'arrowdown':
          setPlayerControls(prev => ({ ...prev, backward: false }));
          break;
        case 'a':
        case 'arrowleft':
          setPlayerControls(prev => ({ ...prev, left: false }));
          break;
        case 'd':
        case 'arrowright':
          setPlayerControls(prev => ({ ...prev, right: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (simulationState.isRunning) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(simulate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [simulationState.isRunning, simulate]);

  // Initialize on mount
  useEffect(() => {
    initializePopulation();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏎️ Self-Driving Car Simulator
          </h1>
          <p className="text-slate-300">
            AI cars learn to navigate tracks using neural networks and genetic algorithms
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <SimulationCanvas
              simulationState={simulationState}
              onSpeedChange={(speed) => setSimulationState(prev => ({ ...prev, speed }))}
            />
          </div>
          
          <div className="space-y-6">
            <ControlPanel
              simulationState={simulationState}
              onToggleSimulation={toggleSimulation}
              onResetSimulation={resetSimulation}
              onTrackChange={changeTrack}
              onToggleSensors={() => setSimulationState(prev => ({ ...prev, showSensors: !prev.showSensors }))}
              onPopulationSizeChange={(size) => setSimulationState(prev => ({ ...prev, populationSize: size }))}
            />
            
            <StatsPanel simulationState={simulationState} />
          </div>
        </div>

        <div className="mt-6 bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Controls</h3>
          <div className="text-slate-300 text-sm space-y-1">
            <p><kbd className="bg-slate-700 px-2 py-1 rounded">WASD</kbd> or <kbd className="bg-slate-700 px-2 py-1 rounded">Arrow Keys</kbd> - Control player car (blue)</p>
            <p>🧠 AI cars use neural networks with 5 distance sensors</p>
            <p>🧬 Genetic algorithm evolves better drivers each generation</p>
            <p>🏁 Cars earn fitness points for distance traveled and checkpoints passed</p>
          </div>
        </div>
      </div>
    </div>
  );
};