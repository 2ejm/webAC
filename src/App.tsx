import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameSocket } from './hooks/useGameSocket';
import { GameBoard } from './components/GameBoard';
import { Shop } from './components/Shop';
import { Bench } from './components/Bench';
import { Lobby } from './components/Lobby';
import { Player } from './game/types';
import { Users, Swords, Coins, Heart, Timer as TimerIcon } from 'lucide-react';

export default function App() {
  const { gameState, playerId, connected, connect, sendAction } = useGameSocket();
  const [playerName, setPlayerName] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const handleJoin = (name: string) => {
    setPlayerName(name);
    connect(name);
    setIsJoined(true);
  };

  if (!isJoined) {
    return <Lobby onJoin={handleJoin} />;
  }

  if (!gameState || !playerId) {
    return (
      <div className="min-h-screen bg-[#141414] text-[#E4E3E0] flex items-center justify-center font-mono">
        <div className="animate-pulse">Connecting to Arena...</div>
      </div>
    );
  }

  const currentPlayer = gameState.players[playerId];

  return (
    <div className="min-h-screen bg-[#141414] text-[#E4E3E0] font-mono selection:bg-[#E4E3E0] selection:text-[#141414] overflow-hidden flex flex-col">
      {/* Header / Stats Bar */}
      <header className="border-b border-[#E4E3E0]/20 p-4 flex justify-between items-center bg-[#1a1a1a]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-red-500" />
            <span className="text-xl font-bold tracking-tighter uppercase italic">Auto Chess Arena</span>
          </div>
          <div className="flex items-center gap-4 text-sm opacity-60">
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {Object.keys(gameState.players).length}/6</span>
            <span className="px-2 py-0.5 border border-[#E4E3E0]/20 rounded uppercase text-[10px]">Round {gameState.round}</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-lg font-bold">{currentPlayer.hp}</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-lg font-bold">{currentPlayer.gold}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] opacity-50 uppercase">Level {currentPlayer.level}</span>
              <div className="w-24 h-1 bg-[#E4E3E0]/10 mt-1">
                <div 
                  className="h-full bg-[#E4E3E0]" 
                  style={{ width: `${(currentPlayer.exp / (currentPlayer.level * 5)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#E4E3E0] text-[#141414] px-4 py-2 rounded-sm">
            <TimerIcon className="w-5 h-5" />
            <span className="text-2xl font-black tabular-nums">{gameState.timer}s</span>
            <span className="text-[10px] uppercase font-bold opacity-70 ml-2">{gameState.phase}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Player List */}
        <aside className="w-64 border-r border-[#E4E3E0]/10 p-4 flex flex-col gap-2 overflow-y-auto">
          <h3 className="text-[10px] uppercase opacity-40 mb-2 font-bold tracking-widest">Players</h3>
          {(Object.values(gameState.players) as Player[]).map((p) => (
            <div 
              key={p.id} 
              className={`p-3 border transition-colors ${p.id === playerId ? 'border-[#E4E3E0] bg-[#E4E3E0]/5' : 'border-[#E4E3E0]/10 opacity-60'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold truncate">{p.name}</span>
                <span className="text-xs">{p.hp} HP</span>
              </div>
              <div className="w-full h-0.5 bg-[#E4E3E0]/10">
                <div className="h-full bg-red-500" style={{ width: `${p.hp}%` }} />
              </div>
            </div>
          ))}
        </aside>

        {/* Center: Game Board */}
        <section className="flex-1 flex flex-col relative bg-[radial-gradient(#E4E3E0_1px,transparent_1px)] [background-size:32px_32px] [background-position:center]">
          <div className="flex-1 flex items-center justify-center p-8">
            <GameBoard 
              gameState={gameState} 
              playerId={playerId} 
              onMoveUnit={(from, to) => sendAction({ type: 'MOVE_UNIT', from, to })}
            />
          </div>
          
          {/* Bottom Controls: Bench & Shop */}
          <div className="p-4 bg-[#1a1a1a]/80 backdrop-blur-md border-t border-[#E4E3E0]/20">
            <Bench 
              units={currentPlayer.bench} 
              onMoveUnit={(from, to) => sendAction({ type: 'MOVE_UNIT', from, to })}
              onSellUnit={(from) => sendAction({ type: 'SELL_UNIT', from })}
            />
            <Shop 
              gold={currentPlayer.gold} 
              onBuyUnit={(index) => sendAction({ type: 'BUY_UNIT', unitIndex: index })}
              onReroll={() => sendAction({ type: 'REROLL' })}
              onLevelUp={() => sendAction({ type: 'LEVEL_UP' })}
            />
          </div>
        </section>
      </main>

      {/* Overlay for Phase Transitions */}
      <AnimatePresence>
        {gameState.phase === 'COMBAT' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-900/20 backdrop-blur-[2px] z-40 pointer-events-none flex items-center justify-center"
          >
            <div className="flex flex-col items-center">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-6xl font-black uppercase italic text-red-500 tracking-tighter drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]"
              >
                Combat in Progress
              </motion.div>
              <div className="mt-4 text-[10px] uppercase font-bold tracking-[0.5em] opacity-60">Simulating Battle...</div>
            </div>
          </motion.div>
        )}

        {gameState.phase === 'LOBBY' && !currentPlayer.isReady && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#141414]/90 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="text-center">
              <h2 className="text-4xl font-black uppercase italic mb-8 tracking-tighter">Waiting for Players</h2>
              <button 
                onClick={() => sendAction({ type: 'READY' })}
                className="px-12 py-4 bg-[#E4E3E0] text-[#141414] font-black uppercase text-xl hover:scale-105 transition-transform"
              >
                Ready to Fight
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
