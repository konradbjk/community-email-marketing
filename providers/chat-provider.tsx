'use client';

import { createContext, PropsWithChildren, useState } from 'react';
import { StoreApi } from 'zustand';
import { createChatStore } from '@/stores/chat-store';
import type { ChatStore } from '@/stores/chat-store';

// Context to hold the store
export const ChatStoreContext = createContext<StoreApi<ChatStore> | undefined>(undefined);

// Provider component - now only manages UI state
export default function ChatProvider({ children }: PropsWithChildren) {
  // Create store once on mount - no initial data needed
  const [store] = useState(() => createChatStore());

  return (
    <ChatStoreContext.Provider value={store}>
      {children}
    </ChatStoreContext.Provider>
  );
}
