import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Star, Reply, MoreHorizontal, Users, Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Email } from '@/types';

interface ThreadViewProps {
  emails?: Email[];
  loading?: boolean;
}

const ThreadView: React.FC<ThreadViewProps> = ({ emails = [], loading = false }) => {
  const [expandedEmails, setExpandedEmails] = useState<Set<number>>(new Set([
    emails.length > 0 ? emails[emails.length - 1].id : -1 // Expand the latest email by default
  ]));

  const toggleExpand = (id: number) => {
    setExpandedEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <div className="mb-4 p-3 bg-blue-50 rounded-full">
          <Users className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Email Thread Selected</h3>
        <p className="text-gray-500 mb-4">Select an email to view its conversation thread</p>
      </div>
    );
  }

  // Sort emails by timestamp to show oldest first
  const sortedEmails = [...emails].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Count unique participants in the thread
  const uniqueParticipants = new Set(sortedEmails.map(email => email.senderEmail)).size;

  return (
    <section className="w-full h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-800">
            {sortedEmails.length > 1 
              ? `Thread (${sortedEmails.length} messages)` 
              : 'Email Thread'}
          </h2>
          {sortedEmails.length > 1 && (
            <div className="text-xs text-gray-500 mt-1">
              {uniqueParticipants} participants • Conversation started {sortedEmails.length > 0 ? new Date(sortedEmails[0].timestamp).toLocaleDateString() : ''}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          {sortedEmails.length > 0 && (
            <Button variant="ghost" size="sm">
              <Reply className="h-4 w-4 mr-1" />
              Reply All
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="py-4">
          {/* Thread subject line */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">
              {sortedEmails[0]?.subject?.replace(/^(Re: )+/g, '') || 'No Subject'}
            </h3>
            {sortedEmails.length > 1 && (
              <div className="text-sm flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {Array.from(new Set(sortedEmails.map(email => email.sender))).slice(0, 3).map((sender, index) => (
                    <div 
                      key={index}
                      className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                      title={sender}
                    >
                      {sender.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="text-gray-500">
                  {sortedEmails.length} messages in this conversation
                </span>
              </div>
            )}
          </div>

          {/* Thread emails */}
          <div className="space-y-4">
            {sortedEmails.map((email) => {
              const isExpanded = expandedEmails.has(email.id);
              return (
                <div 
                  key={email.id} 
                  className={`border rounded-lg overflow-hidden ${
                    isExpanded ? 'border-gray-300 shadow-sm' : 'border-gray-200'
                  }`}
                >
                  {/* Email header - always visible */}
                  <div 
                    className={`p-4 flex items-start gap-3 cursor-pointer ${isExpanded ? 'bg-white' : `${!email.isRead ? 'bg-blue-50' : 'bg-gray-50'} hover:bg-gray-100`}`}
                    onClick={() => toggleExpand(email.id)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10 mt-1">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${email.sender}&background=random`} alt={email.sender} />
                        <AvatarFallback>{email.sender.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {!email.isRead && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className={`text-sm ${!email.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-800'} truncate`}>
                          {email.sender}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(email.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">{email.senderEmail}</div>
                      
                      {!isExpanded && (
                        <p className={`text-sm ${!email.isRead ? 'font-medium text-gray-900' : 'text-gray-700'} line-clamp-1`}>
                          {email.preview}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Star className="h-4 w-4 text-gray-400" />
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Email body - only visible when expanded */}
                  {isExpanded && (
                    <div className="p-4 border-t border-gray-200">
                      {/* Recipients line */}
                      <div className="text-xs text-gray-500 mb-3">
                        <span className="mr-1">To:</span>
                        {email.recipients.map((recipient, index) => (
                          <span key={index}>
                            {recipient}
                            {index < email.recipients.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                      
                      {/* Email content */}
                      <div className="prose prose-sm max-w-none whitespace-pre-line text-gray-800">
                        {email.body}
                      </div>
                      
                      {/* Email labels and actions */}
                      {email.labels && email.labels.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                          {email.labels.map((label, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={`text-xs font-medium 
                                ${label === 'Work' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                                ${label === 'Meeting' ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100' : ''} 
                                ${label === 'Important' ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' : ''}
                                ${label === 'Urgent' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
                              `}
                            >
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Email actions */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="text-xs">
                            <Reply className="h-3.5 w-3.5 mr-1" />
                            Reply
                          </Button>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </section>
  );
};

export default ThreadView;