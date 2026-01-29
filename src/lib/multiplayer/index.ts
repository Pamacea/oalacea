// Multiplayer module - Re-exports
export * from './types';
export { default as MultiplayerClient } from './client';

import MultiplayerClient from './client';
import type { MultiplayerConfig, MessageHandler, ConnectionHandler, PlayersHandler } from './types';

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
