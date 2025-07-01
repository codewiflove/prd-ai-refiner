import { useState, useCallback } from 'react';
import { AIService } from '@/lib/services/ai-service';
import { AIRequest, AIResponse, AIPersona } from '@/lib/types/ai';
import { AI_PERSONAS } from '@/lib/config/personas';
import { useToast } from '@/hooks/use-toast';

interface UseAIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export const useAI = (options: UseAIOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const aiService = new AIService();

  const generateResponse = useCallback(async (
    message: string,
    persona?: AIPersona,
    context?: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const personaConfig = persona ? AI_PERSONAS[persona] : null;
      const model = options.model || personaConfig?.preferredModel || 'gpt-4o-mini';
      const temperature = options.temperature || personaConfig?.temperature || 0.7;

      const systemPrompt = personaConfig?.systemPrompt || 'You are a helpful AI assistant.';
      const messages = AIService.createMessages(systemPrompt, message, context);

      const request: AIRequest = {
        model,
        messages,
        temperature,
        maxTokens: options.maxTokens || 1000,
      };

      const response = await aiService.generateResponse(request);
      return response.content;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate AI response';
      setError(errorMessage);
      
      toast({
        title: 'AI Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [options, toast]);

  const generateStreamResponse = useCallback(async (
    message: string,
    onChunk: (chunk: string) => void,
    persona?: AIPersona,
    context?: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const personaConfig = persona ? AI_PERSONAS[persona] : null;
      const model = options.model || personaConfig?.preferredModel || 'gpt-4o-mini';
      const temperature = options.temperature || personaConfig?.temperature || 0.7;

      const systemPrompt = personaConfig?.systemPrompt || 'You are a helpful AI assistant.';
      const messages = AIService.createMessages(systemPrompt, message, context);

      const request: AIRequest = {
        model,
        messages,
        temperature,
        maxTokens: options.maxTokens || 1000,
        stream: true,
      };

      await aiService.generateStreamResponse(request, onChunk);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate AI response';
      setError(errorMessage);
      
      toast({
        title: 'AI Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [options, toast]);

  return {
    generateResponse,
    generateStreamResponse,
    isLoading,
    error,
  };
};

// Hook for generating PRDs specifically
export const usePRDGeneration = () => {
  const { generateResponse, isLoading, error } = useAI({
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.5,
    maxTokens: 4000,
  });

  const generatePRD = useCallback(async (formData: any): Promise<string | null> => {
    const prompt = `Generate a comprehensive Product Requirements Document (PRD) based on the following information:

App Name: ${formData.appName}
Description: ${formData.description}
Target Audience: ${formData.targetAudience || 'Not specified'}
Platform: ${formData.platform || 'Not specified'}
Primary Goals: ${formData.primaryGoals || 'Not specified'}
Key Features: ${formData.keyFeatures || 'Not specified'}
Tech Stack: ${formData.techStack || 'Not specified'}
Timeline: ${formData.timeline || 'Not specified'}

Please create a professional, detailed PRD that includes:
1. Executive Summary
2. Product Overview
3. Market Analysis & Target Audience
4. Product Goals & Success Metrics
5. Feature Requirements & User Stories
6. Technical Architecture & Requirements
7. User Experience & Interface Design
8. Implementation Timeline & Milestones
9. Risk Assessment & Mitigation
10. Success Metrics & KPIs

Format the response in clear markdown with proper headings and sections.`;

    return await generateResponse(prompt, 'product_manager');
  }, [generateResponse]);

  return {
    generatePRD,
    isLoading,
    error,
  };
};