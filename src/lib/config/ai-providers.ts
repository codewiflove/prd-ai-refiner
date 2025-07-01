import { AIProvider, AIModel } from '@/lib/types/ai';

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        maxTokens: 4096,
        costPer1kTokens: 0.03,
        supportsStreaming: true
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'openai',
        maxTokens: 16384,
        costPer1kTokens: 0.00015,
        supportsStreaming: true
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        maxTokens: 4096,
        costPer1kTokens: 0.002,
        supportsStreaming: true
      }
    ],
    apiKeyRequired: true
  }
];

export const getProvider = (providerId: string): AIProvider | undefined => {
  return AI_PROVIDERS.find(p => p.id === providerId);
};

export const getModel = (modelId: string): AIModel | undefined => {
  for (const provider of AI_PROVIDERS) {
    const model = provider.models.find(m => m.id === modelId);
    if (model) return model;
  }
  return undefined;
};