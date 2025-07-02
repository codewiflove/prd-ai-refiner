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
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, User, Palette, Code, Loader2, AlertCircle, Settings } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "designer" | "engineer";
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatInterfaceProps {
  prd: string;
}

export const ChatInterface = ({ prd }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm the **Designer AI**. I can help you improve the user experience and visual design aspects of your PRD. What would you like to discuss?\n\n**Areas I can help with:**\n- User experience design\n- Visual design and aesthetics\n- Accessibility considerations\n- User flow optimization",
      sender: "designer",
      timestamp: new Date()
    },
    {
      id: "2", 
      content: "Hi there! I'm the **Engineer AI**. I can provide technical insights and help optimize the technical implementation details in your PRD. How can I assist you?\n\n**Areas I can help with:**\n- Technical architecture\n- Performance optimization\n- Security considerations\n- Scalability planning",
      sender: "engineer",
      timestamp: new Date()
    }
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<"designer" | "engineer">("designer");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { generateStreamResponse, isLoading, error } = useAI();

  useEffect(() => {
    try {
      console.log('ChatInterface: Initializing...');
      
      // Load chat history from localStorage
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        console.log('ChatInterface: Loaded saved messages:', parsed.length);
        setMessages(messagesWithDates);
      }

      // Check for API key
      const openaiKey = AIService.getApiKey('openai');
      console.log('ChatInterface: API key exists:', !!openaiKey);
      setHasApiKey(!!openaiKey);
    } catch (error) {
      console.error('ChatInterface: Error during initialization:', error);
      // Reset to default state on error
      setMessages([
        {
          id: "1",
          content: "Hello! I'm the **Designer AI**. I can help you improve the user experience and visual design aspects of your PRD. What would you like to discuss?",
          sender: "designer",
          timestamp: new Date()
        },
        {
          id: "2", 
          content: "Hi there! I'm the **Engineer AI**. I can provide technical insights and help optimize the technical implementation details in your PRD. How can I assist you?",
          sender: "engineer",
          timestamp: new Date()
        }
      ]);
      setHasApiKey(false);
    }
  }, []);

  useEffect(() => {
    // Save chat history to localStorage (excluding streaming messages)
    const messagesToSave = messages.filter(msg => !msg.isStreaming);
    localStorage.setItem('chatHistory', JSON.stringify(messagesToSave));
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when new messages are added or streaming content updates
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading || !hasApiKey) {
      console.log('ChatInterface: sendMessage blocked', { 
        hasMessage: !!newMessage.trim(), 
        isLoading, 
        hasApiKey 
      });
      return;
    }

    console.log('ChatInterface: Sending message', { message: newMessage, persona: selectedPersona });

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage("");

    // Create streaming AI message placeholder
    const aiMessageId = (Date.now() + 1).toString();
    const streamingAiMessage: Message = {
      id: aiMessageId,
      content: "",
      sender: selectedPersona,
      timestamp: new Date(),
      isStreaming: true
    };

    setStreamingMessage(streamingAiMessage);
    setMessages(prev => [...prev, streamingAiMessage]);

    try {
      console.log('ChatInterface: Starting streaming response...');
      
      await generateStreamResponse(
        currentMessage,
        (chunk: string) => {
          // Update streaming message content
          setStreamingMessage(prev => {
            if (!prev) return null;
            const updated = { ...prev, content: prev.content + chunk };
            
            // Also update in messages array
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === aiMessageId ? updated : msg
              )
            );
            
            return updated;
          });
        },
        selectedPersona as AIPersona,
        `Here is the PRD for context:\n\n${prd}`
      );

      // Finalize the streaming message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
      setStreamingMessage(null);

      console.log('ChatInterface: Streaming completed');
    } catch (error) {
      console.error('ChatInterface: Error during streaming:', error);
      
      // Replace streaming message with error message
      const errorContent = `I apologize, but I'm having trouble generating a response right now. **Error:** ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key configuration and try again.`;
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: errorContent, isStreaming: false }
            : msg
        )
      );
      setStreamingMessage(null);
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

  const renderMessageContent = (message: Message) => {
    if (message.sender === "user") {
      return <p className="text-sm">{message.content}</p>;
    }

    // For AI messages, use markdown rendering
    return (
      <div className="text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className="prose prose-sm dark:prose-invert max-w-none"
        >
          {message.content}
        </ReactMarkdown>
        {message.isStreaming && (
          <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-1" />
        )}
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <Card className="h-[600px] flex flex-col bg-card/50 backdrop-blur-sm border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">AI Consultation</h3>
            <div className="flex gap-2">
              <Badge 
                variant={selectedPersona === "designer" ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => setSelectedPersona("designer")}
              >
                <Palette className="w-3 h-3 mr-1" />
                Designer
              </Badge>
              <Badge 
                variant={selectedPersona === "engineer" ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
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
                className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <Avatar className={`w-8 h-8 ${getAvatarColor(message.sender)} transition-all`}>
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
                    className={`p-3 rounded-lg transition-all ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted border"
                    }`}
                  >
                    {renderMessageContent(message)}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {message.timestamp.toLocaleTimeString()}
                    {message.isStreaming && (
                      <span className="ml-2 text-primary animate-pulse">●</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
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
              className="transition-all focus:ring-2"
            />
            <Button 
              onClick={sendMessage} 
              variant="cosmic" 
              size="icon"
              disabled={!hasApiKey || isLoading || !newMessage.trim()}
              className="transition-all hover:scale-105"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          {hasApiKey && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI responses support markdown formatting • Press Enter to send
            </p>
          )}
        </div>
      </Card>
    </ErrorBoundary>
  );
};