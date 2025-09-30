'use client';

import { createContext, PropsWithChildren, useState } from 'react';
import { StoreApi } from 'zustand';
import { ChatStore, createChatStore } from '@/stores/chat-store';
import { MockConversation } from '@/lib/mock-data';

// Context to hold the store
export const ChatStoreContext = createContext<StoreApi<ChatStore> | undefined>(undefined);

// Props for initialization
type ChatProviderProps = PropsWithChildren & {
  initialConversations?: MockConversation[];
  initialActiveConversationId?: string | null;
};

// Provider component
export default function ChatProvider({
  children,
  initialConversations = [],
  initialActiveConversationId = null,
}: ChatProviderProps) {
  // Create store once on mount
  const [store] = useState(() => {
    const chatStore = createChatStore(initialConversations);

    // Set initial active conversation if provided
    if (initialActiveConversationId) {
      chatStore.getState().setActiveConversation(initialActiveConversationId);
    }

    return chatStore;
  });

  return (
    <ChatStoreContext.Provider value={store}>
      {children}
    </ChatStoreContext.Provider>
  );
}