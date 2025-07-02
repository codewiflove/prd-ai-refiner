import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Trash2, 
  Eye,
  Clock,
  Plus,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface SavedPRD {
  id: string;
  prd: string;
  data: {
    appName: string;
    description: string;
    platform?: string;
    createdAt: string;
  };
  savedAt: string;
}

const PRDGallery = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [savedPRDs, setSavedPRDs] = useState<SavedPRD[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSavedPRDs();
  }, []);

  const loadSavedPRDs = () => {
    const saved = JSON.parse(localStorage.getItem('savedPRDs') || '[]');
    setSavedPRDs(saved);
  };

  const deletePRD = (id: string) => {
    if (window.confirm("Are you sure you want to delete this PRD?")) {
      const updatedPRDs = savedPRDs.filter(prd => prd.id !== id);
      localStorage.setItem('savedPRDs', JSON.stringify(updatedPRDs));
      setSavedPRDs(updatedPRDs);
      
      toast({
        title: "PRD Deleted",
        description: "The PRD has been removed from your gallery."
      });
    }
  };

  const viewPRD = (prd: SavedPRD) => {
    localStorage.setItem('currentPRD', prd.prd);
    localStorage.setItem('currentPRDData', JSON.stringify(prd.data));
    navigate('/prd-view');
  };

  const downloadPRD = (prd: SavedPRD) => {
    const element = document.createElement("a");
    const file = new Blob([prd.prd], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${prd.data.appName || 'product'}-requirements-document.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Downloaded!",
      description: "PRD has been downloaded as a Markdown file."
    });
  };

  const filteredPRDs = savedPRDs.filter(prd =>
    prd.data.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prd.data.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Generator
            </Button>
            <div>
              <h1 className="text-2xl font-bold">PRD Gallery</h1>
              <p className="text-muted-foreground">
                Manage your saved Product Requirements Documents
              </p>
            </div>
          </div>
          <Button variant="cosmic" onClick={() => navigate('/')}>
            <Plus className="w-4 h-4 mr-2" />
            Create New PRD
          </Button>
        </div>

        {/* Search */}
        {savedPRDs.length > 0 && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search PRDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* PRD Grid */}
        {savedPRDs.length === 0 ? (
          <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-border">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Saved PRDs</h3>
            <p className="text-muted-foreground mb-4">
              Create and save your first PRD to see it here.
            </p>
            <Button variant="cosmic" onClick={() => navigate('/')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First PRD
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPRDs.map((prd) => (
              <Card key={prd.id} className="p-6 bg-card/50 backdrop-blur-sm border-border hover:shadow-cosmic transition-shadow">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {prd.data.appName}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {prd.data.description}
                    </p>
                    <div className="flex items-center gap-2">
                      {prd.data.platform && (
                        <Badge variant="outline" className="text-xs">
                          {prd.data.platform}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(prd.savedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => viewPRD(prd)}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => downloadPRD(prd)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deletePRD(prd.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredPRDs.length === 0 && searchTerm && (
          <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-border">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground">
              No PRDs match your search term "{searchTerm}".
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PRDGallery;