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
    model: 'gpt-4o',
    temperature: 0.5,
    maxTokens: 4000,
  });

  const generatePRD = useCallback(async (formData: { prdIdea: string }): Promise<string | null> => {
    const prompt = `You are a senior full-stack product designer and engineer. I will give you a product idea, and you will generate a complete Product Requirements Document (PRD) for a fully functional working well prototype mvp app out of the box.

Based on the following product idea, extract and infer the necessary details to fill out this comprehensive PRD structure:

---

🔧 Project Brief:

Name: [Extract/infer project name from the idea]

Description: [Extract the core description from the idea]

Primary Goals:

1. [Infer primary goal based on the idea]
2. [Infer secondary goal]
3. [Infer tertiary goal]
4. [Infer quaternary goal]

🧪 Tech Stack:

Frontend: [Recommend appropriate frontend stack]
Backend: [Recommend appropriate backend stack]
Platform Type: [Infer platform type from idea]
Framework Versions: Latest stable

Use vite react with local storage only, no need for login or signup

If need to use api key, please make admin setting to save & validate api key

🔑 Core Features:

[Feature 1 - Extract/infer from idea]
[Feature 2 - Extract/infer from idea]
[Feature 3 - Extract/infer from idea]
[Feature 4 - Extract/infer from idea]
[Integrations and sync - if applicable]

🧽 User Flows:

1. [User flow 1 based on core functionality]
2. [User flow 2 for secondary actions]
3. [User flow 3 for data management]
4. [User flow 4 for settings/preferences]
5. [User flow 5 for export/sharing]

👤 User & Auth:

Authentication via [Recommend auth method or none if not needed]
OAuth scopes for [Relevant integrations]
Row-level security: [Appropriate RLS policies]

🖼️ UI/UX:

Look & Feel: [Recommend UI style appropriate for the app]
Dark mode, cosmic gradient, glowing edges, motion blur, clean grid

Page Layouts: [List relevant pages for the app]
Key Components: [List key UI components needed]

📃 Database Schema:

[Design appropriate database schema based on the app idea]
users: [User table fields if needed]
[Additional tables based on app requirements]

---

**Product Idea:**
${formData.prdIdea}

**Instructions:**
- Analyze the product idea thoroughly
- Extract explicit requirements and infer missing details logically
- Create a comprehensive, professional PRD
- Use clear markdown formatting with proper headings
- Focus on creating a fully functional MVP prototype
- Ensure all sections are detailed and actionable
- Include technical specifications appropriate for the idea
- Consider user experience and business viability

Generate the complete PRD now:`;

    return await generateResponse(prompt, 'product_manager');
  }, [generateResponse]);

  return {
    generatePRD,
    isLoading,
    error,
  };
};