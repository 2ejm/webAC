import React from 'react';
import { Unit } from '../game/types';
import { UnitDisplay } from './GameBoard';
import { Trash2 } from 'lucide-react';

interface BenchProps {
  units: (Unit | null)[];
  onMoveUnit: (from: any, to: any) => void;
  onSellUnit: (from: any) => void;
}

export function Bench({ units, onMoveUnit, onSellUnit }: BenchProps) {
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('source', JSON.stringify({ type: 'bench', index }));
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const sourceData = e.dataTransfer.getData('source');
    if (!sourceData) return;
    try {
      const source = JSON.parse(sourceData);
      onMoveUnit(source, { type: 'bench', index });
    } catch (e) {
      console.error('Failed to parse drag source:', e);
    }
  };

  const handleSellDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const sourceData = e.dataTransfer.getData('source');
    if (!sourceData) return;
    try {
      const source = JSON.parse(sourceData);
      onSellUnit(source);
    } catch (e) {
      console.error('Failed to parse drag source:', e);
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <div className="flex-1 flex gap-2">
        {units.map((unit, i) => (
          <div 
            key={i}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, i)}
            className="w-16 h-16 border border-[#E4E3E0]/10 bg-[#141414]/40 flex items-center justify-center relative group hover:bg-[#E4E3E0]/5 transition-colors"
          >
            {unit ? (
              <div 
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                className="w-full h-full p-1 cursor-grab active:cursor-grabbing"
              >
                <UnitDisplay unit={unit} />
              </div>
            ) : (
              <div className="text-[8px] opacity-10 font-bold uppercase">Bench</div>
            )}
          </div>
        ))}
      </div>

      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleSellDrop}
        className="w-16 h-16 border border-red-500/20 bg-red-500/5 flex flex-col items-center justify-center gap-1 group hover:bg-red-500/10 hover:border-red-500/40 transition-all"
      >
        <Trash2 className="w-5 h-5 text-red-500/40 group-hover:text-red-500 transition-colors" />
        <span className="text-[8px] font-bold uppercase text-red-500/40 group-hover:text-red-500">Sell</span>
      </div>
    </div>
  );
}
