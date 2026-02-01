// VoiceChat - Spatial voice chat with WebRTC
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Vector3 } from 'three';

// WebRTC types
interface AudioStream {
  stream: MediaStream;
  playerId: string;
}

interface SpatialAudioContext {
  context: AudioContext;
  sources: Map<string, { source: AudioBufferSourceNode; panner: PannerNode; gain: GainNode }>;
}

interface VoiceChatState {
  isEnabled: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  isPushToTalk: boolean;
  volume: number;
}

interface VoiceChatConfig {
  pushToTalkKey?: string;
  maxDistance?: number;
  rolloffFactor?: number;
  initialVolume?: number;
}

const DEFAULT_CONFIG: Required<VoiceChatConfig> = {
  pushToTalkKey: 'KeyV',
  maxDistance: 20,
  rolloffFactor: 1,
  initialVolume: 0.8,
};

// Check if WebRTC is supported
export function isVoiceChatSupported(): boolean {
  return (
    typeof MediaStream !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    typeof AudioContext !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getUserMedia' in navigator.mediaDevices
  );
}

export function useVoiceChat(config: VoiceChatConfig = DEFAULT_CONFIG) {
  const [state, setState] = useState<VoiceChatState>({
    isEnabled: isVoiceChatSupported(),
    isMuted: false,
    isSpeaking: false,
    isPushToTalk: !!config.pushToTalkKey,
    volume: config.initialVolume ?? DEFAULT_CONFIG.initialVolume,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const dataChannelsRef = useRef<Map<string, RTCDataChannel>>(new Map());
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speakingDetectorRef = useRef<NodeJS.Timeout | null>(null);
  const spatialAudioRef = useRef<SpatialAudioContext | null>(null);
  const isPushToTalkActiveRef = useRef(false);

  // Initialize Audio Context for spatial audio
  const initSpatialAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    if (!spatialAudioRef.current) {
      spatialAudioRef.current = {
        context: audioContextRef.current,
        sources: new Map(),
      };
    }

    return audioContextRef.current;
  }, []);

  // Initialize local microphone
  const initMicrophone = useCallback(async () => {
    if (!isVoiceChatSupported()) {
      console.warn('[VoiceChat] WebRTC not supported');
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
        video: false,
      });

      localStreamRef.current = stream;

      // Set up audio analyser for speaking detection
      const context = initSpatialAudio();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      return stream;
    } catch (error) {
      console.error('[VoiceChat] Failed to get microphone:', error);
      return null;
    }
  }, [initSpatialAudio]);

  // Detect if user is speaking
  const detectSpeaking = useCallback(() => {
    if (!analyserRef.current) return false;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    return average > 20; // Threshold for speaking
  }, []);

  // Start speaking detection loop
  const startSpeakingDetection = useCallback(() => {
    const check = () => {
      const isSpeakingNow = detectSpeaking();
      setState((prev) => {
        if (prev.isSpeaking !== isSpeakingNow) {
          return { ...prev, isSpeaking: isSpeakingNow };
        }
        return prev;
      });
      speakingDetectorRef.current = setTimeout(check, 100);
    };
    check();
  }, [detectSpeaking]);

  // Stop speaking detection
  const stopSpeakingDetection = useCallback(() => {
    if (speakingDetectorRef.current) {
      clearTimeout(speakingDetectorRef.current);
      speakingDetectorRef.current = null;
    }
  }, []);

  // Connect to a peer
  const connectToPeer = useCallback(async (playerId: string): Promise<RTCPeerConnection | null> => {
    if (!localStreamRef.current || !audioContextRef.current) {
      console.warn('[VoiceChat] Not initialized');
      return null;
    }

    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(config);
    peerConnectionsRef.current.set(playerId, pc);

    // Add local stream to peer connection
    localStreamRef.current.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current!);
    });

    // Handle incoming stream
    pc.ontrack = (event) => {
      handleIncomingStream(playerId, event.streams[0], audioContextRef.current!);
    };

    // Create data channel for signaling
    const dataChannel = pc.createDataChannel('voice-signaling');
    dataChannelsRef.current.set(playerId, dataChannel);

    // ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send candidate through signaling server
        // This would be handled by the multiplayer client
      }
    };

    return pc;
  }, []);

  // Handle incoming audio stream with spatial positioning
  const handleIncomingStream = useCallback((
    playerId: string,
    stream: MediaStream,
    context: AudioContext
  ) => {
    if (!spatialAudioRef.current) return;

    const spatial = spatialAudioRef.current;

    // Clean up existing source for this player
    if (spatial.sources.has(playerId)) {
      const existing = spatial.sources.get(playerId);
      existing?.source.stop();
      existing?.panner.disconnect();
      existing?.gain.disconnect();
      spatial.sources.delete(playerId);
    }

    // Create new audio source chain
    const source = context.createMediaStreamSource(stream);
    const panner = context.createPanner();
    const gain = context.createGain();

    // Configure panner for spatial audio
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'linear';
    panner.refDistance = 1;
    panner.maxDistance = config.maxDistance ?? DEFAULT_CONFIG.maxDistance;
    panner.rolloffFactor = config.rolloffFactor ?? DEFAULT_CONFIG.rolloffFactor;
    panner.coneInnerAngle = 360;

    // Connect: source -> panner -> gain -> destination
    source.connect(panner);
    panner.connect(gain);
    gain.connect(context.destination);

    gain.gain.value = state.volume;

    spatial.sources.set(playerId, { source: source as unknown as AudioBufferSourceNode, panner, gain });
  }, [config.maxDistance, config.rolloffFactor, state.volume]);

  // Update player position for spatial audio
  const updatePlayerPosition = useCallback((playerId: string, position: [number, number, number]) => {
    const spatial = spatialAudioRef.current;
    if (!spatial || !spatial.sources.has(playerId)) return;

    const { panner } = spatial.sources.get(playerId)!;
    panner.positionX.value = position[0];
    panner.positionY.value = position[1];
    panner.positionZ.value = position[2];
  }, []);

  // Update listener position (local player)
  const updateListenerPosition = useCallback((position: [number, number, number], rotation: number) => {
    const context = audioContextRef.current;
    if (!context) return;

    const listener = context.listener;
    listener.positionX.value = position[0];
    listener.positionY.value = position[1];
    listener.positionZ.value = position[2];

    // Set orientation based on rotation
    const forwardX = Math.sin(rotation);
    const forwardZ = Math.cos(rotation);
    listener.forwardX.value = forwardX;
    listener.forwardY.value = 0;
    listener.forwardZ.value = -forwardZ;
    listener.upX.value = 0;
    listener.upY.value = 1;
    listener.upZ.value = 0;
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;

    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setState((prev) => ({ ...prev, isMuted: !audioTrack.enabled }));
    }
  }, []);

  // Set mute state
  const setMuted = useCallback((muted: boolean) => {
    if (!localStreamRef.current) return;

    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !muted;
      setState((prev) => ({ ...prev, isMuted: muted }));
    }
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    setState((prev) => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));

    // Update all gain nodes
    const spatial = spatialAudioRef.current;
    if (spatial) {
      spatial.sources.forEach(({ gain }) => {
        gain.gain.value = volume;
      });
    }
  }, []);

  // Initialize voice chat
  const init = useCallback(async () => {
    if (!isVoiceChatSupported()) {
      setState((prev) => ({ ...prev, isEnabled: false }));
      return false;
    }

    initSpatialAudio();
    const stream = await initMicrophone();
    if (stream) {
      startSpeakingDetection();
      return true;
    }

    return false;
  }, [initSpatialAudio, initMicrophone, startSpeakingDetection]);

  // Cleanup
  const cleanup = useCallback(() => {
    stopSpeakingDetection();

    // Stop all tracks
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();

    // Close data channels
    dataChannelsRef.current.forEach((dc) => dc.close());
    dataChannelsRef.current.clear();

    // Stop all spatial audio sources
    const spatial = spatialAudioRef.current;
    if (spatial) {
      spatial.sources.forEach(({ source, panner, gain }) => {
        try {
          source.stop();
        } catch {}
        panner.disconnect();
        gain.disconnect();
      });
      spatial.sources.clear();
    }

    // Close audio context
    audioContextRef.current?.close();
    audioContextRef.current = null;
    spatialAudioRef.current = null;
  }, [stopSpeakingDetection]);

  // Push-to-talk handling
  useEffect(() => {
    if (!state.isPushToTalk || !config.pushToTalkKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === config.pushToTalkKey && !isPushToTalkActiveRef.current) {
        isPushToTalkActiveRef.current = true;
        setMuted(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === config.pushToTalkKey && isPushToTalkActiveRef.current) {
        isPushToTalkActiveRef.current = false;
        setMuted(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state.isPushToTalk, config.pushToTalkKey, setMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    ...state,
    init,
    cleanup,
    toggleMute,
    setMuted,
    setVolume,
    connectToPeer,
    updatePlayerPosition,
    updateListenerPosition,
    isSupported: isVoiceChatSupported(),
  };
}

interface VoiceChatIndicatorProps {
  isSpeaking: boolean;
  isMuted: boolean;
  volume: number;
  isPushToTalk?: boolean;
  onToggleMute?: () => void;
  onVolumeChange?: (volume: number) => void;
}

export function VoiceChatIndicator({
  isSpeaking,
  isMuted,
  volume,
  isPushToTalk,
  onToggleMute,
  onVolumeChange,
}: VoiceChatIndicatorProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/60 backdrop-blur-sm rounded-sm p-3 border border-white/10">
      <div className="flex items-center gap-3">
        {/* Speaking Indicator */}
        <div className="relative">
          <div className={`w-3 h-3 rounded-sm ${isMuted ? 'bg-red-500' : isSpeaking ? 'bg-green-500' : 'bg-gray-500'}`} />
          {isSpeaking && !isMuted && (
            <div className="absolute inset-0 w-3 h-3 rounded-sm bg-green-500 animate-ping opacity-50" />
          )}
        </div>

        {/* Status Text */}
        <span className="text-white text-sm">
          {isMuted ? 'Muted' : isPushToTalk ? `Push ${isPushToTalk === true ? 'V' : ''} to talk` : 'Voice Active'}
        </span>

        {/* Mute Toggle */}
        {onToggleMute && (
          <button
            type="button"
            onClick={onToggleMute}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        )}

        {/* Volume Slider */}
        {onVolumeChange && (
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-20 h-1 bg-white/20 rounded-sm appearance-none cursor-pointer"
            aria-label="Volume"
          />
        )}
      </div>
    </div>
  );
}

// Distance calculator for volume attenuation
export function calculateVolumeAtDistance(
  playerPos: [number, number, number],
  listenerPos: [number, number, number],
  maxDistance: number = 20
): number {
  const dx = playerPos[0] - listenerPos[0];
  const dz = playerPos[2] - listenerPos[2];
  const distance = Math.sqrt(dx * dx + dz * dz);

  // Linear attenuation
  return Math.max(0, 1 - distance / maxDistance);
}
