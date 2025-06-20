import React from 'react';
import { GameState, Tower } from './types';
import { TOWER_CONFIGS } from './gameUtils';
import { Play, Pause, RotateCcw, Zap, Target, Rocket } from 'lucide-react';

interface GameUIProps {
  gameState: GameState;
  onTowerSelect: (type: Tower['type'] | null) => void;
  onStartWave: () => void;
  onPauseGame: () => void;
  onResetGame: () => void;
  selectedTower: Tower | null;
  onUpgradeTower: (tower: Tower) => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  onTowerSelect,
  onStartWave,
  onPauseGame,
  onResetGame,
  selectedTower,
  onUpgradeTower
}) => {
  const getTowerIcon = (type: Tower['type']) => {
    switch (type) {
      case 'basic': return <Target className="w-5 h-5" />;
      case 'laser': return <Zap className="w-5 h-5" />;
      case 'missile': return <Rocket className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-yellow-400 font-bold text-xl">{gameState.gold}</div>
          <div className="text-slate-300 text-sm">Gold</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-red-400 font-bold text-xl">{gameState.lives}</div>
          <div className="text-slate-300 text-sm">Lives</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-blue-400 font-bold text-xl">{gameState.wave}</div>
          <div className="text-slate-300 text-sm">Wave</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <div className="text-green-400 font-bold text-xl">{gameState.score}</div>
          <div className="text-slate-300 text-sm">Score</div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex gap-3">
        <button
          onClick={gameState.gameRunning ? onPauseGame : onStartWave}
          disabled={gameState.waveInProgress && gameState.gameRunning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {gameState.gameRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {gameState.waveInProgress ? 'Wave Active' : gameState.gameRunning ? 'Pause' : 'Start Wave'}
        </button>
        
        <button
          onClick={onResetGame}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Tower Selection */}
      <div>
        <h3 className="text-white font-semibold mb-3">Build Towers</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(TOWER_CONFIGS).map(([type, config]) => (
            <button
              key={type}
              onClick={() => onTowerSelect(gameState.selectedTowerType === type ? null : type as Tower['type'])}
              disabled={gameState.gold < config.cost}
              className={`p-4 rounded-lg border-2 transition-all ${
                gameState.selectedTowerType === type
                  ? 'border-blue-400 bg-blue-900/30'
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              } ${gameState.gold < config.cost ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-2">
                <div style={{ color: config.color }}>
                  {getTowerIcon(type as Tower['type'])}
                </div>
                <div className="text-white font-medium capitalize">{type}</div>
                <div className="text-yellow-400 text-sm">${config.cost}</div>
                <div className="text-slate-300 text-xs text-center">
                  DMG: {config.damage} | RNG: {config.range}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Tower Info */}
      {selectedTower && (
        <div className="bg-slate-700/50 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Tower Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Type:</span>
              <span className="text-white capitalize">{selectedTower.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Level:</span>
              <span className="text-white">{selectedTower.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Damage:</span>
              <span className="text-white">{selectedTower.damage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Range:</span>
              <span className="text-white">{selectedTower.range}</span>
            </div>
            
            {selectedTower.level < 5 && (
              <button
                onClick={() => onUpgradeTower(selectedTower)}
                disabled={gameState.gold < selectedTower.upgradeCost}
                className="w-full mt-3 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded font-medium transition-colors"
              >
                Upgrade (${selectedTower.upgradeCost})
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI Strategy Info */}
      <div className="bg-slate-700/50 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">Enemy AI Status</h3>
        <div className="space-y-2 text-sm">
          <div className="text-slate-300">
            Active Strategies:
          </div>
          <div className="flex gap-4">
            <div className="text-red-400">⚡ Speed ({gameState.enemies.filter(e => e.aiStrategy === 'shortest').length})</div>
            <div className="text-cyan-400">🛡️ Safety ({gameState.enemies.filter(e => e.aiStrategy === 'safest').length})</div>
            <div className="text-purple-400">🧠 Adaptive ({gameState.enemies.filter(e => e.aiStrategy === 'adaptive').length})</div>
          </div>
        </div>
      </div>
    </div>
  );
};