// WebSocket provider for multiplayer
import { logger } from '@/lib/logger';
import type { MultiplayerConfig, Message } from '../types';
import type MultiplayerClient from '../client';

interface WebSocketResult {
  ws: WebSocket | null;
  success: boolean;
}

export async function connectWebSocket(
  config: MultiplayerConfig,
  client: MultiplayerClient
): Promise<WebSocketResult> {
  const wsUrl = config.wsUrl || `ws://localhost:3001/ws`;
  const ws = new WebSocket(wsUrl);

  return new Promise((resolve) => {
    if (!ws) return resolve({ ws: null, success: false });

    ws.onopen = () => {
      logger.info('[Multiplayer] WebSocket connected');
      client.setConnected(true);
      client.notifyConnectionChange(true);
      client.startHeartbeat();
      client.startPositionBroadcast();
      // Request sync
      ws.send(JSON.stringify({
        type: 'sync_request',
        playerId: client.getLocalPlayerId(),
        timestamp: Date.now(),
      }));
      resolve({ ws, success: true });
    };

    ws.onmessage = (event) => {
      try {
        const message: Message = JSON.parse(event.data);
        client.handleMessage(message);
      } catch (e) {
        logger.error('[Multiplayer] Failed to parse message', e);
      }
    };

    ws.onclose = () => {
      logger.info('[Multiplayer] WebSocket disconnected');
      client.setConnected(false);
      client.notifyConnectionChange(false);
      client.stopHeartbeat();
      client.stopPositionBroadcast();
    };

    ws.onerror = () => {
      logger.error('[Multiplayer] WebSocket error');
      client.setConnected(false);
      resolve({ ws, success: false });
    };
  });
}
