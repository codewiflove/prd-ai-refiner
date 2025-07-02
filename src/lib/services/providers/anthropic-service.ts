import { AIRequest, AIResponse } from '@/lib/types/ai';

export class AnthropicService {
  async generateResponse(request: AIRequest): Promise<AIResponse> {
    throw new Error('Anthropic service not implemented with edge functions yet');
  }

  async generateStreamResponse(request: AIRequest, onChunk: (chunk: string) => void): Promise<void> {
    throw new Error('Anthropic service not implemented with edge functions yet');
  }
}