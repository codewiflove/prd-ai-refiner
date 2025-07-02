import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePRDGeneration } from "@/hooks/use-ai";
import { AIService } from "@/lib/services/ai-service";
import { Sparkles, Send, Loader2, Settings, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface FormData {
  appName: string;
  description: string;
  targetAudience: string;
  platform: string;
  primaryGoals: string;
  keyFeatures: string;
  techStack: string;
  timeline: string;
}

const GeneratePRD = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { generatePRD, isLoading, error } = usePRDGeneration();
  
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem('prdFormData');
    return saved ? JSON.parse(saved) : {
      appName: "",
      description: "",
      targetAudience: "",
      platform: "",
      primaryGoals: "",
      keyFeatures: "",
      techStack: "",
      timeline: ""
    };
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    localStorage.setItem('prdFormData', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (!isExpanded && (formData.appName || formData.description)) {
      setIsExpanded(true);
    }
  };

  const checkApiKey = () => {
    const openaiKey = AIService.getApiKey('openai');
    return openaiKey && openaiKey.length > 10;
  };

  const generatePRDDocument = async () => {
    if (!formData.appName.trim() || !formData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide at least an app name and description.",
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
          ...formData,
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

  const isFormValid = formData.appName.trim() && formData.description.trim();
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
                Provide details about your app idea and let AI generate a comprehensive Product Requirements Document.
              </p>
            </div>

            <div className="space-y-4">
              {/* Always visible core fields */}
              <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
                <h3 className="font-semibold text-sm text-primary">Tell us about your app idea</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="appName">App Name *</Label>
                  <Input
                    id="appName"
                    placeholder="Enter your app name..."
                    value={formData.appName}
                    onChange={(e) => handleInputChange('appName', e.target.value)}
                    onKeyDown={handleKeyPress}
                    onFocus={handleFocus}
                    className="text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">App Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your app idea in detail. What problem does it solve? What are the main features? Who is it for?"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    onKeyDown={handleKeyPress}
                    onFocus={handleFocus}
                    rows={isFocused ? 4 : 3}
                    className="resize-none text-base leading-relaxed transition-all duration-300"
                  />
                </div>
              </div>

              {/* Expandable additional fields */}
              {(isExpanded || isFocused) && (
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full animate-in slide-in-from-top-2"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Hide Additional Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Add More Details (Optional)
                      </>
                    )}
                  </Button>
                  
                  {isExpanded && (
                    <div className="space-y-4 p-4 bg-muted/10 rounded-lg border animate-in slide-in-from-top-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="targetAudience">Target Audience</Label>
                          <Input
                            id="targetAudience"
                            placeholder="e.g., Young professionals, Small business owners"
                            value={formData.targetAudience}
                            onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="platform">Platform</Label>
                          <Input
                            id="platform"
                            placeholder="e.g., Web, Mobile (iOS/Android), Desktop"
                            value={formData.platform}
                            onChange={(e) => handleInputChange('platform', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="primaryGoals">Primary Goals</Label>
                        <Textarea
                          id="primaryGoals"
                          placeholder="What are the main objectives you want to achieve with this app?"
                          value={formData.primaryGoals}
                          onChange={(e) => handleInputChange('primaryGoals', e.target.value)}
                          rows={2}
                          className="resize-none"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="keyFeatures">Key Features</Label>
                        <Textarea
                          id="keyFeatures"
                          placeholder="List the most important features your app should have"
                          value={formData.keyFeatures}
                          onChange={(e) => handleInputChange('keyFeatures', e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="techStack">Preferred Tech Stack</Label>
                          <Input
                            id="techStack"
                            placeholder="e.g., React, Node.js, PostgreSQL"
                            value={formData.techStack}
                            onChange={(e) => handleInputChange('techStack', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="timeline">Timeline</Label>
                          <Input
                            id="timeline"
                            placeholder="e.g., 3 months, 6 months"
                            value={formData.timeline}
                            onChange={(e) => handleInputChange('timeline', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Press Cmd/Ctrl + Enter to generate</span>
                <span className="text-primary">* Required fields</span>
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

            <Button 
              onClick={generatePRDDocument}
              disabled={!isFormValid || isLoading || !hasApiKey}
              variant="cosmic"
              size="lg"
              className="w-full animate-shimmer bg-gradient-cosmic bg-[length:200%_100%] hover:scale-105 transition-transform duration-300"
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
            </Button>

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