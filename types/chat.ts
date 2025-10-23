// Message type for chat functionality
export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

// Conversation type matching database structure
export type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isStarred: boolean;
  isArchived: boolean;
  messageCount: number;
  projectId?: string;
};

// Extended conversation type with messages
export type ConversationWithMessages = Conversation & {
  messages: Message[];
};

// State: What data are we storing?
export type ChatState = {
  // Active conversation ID
  activeConversationId: string | null;

  // All conversations with their messages
  conversations: ConversationWithMessages[];

  // Input state (shared across components)
  input: string;

  // Loading states
  isGenerating: boolean;
  isLoading: boolean;
};

// Actions: How can we modify the state?
export type ChatActions = {
  // Conversation management
  setActiveConversation: (conversationId: string | null) => void;
  createNewConversation: (initialMessage?: string) => string;
  deleteConversation: (conversationId: string) => void;
  archiveConversation: (conversationId: string) => void;
  toggleStarredConversation: (conversationId: string) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;

  // Message management
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: (conversationId: string) => void;

  // Input management
  setInput: (input: string) => void;
  clearInput: () => void;

  // Loading states
  setIsGenerating: (isGenerating: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;

  // Initialization
  initializeConversations: (conversations: Conversation[]) => void;

  // Reset
  resetChat: () => void;
};

// Combined type for the complete store
export type ChatStore = ChatState & ChatActions;
