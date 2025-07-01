import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PRDForm } from "@/components/PRDForm";
import { ChatInterface } from "@/components/ChatInterface";
import { PRDDisplay } from "@/components/PRDDisplay";
import { Settings } from "@/components/Settings";
import { Sparkles, MessageSquare, FileText, Settings as SettingsIcon, Zap } from "lucide-react";
import cosmicHero from "@/assets/cosmic-hero.jpg";

const Index = () => {
  const [currentPRD, setCurrentPRD] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("generate");

  useEffect(() => {
    // Load existing PRD from localStorage
    const savedPRD = localStorage.getItem('currentPRD');
    if (savedPRD) {
      setCurrentPRD(savedPRD);
      setActiveTab("view");
    }
  }, []);

  const handlePRDGenerated = (prd: string) => {
    setCurrentPRD(prd);
    setActiveTab("view");
  };

  const handleEditPRD = () => {
    setActiveTab("generate");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-[40vh] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${cosmicHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center space-y-4 max-w-4xl mx-auto px-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-5xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
                PRD Genie
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your app ideas into comprehensive Product Requirements Documents with AI-powered assistance from designer and engineer personas.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Badge variant="outline" className="text-sm">
                <Zap className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
              <Badge variant="outline" className="text-sm">
                Designer & Engineer Personas
              </Badge>
              <Badge variant="outline" className="text-sm">
                Local Storage Only
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-4 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="view" disabled={!currentPRD} className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                View PRD
              </TabsTrigger>
              <TabsTrigger value="chat" disabled={!currentPRD} className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="generate" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <PRDForm onPRDGenerated={handlePRDGenerated} />
            </div>
          </TabsContent>

          <TabsContent value="view" className="space-y-6">
            {currentPRD ? (
              <div className="max-w-5xl mx-auto">
                <PRDDisplay prd={currentPRD} onEdit={handleEditPRD} />
              </div>
            ) : (
              <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-border max-w-2xl mx-auto">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No PRD Generated</h3>
                <p className="text-muted-foreground mb-4">
                  Generate your first PRD to view it here.
                </p>
                <Button variant="cosmic" onClick={() => setActiveTab("generate")}>
                  Create Your First PRD
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            {currentPRD ? (
              <div className="max-w-4xl mx-auto">
                <ChatInterface prd={currentPRD} />
              </div>
            ) : (
              <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-border max-w-2xl mx-auto">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chat Not Available</h3>
                <p className="text-muted-foreground mb-4">
                  Generate a PRD first to start chatting with AI personas.
                </p>
                <Button variant="cosmic" onClick={() => setActiveTab("generate")}>
                  Generate PRD First
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <Settings />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>PRD Genie - AI-powered Product Requirements Document assistant</p>
            <p className="mt-2">Built with React, TypeScript, and modern web technologies</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
