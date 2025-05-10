import React, { useState } from "react";
import { RefreshCw, Edit, Save, Send, Type, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReply, saveReply, sendEmail, getEmail } from "@/lib/api";
import { Reply, Email } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReplyPreviewProps {
  selectedEmailId?: number;
  selectedEmailSender?: string;
  selectedEmailSubject?: string;
}

const ReplyPreview: React.FC<ReplyPreviewProps> = ({ 
  selectedEmailId, 
  selectedEmailSender, 
  selectedEmailSubject 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [activeTab, setActiveTab] = useState<string>("reply");

  // Fetch reply data when an email is selected
  const {
    data: reply,
    isLoading: replyLoading,
    refetch: refetchReply
  } = useQuery<Reply>({
    queryKey: selectedEmailId ? [`/api/emails/${selectedEmailId}/reply`] : [],
    enabled: !!selectedEmailId
  });
  
  // Fetch the original email content
  const {
    data: originalEmail,
    isLoading: emailLoading
  } = useQuery<Email>({
    queryKey: selectedEmailId ? [`/api/emails/${selectedEmailId}`] : [],
    enabled: !!selectedEmailId
  });
  
  // Update content and subject when reply data changes
  React.useEffect(() => {
    if (reply) {
      setReplyContent(reply.content);
      setReplySubject(reply.subject);
    }
  }, [reply]);
  
  // Determine if anything is loading
  const isLoading = replyLoading || emailLoading;

  // Save reply mutation
  const saveMutation = useMutation({
    mutationFn: ({ emailId, content, subject }: { emailId: number; content: string; subject: string }) => {
      return saveReply(emailId, { content, subject });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/emails/${selectedEmailId}/reply`] });
      toast({
        title: "Draft saved",
        description: "Your reply has been saved as a draft.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Failed to save",
        description: "There was an error saving your draft.",
        variant: "destructive",
      });
    }
  });

  // Send email mutation
  const sendMutation = useMutation({
    mutationFn: (emailId: number) => {
      return sendEmail(emailId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/emails/${selectedEmailId}/reply`] });
      toast({
        title: "Email sent",
        description: "Your reply has been sent successfully.",
      });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Failed to send",
        description: "There was an error sending your email.",
        variant: "destructive",
      });
    }
  });

  const handleRegenerate = () => {
    if (selectedEmailId) {
      refetchReply();
    }
  };

  const handleSaveDraft = () => {
    if (selectedEmailId) {
      saveMutation.mutate({
        emailId: selectedEmailId,
        content: replyContent,
        subject: replySubject
      });
    }
  };

  const handleSend = () => {
    if (selectedEmailId) {
      // First save the current content
      saveMutation.mutate({
        emailId: selectedEmailId,
        content: replyContent,
        subject: replySubject
      }, {
        onSuccess: () => {
          // Then send the email
          sendMutation.mutate(selectedEmailId);
        }
      });
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  if (!selectedEmailId) {
    return (
      <section className="w-full h-full bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Mail & Reply</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500 p-4 flex-col">
          <Mail className="h-12 w-12 text-gray-300 mb-4" />
          <p className="mb-2">No email selected</p>
          <p className="text-sm text-gray-400">Select an email from the list to view and reply</p>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="w-full h-full bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Mail & Reply</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="border-b flex">
          <div className="w-1/2 h-12 flex items-center justify-center border-b-2 border-primary">
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="w-1/2 h-12 flex items-center justify-center">
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="flex justify-between items-start mb-4">
            <Skeleton className="h-7 w-60" />
            <Skeleton className="h-5 w-32" />
          </div>
          
          <Skeleton className="h-5 w-full mb-6" />
          
          <div className="mb-4 bg-gray-50 p-3 rounded-md">
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          
          <div className="border border-gray-200 rounded-md p-4 mb-4">
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-40 w-full mb-2" />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </ScrollArea>
      </section>
    );
  }

  return (
    <section className="w-full h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Mail & Reply</h2>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleRegenerate}
            disabled={saveMutation.isPending || sendMutation.isPending}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {activeTab === "reply" && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={toggleEdit}
              disabled={saveMutation.isPending || sendMutation.isPending || activeTab !== "reply"}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full rounded-none border-b bg-transparent p-0 h-12">
          <TabsTrigger 
            value="original" 
            className="flex-1 h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            <Mail className="mr-2 h-4 w-4" />
            Original Email
          </TabsTrigger>
          <TabsTrigger 
            value="reply" 
            className="flex-1 h-12 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Reply
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="original" className="flex-1 p-0 border-none">
          <ScrollArea className="p-4 h-full">
            {originalEmail && (
              <div className="mb-4">
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{originalEmail.subject}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <span className="font-medium text-gray-800 mr-1">{originalEmail.sender}</span>
                        <span className="mx-1 text-gray-400">&lt;{originalEmail.senderEmail}&gt;</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(originalEmail.timestamp).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 flex flex-wrap gap-1 mt-2">
                    <span>To:</span>
                    {originalEmail.recipients.map((recipient, index) => (
                      <span key={index} className="text-gray-800">{recipient}{index < originalEmail.recipients.length - 1 ? ', ' : ''}</span>
                    ))}
                  </div>
                  
                  {originalEmail.labels && originalEmail.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {originalEmail.labels.map((label, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className={`text-xs font-medium 
                            ${label === 'Work' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                            ${label === 'Meeting' ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100' : ''} 
                            ${label === 'Important' ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' : ''}
                            ${label === 'Urgent' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
                            ${label === 'Calendar' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                          `}
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="prose prose-sm max-w-none whitespace-pre-line">
                    {originalEmail.body}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="reply" className="flex-1 p-0 border-none">
          <ScrollArea className="p-4 h-full">
            <Alert className="mb-4 bg-gray-50">
              <AlertDescription className="text-sm text-gray-600 flex flex-col gap-2">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>This is an AI-generated reply based on the selected email. You can edit it before sending.</p>
                </div>
                <div className="flex items-center pt-1">
                  {reply && reply.tone && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 mr-2">
                      {reply.tone}
                    </Badge>
                  )}
                  {reply && reply.length && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {reply.length}
                    </Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="border border-gray-200 rounded-md p-4 mb-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-sm text-gray-600">To:</span>
                    <span className="text-sm text-gray-900 ml-1">{selectedEmailSender}</span>
                  </div>
                  <Button variant="link" size="sm" className="text-xs text-gray-500 h-auto p-0">
                    Add CC/BCC
                  </Button>
                </div>
                <div className="mb-2">
                  <span className="text-sm text-gray-600">Subject:</span>
                  {isEditing ? (
                    <Input
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <span className="text-sm text-gray-900 ml-1">{replySubject}</span>
                  )}
                </div>
              </div>
              
              {isEditing ? (
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[200px]"
                />
              ) : (
                <div className="prose prose-sm max-w-none whitespace-pre-line">
                  {replyContent}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleSaveDraft}
                  disabled={saveMutation.isPending || sendMutation.isPending}
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={toggleEdit}
                  disabled={saveMutation.isPending || sendMutation.isPending}
                >
                  <Type className="h-4 w-4" />
                  Format
                </Button>
              </div>
              <Button 
                variant="default" 
                size="sm"
                className="flex items-center gap-1"
                onClick={handleSend}
                disabled={saveMutation.isPending || sendMutation.isPending}
              >
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default ReplyPreview;
