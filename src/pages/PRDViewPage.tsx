import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChatSidebar } from "@/components/ChatSidebar";
import ReactMarkdown from "react-markdown";
import { LavaButton } from "@/components/ui/lava-button";
import remarkGfm from "remark-gfm";
import { 
  Download, 
  Copy, 
  ArrowLeft, 
  MessageSquare, 
  Save, 
  Star,
  Clock,
  FileText
} from "lucide-react";

interface PRDData {
  appName: string;
  description: string;
  targetAudience: string;
  platform: string;
  primaryGoals: string;
  keyFeatures: string;
  techStack: string;
  timeline: string;
  createdAt: string;
}

const PRDViewPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prd, setPrd] = useState<string>("");
  const [prdData, setPrdData] = useState<PRDData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const currentPRD = localStorage.getItem('currentPRD');
    const currentPRDData = localStorage.getItem('currentPRDData');
    
    if (!currentPRD) {
      navigate('/');
      return;
    }
    
    setPrd(currentPRD);
    if (currentPRDData) {
      setPrdData(JSON.parse(currentPRDData));
    }

    // Check if current PRD is already saved
    const savedPRDs = JSON.parse(localStorage.getItem('savedPRDs') || '[]');
    const isAlreadySaved = savedPRDs.some((saved: any) => saved.prd === currentPRD);
    setIsSaved(isAlreadySaved);
  }, [navigate]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prd);
    toast({
      title: "Copied!",
      description: "PRD has been copied to clipboard."
    });
  };

  const downloadPRD = () => {
    const element = document.createElement("a");
    const file = new Blob([prd], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${prdData?.appName || 'product'}-requirements-document.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Downloaded!",
      description: "PRD has been downloaded as a Markdown file."
    });
  };

  const savePRD = () => {
    if (!prdData) return;

    const savedPRDs = JSON.parse(localStorage.getItem('savedPRDs') || '[]');
    
    const prdToSave = {
      id: Date.now().toString(),
      prd,
      data: prdData,
      savedAt: new Date().toISOString()
    };

    const updatedSavedPRDs = [prdToSave, ...savedPRDs];
    localStorage.setItem('savedPRDs', JSON.stringify(updatedSavedPRDs));
    setIsSaved(true);

    toast({
      title: "PRD Saved!",
      description: "Your PRD has been added to your gallery."
    });
  };

  const handlePRDUpdate = (updatedPRD: string) => {
    setPrd(updatedPRD);
    localStorage.setItem('currentPRD', updatedPRD);
    setIsSaved(false); // Mark as unsaved since it's been modified
  };

  if (!prd) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-border max-w-2xl mx-auto">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No PRD Found</h3>
          <p className="text-muted-foreground mb-4">
            Please generate a PRD first to view it here.
          </p>
          <Button variant="cosmic" onClick={() => navigate('/')}>
            Generate Your First PRD
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button variant="outline" onClick={() => navigate('/')} size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Generator
            </Button>
            {prdData && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Created {new Date(prdData.createdAt).toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => navigate('/gallery')} size="sm" className="w-full sm:w-auto">
              View Gallery
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsChatOpen(true)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
              size="sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="sm:inline">Refine with AI</span>
            </Button>
          </div>
        </div>

        {/* PRD Header Info */}
        {prdData && (
          <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border-border">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold break-words">{prdData.appName}</h1>
                  {isSaved && (
                    <Badge variant="outline" className="text-green-600 border-green-600 w-fit">
                      <Star className="w-3 h-3 mr-1" />
                      Saved
                    </Badge>
                  )}
                </div>
                <p className="text-sm sm:text-base text-muted-foreground break-words">{prdData.description}</p>
                {prdData.platform && (
                  <Badge variant="outline" className="w-fit">{prdData.platform}</Badge>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex-1 sm:flex-none">
                    <Copy className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Copy</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadPRD} className="flex-1 sm:flex-none">
                    <Download className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>
                {!isSaved && (
                  <Button variant="cosmic" size="sm" onClick={savePRD} className="w-full sm:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    Save PRD
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* PRD Content */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <div className="p-4 sm:p-6">
            <div className="prose prose-invert max-w-none overflow-hidden">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose prose-sm dark:prose-invert max-w-none"
                components={{
                  h1: ({children}) => <h1 className="text-2xl font-bold mb-4 text-primary">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-semibold mb-3 mt-6 text-foreground">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-medium mb-2 mt-4 text-foreground">{children}</h3>,
                  p: ({children}) => <p className="mb-2 leading-relaxed">{children}</p>,
                  ul: ({children}) => <ul className="mb-4 ml-4 space-y-1">{children}</ul>,
                  ol: ({children}) => <ol className="mb-4 ml-4 space-y-1">{children}</ol>,
                  li: ({children}) => <li className="mb-1">{children}</li>,
                  hr: () => <hr className="my-6 border-border" />,
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-primary pl-4 italic my-4">
                      {children}
                    </blockquote>
                  ),
                  code: ({children}) => (
                    <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>
                  ),
                  pre: ({children}) => (
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">{children}</pre>
                  )
                }}
              >
                {prd}
              </ReactMarkdown>
            </div>
          </div>
        </Card>

        {/* Chat with AI Button */}
        <div className="text-center">
          <LavaButton 
            variant="default" 
            size="lg"
            glow="intense"
            particles={true}
            onClick={() => setIsChatOpen(true)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat with AI Experts to Refine PRD
          </LavaButton>
        </div>

        {/* Chat Sidebar */}
        <ChatSidebar 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)}
          prd={prd}
          onPRDUpdate={handlePRDUpdate}
        />
      </div>
    </div>
  );
};

export default PRDViewPage;