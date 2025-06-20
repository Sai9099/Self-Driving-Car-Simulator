import React from 'react';
import { SimulationState } from '../types';
import { Trophy, Target, Zap, Brain } from 'lucide-react';

interface StatsPanelProps {
  simulationState: SimulationState;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ simulationState }) => {
  const aliveCars = simulationState.cars.filter(car => car.alive);
  const bestCar = simulationState.cars.reduce((best, car) => 
    car.fitness > best.fitness ? car : best, 
    simulationState.cars[0] || { fitness: 0, checkpointsPassed: 0, distanceTraveled: 0 }
  );
  
  const averageFitness = simulationState.cars.length > 0 
    ? simulationState.cars.reduce((sum, car) => sum + car.fitness, 0) / simulationState.cars.length
    : 0;

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 space-y-6">
      <div>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Generation Stats
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-blue-400 font-bold text-xl">{simulationState.generation}</div>
            <div className="text-slate-300 text-sm">Generation</div>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-green-400 font-bold text-xl">{aliveCars.length}</div>
            <div className="text-slate-300 text-sm">Cars Alive</div>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-yellow-400 font-bold text-xl">{Math.floor(simulationState.bestFitness)}</div>
            <div className="text-slate-300 text-sm">Best Fitness</div>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-purple-400 font-bold text-xl">{Math.floor(averageFitness)}</div>
            <div className="text-slate-300 text-sm">Avg Fitness</div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Best Performer
        </h4>
        
        <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Fitness:</span>
            <span className="text-white font-medium">{Math.floor(bestCar.fitness)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Checkpoints:</span>
            <span className="text-white font-medium">{bestCar.checkpointsPassed}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Distance:</span>
            <span className="text-white font-medium">{Math.floor(bestCar.distanceTraveled)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Status:</span>
            <span className={`font-medium ${bestCar.alive ? 'text-green-400' : 'text-red-400'}`}>
              {bestCar.alive ? 'Alive' : 'Crashed'}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Performance Distribution
        </h4>
        
        <div className="space-y-2">
          {[
            { label: 'Excellent (>2000)', count: simulationState.cars.filter(c => c.fitness > 2000).length, color: 'bg-green-500' },
            { label: 'Good (1000-2000)', count: simulationState.cars.filter(c => c.fitness >= 1000 && c.fitness <= 2000).length, color: 'bg-blue-500' },
            { label: 'Average (500-1000)', count: simulationState.cars.filter(c => c.fitness >= 500 && c.fitness < 1000).length, color: 'bg-yellow-500' },
            { label: 'Poor (<500)', count: simulationState.cars.filter(c => c.fitness < 500).length, color: 'bg-red-500' }
          ].map(category => (
            <div key={category.label} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded ${category.color}`}></div>
              <div className="flex-1 text-slate-300 text-sm">{category.label}</div>
              <div className="text-white font-medium">{category.count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-700/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Evolution Progress
        </h4>
        <div className="text-slate-300 text-sm space-y-1">
          <p>Generation {simulationState.generation} learning in progress...</p>
          <p>Neural networks adapting to track layout</p>
          <p>Genetic algorithm optimizing driving behavior</p>
        </div>
      </div>
    </div>
  );
};