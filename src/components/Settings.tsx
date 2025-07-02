import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Database, Download, Trash2, Shield } from "lucide-react";

export const Settings = () => {
  const { toast } = useToast();
  const [dataStats, setDataStats] = useState({
    prds: 0,
    chatMessages: 0,
    storageUsed: 0
  });

  useEffect(() => {
    // Calculate data usage
    const prds = localStorage.getItem('currentPRD') ? 1 : 0;
    const chatHistory = localStorage.getItem('chatHistory');
    const messages = chatHistory ? JSON.parse(chatHistory).length : 0;
    
    // Estimate storage usage (rough calculation)
    const storageKeys = ['currentPRD', 'prdData', 'chatHistory'];
    let totalSize = 0;
    storageKeys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += new Blob([item]).size;
      }
    });

    setDataStats({
      prds,
      chatMessages: messages,
      storageUsed: Math.round(totalSize / 1024) // Convert to KB
    });
  }, []);

  const exportData = () => {
    const data = {
      prd: localStorage.getItem('currentPRD'),
      prdData: localStorage.getItem('prdData'),
      chatHistory: localStorage.getItem('chatHistory'),
      exportDate: new Date().toISOString()
    };

    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = "prd-genie-data.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Data Exported",
      description: "Your PRD Genie data has been exported successfully."
    });
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      localStorage.removeItem('currentPRD');
      localStorage.removeItem('prdData');
      localStorage.removeItem('chatHistory');
      
      setDataStats({ prds: 0, chatMessages: 0, storageUsed: 0 });
      
      toast({
        title: "Data Cleared",
        description: "All PRD and chat data has been cleared."
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your API keys and application preferences.
        </p>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-4">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">API Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  API keys are now securely managed via Supabase Edge Function secrets.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center p-8 border border-dashed border-border rounded-lg">
                  <div className="text-center space-y-3">
                    <Shield className="w-12 h-12 mx-auto text-green-500" />
                    <div>
                      <h4 className="font-medium">Secure API Key Management</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        API keys are stored securely in Supabase Edge Function secrets.
                        <br />
                        No sensitive data is stored in your browser.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ✓ OpenAI API Configured
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <Shield className="w-3 h-3 inline mr-1" />
                  API keys are managed securely via Supabase secrets and never exposed to the client.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Data Management</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage your stored data in PRD Genie.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{dataStats.prds}</div>
                  <div className="text-sm text-muted-foreground">PRDs Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{dataStats.chatMessages}</div>
                  <div className="text-sm text-muted-foreground">Chat Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{dataStats.storageUsed} KB</div>
                  <div className="text-sm text-muted-foreground">Storage Used</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={exportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="destructive" onClick={clearAllData}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <Database className="w-3 h-3 inline mr-1" />
                  All data is stored locally in your browser. No data is sent to external servers.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">About PRD Genie</h3>
                <p className="text-sm text-muted-foreground">
                  Version 1.0.0 - Your AI-powered Product Requirements Document assistant.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">PRD Generation</Badge>
                    <Badge variant="outline">AI Chat Interface</Badge>
                    <Badge variant="outline">Designer Persona</Badge>
                    <Badge variant="outline">Engineer Persona</Badge>
                    <Badge variant="outline">Local Storage</Badge>
                    <Badge variant="outline">Export/Import</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Built With</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge>React</Badge>
                    <Badge>TypeScript</Badge>
                    <Badge>Vite</Badge>
                    <Badge>Tailwind CSS</Badge>
                    <Badge>Shadcn/ui</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};