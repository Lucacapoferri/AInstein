import React, { useState } from "react";
import { RefreshCw, FileText, Copy, Quote, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { getDocuments, getHighlights } from "@/lib/api";
import { Document, Highlight } from "@/types";

interface DocumentHighlightsProps {
  updateReplyWithQuote?: (text: string) => void;
  selectedEmailId?: number;
}

const DocumentHighlights: React.FC<DocumentHighlightsProps> = ({ updateReplyWithQuote, selectedEmailId }) => {
  const { toast } = useToast();
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  // Fetch documents
  const { data: documents, isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: selectedEmailId ? [`/api/documents`, selectedEmailId] : [],
    enabled: !!selectedEmailId
  });

  // Set initial document when data loads
  React.useEffect(() => {
    if (documents && documents.length > 0 && !selectedDocumentId) {
      setSelectedDocumentId(documents[0].id);
    }
    console.log("Selected Email ID changed:", selectedEmailId);
  }, [documents, selectedDocumentId]);

  // Fetch highlights for selected document
  const {
    data: highlights,
    isLoading: highlightsLoading,
    refetch: refetchHighlights
  } = useQuery<Highlight[]>({
    queryKey: selectedEmailId ? [`/api/documents/${selectedEmailId}/highlights`] : [],
    enabled: !!selectedEmailId
  });

  const selectedDocument = documents?.find(doc => doc.id === selectedDocumentId);

  const handleDocumentChange = (value: string) => {
    setSelectedDocumentId(Number(value));
  };

  const handleRefresh = () => {
    refetchHighlights();
  };
  

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "Text has been copied to your clipboard.",
        });
      },
      () => {
        toast({
          title: "Copy failed",
          description: "Failed to copy text to clipboard.",
          variant: "destructive",
        });
      }
    );
  };

  const handleQuoteInReply = (text: string) => {
    if (updateReplyWithQuote) {
      updateReplyWithQuote(text);
      toast({
        title: "Added to reply",
        description: "Quote has been added to your reply.",
      });
    }
  };

  if (documentsLoading) {
    return (
      <section className="w-full h-full bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Document Highlights</h2>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          <Skeleton className="h-32 w-full mb-4" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full mb-4" />
          ))}
        </ScrollArea>
      </section>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <section className="w-full h-full bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">Document Highlights</h2>
        </div>
        <div className="flex space-x-2">
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500 p-4">
          <p>No documents available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full h-full bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Document Highlights</h2>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        {selectedDocument && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-medium text-gray-900">
                {selectedDocument.name}
              </h3>
              <span className="text-xs text-gray-500">
                {new Date(selectedDocument.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {selectedDocument.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDocument.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`text-xs flex items-center gap-1 
                    ${tag === 'Document' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                    ${tag === 'Team' ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' : ''}
                    ${tag === 'Project' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                    ${tag === 'Requirements' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                  `}
                >
                  {tag === 'Document' && <FileText className="h-3 w-3" />}
                  {tag === 'Team' && <User className="h-3 w-3" />}
                  {tag === 'Project' && <FileText className="h-3 w-3" />}
                  {tag === 'Requirements' && <FileText className="h-3 w-3" />}
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {highlightsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-l-4 border-gray-300 pl-3 py-2 mb-4">
              <Skeleton className="h-5 w-40 mb-1" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ))
        ) : highlights && highlights.length > 0 ? (
          highlights.map((highlight) => (
            <div 
              key={highlight.id} 
              className={`border-l-4 pl-3 py-2 mb-4 
                ${highlight.category === 'Decision' ? 'border-yellow-400' : ''}
                ${highlight.category === 'Resources' ? 'border-green-400' : ''}
                ${highlight.category === 'Action' ? 'border-blue-400' : ''}
                ${highlight.category === 'Requirement' ? 'border-purple-400' : ''}
              `}
            >
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium text-gray-900">{highlight.title}</h4>
                <span className="text-xs text-gray-500">Page {highlight.page}</span>
              </div>
              <p className="text-sm text-gray-800 mb-2">{highlight.content}</p>
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 h-auto p-0"
                    onClick={() => handleCopy(highlight.content)}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 h-auto p-0"
                    onClick={() => handleQuoteInReply(highlight.content)}
                  >
                    <Quote className="h-3 w-3" />
                    Quote in Reply
                  </Button>
                </div>
                <div>
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium
                      ${highlight.priority === 'High Priority' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
                      ${highlight.priority === 'Medium Priority' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
                      ${highlight.priority === 'Assigned to You' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                      ${highlight.priority === 'New Requirement' ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100' : ''}
                    `}
                  >
                    {highlight.priority}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No highlights found for this document
          </div>
        )}
      </ScrollArea>
    </section>
  );
};

export default DocumentHighlights;
