import { useContext } from 'react';
import { useStore } from 'zustand';
import { ChatStoreContext } from '@/providers/chat-provider';
import type { ChatStore } from '@/stores/chat-store';

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

// UI State Hooks - Active Conversation Selection
export const useActiveConversationId = () =>
  useChat((state) => state.activeConversationId);

export const useSetActiveConversation = () =>
  useChat((state) => state.setActiveConversation);

// Input Hooks
export const useInput = () =>
  useChat((state) => state.input);

export const useSetInput = () =>
  useChat((state) => state.setInput);

export const useClearInput = () =>
  useChat((state) => state.clearInput);

// Loading State Hooks
export const useIsGenerating = () =>
  useChat((state) => state.isGenerating);

export const useIsLoading = () =>
  useChat((state) => state.isLoading);

export const useSetIsGenerating = () =>
  useChat((state) => state.setIsGenerating);

export const useSetIsLoading = () =>
  useChat((state) => state.setIsLoading);

// Reset Hook
export const useResetChatUi = () =>
  useChat((state) => state.resetChatUi);

// Composite hooks for related functionality
export const useLoadingStates = () =>
  useChat((state) => ({
    isGenerating: state.isGenerating,
    isLoading: state.isLoading,
    setIsGenerating: state.setIsGenerating,
    setIsLoading: state.setIsLoading,
  }));

// Convenience hook for chat UI state
export const useChatUiState = () =>
  useChat((state) => ({
    activeConversationId: state.activeConversationId,
    isGenerating: state.isGenerating,
    isLoading: state.isLoading,
    input: state.input,
  }));
