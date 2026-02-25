import { useState } from 'react';
import { motion } from 'motion/react';
import { Swords } from 'lucide-react';

interface LobbyProps {
  onJoin: (name: string) => void;
}

export function Lobby({ onJoin }: LobbyProps) {
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen bg-[#141414] text-[#E4E3E0] font-mono flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full border border-[#E4E3E0]/20 p-8 bg-[#1a1a1a]"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <Swords className="w-10 h-10 text-red-500" />
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Arena</h1>
        </div>

        <p className="text-xs uppercase opacity-50 mb-6 text-center tracking-widest leading-relaxed">
          Enter the battleground. Build your army. <br /> Survive the rounds.
        </p>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) onJoin(name);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-[10px] uppercase font-bold mb-2 opacity-40 tracking-widest">Warrior Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full bg-transparent border border-[#E4E3E0]/20 p-4 focus:border-[#E4E3E0] outline-none transition-colors text-lg"
              autoFocus
            />
          </div>

          <button 
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-[#E4E3E0] text-[#141414] font-black uppercase py-4 text-xl hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Join Battle
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-[#E4E3E0]/10 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold">6</div>
            <div className="text-[8px] uppercase opacity-40">Players</div>
          </div>
          <div>
            <div className="text-lg font-bold">AUTO</div>
            <div className="text-[8px] uppercase opacity-40">Combat</div>
          </div>
          <div>
            <div className="text-lg font-bold">∞</div>
            <div className="text-[8px] uppercase opacity-40">Strategy</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
