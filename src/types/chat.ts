/**
 * Chat-related types
 */

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  /** For assistant messages, the generated/edited HTML */
  html?: string;
}

export interface ChatState {
  messages: ChatMessage[];
}

