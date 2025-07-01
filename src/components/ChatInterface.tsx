import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAI } from "@/hooks/use-ai";
import { AIService } from "@/lib/services/ai-service";
import { AIPersona } from "@/lib/types/ai";
import { Send, User, Palette, Code, Loader2, AlertCircle, Settings } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "designer" | "engineer";
  timestamp: Date;
}

interface ChatInterfaceProps {
  prd: string;
}

export const ChatInterface = ({ prd }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm the Designer AI. I can help you improve the user experience and visual design aspects of your PRD. What would you like to discuss?",
      sender: "designer",
      timestamp: new Date()
    },
    {
      id: "2", 
      content: "Hi there! I'm the Engineer AI. I can provide technical insights and help optimize the technical implementation details in your PRD. How can I assist you?",
      sender: "engineer",
      timestamp: new Date()
    }
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<"designer" | "engineer">("designer");
  const [hasApiKey, setHasApiKey] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { generateResponse, isLoading, error } = useAI();

  useEffect(() => {
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    // Check for API key
    const openaiKey = AIService.getApiKey('openai');
    setHasApiKey(!!openaiKey);
  }, []);

  useEffect(() => {
    // Save chat history to localStorage
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading || !hasApiKey) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage("");

    try {
      const aiResponse = await generateResponse(
        currentMessage,
        selectedPersona as AIPersona,
        `Here is the PRD for context:\n\n${prd}`
      );

      if (aiResponse) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: selectedPersona,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble generating a response right now. Please check your API key configuration and try again.",
        sender: selectedPersona,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const openSettings = () => {
    window.dispatchEvent(new CustomEvent('open-settings'));
  };

  const getAvatarIcon = (sender: string) => {
    switch (sender) {
      case "designer": return <Palette className="w-4 h-4" />;
      case "engineer": return <Code className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getAvatarColor = (sender: string) => {
    switch (sender) {
      case "designer": return "bg-accent text-accent-foreground";
      case "engineer": return "bg-primary text-primary-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Card className="h-[600px] flex flex-col bg-card/50 backdrop-blur-sm border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">AI Consultation</h3>
          <div className="flex gap-2">
            <Badge 
              variant={selectedPersona === "designer" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedPersona("designer")}
            >
              <Palette className="w-3 h-3 mr-1" />
              Designer
            </Badge>
            <Badge 
              variant={selectedPersona === "engineer" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedPersona("engineer")}
            >
              <Code className="w-3 h-3 mr-1" />
              Engineer
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Chat with AI personas to get feedback on your PRD. Select a persona to direct your questions.
        </p>
      </div>

      {!hasApiKey && (
        <div className="p-4 border-b border-border">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>OpenAI API key required for AI chat functionality.</span>
              <Button size="sm" variant="outline" onClick={openSettings}>
                <Settings className="w-3 h-3 mr-1" />
                Configure
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className={`w-8 h-8 ${getAvatarColor(message.sender)}`}>
                <AvatarFallback>
                  {getAvatarIcon(message.sender)}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex-1 max-w-[80%] ${
                  message.sender === "user" ? "text-right" : ""
                }`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className={`w-8 h-8 ${getAvatarColor(selectedPersona)}`}>
                <AvatarFallback>
                  {getAvatarIcon(selectedPersona)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 max-w-[80%]">
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder={hasApiKey ? `Ask the ${selectedPersona} for feedback...` : "Configure API key to chat"}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !isLoading && hasApiKey && sendMessage()}
            disabled={!hasApiKey || isLoading}
          />
          <Button 
            onClick={sendMessage} 
            variant="cosmic" 
            size="icon"
            disabled={!hasApiKey || isLoading || !newMessage.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};