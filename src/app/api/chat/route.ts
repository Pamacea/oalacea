import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';

import { TECH_PRIEST_CONFIG } from '@/core/3d/npc/TechPriestGuide';
import { ART_CURATOR_CONFIG } from '@/core/3d/npc/ArtCuratorGuide';
import { getPosts } from '@/actions/blog';

const NPC_CONFIGS = {
  'tech-priest-guide': TECH_PRIEST_CONFIG,
  'art-curator-guide': ART_CURATOR_CONFIG,
} as const;

type NPCId = keyof typeof NPC_CONFIGS;

const getContextString = async (npcId: NPCId) => {
  const posts = await getPosts({ published: true, limit: 10 });

  const projectsContext = npcId === 'tech-priest-guide'
    ? `
AVAILABLE PROJECTS:
The portfolio includes various technical projects including:
- Web applications built with Next.js, React, TypeScript
- Backend systems using Node.js, PostgreSQL, Prisma
- 3D experiences with Three.js and React Three Fiber
- Admin dashboards and content management systems
`
    : `
CREATIVE PROJECTS:
The portfolio features creative work including:
- UI/UX design projects
- 3D art and visualizations
- Street art inspired aesthetics
- Interactive digital experiences
`;

  const blogContext = posts.posts.length > 0
    ? `
RECENT BLOG POSTS:
${posts.posts.slice(0, 5).map(p => `- ${p.title}: ${p.excerpt || 'Technical insights'}`).join('\n')}
`
    : '';

  return `${projectsContext}\n${blogContext}`;
};

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, npcId }: { messages: UIMessage[]; npcId: NPCId } = await req.json();

    const npcConfig = NPC_CONFIGS[npcId];
    if (!npcConfig) {
      return new Response('Invalid NPC ID', { status: 400 });
    }

    const contextString = await getContextString(npcId);

    const systemPrompt = `${npcConfig.systemPrompt}

${contextString}

Remember: Keep responses concise (2-3 sentences maximum). You are speaking to a visitor exploring the portfolio.`;

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      temperature: 0.8,
    });

    return result.toUIMessageStreamResponse({
      onError: error => {
        console.error('AI Chat error:', error);
        if (error == null) return 'An error occurred.';
        if (typeof error === 'string') return error;
        if (error instanceof Error) return error.message;
        return JSON.stringify(error);
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
