// Pusher provider for multiplayer
import { logger } from '@/lib/logger';
import type { MultiplayerConfig, PlayerState, PlayerAction } from '../types';
import type MultiplayerClient from '../client';

interface PusherResult {
  pusher: any;
  channel: any;
  success: boolean;
}

export async function connectPusher(
  config: MultiplayerConfig,
  client: MultiplayerClient
): Promise<PusherResult> {
  if (!config.pusherKey) {
    logger.warn('[Multiplayer] Pusher key not configured');
    return { pusher: null, channel: null, success: false };
  }

  try {
    // Dynamic import for Pusher (optional dependency)
    const Pusher = (await import('pusher-js')).default;
    const pusher = new Pusher(config.pusherKey, {
      cluster: config.pusherCluster || 'us2',
      authEndpoint: '/api/pusher/auth',
    });

    const channel = pusher.subscribe(config.channelName);

    channel.bind('pusher:subscription_succeeded', () => {
      logger.info('[Multiplayer] Pusher connected');
      client.setConnected(true);
      client.notifyConnectionChange(true);
      client.startHeartbeat();
      client.startPositionBroadcast();
    });

    channel.bind('player_update', (data: PlayerState) => {
      client.handleMessage({
        type: 'player_update',
        playerId: data.id,
        data,
        timestamp: Date.now(),
      });
    });

    channel.bind('player_action', (data: PlayerAction) => {
      client.notifyMessage(data);
    });

    channel.bind('pusher:member_added', (member: any) => {
      // Handle new player
      logger.debug('[Multiplayer] Player joined', { memberId: member.id });
    });

    channel.bind('pusher:member_removed', (member: any) => {
      client.handleMessage({
        type: 'player_leave',
        playerId: member.id,
        timestamp: Date.now(),
      });
    });

    return { pusher, channel, success: true };
  } catch (error) {
    logger.error('[Multiplayer] Pusher connection failed', error);
    return { pusher: null, channel: null, success: false };
  }
}
