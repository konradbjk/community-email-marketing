import { createStore } from 'zustand/vanilla';
import { CHAT_DEFAULTS } from '@/consts/defaults';

// UI-only state for chat interface
export type ChatUiState = {
  // Active conversation selection (UI state)
  activeConversationId: string | null;

  // Composer input state
  input: string;

  // Loading states
  isGenerating: boolean;
  isLoading: boolean;
};

// UI-only actions
export type ChatUiActions = {
  // Conversation selection
  setActiveConversation: (conversationId: string | null) => void;

  // Input management
  setInput: (input: string) => void;
  clearInput: () => void;

  // Loading states
  setIsGenerating: (isGenerating: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;

  // Reset
  resetChatUi: () => void;
};

// Combined type for the complete store
export type ChatStore = ChatUiState & ChatUiActions;

// Store factory function - now only manages UI state
export const createChatStore = () => {
  return createStore<ChatStore>()((set) => ({
    // Initial state - UI only
    activeConversationId: null,
    input: '',
    isGenerating: CHAT_DEFAULTS.isGenerating,
    isLoading: CHAT_DEFAULTS.isLoading,

    // UI Actions
    setActiveConversation: (conversationId) => {
      set({ activeConversationId: conversationId });
    },

    // Input management actions
    setInput: (input) => {
      set({ input });
    },

    clearInput: () => {
      set({ input: '' });
    },

    // Loading state actions
    setIsGenerating: (isGenerating) => {
      set({ isGenerating });
    },

    setIsLoading: (isLoading) => {
      set({ isLoading });
    },

    // Reset action - resets UI state only
    resetChatUi: () => {
      set({
        activeConversationId: null,
        input: '',
        isGenerating: CHAT_DEFAULTS.isGenerating,
        isLoading: CHAT_DEFAULTS.isLoading,
      });
    },
  }));
};
