import React, { useState, useCallback } from "react";
import Header from "@/components/Header";
import MobileTabs from "@/components/MobileTabs";
import EmailList from "@/components/EmailList";
import ReplyPreview from "@/components/ReplyPreview";
import DocumentHighlights from "@/components/DocumentHighlights";
import ThreadView from "@/components/ThreadView";
import { useMobileView, useMobileTab } from "@/lib/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getEmail, getEmailThread, saveReply } from "@/lib/api";
import { Email } from "@/types";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const Dashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const isMobile = useMobileView();
  const { activeTab, setActiveTab } = useMobileTab();
  const [selectedEmailId, setSelectedEmailId] = useState<number | undefined>();
  const [selectedEmail, setSelectedEmail] = useState<Email | undefined>();
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  // Get the selected email details
  const { data: emailDetails } = useQuery<Email>({
    queryKey: selectedEmailId ? [`/api/emails/${selectedEmailId}`] : [],
    enabled: !!selectedEmailId,
  });

  // Get thread emails for the selected email
  const { data: threadEmails = [], isLoading: threadLoading } = useQuery<Email[]>({
    queryKey: emailDetails?.threadId ? [`/api/threads/${emailDetails.threadId}`] : [],
    enabled: !!emailDetails?.threadId,
  });

  // Update selected email when email details change
  React.useEffect(() => {
    if (emailDetails) {
      setSelectedEmail(emailDetails);
    }
  }, [emailDetails]);

  const handleSelectEmail = (email: Email) => {
    setSelectedEmailId(email.id);
    setSelectedEmail(email);
    if (isMobile) {
      setActiveTab(1); // Switch to reply preview tab on mobile
    }
  };



  const handleGlobalSearch = useCallback((query: string) => {
    setGlobalSearchQuery(query);
  }, []);

  const updateReplyWithQuote = useCallback(async (text: string) => {
    if (!selectedEmailId) return;

    // Get current reply
    const replyKey = [`/api/emails/${selectedEmailId}/reply`];
    const currentReply = queryClient.getQueryData(replyKey);
    
    if (currentReply) {
      const reply = currentReply as any; // Type as any for simplicity
      const updatedContent = `${reply.content}\n\n> ${text}`;
      
      // Update the reply with the quote
      await saveReply(selectedEmailId, {
        content: updatedContent,
        subject: reply.subject
      });
      
      // Refetch to update UI
      queryClient.invalidateQueries({ queryKey: replyKey });
      
      // Switch to reply tab on mobile
      if (isMobile) {
        setActiveTab(1);
      }
    }
  }, [selectedEmailId, queryClient, isMobile, setActiveTab]);

  return (
    <div className="flex flex-col h-screen">
      <Header onSearch={handleGlobalSearch} />
      
      {isMobile && (
        <MobileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full">
          {isMobile ? (
            // Mobile view with tabs
            <div className="h-full">
              {/* Email List */}
              <div className={activeTab === 0 ? 'block h-full' : 'hidden'}>
                <EmailList 
                  onSelectEmail={handleSelectEmail} 
                  selectedEmailId={selectedEmailId}
                />
              </div>
              
              {/* Reply Preview */}
              <div className={activeTab === 1 ? 'block h-full' : 'hidden'}>
                <ReplyPreview 
                  selectedEmailId={selectedEmailId}
                  selectedEmailSender={selectedEmail?.sender}
                  selectedEmailSubject={selectedEmail?.subject}
                />
              </div>
              
              {/* Document Highlights */}
              <div className={activeTab === 2 ? 'block h-full' : 'hidden'}>
                <DocumentHighlights 
                  updateReplyWithQuote={updateReplyWithQuote}
                  selectedEmailId={selectedEmailId}
                />
              </div>
              
              {/* Thread View */}
              <div className={activeTab === 3 ? 'block h-full' : 'hidden'}>
                <ThreadView 
                  emails={emailDetails?.threadId ? threadEmails : selectedEmailId ? [selectedEmail].filter(Boolean) as Email[] : []}
                  loading={threadLoading}
                />
              </div>
            </div>
          ) : (
            // Desktop view with resizable panels
            <ResizablePanelGroup
              direction="horizontal"
              className="h-full"
            >
              {/* Left side: Split between Email List and Thread View */}
              <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
                <ResizablePanelGroup direction="vertical" className="h-full">
                  {/* Email List Panel */}
                  <ResizablePanel defaultSize={60} minSize={40} maxSize={75}>
                    <EmailList 
                      onSelectEmail={handleSelectEmail} 
                      selectedEmailId={selectedEmailId}
                    />
                  </ResizablePanel>
                  
                  <ResizableHandle withHandle />
                  
                  {/* Thread View Panel */}
                  <ResizablePanel defaultSize={40} minSize={25}>
                    <ThreadView 
                      emails={emailDetails?.threadId ? threadEmails : selectedEmailId ? [selectedEmail].filter(Boolean) as Email[] : []}
                      loading={threadLoading}
                    />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Reply Preview Panel */}
              <ResizablePanel defaultSize={40} minSize={30} maxSize={50}>
                <ReplyPreview 
                  selectedEmailId={selectedEmailId}
                  selectedEmailSender={selectedEmail?.sender}
                  selectedEmailSubject={selectedEmail?.subject}
                />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Document Highlights Panel */}
              <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
                <DocumentHighlights 
                  updateReplyWithQuote={updateReplyWithQuote}
                  selectedEmailId={selectedEmailId}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
