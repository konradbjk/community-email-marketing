// DEMO MODE: Mock streaming response instead of real AI
// To restore real AI functionality, uncomment the imports and original implementation

// import { convertToModelMessages, streamText, UIMessage } from 'ai';
// import { azure, CLAUDE_SONNET_4 } from '@/lib/ai-providers';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const DEMO_MESSAGE = "Thank you for your message, I am currently in a demo mode, hence no data is being sent or saved";

export async function POST(req: Request) {
  try {
    // Parse request but don't use it (demo mode)
    await req.json();

    // Create a mock streaming response that simulates token-by-token output
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Simulate streaming each character with a delay
        for (let i = 0; i < DEMO_MESSAGE.length; i++) {
          const chunk = DEMO_MESSAGE[i];

          // Format as AI SDK stream event
          const data = `0:${JSON.stringify(chunk)}\n`;
          controller.enqueue(encoder.encode(data));

          // Add delay to simulate typing (20-40ms per character)
          await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 20));
        }

        // Send finish event
        const finishData = `d:{"finishReason":"stop"}\n`;
        controller.enqueue(encoder.encode(finishData));

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
