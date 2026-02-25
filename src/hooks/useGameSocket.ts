import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from '../game/types';

export function useGameSocket() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback((name: string) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      socket.send(JSON.stringify({ type: 'JOIN', name }));
    };

    socket.onmessage = (event) => {
      try {
        if (!event.data) return;
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'INIT':
            setPlayerId(data.playerId);
            setGameState(data.gameState);
            break;
          case 'UPDATE_GAME':
            setGameState(data.gameState);
            break;
          case 'ERROR':
            alert(data.message);
            break;
        }
      } catch (e) {
        console.error('Failed to parse server message:', e);
      }
    };

    socket.onclose = () => {
      setConnected(false);
    };

    return () => socket.close();
  }, []);

  const sendAction = useCallback((action: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(action));
    }
  }, []);

  return { gameState, playerId, connected, connect, sendAction };
}
