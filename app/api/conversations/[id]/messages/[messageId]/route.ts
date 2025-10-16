import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

import { getDataSource } from '@/database/data-source';
import { Conversation } from '@/database/entities/conversation.entity';
import { Message } from '@/database/entities/message.entity';
import { getUserFromHeaders } from '@/lib/api-utils';
import { getEnvConfig } from '@/lib/env-validation';

const ENV = getEnvConfig();
const SYSTEM_MESSAGE =
  'You are talking with a merck employee over email campaigns data';

interface ChatCompletionRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
  }>;
  model: string;
  user: {
    name: string;
    role: string;
    department: string;
    id: string;
  };
}

interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
      tool_calls?: Array<{
        id: string;
        type: string;
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface PatchBody {
  message?: unknown;
  regenerate?: boolean;
}

const parseToolCallArguments = (args: string | undefined) => {
  if (!args) return null;

  try {
    return JSON.parse(args) as Record<string, unknown>;
  } catch {
    return { raw: args };
  }
};

const formatMessageResponse = (message: Message) => ({
  id: message.id,
  role: message.role,
  content: message.content,
  createdAt: message.created_at.toISOString(),
  attachments: message.attachments,
  toolInvocations: message.tool_invocations,
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> },
) {
  const user = getUserFromHeaders(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: conversationId, messageId } = await params;

  let body: PatchBody;

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body', details: (error as Error).message },
      { status: 400 },
    );
  }

  const { message, regenerate = false } = body;

  if (typeof message !== 'string' || !message.trim()) {
    return NextResponse.json(
      { error: 'Message content is required' },
      { status: 400 },
    );
  }

  try {
    const dataSource = await getDataSource();
    const conversationRepository = dataSource.getRepository(Conversation);
    const messageRepository = dataSource.getRepository(Message);

    const conversation = await conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('conversation.id = :id', { id: conversationId })
      .andWhere('user.merck_id = :merckId', { merckId: user.merck_id })
      .getOne();

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 },
      );
    }

    if (conversation.is_archived) {
      return NextResponse.json(
        { error: 'Cannot edit messages in archived conversation' },
        { status: 400 },
      );
    }

    const userContext = {
      id: conversation.user?.merck_id ?? user.merck_id,
      name:
        [conversation.user?.name, conversation.user?.surname]
          .filter(Boolean)
          .join(' ')
          .trim() ||
        [user.name, user.surname].filter(Boolean).join(' ').trim() ||
        user.email,
      role: conversation.user?.profile?.role ?? 'Unknown',
      department: conversation.user?.profile?.department ?? 'Unknown',
    };

    const userMessage = await messageRepository
      .createQueryBuilder('message')
      .where('message.id = :messageId', { messageId })
      .andWhere('message.conversation_id = :conversationId', {
        conversationId,
      })
      .getOne();

    if (!userMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 },
      );
    }

    if (userMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Only user messages can be edited' },
        { status: 400 },
      );
    }

    userMessage.content = message.trim();
    await messageRepository.save(userMessage);

    if (!regenerate) {
      conversation.updated_at = userMessage.created_at ?? new Date();
      await conversationRepository.save(conversation);

      return NextResponse.json({
        userMessage: formatMessageResponse(userMessage),
        aiMessage: null,
      });
    }

    try {
      const messageHistory = await messageRepository.find({
        where: { conversation_id: conversationId },
        order: { created_at: 'ASC' },
      });

      const backendRequest: ChatCompletionRequest = {
        messages: [
          {
            role: 'system',
            content: SYSTEM_MESSAGE,
          },
          ...messageHistory.map((item) => ({
            role: item.role,
            content: item.content,
          })),
        ],
        model: ENV.BACKEND_API_MODEL,
        user: userContext,
      };

      const pythonResponse = await fetch(
        `${ENV.BACKEND_API_URL}/v1/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(backendRequest),
          signal: AbortSignal.timeout(ENV.BACKEND_API_TIMEOUT),
        },
      );

      if (!pythonResponse.ok) {
        throw new Error(
          `Python backend error: ${pythonResponse.status} ${pythonResponse.statusText}`,
        );
      }

      const completion =
        (await pythonResponse.json()) as ChatCompletionResponse;
      const choice = completion.choices[0];

      if (!choice?.message?.content) {
        throw new Error('No message content in Python backend response');
      }

      const toolInvocations =
        choice.message.tool_calls?.map((toolCall) => ({
          type: toolCall.type,
          state: 'output-available' as const,
          input: parseToolCallArguments(toolCall.function?.arguments),
          output: null,
        })) ?? null;

      const aiMessage = messageRepository.create({
        id: `msg_${randomUUID()}`,
        conversation_id: conversationId,
        role: 'assistant',
        content: choice.message.content,
        tool_invocations: toolInvocations,
      });

      await messageRepository.save(aiMessage);

      conversation.updated_at = aiMessage.created_at ?? new Date();
      await conversationRepository.save(conversation);

      return NextResponse.json({
        userMessage: formatMessageResponse(userMessage),
        aiMessage: formatMessageResponse(aiMessage),
      });
    } catch (error) {
      console.error('Error regenerating message:', error);

      conversation.updated_at = userMessage.created_at ?? new Date();
      await conversationRepository.save(conversation);

      if (error instanceof Error && error.name === 'TimeoutError') {
        return NextResponse.json({
          userMessage: formatMessageResponse(userMessage),
          aiMessage: null,
          error: 'Request timeout',
          details: 'Python backend did not respond in time',
        });
      }

      const details =
        error instanceof Error ? error.message : 'Unknown error occurred';

      return NextResponse.json({
        userMessage: formatMessageResponse(userMessage),
        aiMessage: null,
        error: 'The assistant could not respond. Please try again.',
        details,
      });
    }
  } catch (error) {
    console.error('Error updating message:', error);

    return NextResponse.json(
      {
        error:
          'Failed to update message. Please try again or contact support if the issue persists.',
      },
      { status: 500 },
    );
  }
}
