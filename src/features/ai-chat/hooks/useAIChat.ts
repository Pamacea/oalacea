'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useMemo } from 'react';
import { TECH_PRIEST_CONFIG, ART_CURATOR_CONFIG } from '@/core/3d/npc';
import type { UIMessage } from 'ai';

type NPCId = 'tech-priest-guide' | 'art-curator-guide';

interface UseAIChatOptions {
  npcId: NPCId;
  onError?: (error: Error) => void;
  onFinish?: (message: UIMessage) => void;
}

const NPC_CONFIGS = {
  'tech-priest-guide': TECH_PRIEST_CONFIG,
  'art-curator-guide': ART_CURATOR_CONFIG,
} as const;

const INITIAL_MESSAGES: Record<NPCId, UIMessage[]> = {
  'tech-priest-guide': [
    {
      id: 'welcome-tech-priest',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: 'Greetings, traveler. The Machine Spirits await your inquiry. How may I guide you through the sacred archives of technical knowledge?',
        },
      ],
    },
  ],
  'art-curator-guide': [
    {
      id: 'welcome-art-curator',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: 'Hey there! Ready to explore some creative vibes? What would you like to check out?',
        },
      ],
    },
  ],
};

export function useAIChat({ npcId, onError, onFinish }: UseAIChatOptions) {
  const npcConfig = useMemo(() => NPC_CONFIGS[npcId], [npcId]);
  const initialMessages = useMemo(() => INITIAL_MESSAGES[npcId], [npcId]);

  const chat = useChat({
    id: `npc-chat-${npcId}`,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        npcId,
      },
    }),
    initialMessages,
    onError,
    onFinish,
  });

  return {
    ...chat,
    npcConfig,
  };
}

export type { NPCId };
