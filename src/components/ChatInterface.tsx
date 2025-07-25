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
  onPRDUpdate?: (updatedPRD: string) => void;
}

export const ChatInterface = ({ prd, onPRDUpdate }: ChatInterfaceProps) => {
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

      // API keys are now handled by edge functions
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
    if (!newMessage.trim() || isLoading) {
      console.log('ChatInterface: sendMessage blocked', { 
        hasMessage: !!newMessage.trim(), 
        isLoading
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
      return <p className="text-sm break-words">{message.content}</p>;
    }

    // For AI messages, use markdown rendering
    return (
      <div className="text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className="prose prose-sm dark:prose-invert max-w-none break-words"
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
            ul: ({ children }) => <ul className="ml-4 mb-2 last:mb-0">{children}</ul>,
            ol: ({ children }) => <ol className="ml-4 mb-2 last:mb-0">{children}</ol>,
            strong: ({ children }) => <strong className="font-semibold break-words">{children}</strong>,
          }}
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
      <Card className="h-[calc(100vh-180px)] sm:h-[600px] flex flex-col bg-card/50 backdrop-blur-sm border-border">
        <div className="p-3 sm:p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold">AI Consultation</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <Badge 
                variant={selectedPersona === "designer" ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105 flex-1 sm:flex-none justify-center touch-manipulation h-10 min-h-[44px]"
                onClick={() => setSelectedPersona("designer")}
              >
                <Palette className="w-3 h-3 mr-1" />
                Designer
              </Badge>
              <Badge 
                variant={selectedPersona === "engineer" ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105 flex-1 sm:flex-none justify-center touch-manipulation h-10 min-h-[44px]"
                onClick={() => setSelectedPersona("engineer")}
              >
                <Code className="w-3 h-3 mr-1" />
                Engineer
              </Badge>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Chat with AI personas to get feedback on your PRD. Select a persona to direct your questions.
          </p>
        </div>

        <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollAreaRef}>
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 sm:gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <Avatar className={`w-8 h-8 sm:w-8 sm:h-8 ${getAvatarColor(message.sender)} transition-all flex-shrink-0`}>
                  <AvatarFallback>
                    {getAvatarIcon(message.sender)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 max-w-[calc(100%-3rem)] sm:max-w-[80%] ${
                    message.sender === "user" ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`p-3 sm:p-3 rounded-lg transition-all overflow-hidden ${
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

        <div className="p-3 sm:p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder={`Ask the ${selectedPersona} for feedback...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isLoading}
              className="flex-1 h-11 sm:h-10"
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !newMessage.trim()}
              size="sm"
              className="min-w-[60px] touch-manipulation"
            >
              {isLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <>
                  <Send className="w-4 h-4 sm:hidden" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            <span className="hidden sm:inline">AI responses support markdown formatting • Press Enter to send</span>
            <span className="sm:hidden">Press Enter to send</span>
          </p>
        </div>
      </Card>
    </ErrorBoundary>
  );
};