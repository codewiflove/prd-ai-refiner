import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AIService } from "@/lib/services/ai-service";
import { AI_PROVIDERS } from "@/lib/config/ai-providers";
import { Key, Eye, EyeOff, Save, Trash2, AlertTriangle } from "lucide-react";

export const APIKeyManager = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [tempKeys, setTempKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load existing API keys
    const keys: Record<string, string> = {};
    AI_PROVIDERS.forEach(provider => {
      const key = AIService.getApiKey(provider.id);
      if (key) {
        keys[provider.id] = key;
      }
    });
    setApiKeys(keys);
    setTempKeys(keys);
  }, []);

  const handleSaveKey = (providerId: string) => {
    const key = tempKeys[providerId];
    if (!key || key.trim() === '') {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }

    AIService.setApiKey(providerId, key.trim());
    setApiKeys(prev => ({ ...prev, [providerId]: key.trim() }));
    
    toast({
      title: "API Key Saved",
      description: `${AI_PROVIDERS.find(p => p.id === providerId)?.name} API key saved successfully`
    });
  };

  const handleRemoveKey = (providerId: string) => {
    AIService.removeApiKey(providerId);
    setApiKeys(prev => {
      const newKeys = { ...prev };
      delete newKeys[providerId];
      return newKeys;
    });
    setTempKeys(prev => {
      const newKeys = { ...prev };
      delete newKeys[providerId];
      return newKeys;
    });
    
    toast({
      title: "API Key Removed",
      description: `${AI_PROVIDERS.find(p => p.id === providerId)?.name} API key removed`
    });
  };

  const toggleKeyVisibility = (providerId: string) => {
    setShowKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const maskKey = (key: string): string => {
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Key className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-xl font-semibold">API Key Management</h3>
            <p className="text-sm text-muted-foreground">
              Configure API keys for AI providers to enable enhanced PRD generation
            </p>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> You need to configure at least one AI provider's API key to generate real PRDs. API keys are stored locally in your browser for security.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="openai" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {AI_PROVIDERS.map(provider => (
              <TabsTrigger key={provider.id} value={provider.id} className="flex items-center gap-2">
                {provider.name}
                {apiKeys[provider.id] && (
                  <Badge variant="outline" className="text-xs">
                    Connected
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {AI_PROVIDERS.map(provider => (
            <TabsContent key={provider.id} value={provider.id} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{provider.name} Configuration</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {provider.id === 'openai' && 'Get your API key from https://platform.openai.com/api-keys (Recommended for general use)'}
                    {provider.id === 'anthropic' && 'Get your API key from https://console.anthropic.com/ (Best for detailed PRDs)'}
                    {provider.id === 'perplexity' && 'Get your API key from https://www.perplexity.ai/settings/api (Good for research-based PRDs)'}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor={`${provider.id}-key`}>API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={`${provider.id}-key`}
                        type={showKeys[provider.id] ? "text" : "password"}
                        placeholder="Enter your API key..."
                        value={tempKeys[provider.id] || ''}
                        onChange={(e) => setTempKeys(prev => ({ 
                          ...prev, 
                          [provider.id]: e.target.value 
                        }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                        onClick={() => toggleKeyVisibility(provider.id)}
                      >
                        {showKeys[provider.id] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleSaveKey(provider.id)}
                      disabled={!tempKeys[provider.id] || tempKeys[provider.id] === apiKeys[provider.id]}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                  
                  {apiKeys[provider.id] && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Current Key
                        </Badge>
                        <span className="text-sm font-mono">
                          {showKeys[provider.id] ? apiKeys[provider.id] : maskKey(apiKeys[provider.id])}
                        </span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveKey(provider.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h5 className="font-medium mb-2">Available Models</h5>
                  <div className="space-y-2">
                    {provider.models.map(model => (
                      <div key={model.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <span className="font-medium text-sm">{model.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ${model.costPer1kTokens}/1K tokens
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {model.supportsStreaming && (
                            <Badge variant="outline" className="text-xs">
                              Streaming
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {model.maxTokens} tokens
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Card>
  );
};