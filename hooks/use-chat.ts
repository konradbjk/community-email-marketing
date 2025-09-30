import { useContext } from 'react';
import { useStore } from 'zustand';
import { ChatStoreContext } from '@/providers/chat-provider';
import type { ChatStore } from '@/types/chat';

// Base hook with scope validation
export const useChat = <T>(
  selector: (store: ChatStore) => T,
): T => {
  const chatStore = useContext(ChatStoreContext);

  if (!chatStore) {
    throw new Error(
      'useChat must be used within ChatProvider. ' +
      'Make sure the component is wrapped with <ChatProvider>'
    );
  }

  return useStore(chatStore, selector);
};

// Conversation hooks
export const useActiveConversationId = () =>
  useChat((state) => state.activeConversationId);

export const useConversations = () =>
  useChat((state) => state.conversations);

export const useActiveConversation = () =>
  useChat((state) => {
    if (!state.activeConversationId) return null;
    return state.conversations.find(c => c.id === state.activeConversationId) || null;
  });

export const useSetActiveConversation = () =>
  useChat((state) => state.setActiveConversation);

export const useCreateNewConversation = () =>
  useChat((state) => state.createNewConversation);

export const useDeleteConversation = () =>
  useChat((state) => state.deleteConversation);

export const useArchiveConversation = () =>
  useChat((state) => state.archiveConversation);

export const useToggleStarredConversation = () =>
  useChat((state) => state.toggleStarredConversation);

export const useUpdateConversationTitle = () =>
  useChat((state) => state.updateConversationTitle);

// Message hooks - currentMessages is derived from active conversation
export const useCurrentMessages = () =>
  useChat((state) => {
    if (!state.activeConversationId) return [];
    const activeConv = state.conversations.find(c => c.id === state.activeConversationId);
    return activeConv?.messages || [];
  });

export const useAddMessage = () =>
  useChat((state) => state.addMessage);

export const useClearMessages = () =>
  useChat((state) => state.clearMessages);

// Input hooks
export const useInput = () =>
  useChat((state) => state.input);

export const useSetInput = () =>
  useChat((state) => state.setInput);

export const useClearInput = () =>
  useChat((state) => state.clearInput);

// Loading state hooks
export const useIsGenerating = () =>
  useChat((state) => state.isGenerating);

export const useIsLoading = () =>
  useChat((state) => state.isLoading);

export const useSetIsGenerating = () =>
  useChat((state) => state.setIsGenerating);

export const useSetIsLoading = () =>
  useChat((state) => state.setIsLoading);

// Initialization hooks
export const useInitializeConversations = () =>
  useChat((state) => state.initializeConversations);

export const useResetChat = () =>
  useChat((state) => state.resetChat);

// Composite hooks for related functionality
export const useChatActions = () =>
  useChat((state) => ({
    setActiveConversation: state.setActiveConversation,
    createNewConversation: state.createNewConversation,
    deleteConversation: state.deleteConversation,
    archiveConversation: state.archiveConversation,
    toggleStarredConversation: state.toggleStarredConversation,
    updateConversationTitle: state.updateConversationTitle,
  }));

export const useMessageActions = () =>
  useChat((state) => ({
    addMessage: state.addMessage,
    clearMessages: state.clearMessages,
  }));

export const useLoadingStates = () =>
  useChat((state) => ({
    isGenerating: state.isGenerating,
    isLoading: state.isLoading,
    setIsGenerating: state.setIsGenerating,
    setIsLoading: state.setIsLoading,
  }));

// Convenience hook for chat state
export const useChatState = () =>
  useChat((state) => ({
    activeConversationId: state.activeConversationId,
    conversations: state.conversations,
    currentMessages: state.currentMessages,
    isGenerating: state.isGenerating,
    isLoading: state.isLoading,
    input: state.input,
  }));