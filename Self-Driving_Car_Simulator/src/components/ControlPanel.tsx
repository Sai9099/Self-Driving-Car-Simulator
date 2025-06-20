import React from 'react';
import { SimulationState } from '../types';
import { Play, Pause, RotateCcw, Eye, EyeOff, Settings } from 'lucide-react';
import { AVAILABLE_TRACKS } from '../utils/tracks';

interface ControlPanelProps {
  simulationState: SimulationState;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
  onTrackChange: (trackId: string) => void;
  onToggleSensors: () => void;
  onPopulationSizeChange: (size: number) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  simulationState,
  onToggleSimulation,
  onResetSimulation,
  onTrackChange,
  onToggleSensors,
  onPopulationSizeChange
}) => {
  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 space-y-6">
      <div>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Simulation Controls
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={onToggleSimulation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            {simulationState.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {simulationState.isRunning ? 'Pause' : 'Start'} Simulation
          </button>
          
          <button
            onClick={onResetSimulation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          
          <button
            onClick={onToggleSensors}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            {simulationState.showSensors ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {simulationState.showSensors ? 'Hide' : 'Show'} Sensors
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-white font-medium mb-3">Track Selection</h4>
        <select
          value={simulationState.selectedTrack}
          onChange={(e) => onTrackChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-400 focus:outline-none"
        >
          {AVAILABLE_TRACKS.map(track => (
            <option key={track.id} value={track.id}>
              {track.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h4 className="text-white font-medium mb-3">Population Size</h4>
        <select
          value={simulationState.populationSize}
          onChange={(e) => onPopulationSizeChange(Number(e.target.value))}
          className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-400 focus:outline-none"
        >
          <option value={20}>20 Cars</option>
          <option value={50}>50 Cars</option>
          <option value={100}>100 Cars</option>
          <option value={200}>200 Cars</option>
        </select>
      </div>

      <div>
        <h4 className="text-white font-medium mb-3">Simulation Speed</h4>
        <div className="grid grid-cols-4 gap-2">
          {[0.5, 1, 2, 4].map(speed => (
            <button
              key={speed}
              onClick={() => {/* Speed change handled in parent */}}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                simulationState.speed === speed
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-700/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">AI Learning</h4>
        <div className="text-slate-300 text-sm space-y-1">
          <p>• Neural networks with 8 inputs, 4 outputs</p>
          <p>• 5 distance sensors + speed + checkpoint direction</p>
          <p>• Genetic algorithm evolution</p>
          <p>• Top 20% survive to next generation</p>
        </div>
      </div>
    </div>
  );
};