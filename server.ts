import express from 'express';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { GameState, Player, Unit, GamePhase, UNIT_POOL, PLAYER_BOARD_ROWS, BOARD_COLS } from './src/game/types';
import { v4 as uuidv4 } from 'uuid';

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  const PORT = 4173;

  // Game State
  let gameState: GameState = {
    phase: 'LOBBY',
    round: 0,
    timer: 0,
    players: {},
  };

  const clients = new Map<string, WebSocket>();

  function broadcast(data: any) {
    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  function sendTo(playerId: string, data: any) {
    const client = clients.get(playerId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  function createPlayer(id: string, name: string): Player {
    return {
      id,
      name,
      hp: 100,
      gold: 5,
      level: 1,
      exp: 0,
      bench: Array(8).fill(null),
      board: Array(PLAYER_BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null)),
      isReady: false,
    };
  }

  wss.on('connection', (ws) => {
    const playerId = uuidv4();
    
    ws.on('message', (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
        case 'JOIN':
          if (Object.keys(gameState.players).length >= 6) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Game full' }));
            return;
          }
          const name = data.name || `Player ${Object.keys(gameState.players).length + 1}`;
          gameState.players[playerId] = createPlayer(playerId, name);
          clients.set(playerId, ws);
          ws.send(JSON.stringify({ type: 'INIT', playerId, gameState }));
          broadcast({ type: 'UPDATE_GAME', gameState });
          break;

        case 'READY':
          if (gameState.players[playerId]) {
            gameState.players[playerId].isReady = true;
            broadcast({ type: 'UPDATE_GAME', gameState });
            
            const allReady = Object.values(gameState.players).every(p => p.isReady);
            if (allReady && Object.keys(gameState.players).length >= 2 && gameState.phase === 'LOBBY') {
              startGame();
            }
          }
          break;

        case 'BUY_UNIT':
          handleBuyUnit(playerId, data.unitIndex);
          break;

        case 'MOVE_UNIT':
          handleMoveUnit(playerId, data.from, data.to);
          break;

        case 'SELL_UNIT':
          handleSellUnit(playerId, data.from);
          break;
      }
    } catch (e) {
      console.error('Failed to parse message:', e);
    }
    });

    ws.on('close', () => {
      delete gameState.players[playerId];
      clients.delete(playerId);
      broadcast({ type: 'UPDATE_GAME', gameState });
    });
  });

  function startGame() {
    gameState.phase = 'PREPARATION';
    gameState.round = 1;
    gameState.timer = 30;
    startTimer();
    broadcast({ type: 'UPDATE_GAME', gameState });
  }

  let timerInterval: NodeJS.Timeout | null = null;
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      gameState.timer--;
      if (gameState.timer <= 0) {
        if (gameState.phase === 'PREPARATION') {
          startCombat();
        } else if (gameState.phase === 'COMBAT') {
          endCombat();
        }
      }
      broadcast({ type: 'UPDATE_GAME', gameState });
    }, 1000);
  }

  function startCombat() {
    gameState.phase = 'COMBAT';
    gameState.timer = 20; // Combat duration
    // In a real game, we would simulate combat here or send pairings to clients
    broadcast({ type: 'START_COMBAT', pairings: generatePairings() });
  }

  function generatePairings() {
    const playerIds = Object.keys(gameState.players);
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
    const pairings = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (shuffled[i + 1]) {
        pairings.push([shuffled[i], shuffled[i + 1]]);
      } else {
        // Odd number of players, one fights a ghost or gets a bye
        pairings.push([shuffled[i], null]);
      }
    }
    return pairings;
  }

  function endCombat() {
    gameState.phase = 'PREPARATION';
    gameState.round++;
    gameState.timer = 30;
    // Give gold, etc.
    Object.values(gameState.players).forEach(p => {
      p.gold += 5 + Math.min(Math.floor(p.gold / 10), 5); // Basic + Interest
    });
    broadcast({ type: 'UPDATE_GAME', gameState });
  }

  function handleBuyUnit(playerId: string, unitIndex: number) {
    const player = gameState.players[playerId];
    if (!player) return;
    
    // Simple mock shop for now
    const unitTemplate = UNIT_POOL[unitIndex % UNIT_POOL.length];
    if (player.gold >= unitTemplate.cost) {
      const emptyBenchIndex = player.bench.findIndex(u => u === null);
      if (emptyBenchIndex !== -1) {
        player.gold -= unitTemplate.cost;
        player.bench[emptyBenchIndex] = { ...unitTemplate, id: uuidv4() } as Unit;
        broadcast({ type: 'UPDATE_GAME', gameState });
      }
    }
  }

  function handleMoveUnit(playerId: string, from: any, to: any) {
    const player = gameState.players[playerId];
    if (!player) return;

    let unit: Unit | null = null;
    
    // Get unit from source
    if (from.type === 'bench') {
      unit = player.bench[from.index];
      player.bench[from.index] = null;
    } else if (from.type === 'board') {
      unit = player.board[from.y][from.x];
      player.board[from.y][from.x] = null;
    }

    if (!unit) return;

    // Place unit to destination
    if (to.type === 'bench') {
      const targetUnit = player.bench[to.index];
      player.bench[to.index] = unit;
      if (targetUnit) {
        // Swap back if there was a unit
        if (from.type === 'bench') player.bench[from.index] = targetUnit;
        else player.board[from.y][from.x] = targetUnit;
      }
    } else if (to.type === 'board') {
      const targetUnit = player.board[to.y][to.x];
      player.board[to.y][to.x] = unit;
      if (targetUnit) {
        if (from.type === 'bench') player.bench[from.index] = targetUnit;
        else player.board[from.y][from.x] = targetUnit;
      }
    }

    broadcast({ type: 'UPDATE_GAME', gameState });
  }

  function handleSellUnit(playerId: string, from: any) {
    const player = gameState.players[playerId];
    if (!player) return;

    let unit: Unit | null = null;
    if (from.type === 'bench') {
      unit = player.bench[from.index];
      player.bench[from.index] = null;
    } else if (from.type === 'board') {
      unit = player.board[from.y][from.x];
      player.board[from.y][from.x] = null;
    }

    if (unit) {
      player.gold += unit.cost;
      broadcast({ type: 'UPDATE_GAME', gameState });
    }
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
