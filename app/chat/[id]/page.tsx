'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Chat } from '@/components/ui/chat';
import type { Message as ChatMessageType } from '@/components/ui/chat-message';
import {
  useActiveConversationId,
  useInput,
  useSetActiveConversation,
  useSetInput,
} from '@/hooks/use-chat';
import { useChatMessages } from '@/hooks/use-messages';
import { useConversation, useArchiveConversation } from '@/hooks/use-conversations';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MessageSquare, ArrowLeft, ArchiveRestore, Archive } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatIdPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;

  // TanStack Query hooks for server data
  const { data: conversation, isLoading: isLoadingConversation } = useConversation(chatId);
  const archiveConversation = useArchiveConversation();
  const {
    messages,
    isLoadingMessages,
    isSendingMessage,
    isUpdatingMessage,
    sendMessage,
    updateMessage,
  } = useChatMessages(chatId);

  // Zustand hooks for UI state
  const activeConversationId = useActiveConversationId();
  const setActiveConversation = useSetActiveConversation();
  const input = useInput();
  const setInput = useSetInput();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  // Set active conversation when page loads
  useEffect(() => {
    if (chatId && activeConversationId !== chatId) {
      if (conversation) {
        setActiveConversation(chatId);
      } else if (!isLoadingConversation && !conversation) {
        // Conversation not found, redirect to main chat
        router.push('/chat');
      }
    }
    setEditingMessageId(null);
  }, [chatId, conversation, isLoadingConversation, activeConversationId, setActiveConversation, router]);

  const handleUnarchiveConversation = () => {
    if (conversation) {
      archiveConversation(conversation.id, conversation.isArchived);
      toast.success('Conversation unarchived');
    }
  };

  const handleSubmit = async (
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: FileList },
  ) => {
    event?.preventDefault?.();

    if (!conversation) return;

    const trimmedMessage = input.trim();

    if (!trimmedMessage) return;

    // Prevent submission if conversation is archived
    if (conversation.isArchived) {
      toast.error('Cannot send messages in archived conversation');
      return;
    }

    // Handle attachments if present
    if (
      options?.experimental_attachments &&
      options.experimental_attachments.length > 0
    ) {
      // TODO: Upload files and include URLs in request payload
      console.log('Attachments are not yet supported:', options.experimental_attachments);
    }

    if (editingMessageId) {
      updateMessage(
        {
          conversationId: chatId,
          messageId: editingMessageId,
          message: trimmedMessage,
          regenerate: true,
        },
        {
          onSuccess: () => {
            setEditingMessageId(null);
            setInput('');
          },
          onError: () => {
            setInput(trimmedMessage);
          },
        },
      );
      return;
    }

    setInput('');

    sendMessage(
      {
        conversationId: chatId,
        message: trimmedMessage,
      },
      {
        onError: () => {
          setInput(trimmedMessage);
        },
      },
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleRateResponse = (
    messageId: string,
    rating: 'thumbs-up' | 'thumbs-down',
  ) => {
    // TODO: Implement feedback handling
    console.log('Rating:', messageId, rating);
  };

  const handleStop = () => {
    // TODO: Implement cancellation when streaming support is added
    console.log('Stop generation requested');
  };

  const handleAppend = (message: { role: 'user'; content: string }) => {
    if (!conversation || conversation.isArchived) {
      toast.error('Cannot send messages in archived conversation');
      return;
    }

    setEditingMessageId(null);
    sendMessage({
      conversationId: chatId,
      message: message.content,
    });
  };

  const handleEditMessage = (message: ChatMessageType) => {
    if (!conversation || conversation.isArchived) {
      toast.error('Cannot edit messages in archived conversation');
      return;
    }

    if (message.role !== 'user') return;

    setEditingMessageId(message.id);
    setInput(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setInput('');
  };

  const handleRetryMessage = (message: ChatMessageType) => {
    if (!conversation || conversation.isArchived) {
      toast.error('Cannot send messages in archived conversation');
      return;
    }

    const lastUserMessage = [...messages].reverse().find((msg) => msg.role === 'user');

    if (!lastUserMessage) {
      toast.error('Unable to retry the message.');
      return;
    }

    setEditingMessageId(null);
    updateMessage({
      conversationId: chatId,
      messageId: lastUserMessage.id,
      message: lastUserMessage.content,
      regenerate: true,
    });
  };

  // Mock suggestions for empty conversations
  const suggestions =
    !editingMessageId && !isLoadingMessages && messages.length === 0
      ? [
          'For a selected brand and Business Unit (BU), what proportion of total interactions (field and non-field) are driven by field teams?',
          'Which types of emails (Commercial, Medical, Promotional, Event-related) generate the highest open rates?',
          'What percentage of HCPs have opted in for communication this quarter?',
          'How have the behavioral segments changed over the past year?',
        ]
      : undefined;

  const handleTranscribeAudio = async (blob: Blob): Promise<string> => {
    // TODO: Implement actual audio transcription
    console.log('Transcribing audio blob:', blob);
    return 'Mock transcription result';
  };

  if (isLoadingConversation || isLoadingMessages) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center space-y-4'>
          <MessageSquare className='h-12 w-12 text-muted-foreground mx-auto' />
          <h2 className='text-xl font-semibold'>Loading conversation...</h2>
        </div>
      </div>
    );
  }

  const chatMessages: ChatMessageType[] = messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt,
    experimental_attachments: msg.attachments?.map((attachment) => ({
      name: attachment.name,
      contentType: attachment.contentType,
      url: attachment.url,
    })),
    metadata: msg.metadata,
  }));

  if (!conversation) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center space-y-4'>
          <MessageSquare className='h-12 w-12 text-muted-foreground mx-auto' />
          <h2 className='text-xl font-semibold'>Conversation not found</h2>
          <p className='text-muted-foreground'>
            The conversation you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push('/chat')} variant='outline'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header with conversation title */}
      <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
        <SidebarTrigger className='-ml-1' />
        <div className='flex items-center gap-2 flex-1'>
          <h1 className='text-lg font-semibold'>{conversation.title}</h1>
          {conversation.isArchived && (
            <span className='text-xs text-muted-foreground bg-muted px-2 py-1 rounded'>
              Archived
            </span>
          )}
        </div>
        {conversation.isArchived && (
          <Button
            variant='outline'
            size='sm'
            className='gap-2'
            onClick={handleUnarchiveConversation}
          >
            <ArchiveRestore className='h-4 w-4' />
            Unarchive
          </Button>
        )}
      </header>

      {/* Archived banner */}
      {conversation.isArchived && (
        <div className='px-8 pt-4'>
          <Alert>
            <Archive className='h-4 w-4' />
            <AlertTitle>This conversation is archived</AlertTitle>
            <AlertDescription>
              You cannot send messages in an archived conversation. Unarchive it to continue chatting.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Chat area - proper layout with fixed input at bottom */}
      <div className='flex-1 flex flex-col overflow-hidden px-8 py-4'>
        {editingMessageId && (
          <div className='mb-4'>
            <Alert>
              <AlertTitle>Editing previous message</AlertTitle>
              <AlertDescription>
                Update your text below and press send to try again with the assistant.
              </AlertDescription>
              <div className='mt-4'>
                <Button variant='outline' size='sm' onClick={handleCancelEdit}>
                  Cancel edit
                </Button>
              </div>
            </Alert>
          </div>
        )}
        {suggestions ? (
          <Chat
            messages={chatMessages}
            handleSubmit={handleSubmit}
            input={input}
            handleInputChange={handleInputChange}
            isGenerating={isSendingMessage || isUpdatingMessage}
            stop={handleStop}
            onRateResponse={handleRateResponse}
            append={handleAppend}
            suggestions={suggestions}
            transcribeAudio={handleTranscribeAudio}
            className='flex-1'
            onRetry={handleRetryMessage}
            onEdit={handleEditMessage}
          />
        ) : (
          <Chat
            messages={chatMessages}
            handleSubmit={handleSubmit}
            input={input}
            handleInputChange={handleInputChange}
            isGenerating={isSendingMessage || isUpdatingMessage}
            stop={handleStop}
            onRateResponse={handleRateResponse}
            transcribeAudio={handleTranscribeAudio}
            className='flex-1'
            onRetry={handleRetryMessage}
            onEdit={handleEditMessage}
          />
        )}
      </div>
    </>
  );
}
