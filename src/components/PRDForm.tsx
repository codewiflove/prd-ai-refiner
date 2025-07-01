import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePRDGeneration } from "@/hooks/use-ai";
import { Sparkles, Send, Loader2 } from "lucide-react";

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

  const generatePRDDocument = async () => {
    if (!formData.appName.trim() || !formData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide at least an app name and description.",
        variant: "destructive"
      });
      return;
    }

    try {
      const prd = await generatePRD(formData);
      
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
    } catch (err) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate PRD. Please check your API keys in Settings and try again.",
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

  return (
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
          {/* Required Fields */}
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
            <h3 className="font-semibold text-sm text-primary">Required Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="appName">App Name *</Label>
              <Input
                id="appName"
                placeholder="Enter your app name..."
                value={formData.appName}
                onChange={(e) => handleInputChange('appName', e.target.value)}
                onKeyDown={handleKeyPress}
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
                rows={4}
                className="resize-none text-base leading-relaxed"
              />
            </div>
          </div>

          {/* Optional Fields - Collapsible */}
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full"
            >
              {isExpanded ? 'Hide' : 'Show'} Additional Details (Optional)
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
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Press Cmd/Ctrl + Enter to generate</span>
            <span className="text-primary">* Required fields</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button 
          onClick={generatePRDDocument}
          disabled={!isFormValid || isLoading}
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

        <div className="text-center text-sm text-muted-foreground">
          <p>AI will analyze your input and create a comprehensive PRD</p>
          <p className="mt-1">Make sure to configure your AI API keys in Settings first</p>
        </div>
      </div>
    </Card>
  );
};