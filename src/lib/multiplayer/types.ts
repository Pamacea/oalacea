// Multiplayer types and interfaces
export interface PlayerState {
  id: string;
  name: string;
  position: [number, number, number];
  rotation: number;
  currentWorld: 'dev' | 'art';
  isMoving: boolean;
  isSprinting: boolean;
  emote?: string;
  lastUpdate: number;
}

export interface PlayerAction {
  type: 'move' | 'emote' | 'wave' | 'disconnect';
  playerId: string;
  data?: unknown;
}

export interface MultiplayerConfig {
  provider: 'websocket' | 'pusher';
  wsUrl?: string;
  pusherKey?: string;
  pusherCluster?: string;
  channelName: string;
  playerName: string;
  inactivityTimeout?: number;
}

export interface Message {
  type: 'player_update' | 'player_action' | 'player_join' | 'player_leave' | 'sync_request' | 'sync_response';
  playerId: string;
  data?: PlayerState | PlayerAction;
  timestamp: number;
}

export type MessageHandler = (data: PlayerState | PlayerAction) => void;
export type ConnectionHandler = (connected: boolean) => void;
export type PlayersHandler = (players: Map<string, PlayerState>) => void;
