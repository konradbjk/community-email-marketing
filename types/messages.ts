/**
 * Custom message type definitions
 * These types replace the Vercel AI SDK types for custom backend integration
 */

// Message role types
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

// Chat status types
export type ChatStatus = 'idle' | 'submitted' | 'streaming' | 'error';

// Tool invocation state types
export type ToolInvocationState =
  | 'input-streaming'
  | 'input-available'
  | 'output-available'
  | 'output-error';

// Attachment types
export interface Attachment {
  name: string;
  contentType: string;
  url: string;
  size?: number;
}

// Tool invocation types
export interface ToolInvocation {
  type: string;
  state: ToolInvocationState;
  input: Record<string, unknown>;
  output?: unknown;
  errorText?: string;
}

// Message content part (for multi-modal content)
export interface MessageContentPart {
  type: 'text' | 'image' | 'file';
  text?: string;
  image?: string;
  url?: string;
}

// Main message type
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt?: Date;
  toolInvocations?: ToolInvocation[];
  attachments?: Attachment[];
  parts?: MessageContentPart[];
  metadata?: {
    type?: 'info' | 'error' | 'success';
    retryMessage?: string;
  };
}

// Legacy type alias for backward compatibility with UI components
export type UIMessage = Message;

// Tool UI part type for component props
export type ToolUIPart = ToolInvocation;

// Generated image type
export interface GeneratedImage {
  base64: string;
  uint8Array?: Uint8Array;
  mediaType: string;
  alt?: string;
}

// Legacy type alias for backward compatibility
export type Experimental_GeneratedImage = GeneratedImage;

// Chat request/response types
export interface ChatRequest {
  conversationId?: string;
  message: string;
  attachments?: Attachment[];
}

export interface ChatResponse {
  message: Message;
  conversationId: string;
}

// Streaming message chunk
export interface MessageChunk {
  id: string;
  delta: string;
  done: boolean;
}
