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
        maxTokens: 4096,
        costPer1kTokens: 0.015,
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
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        maxTokens: 8192,
        costPer1kTokens: 0.015,
        supportsStreaming: true
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        maxTokens: 4096,
        costPer1kTokens: 0.0025,
        supportsStreaming: true
      }
    ],
    apiKeyRequired: true
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    models: [
      {
        id: 'llama-3.1-sonar-large-128k-online',
        name: 'Llama 3.1 Sonar Large',
        provider: 'perplexity',
        maxTokens: 4096,
        costPer1kTokens: 0.001,
        supportsStreaming: true
      },
      {
        id: 'llama-3.1-sonar-small-128k-online',
        name: 'Llama 3.1 Sonar Small',
        provider: 'perplexity',
        maxTokens: 4096,
        costPer1kTokens: 0.0002,
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