'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Chat } from '@/components/ui/chat';
import {
  useActiveConversation,
  useConversations,
  useCurrentMessages,
  useInput,
  useIsGenerating,
  useSetActiveConversation,
  useAddMessage,
  useSetInput,
  useSetIsGenerating,
} from '@/hooks/use-chat';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowLeft } from 'lucide-react';

export default function ChatIdPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;

  const activeConversation = useActiveConversation();
  const conversations = useConversations();
  const messages = useCurrentMessages();
  const input = useInput();
  const isGenerating = useIsGenerating();
  const setActiveConversation = useSetActiveConversation();
  const addMessage = useAddMessage();
  const setInput = useSetInput();
  const setIsGenerating = useSetIsGenerating();

  // Set active conversation when page loads
  useEffect(() => {
    if (chatId && (!activeConversation || activeConversation.id !== chatId)) {
      const conversation = conversations.find((c: any) => c.id === chatId);
      if (conversation) {
        setActiveConversation(conversation.id);
      } else {
        // Conversation not found, redirect to main chat
        router.push('/chat');
      }
    }
  }, [
    chatId,
    activeConversation,
    conversations,
    setActiveConversation,
    router,
  ]);

  const handleConversationSelect = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  const handleProjectSelect = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleNewChat = () => {
    router.push('/chat');
  };

  const handleSubmit = async (
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: FileList },
  ) => {
    event?.preventDefault?.();
    if (!input.trim() || !activeConversation) return;

    const userMessageData = {
      role: 'user' as const,
      content: input.trim(),
    };

    // Handle attachments if present
    if (
      options?.experimental_attachments &&
      options.experimental_attachments.length > 0
    ) {
      // TODO: Handle file attachments
      console.log('Attachments:', options.experimental_attachments);
    }

    addMessage(activeConversation.id, userMessageData);
    setInput('');
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessageData = {
        role: 'assistant' as const,
        content: `I understand you said: "${userMessageData.content}". This is a mock response for demonstration purposes. In the actual implementation, this would connect to your backend AI service.`,
      };
      addMessage(activeConversation.id, aiMessageData);
      setIsGenerating(false);
    }, 1000);
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
    setIsGenerating(false);
  };

  const handleAppend = (message: { role: 'user'; content: string }) => {
    if (!activeConversation) return;
    addMessage(activeConversation.id, message);
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessageData = {
        role: 'assistant' as const,
        content: `I understand you said: "${message.content}". This is a mock response for demonstration purposes.`,
      };
      addMessage(activeConversation.id, aiMessageData);
      setIsGenerating(false);
    }, 1000);
  };

  // Mock suggestions for empty conversations
  const suggestions =
    messages.length === 0
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

  if (!activeConversation) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center space-y-4'>
          <MessageSquare className='h-12 w-12 text-muted-foreground mx-auto' />
          <h2 className='text-xl font-semibold'>Loading conversation...</h2>
          <p className='text-muted-foreground'>
            If this persists, the conversation may not exist.
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
        <div className='flex items-center gap-2'>
          <h1 className='text-lg font-semibold'>{activeConversation.title}</h1>
        </div>
      </header>

      {/* Chat area - proper layout with fixed input at bottom */}
      <div className='flex-1 flex flex-col overflow-hidden px-8 py-4'>
        {suggestions ? (
          <Chat
            messages={messages.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp,
            }))}
            handleSubmit={handleSubmit}
            input={input}
            handleInputChange={handleInputChange}
            isGenerating={isGenerating}
            stop={handleStop}
            onRateResponse={handleRateResponse}
            append={handleAppend}
            suggestions={suggestions}
            transcribeAudio={handleTranscribeAudio}
            className='flex-1'
          />
        ) : (
          <Chat
            messages={messages.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp,
            }))}
            handleSubmit={handleSubmit}
            input={input}
            handleInputChange={handleInputChange}
            isGenerating={isGenerating}
            stop={handleStop}
            onRateResponse={handleRateResponse}
            transcribeAudio={handleTranscribeAudio}
            className='flex-1'
          />
        )}
      </div>
    </>
  );
}
