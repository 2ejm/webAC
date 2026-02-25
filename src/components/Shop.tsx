import { UNIT_POOL, Unit } from '../game/types';
import { Coins, RefreshCw, ArrowUpCircle } from 'lucide-react';

interface ShopProps {
  gold: number;
  onBuyUnit: (index: number) => void;
  onReroll: () => void;
  onLevelUp: () => void;
}

export function Shop({ gold, onBuyUnit, onReroll, onLevelUp }: ShopProps) {
  // Mock shop items for now - in a real game these would come from the server
  const shopItems = [0, 1, 2, 3, 4]; 

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button 
            onClick={onLevelUp}
            className="flex items-center gap-2 px-4 py-2 bg-[#E4E3E0]/5 border border-[#E4E3E0]/20 hover:bg-[#E4E3E0]/10 transition-colors group"
          >
            <ArrowUpCircle className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Level Up (4G)</span>
          </button>
          <button 
            onClick={onReroll}
            className="flex items-center gap-2 px-4 py-2 bg-[#E4E3E0]/5 border border-[#E4E3E0]/20 hover:bg-[#E4E3E0]/10 transition-colors group"
          >
            <RefreshCw className="w-4 h-4 text-green-400 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Reroll (2G)</span>
          </button>
        </div>
        
        <div className="text-[10px] uppercase opacity-40 font-bold tracking-[0.2em]">Recruitment Phase</div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {shopItems.map((poolIndex, i) => {
          const unit = UNIT_POOL[poolIndex];
          const canAfford = gold >= unit.cost;
          
          return (
            <button
              key={i}
              onClick={() => onBuyUnit(poolIndex)}
              disabled={!canAfford}
              className={`group relative border p-3 text-left transition-all ${canAfford ? 'border-[#E4E3E0]/20 hover:border-[#E4E3E0] bg-[#1a1a1a]' : 'border-red-900/20 opacity-40 cursor-not-allowed'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase opacity-50">{unit.type}</span>
                <div className="flex items-center gap-1 text-yellow-500">
                  <span className="text-xs font-bold">{unit.cost}</span>
                  <Coins className="w-3 h-3" />
                </div>
              </div>
              
              <div className="text-sm font-black uppercase italic mb-1 group-hover:translate-x-1 transition-transform">{unit.name}</div>
              
              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-[8px] uppercase font-bold">ATK {unit.stats.attack}</div>
                <div className="text-[8px] uppercase font-bold">HP {unit.stats.hp}</div>
              </div>

              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#E4E3E0]/40" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
