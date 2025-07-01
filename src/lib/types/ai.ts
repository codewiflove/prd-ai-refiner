export interface AIProvider {
  id: string;
  name: string;
  models: AIModel[];
  apiKeyRequired: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  costPer1kTokens: number;
  supportsStreaming: boolean;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  model: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'content_filter' | 'tool_calls';
}

export interface AIError {
  code: string;
  message: string;
  provider: string;
  retryable: boolean;
}

export type AIPersona = 'designer' | 'engineer' | 'product_manager' | 'user_researcher';

export interface PersonaConfig {
  systemPrompt: string;
  temperature: number;
  preferredModel: string;
}