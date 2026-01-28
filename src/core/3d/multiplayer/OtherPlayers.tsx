// OtherPlayers - Display other players in 3D space
'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { Text } from '@react-three/drei';
import type { PlayerState, PlayerAction } from '@/lib/multiplayer';

interface OtherPlayerProps {
  player: PlayerState;
  worldType: 'dev' | 'art';
  onEmote?: (playerId: string, emote: string) => void;
}

function OtherPlayer({ player, worldType, onEmote }: OtherPlayerProps) {
  const groupRef = useRef<Group>(null);
  const [targetPosition, setTargetPosition] = useState(new Vector3(...player.position));
  const [currentEmote, setCurrentEmote] = useState<string | undefined>(player.emote);
  const emoteTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update emote
  useEffect(() => {
    if (player.emote && player.emote !== currentEmote) {
      setCurrentEmote(player.emote);
      onEmote?.(player.id, player.emote);

      // Clear emote after 3 seconds
      if (emoteTimerRef.current) clearTimeout(emoteTimerRef.current);
      emoteTimerRef.current = setTimeout(() => {
        setCurrentEmote(undefined);
      }, 3000);
    }
  }, [player.emote, currentEmote, onEmote, player.id]);

  // Smooth position interpolation
  useFrame(() => {
    if (groupRef.current) {
      const target = new Vector3(...player.position);
      groupRef.current.position.lerp(target, 0.1);
      groupRef.current.rotation.y = player.rotation;
    }
  });

  const colors = {
    dev: { body: '#d4af37', glow: '#8b0000', accent: '#ffd700' },
    art: { body: '#ff6b6b', glow: '#4ecdc4', accent: '#00ffff' },
  }[worldType];

  const c = colors;

  return (
    <group ref={groupRef} position={player.position}>
      {/* Player Name Label */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {player.name}
      </Text>

      {/* Emote Display */}
      {currentEmote && (
        <Text
          position={[0, 2.7, 0]}
          fontSize={0.2}
          color={c.accent}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {currentEmote === 'wave' ? '👋' : currentEmote === 'cheer' ? '🎉' : currentEmote === 'point' ? '👉' : '❓'}
        </Text>
      )}

      {/* Connection Status Indicator */}
      <mesh position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={player.isMoving ? c.glow : '#666666'} />
      </mesh>

      {/* Other Player Character Model */}
      <group>
        {/* Shadow */}
        <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[player.isSprinting ? 0.6 : 0.5, 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.4} />
        </mesh>

        {/* Glow */}
        <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, player.isSprinting ? 0.9 : 0.7, 32]} />
          <meshBasicMaterial color={c.glow} transparent opacity={player.isMoving ? 0.6 : 0.3} />
        </mesh>

        {/* Body */}
        <group position={[0, 0, 0]}>
          {/* Head */}
          <mesh position={[0, 1.3, 0]} castShadow>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial
              color={c.body}
              roughness={0.3}
              metalness={0.5}
              emissive={c.glow}
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Torso */}
          <mesh position={[0, 0.65, 0]} castShadow>
            <capsuleGeometry args={[0.22, 0.55, 8, 16]} />
            <meshStandardMaterial
              color={c.body}
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>

          {/* Arms */}
          <mesh position={[-0.28, 0.9, 0]} castShadow>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color={c.body} metalness={0.6} />
          </mesh>
          <mesh position={[0.28, 0.9, 0]} castShadow>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color={c.body} metalness={0.6} />
          </mesh>

          {/* Direction indicator */}
          <mesh position={[0, 0.15, 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.18, 0.35, 4]} />
            <meshBasicMaterial color={c.glow} transparent opacity={0.8} />
          </mesh>
        </group>

        {/* Movement particles */}
        {player.isMoving && (
          <>
            <mesh position={[-0.35, 0.1, -0.25]}>
              <sphereGeometry args={[0.06, 4, 4]} />
              <meshBasicMaterial color={c.glow} transparent opacity={0.6} />
            </mesh>
            <mesh position={[0.35, 0.1, -0.25]}>
              <sphereGeometry args={[0.06, 4, 4]} />
              <meshBasicMaterial color={c.glow} transparent opacity={0.6} />
            </mesh>
          </>
        )}
      </group>

      {/* World indicator */}
      {player.currentWorld !== worldType && (
        <mesh position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={player.currentWorld === 'dev' ? '#d4af37' : '#ff6b6b'} />
        </mesh>
      )}
    </group>
  );
}

interface OtherPlayersProps {
  players: Map<string, PlayerState>;
  worldType: 'dev' | 'art';
  localPlayerId: string;
}

export function OtherPlayers({ players, worldType, localPlayerId }: OtherPlayersProps) {
  const [emotes, setEmotes] = useState<Map<string, string>>(new Map());

  const handleEmote = (playerId: string, emote: string) => {
    setEmotes((prev) => new Map(prev).set(playerId, emote));
  };

  // Filter out local player and players in different worlds
  const visiblePlayers = useMemo(() => {
    return Array.from(players.values()).filter(
      (p) => p.id !== localPlayerId && p.currentWorld === worldType
    );
  }, [players, localPlayerId, worldType]);

  if (visiblePlayers.length === 0) {
    return null;
  }

  return (
    <>
      {visiblePlayers.map((player) => (
        <OtherPlayer
          key={player.id}
          player={player}
          worldType={worldType}
          onEmote={handleEmote}
        />
      ))}
    </>
  );
}

interface MultiplayerStatusProps {
  connected: boolean;
  playerCount: number;
  playerName: string;
  onEmoteSelect?: (emote: string) => void;
}

export function MultiplayerStatus({ connected, playerCount, playerName, onEmoteSelect }: MultiplayerStatusProps) {
  const [showEmotes, setShowEmotes] = useState(false);

  const emotes = [
    { id: 'wave', label: '👋 Wave' },
    { id: 'cheer', label: '🎉 Cheer' },
    { id: 'point', label: '👉 Point' },
    { id: 'dance', label: '💃 Dance' },
    { id: 'yes', label: '👍 Yes' },
    { id: 'no', label: '👎 No' },
  ];

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
      {/* Connection Status */}
      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-white/10">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-white text-sm font-medium">
            {connected ? 'Multiplayer' : 'Offline'}
          </span>
        </div>
        {connected && (
          <>
            <div className="text-white/70 text-xs mt-1">
              {playerName} ({playerCount} {playerCount === 1 ? 'player' : 'players'} online)
            </div>
            <button
              type="button"
              onClick={() => setShowEmotes(!showEmotes)}
              className="mt-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs transition-colors"
            >
              Emotes
            </button>
          </>
        )}
      </div>

      {/* Emote Menu */}
      {showEmotes && connected && (
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 border border-white/10">
          {emotes.map((emote) => (
            <button
              key={emote.id}
              type="button"
              onClick={() => {
                onEmoteSelect?.(emote.id);
                setShowEmotes(false);
              }}
              className="w-full px-3 py-2 text-left text-white text-sm hover:bg-white/10 rounded transition-colors"
            >
              {emote.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Multiplayer hook for components
export function useMultiplayer() {
  const [players, setPlayers] = useState<Map<string, PlayerState>>(new Map());
  const [connected, setConnected] = useState(false);
  const [localPlayerId, setLocalPlayerId] = useState<string>('');

  return {
    players,
    setPlayers,
    connected,
    setConnected,
    localPlayerId,
    setLocalPlayerId,
  };
}
