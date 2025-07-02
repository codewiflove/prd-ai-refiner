import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChatInterface } from "@/components/ChatInterface";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  prd: string;
  onPRDUpdate?: (updatedPRD: string) => void;
}

export const ChatSidebar = ({ isOpen, onClose, prd, onPRDUpdate }: ChatSidebarProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:w-[600px] max-w-full sm:max-w-[600px] p-0">
        <SheetHeader className="p-4 sm:p-6 pb-4 border-b">
          <SheetTitle className="text-left">AI Expert Consultation</SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100vh-100px)]">
          <ChatInterface prd={prd} onPRDUpdate={onPRDUpdate} />
        </div>
      </SheetContent>
    </Sheet>
  );
};