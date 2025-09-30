// Chat defaults
export const CHAT_DEFAULTS = {
  isGenerating: false,
  isLoading: false,
  messagePageSize: 50,
};

// Conversation defaults
export const CONVERSATION_DEFAULTS = {
  title: "New Chat",
  messageCount: 0,
  isStarred: false,
};

// Message defaults
export const MESSAGE_DEFAULTS = {
  role: "user" as const,
  timestamp: new Date(),
};