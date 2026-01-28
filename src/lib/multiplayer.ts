// Multiplayer Client - EXPERIMENTAL
// Supports WebSocket and Pusher for real-time multiplayer

type MultiplayerProvider = 'websocket' | 'pusher';

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

interface MultiplayerConfig {
  provider: MultiplayerProvider;
  wsUrl?: string;
  pusherKey?: string;
  pusherCluster?: string;
  channelName: string;
  playerName: string;
  inactivityTimeout?: number;
}

type MessageHandler = (data: PlayerState | PlayerAction) => void;
type ConnectionHandler = (connected: boolean) => void;
type PlayersHandler = (players: Map<string, PlayerState>) => void;

interface Message {
  type: 'player_update' | 'player_action' | 'player_join' | 'player_leave' | 'sync_request' | 'sync_response';
  playerId: string;
  data?: PlayerState | PlayerAction;
  timestamp: number;
}

/**
 * Multiplayer Client Class
 * Handles WebSocket/Pusher connection for real-time multiplayer
 */
class MultiplayerClient {
  private ws: WebSocket | null = null;
  private pusher: any = null;
  private channel: any = null;
  private config: MultiplayerConfig;
  private connected = false;
  private players = new Map<string, PlayerState>();
  localPlayerId: string;
  private inactivityTimer: NodeJS.Timeout | null = null;
  private broadcastInterval: NodeJS.Timeout | null = null;
  private lastPosition = [0, 0, 0] as [number, number, number];

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
        return await this.connectPusher();
      }
      return await this.connectWebSocket();
    } catch (error) {
      console.error('[Multiplayer] Connection failed:', error);
      return false;
    }
  }

  private async connectWebSocket(): Promise<boolean> {
    const wsUrl = this.config.wsUrl || `ws://localhost:3001/ws`;
    this.ws = new WebSocket(wsUrl);

    return new Promise((resolve) => {
      if (!this.ws) return resolve(false);

      this.ws.onopen = () => {
        this.connected = true;
        this.notifyConnectionChange(true);
        this.startHeartbeat();
        this.startPositionBroadcast();
        // Request sync
        this.send({ type: 'sync_request', playerId: this.localPlayerId, timestamp: Date.now() });
        resolve(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: Message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (e) {
          console.error('[Multiplayer] Failed to parse message:', e);
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.notifyConnectionChange(false);
        this.stopHeartbeat();
        this.stopPositionBroadcast();
      };

      this.ws.onerror = () => {
        this.connected = false;
        resolve(false);
      };
    });
  }

  private async connectPusher(): Promise<boolean> {
    if (!this.config.pusherKey) {
      console.warn('[Multiplayer] Pusher key not configured');
      return false;
    }

    try {
      // Dynamic import for Pusher (optional dependency)
      const Pusher = (await import('pusher-js')).default;
      this.pusher = new Pusher(this.config.pusherKey, {
        cluster: this.config.pusherCluster || 'us2',
        authEndpoint: '/api/pusher/auth',
      });

      this.channel = this.pusher.subscribe(this.config.channelName);

      this.channel.bind('pusher:subscription_succeeded', () => {
        this.connected = true;
        this.notifyConnectionChange(true);
        this.startHeartbeat();
        this.startPositionBroadcast();
      });

      this.channel.bind('player_update', (data: PlayerState) => {
        this.handlePlayerUpdate(data);
      });

      this.channel.bind('player_action', (data: PlayerAction) => {
        this.notifyMessage(data);
      });

      this.channel.bind('pusher:member_added', (member: any) => {
        // Handle new player
      });

      this.channel.bind('pusher:member_removed', (member: any) => {
        const playerId = member.id;
        this.players.delete(playerId);
        this.notifyPlayersUpdate();
      });

      return true;
    } catch (error) {
      console.error('[Multiplayer] Pusher connection failed:', error);
      return false;
    }
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
  private handleMessage(message: Message): void {
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
  private send(message: Message): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else if (this.channel && this.pusher) {
      this.channel.trigger('client-player_update', message.data);
    }
  }

  /**
   * Start position broadcast interval
   */
  private startPositionBroadcast(): void {
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

  private stopPositionBroadcast(): void {
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

  private startHeartbeat(): void {
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

  private stopHeartbeat(): void {
    if (this.inactivityTimer) {
      clearInterval(this.inactivityTimer);
      this.inactivityTimer = null;
    }
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

  private notifyMessage(data: PlayerAction): void {
    this.onMessageCallbacks.forEach((cb) => cb(data));
  }

  private notifyConnectionChange(connected: boolean): void {
    this.onConnectionCallbacks.forEach((cb) => cb(connected));
  }

  private notifyPlayersUpdate(): void {
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

// Singleton instance
let clientInstance: MultiplayerClient | null = null;

/**
 * Get or create multiplayer client
 */
export function getMultiplayerClient(config?: MultiplayerConfig): MultiplayerClient | null {
  if (!config) return clientInstance;

  if (clientInstance) {
    clientInstance.disconnect();
  }

  clientInstance = new MultiplayerClient(config);
  return clientInstance;
}

/**
 * Hook for multiplayer connection
 */
export function createMultiplayerHook() {
  return {
    connect: (config: MultiplayerConfig) => getMultiplayerClient(config)?.connect(),
    disconnect: () => clientInstance?.disconnect(),
    broadcastPosition: (position: [number, number, number], rotation: number, state: {
      isMoving: boolean;
      isSprinting: boolean;
      currentWorld: 'dev' | 'art';
    }) => clientInstance?.broadcastPosition(position, rotation, state),
    sendAction: (action: 'wave' | 'emote' | 'disconnect', data?: string) => clientInstance?.sendAction(action, data),
    getPlayers: () => clientInstance?.getPlayers() ?? new Map(),
    isConnected: () => clientInstance?.isConnected() ?? false,
    getLocalPlayerId: () => clientInstance?.getLocalPlayerId() ?? '',
    onMessage: (cb: MessageHandler) => clientInstance?.onMessage(cb),
    onConnectionChange: (cb: ConnectionHandler) => clientInstance?.onConnectionChange(cb),
    onPlayersUpdate: (cb: PlayersHandler) => clientInstance?.onPlayersUpdate(cb),
  };
}

export type { MultiplayerConfig, MessageHandler, ConnectionHandler, PlayersHandler };
