import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PRDDisplayProps {
  prd: string;
  onEdit: () => void;
}

export const PRDDisplay = ({ prd, onEdit }: PRDDisplayProps) => {
  const { toast } = useToast();

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
    element.download = "product-requirements-document.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Downloaded!",
      description: "PRD has been downloaded as a Markdown file."
    });
  };

  const formatPRDContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mb-4 text-primary">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold mb-3 mt-6 text-foreground">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-medium mb-2 mt-4 text-foreground">{line.substring(4)}</h3>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-semibold mb-2">{line.slice(2, -2)}</p>;
      } else if (line.startsWith('*') && line.endsWith('*')) {
        return <p key={index} className="italic mb-2 text-muted-foreground">{line.slice(1, -1)}</p>;
      } else if (line.startsWith('---')) {
        return <hr key={index} className="my-6 border-border" />;
      } else if (line.trim().startsWith('-') || line.trim().startsWith('1.')) {
        return <li key={index} className="mb-1 ml-4">{line.trim().substring(line.trim().indexOf(' ') + 1)}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="mb-2 leading-relaxed">{line}</p>;
      }
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Generated PRD</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="cosmic" size="sm" onClick={downloadPRD}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        
        <div className="prose prose-invert max-w-none">
          {formatPRDContent(prd)}
        </div>
      </div>
    </Card>
  );
};