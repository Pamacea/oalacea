// Multiplayer Client - Core client class
// Handles connection management and player state tracking
import { logger } from '@/lib/logger';
import type {
  Message,
  MessageHandler,
  ConnectionHandler,
  MultiplayerConfig,
  PlayersHandler,
  PlayerState,
  PlayerAction,
} from './types';
import { connectWebSocket } from './providers/websocket';
import { connectPusher } from './providers/pusher';

/**
 * Multiplayer Client Class
 * Handles WebSocket/Pusher connection for real-time multiplayer
 */
class MultiplayerClient {
  private config: MultiplayerConfig;
  private connected = false;
  private players = new Map<string, PlayerState>();
  localPlayerId: string;
  private inactivityTimer: NodeJS.Timeout | null = null;
  private broadcastInterval: NodeJS.Timeout | null = null;
  private lastPosition = [0, 0, 0] as [number, number, number];

  // Provider connections
  private ws: WebSocket | null = null;
  private pusher: any = null;
  private channel: any = null;

  // Event handlers
  private onMessageCallbacks: Set<MessageHandler> = new Set();
  private onConnectionCallbacks: Set<ConnectionHandler> = new Set();
  private onPlayersUpdateCallbacks: Set<PlayersHandler> = new Set();

  constructor(config: MultiplayerConfig) {
    this.config = config;
    this.localPlayerId = this.generateId();
  }

  private generateId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Connect to multiplayer server
   */
  async connect(): Promise<boolean> {
    try {
      if (this.config.provider === 'pusher') {
        return await this.connectPusherProvider();
      }
      return await this.connectWebSocketProvider();
    } catch (error) {
      logger.error('[Multiplayer] Connection failed', error);
      return false;
    }
  }

  private async connectWebSocketProvider(): Promise<boolean> {
    const result = await connectWebSocket(this.config, this);
    this.ws = result.ws;
    return result.success;
  }

  private async connectPusherProvider(): Promise<boolean> {
    const result = await connectPusher(this.config, this);
    this.pusher = result.pusher;
    this.channel = result.channel;
    return result.success;
  }

  /**
   * Disconnect from multiplayer server
   */
  disconnect(): void {
    this.sendAction('disconnect');

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
      this.channel = null;
    }

    this.connected = false;
    this.stopHeartbeat();
    this.stopPositionBroadcast();
    this.players.clear();
    this.notifyConnectionChange(false);
  }

  /**
   * Handle incoming messages
   */
  handleMessage(message: Message): void {
    switch (message.type) {
      case 'player_update':
        if (message.data) {
          this.handlePlayerUpdate(message.data as PlayerState);
        }
        break;
      case 'player_action':
        if (message.data) {
          this.notifyMessage(message.data as PlayerAction);
        }
        break;
      case 'player_join':
        if (message.data) {
          this.handlePlayerUpdate(message.data as PlayerState);
        }
        break;
      case 'player_leave':
        this.players.delete(message.playerId);
        this.notifyPlayersUpdate();
        break;
      case 'sync_response':
        // Handle initial sync
        break;
    }
  }

  /**
   * Update or add a player
   */
  private handlePlayerUpdate(player: PlayerState): void {
    // Don't track self
    if (player.id === this.localPlayerId) return;

    // Update or add player
    this.players.set(player.id, player);
    this.notifyPlayersUpdate();
    this.resetInactivityTimer(player.id);
  }

  /**
   * Broadcast local player position
   */
  broadcastPosition(position: [number, number, number], rotation: number, state: {
    isMoving: boolean;
    isSprinting: boolean;
    currentWorld: 'dev' | 'art';
  }): void {
    if (!this.connected) return;

    // Only broadcast if position changed significantly
    const dx = position[0] - this.lastPosition[0];
    const dz = position[2] - this.lastPosition[2];
    if (Math.abs(dx) < 0.05 && Math.abs(dz) < 0.05) return;

    this.lastPosition = position;

    const playerState: PlayerState = {
      id: this.localPlayerId,
      name: this.config.playerName,
      position,
      rotation,
      ...state,
      lastUpdate: Date.now(),
    };

    this.send({
      type: 'player_update',
      playerId: this.localPlayerId,
      data: playerState,
      timestamp: Date.now(),
    });
  }

  /**
   * Send a player action (emote, wave, etc.)
   */
  sendAction(action: 'wave' | 'emote' | 'disconnect', data?: string): void {
    if (!this.connected) return;

    const playerAction: PlayerAction = {
      type: action,
      playerId: this.localPlayerId,
      data,
    };

    this.send({
      type: 'player_action',
      playerId: this.localPlayerId,
      data: playerAction,
      timestamp: Date.now(),
    });
  }

  /**
   * Send message to server
   */
  send(message: Message): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else if (this.channel && this.pusher) {
      this.channel.trigger('client-player_update', message.data);
    }
  }

  /**
   * Start position broadcast interval
   */
  startPositionBroadcast(): void {
    this.broadcastInterval = setInterval(() => {
      // Broadcast is handled by broadcastPosition calls
      // This is a fallback for inactivity detection
      this.send({
        type: 'player_update',
        playerId: this.localPlayerId,
        data: {
          id: this.localPlayerId,
          name: this.config.playerName,
          position: this.lastPosition,
          rotation: 0,
          currentWorld: 'dev',
          isMoving: false,
          isSprinting: false,
          lastUpdate: Date.now(),
        },
        timestamp: Date.now(),
      });
    }, 1000);
  }

  stopPositionBroadcast(): void {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }
  }

  /**
   * Inactivity timeout
   */
  private resetInactivityTimer(playerId: string): void {
    const timeout = this.config.inactivityTimeout || 60000; // 1 minute default

    setTimeout(() => {
      const player = this.players.get(playerId);
      if (player && Date.now() - player.lastUpdate > timeout) {
        this.players.delete(playerId);
        this.notifyPlayersUpdate();
      }
    }, timeout);
  }

  startHeartbeat(): void {
    // Send periodic heartbeat to maintain connection
    this.inactivityTimer = setInterval(() => {
      if (this.connected) {
        this.send({
          type: 'player_update',
          playerId: this.localPlayerId,
          timestamp: Date.now(),
        });
      }
    }, 30000);
  }

  stopHeartbeat(): void {
    if (this.inactivityTimer) {
      clearInterval(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  setConnected(value: boolean): void {
    this.connected = value;
  }

  /**
   * Event subscription
   */
  onMessage(callback: MessageHandler): () => void {
    this.onMessageCallbacks.add(callback);
    return () => this.onMessageCallbacks.delete(callback);
  }

  onConnectionChange(callback: ConnectionHandler): () => void {
    this.onConnectionCallbacks.add(callback);
    return () => this.onConnectionCallbacks.delete(callback);
  }

  onPlayersUpdate(callback: PlayersHandler): () => void {
    this.onPlayersUpdateCallbacks.add(callback);
    return () => this.onPlayersUpdateCallbacks.delete(callback);
  }

  notifyMessage(data: PlayerAction): void {
    this.onMessageCallbacks.forEach((cb) => cb(data));
  }

  notifyConnectionChange(connected: boolean): void {
    this.onConnectionCallbacks.forEach((cb) => cb(connected));
  }

  notifyPlayersUpdate(): void {
    this.onPlayersUpdateCallbacks.forEach((cb) => cb(new Map(this.players)));
  }

  /**
   * Get all connected players
   */
  getPlayers(): Map<string, PlayerState> {
    return new Map(this.players);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get local player ID
   */
  getLocalPlayerId(): string {
    return this.localPlayerId;
  }
}

export default MultiplayerClient;
