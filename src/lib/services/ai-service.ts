import { AIRequest, AIResponse, AIError, AIMessage } from '@/lib/types/ai';
import { getModel } from '@/lib/config/ai-providers';
import { OpenAIService } from './providers/openai-service';

export class AIService {
  private openaiService: OpenAIService;
  private rateLimitTracker: Map<string, number[]> = new Map();

  constructor() {
    this.openaiService = new OpenAIService();
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      // Validate request
      this.validateRequest(request);
      
      // Check rate limits
      await this.checkRateLimit(request.model);
      
      // Get model info
      const model = getModel(request.model);
      if (!model) {
        throw this.createError('MODEL_NOT_FOUND', `Model ${request.model} not found`, request.model);
      }

      // Route to OpenAI service
      if (model.provider === 'openai') {
        return await this.openaiService.generateResponse(request);
      } else {
        throw this.createError('PROVIDER_NOT_SUPPORTED', `Provider ${model.provider} not supported`, request.model);
      }
    } catch (error: any) {
      if (error.code && error.provider) {
        throw error;
      }
      throw this.createError('UNKNOWN_ERROR', error.message || 'Unknown error occurred', request.model);
    }
  }

  async generateStreamResponse(request: AIRequest, onChunk: (chunk: string) => void): Promise<void> {
    const model = getModel(request.model);
    if (!model) {
      throw this.createError('MODEL_NOT_FOUND', `Model ${request.model} not found`, request.model);
    }

    if (!model.supportsStreaming) {
      throw this.createError('STREAMING_NOT_SUPPORTED', `Model ${request.model} does not support streaming`, request.model);
    }

    if (model.provider === 'openai') {
      return await this.openaiService.generateStreamResponse(request, onChunk);
    } else {
      throw this.createError('PROVIDER_NOT_SUPPORTED', `Provider ${model.provider} not supported`, request.model);
    }
  }

  private validateRequest(request: AIRequest): void {
    if (!request.model) {
      throw this.createError('MISSING_MODEL', 'Model is required', '');
    }
    if (!request.messages || request.messages.length === 0) {
      throw this.createError('MISSING_MESSAGES', 'Messages are required', request.model);
    }
    if (request.temperature !== undefined && (request.temperature < 0 || request.temperature > 2)) {
      throw this.createError('INVALID_TEMPERATURE', 'Temperature must be between 0 and 2', request.model);
    }
  }

  private async checkRateLimit(model: string): Promise<void> {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 60; // 60 requests per minute

    const key = `${model}`;
    const requests = this.rateLimitTracker.get(key) || [];
    
    // Remove old requests outside the window
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      throw this.createError('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded. Please try again later.', model);
    }
    
    // Add current request
    recentRequests.push(now);
    this.rateLimitTracker.set(key, recentRequests);
  }

  private createError(code: string, message: string, provider: string): AIError {
    return {
      code,
      message,
      provider,
      retryable: ['RATE_LIMIT_EXCEEDED', 'NETWORK_ERROR', 'TEMPORARY_ERROR'].includes(code)
    };
  }

  // Helper method to create messages for different use cases
  static createMessages(systemPrompt: string, userMessage: string, context?: string): AIMessage[] {
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt }
    ];

    if (context) {
      messages.push({
        role: 'system',
        content: `Context: ${context}`
      });
    }

    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }

  // API keys are now managed securely via Supabase Edge Function secrets
  // No client-side API key management needed
}