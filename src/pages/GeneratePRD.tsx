import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePRDGeneration } from "@/hooks/use-ai";
import { AIService } from "@/lib/services/ai-service";
import { Sparkles, Send, Loader2, Settings, AlertCircle } from "lucide-react";
import { LavaButton } from "@/components/ui/lava-button";

interface FormData {
  prdIdea: string;
}

const GeneratePRD = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { generatePRD, isLoading, error } = usePRDGeneration();
  
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem('prdFormData');
    return saved ? JSON.parse(saved) : {
      prdIdea: ""
    };
  });

  useEffect(() => {
    localStorage.setItem('prdFormData', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (value: string) => {
    setFormData({ prdIdea: value });
  };

  const checkApiKey = () => {
    const openaiKey = AIService.getApiKey('openai');
    return openaiKey && openaiKey.length > 10;
  };

  const generatePRDDocument = async () => {
    if (!formData.prdIdea.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your app idea to generate a PRD.",
        variant: "destructive"
      });
      return;
    }

    if (!checkApiKey()) {
      toast({
        title: "API Key Required",
        description: "Please configure your OpenAI API key in Settings before generating a PRD.",
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
            <Settings className="w-3 h-3 mr-1" />
            Open Settings
          </Button>
        )
      });
      return;
    }

    try {
      const prd = await generatePRD(formData);
      
      if (prd) {
        localStorage.setItem('currentPRD', prd);
        localStorage.setItem('currentPRDData', JSON.stringify({
          appName: "Generated PRD",
          description: formData.prdIdea.substring(0, 200) + (formData.prdIdea.length > 200 ? "..." : ""),
          createdAt: new Date().toISOString()
        }));
        
        navigate('/prd-view');
        
        toast({
          title: "PRD Generated!",
          description: "Your Product Requirements Document has been created successfully using AI."
        });
      }
    } catch (err: any) {
      let errorMessage = "Failed to generate PRD. Please try again.";
      
      if (err.message?.includes('API key')) {
        errorMessage = "Invalid or missing OpenAI API key. Please check your Settings.";
      } else if (err.message?.includes('rate limit')) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      } else if (err.message?.includes('quota')) {
        errorMessage = "OpenAI quota exceeded. Please check your OpenAI account.";
      }

      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      generatePRDDocument();
    }
  };

  const isFormValid = formData.prdIdea.trim().length > 0;
  const hasApiKey = checkApiKey();

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border animate-float hover:animate-glow-pulse transition-all duration-500 will-change-transform shadow-cosmic hover:shadow-glow">
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Create Your PRD with AI</h2>
              </div>
              <p className="text-muted-foreground">
                Describe your app idea and let AI generate a comprehensive Product Requirements Document.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    id="prdIdea"
                    placeholder="Describe your app idea in detail to generate a comprehensive Product Requirements Document...

For example:
• What problem does your app solve?
• Who is your target audience?
• What are the key features?
• What platform will it run on?
• Any specific technical requirements?

The more details you provide, the better your PRD will be!"
                    value={formData.prdIdea}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyPress}
                    rows={12}
                    className="resize-none text-base leading-relaxed transition-all duration-300 min-h-[300px]"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Press Cmd/Ctrl + Enter to generate</span>
                <span className="text-primary">{formData.prdIdea.length} characters</span>
              </div>
            </div>

            {!hasApiKey && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      API Key Required
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      You need to configure your OpenAI API key before generating a PRD.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-amber-800 border-amber-300 hover:bg-amber-100 dark:text-amber-200 dark:border-amber-700 dark:hover:bg-amber-900/50"
                      onClick={() => navigate('/settings')}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Open Settings
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <LavaButton 
              onClick={generatePRDDocument}
              disabled={!isFormValid || isLoading || !hasApiKey}
              variant="intense"
              size="lg"
              glow="intense"
              particles={true}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating PRD with AI...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Generate PRD with AI
                </>
              )}
            </LavaButton>

            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>AI will analyze your input and create a comprehensive PRD</p>
              <div className="flex items-center justify-center gap-4">
                <Badge variant="outline" className="text-xs">
                  {hasApiKey ? '✓ API key configured' : '⚠ Configure API key first'}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/gallery')}
                  className="text-xs"
                >
                  View Saved PRDs
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GeneratePRD;