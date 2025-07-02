import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePRDGeneration } from "@/hooks/use-ai";
import { AIService } from "@/lib/services/ai-service";
import { Sparkles, Send, Loader2, Settings, AlertCircle } from "lucide-react";

interface PRDFormProps {
  onPRDGenerated: (prd: string) => void;
}

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

export const PRDForm = ({ onPRDGenerated }: PRDFormProps) => {
  const { toast } = useToast();
  const { generatePRD, isLoading, error } = usePRDGeneration();
  
  const [formData, setFormData] = useState<FormData>({
    appName: "",
    description: "",
    targetAudience: "",
    platform: "",
    primaryGoals: "",
    keyFeatures: "",
    techStack: "",
    timeline: ""
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const checkApiKey = () => {
    // API keys are now handled by edge functions
    return true;
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

    // Check for API key before attempting generation
    if (!checkApiKey()) {
      toast({
        title: "API Key Required",
        description: "Please configure your OpenAI API key in Settings before generating a PRD.",
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={() => {
            // Trigger settings tab
            window.dispatchEvent(new CustomEvent('open-settings'));
          }}>
            <Settings className="w-3 h-3 mr-1" />
            Open Settings
          </Button>
        )
      });
      return;
    }

    try {
      // Transform formData into the expected format
      const prdIdea = `
App Name: ${formData.appName}
Description: ${formData.description}
Target Audience: ${formData.targetAudience}
Platform: ${formData.platform}
Primary Goals: ${formData.primaryGoals}
Key Features: ${formData.keyFeatures}
Tech Stack: ${formData.techStack}
Timeline: ${formData.timeline}
      `.trim();
      
      const prd = await generatePRD({ prdIdea });
      
      if (prd) {
        // Store in localStorage
        localStorage.setItem('currentPRD', prd);
        localStorage.setItem('prdFormData', JSON.stringify(formData));
        
        onPRDGenerated(prd);
        
        toast({
          title: "PRD Generated!",
          description: "Your Product Requirements Document has been created successfully using AI."
        });
      }
    } catch (err: any) {
      let errorMessage = "Failed to generate PRD. Please try again.";
      let actionButton = null;

      if (err.message?.includes('API key')) {
        errorMessage = "Invalid or missing OpenAI API key. Please check your Settings.";
        actionButton = (
          <Button variant="outline" size="sm" onClick={() => {
            window.dispatchEvent(new CustomEvent('open-settings'));
          }}>
            <Settings className="w-3 h-3 mr-1" />
            Settings
          </Button>
        );
      } else if (err.message?.includes('rate limit')) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      } else if (err.message?.includes('quota')) {
        errorMessage = "OpenAI quota exceeded. Please check your OpenAI account.";
      }

      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
        action: actionButton
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
    <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border-border animate-float hover:animate-glow-pulse transition-all duration-500 will-change-transform shadow-cosmic hover:shadow-glow">
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold">Create Your PRD with AI</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Provide details about your app idea and let AI generate a comprehensive Product Requirements Document.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Required Fields */}
          <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-muted/20 rounded-lg border">
            <h3 className="font-semibold text-sm text-primary">Required Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="appName" className="text-sm sm:text-base">App Name *</Label>
              <Input
                id="appName"
                placeholder="Enter your app name..."
                value={formData.appName}
                onChange={(e) => handleInputChange('appName', e.target.value)}
                onKeyDown={handleKeyPress}
                className="text-base h-11 sm:h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm sm:text-base">App Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your app idea in detail. What problem does it solve? What are the main features? Who is it for?"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                onKeyDown={handleKeyPress}
                rows={4}
                className="resize-none text-base leading-relaxed min-h-[100px]"
              />
            </div>
          </div>

          {/* Optional Fields - Collapsible */}
          <div className="space-y-3 sm:space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-sm sm:text-base"
              size="sm"
            >
              {isExpanded ? 'Hide' : 'Show'} Additional Details (Optional)
            </Button>
            
            {isExpanded && (
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-muted/10 rounded-lg border animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience" className="text-sm">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      placeholder="e.g., Young professionals"
                      value={formData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      className="h-11 sm:h-10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="platform" className="text-sm">Platform</Label>
                    <Input
                      id="platform"
                      placeholder="e.g., Web, Mobile, Desktop"
                      value={formData.platform}
                      onChange={(e) => handleInputChange('platform', e.target.value)}
                      className="h-11 sm:h-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="primaryGoals" className="text-sm">Primary Goals</Label>
                  <Textarea
                    id="primaryGoals"
                    placeholder="What are the main objectives you want to achieve with this app?"
                    value={formData.primaryGoals}
                    onChange={(e) => handleInputChange('primaryGoals', e.target.value)}
                    rows={2}
                    className="resize-none min-h-[80px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="keyFeatures" className="text-sm">Key Features</Label>
                  <Textarea
                    id="keyFeatures"
                    placeholder="List the most important features your app should have"
                    value={formData.keyFeatures}
                    onChange={(e) => handleInputChange('keyFeatures', e.target.value)}
                    rows={3}
                    className="resize-none min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="techStack" className="text-sm">Preferred Tech Stack</Label>
                    <Input
                      id="techStack"
                      placeholder="e.g., React, Node.js"
                      value={formData.techStack}
                      onChange={(e) => handleInputChange('techStack', e.target.value)}
                      className="h-11 sm:h-10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeline" className="text-sm">Timeline</Label>
                    <Input
                      id="timeline"
                      placeholder="e.g., 3 months, 6 months"
                      value={formData.timeline}
                      onChange={(e) => handleInputChange('timeline', e.target.value)}
                      className="h-11 sm:h-10"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="hidden sm:block">Press Cmd/Ctrl + Enter to generate</span>
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
                  You need to configure your OpenAI API key in Settings before generating a PRD.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-amber-800 border-amber-300 hover:bg-amber-100 dark:text-amber-200 dark:border-amber-700 dark:hover:bg-amber-900/50"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
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
          className="w-full animate-shimmer bg-gradient-cosmic bg-[length:200%_100%] hover:scale-105 transition-transform duration-300 h-12 sm:h-11"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span className="hidden sm:inline">Generating PRD with AI...</span>
              <span className="sm:hidden">Generating...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Generate PRD with AI</span>
              <span className="sm:hidden">Generate PRD</span>
            </>
          )}
        </Button>

        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          <p className="px-2">AI will analyze your input and create a comprehensive PRD</p>
          {hasApiKey ? (
            <p className="mt-1 text-green-600 dark:text-green-400">✓ API key configured</p>
          ) : (
            <p className="mt-1 text-amber-600 dark:text-amber-400">⚠ Configure API keys in Settings first</p>
          )}
        </div>
      </div>
    </Card>
  );
};