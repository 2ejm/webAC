import React from 'react';
import { motion } from 'motion/react';
import { GameState, PLAYER_BOARD_ROWS, BOARD_COLS, Unit } from '../game/types';
import { Sword, Shield, Zap, Target } from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
  playerId: string;
  onMoveUnit: (from: any, to: any) => void;
}

export function GameBoard({ gameState, playerId, onMoveUnit }: GameBoardProps) {
  const player = gameState.players[playerId];
  
  const handleDragStart = (e: React.DragEvent, x: number, y: number) => {
    e.dataTransfer.setData('source', JSON.stringify({ type: 'board', x, y }));
  };

  const handleDrop = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    const sourceData = e.dataTransfer.getData('source');
    if (!sourceData) return;
    try {
      const source = JSON.parse(sourceData);
      onMoveUnit(source, { type: 'board', x, y });
    } catch (e) {
      console.error('Failed to parse drag source:', e);
    }
  };

  return (
    <div className="grid grid-rows-4 grid-cols-8 gap-1 bg-[#141414]/40 p-1 border border-[#E4E3E0]/20 shadow-2xl">
      {player.board.map((row, y) => (
        row.map((unit, x) => (
          <div 
            key={`${x}-${y}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, x, y)}
            className={`w-16 h-16 sm:w-20 sm:h-20 border border-[#E4E3E0]/5 flex items-center justify-center relative group transition-colors hover:bg-[#E4E3E0]/5 ${gameState.phase === 'COMBAT' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {unit ? (
              <motion.div 
                layoutId={unit.id}
                draggable={gameState.phase !== 'COMBAT'}
                onDragStart={(e) => handleDragStart(e, x, y)}
                className="w-full h-full p-1"
              >
                <UnitDisplay unit={unit} />
              </motion.div>
            ) : (
              <div className="text-[8px] opacity-10 uppercase font-black">{x},{y}</div>
            )}
            
            {/* Grid highlight on hover */}
            <div className="absolute inset-0 border border-[#E4E3E0]/0 group-hover:border-[#E4E3E0]/20 pointer-events-none" />
          </div>
        ))
      ))}
    </div>
  );
}

export function UnitDisplay({ unit }: { unit: Unit }) {
  const getIcon = () => {
    switch (unit.type) {
      case 'WARRIOR': return <Sword className="w-4 h-4" />;
      case 'TANK': return <Shield className="w-4 h-4" />;
      case 'MAGE': return <Zap className="w-4 h-4" />;
      case 'ARCHER': return <Target className="w-4 h-4" />;
      default: return <Sword className="w-4 h-4" />;
    }
  };

  const getColor = () => {
    switch (unit.type) {
      case 'WARRIOR': return 'text-red-400';
      case 'TANK': return 'text-blue-400';
      case 'MAGE': return 'text-purple-400';
      case 'ARCHER': return 'text-green-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="w-full h-full bg-[#1a1a1a] border border-[#E4E3E0]/20 flex flex-col items-center justify-center relative overflow-hidden group-active:scale-95 transition-transform">
      <div className={`mb-1 ${getColor()}`}>{getIcon()}</div>
      <div className="text-[8px] font-bold uppercase truncate w-full text-center px-1">{unit.name}</div>
      
      {/* HP Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/50">
        <div 
          className="h-full bg-green-500 transition-all duration-300" 
          style={{ width: `${(unit.stats.hp / unit.stats.maxHp) * 100}%` }}
        />
      </div>

      {/* Tier indicator */}
      <div className="absolute top-0.5 right-1 flex gap-0.5">
        {Array.from({ length: unit.tier }).map((_, i) => (
          <div key={i} className="w-1 h-1 bg-yellow-500 rounded-full" />
        ))}
      </div>
    </div>
  );
}
