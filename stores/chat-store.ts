import { createStore } from 'zustand/vanilla';
import { CHAT_DEFAULTS, CONVERSATION_DEFAULTS } from '@/consts/defaults';
import type {
  ChatStore,
  Message,
  ConversationWithMessages,
} from '@/types/chat';
import type { MockConversation } from '@/lib/mock-data';

// Store factory function
export const createChatStore = (
  initialConversations: MockConversation[] = [],
) => {
  return createStore<ChatStore>()((set, get) => ({
    // Initial state
    activeConversationId: null,
    conversations: initialConversations.map((conv) => ({
      ...conv,
      messages: [],
    })),
    input: '',
    isGenerating: CHAT_DEFAULTS.isGenerating,
    isLoading: CHAT_DEFAULTS.isLoading,

    // Conversation management actions
    setActiveConversation: (conversationId) => {
      set({ activeConversationId: conversationId });
    },

    createNewConversation: (initialMessage) => {
      const newId = `conv-${Date.now()}`;
      const newConversation: ConversationWithMessages = {
        id: newId,
        title: CONVERSATION_DEFAULTS.title,
        lastMessage: initialMessage || '',
        timestamp: new Date(),
        isStarred: CONVERSATION_DEFAULTS.isStarred,
        isArchived: false,
        messageCount: initialMessage ? 1 : 0,
        messages: initialMessage
          ? [
              {
                id: `msg-${Date.now()}`,
                role: 'user',
                content: initialMessage,
                timestamp: new Date(),
              },
            ]
          : [],
      };

      set((state) => ({
        conversations: [newConversation, ...state.conversations],
        activeConversationId: newId,
      }));

      return newId;
    },

    deleteConversation: (conversationId) => {
      set((state) => {
        const filteredConversations = state.conversations.filter(
          (c) => c.id !== conversationId,
        );
        const newActiveId =
          state.activeConversationId === conversationId
            ? null
            : state.activeConversationId;

        return {
          conversations: filteredConversations,
          activeConversationId: newActiveId,
        };
      });
    },

    archiveConversation: (conversationId) => {
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? { ...conv, isArchived: !conv.isArchived }
            : conv,
        ),
      }));
    },

    toggleStarredConversation: (conversationId) => {
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? { ...conv, isStarred: !conv.isStarred }
            : conv,
        ),
      }));
    },

    updateConversationTitle: (conversationId, title) => {
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, title } : conv,
        ),
      }));
    },

    // Message management actions
    addMessage: (conversationId, messageData) => {
      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        ...messageData,
      };

      set((state) => ({
        conversations: state.conversations.map((conv) => {
          if (conv.id === conversationId) {
            const updatedMessages = [...conv.messages, newMessage];
            return {
              ...conv,
              messages: updatedMessages,
              lastMessage: newMessage.content,
              messageCount: updatedMessages.length,
              timestamp: newMessage.timestamp,
            };
          }
          return conv;
        }),
      }));
    },

    clearMessages: (conversationId) => {
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: [],
                messageCount: 0,
                lastMessage: '',
              }
            : conv,
        ),
      }));
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

    // Initialization action
    initializeConversations: (conversations) => {
      set({
        conversations: conversations.map((conv) => ({
          ...conv,
          messages: [],
        })),
        activeConversationId: null,
      });
    },

    // Reset action
    resetChat: () => {
      set({
        activeConversationId: null,
        conversations: [],
        isGenerating: CHAT_DEFAULTS.isGenerating,
        isLoading: CHAT_DEFAULTS.isLoading,
      });
    },
  }));
};
