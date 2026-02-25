export type UnitType = 'WARRIOR' | 'MAGE' | 'ARCHER' | 'TANK' | 'ASSASSIN';

export interface UnitStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  range: number;
  speed: number;
}

export interface Unit {
  id: string;
  name: string;
  type: UnitType;
  cost: number;
  tier: number;
  stats: UnitStats;
  position?: { x: number; y: number };
}

export interface Player {
  id: string;
  name: string;
  hp: number;
  gold: number;
  level: number;
  exp: number;
  bench: (Unit | null)[];
  board: (Unit | null)[][]; // 4x8 board (player side is 4x8)
  isReady: boolean;
}

export type GamePhase = 'LOBBY' | 'PREPARATION' | 'COMBAT' | 'RESULTS';

export interface GameState {
  phase: GamePhase;
  round: number;
  timer: number;
  players: Record<string, Player>;
  combatResults?: CombatResult[];
}

export interface CombatResult {
  player1Id: string;
  player2Id: string;
  winnerId: string | null; // null for draw
  damage: number;
}

export const BOARD_ROWS = 8;
export const BOARD_COLS = 8;
export const PLAYER_BOARD_ROWS = 4;

export const UNIT_POOL: Omit<Unit, 'id'>[] = [
  { name: 'Footman', type: 'WARRIOR', cost: 1, tier: 1, stats: { hp: 100, maxHp: 100, attack: 15, defense: 5, range: 1, speed: 1 } },
  { name: 'Apprentice', type: 'MAGE', cost: 1, tier: 1, stats: { hp: 60, maxHp: 60, attack: 25, defense: 2, range: 3, speed: 1 } },
  { name: 'Scout', type: 'ARCHER', cost: 1, tier: 1, stats: { hp: 70, maxHp: 70, attack: 20, defense: 3, range: 4, speed: 1 } },
  { name: 'Guard', type: 'TANK', cost: 2, tier: 1, stats: { hp: 150, maxHp: 150, attack: 10, defense: 10, range: 1, speed: 1 } },
  { name: 'Shadow', type: 'ASSASSIN', cost: 2, tier: 1, stats: { hp: 80, maxHp: 80, attack: 30, defense: 2, range: 1, speed: 1.5 } },
  { name: 'Knight', type: 'WARRIOR', cost: 3, tier: 2, stats: { hp: 180, maxHp: 180, attack: 25, defense: 8, range: 1, speed: 1 } },
  { name: 'Sorcerer', type: 'MAGE', cost: 3, tier: 2, stats: { hp: 100, maxHp: 100, attack: 45, defense: 4, range: 3, speed: 1 } },
];
