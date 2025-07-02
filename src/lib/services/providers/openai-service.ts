import { AIRequest, AIResponse } from '@/lib/types/ai';
import { supabase } from '@/integrations/supabase/client';

export class OpenAIService {
  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const { data, error } = await supabase.functions.invoke('chat-completion', {
      body: {
        model: request.model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        maxTokens: request.maxTokens || 1000,
        stream: false,
      },
    });

    if (error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }

    return data;
  }

  async generateStreamResponse(request: AIRequest, onChunk: (chunk: string) => void): Promise<void> {
    // Note: Streaming through edge functions requires a different approach
    // For now, we'll use the non-streaming endpoint and return the full response
    const response = await this.generateResponse(request);
    onChunk(response.content);
  }
}