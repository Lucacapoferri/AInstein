import React, { useState } from "react";
import { Search, RefreshCw, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useFormatDate, useSearch } from "@/lib/hooks";
import { Email } from "@/types";

interface EmailListProps {
  onSelectEmail: (email: Email) => void;
  selectedEmailId?: number;
}

const EmailList: React.FC<EmailListProps> = ({ onSelectEmail, selectedEmailId }) => {
  const [filterQuery, setFilterQuery] = useState("");

  const { data: emails, isLoading, refetch } = useQuery<Email[]>({
    queryKey: ["/api/emails"],
  });

  const { searchQuery, setSearchQuery, filteredItems: filteredEmails } = useSearch<Email>(
    emails || [],
    "subject"
  );
  
  const displayedEmails = filterQuery
    ? filteredEmails.filter(email => email.subject.toLowerCase().includes(filterQuery.toLowerCase()) || 
                                    email.sender.toLowerCase().includes(filterQuery.toLowerCase()))
    : filteredEmails;
  
  const handleRefresh = () => {
    refetch();
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterQuery(e.target.value);
  };

  if (isLoading) {
    return (
      <section className="w-full h-full bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Inbox</h2>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Input
              type="text"
              placeholder="Filter emails..."
              className="w-full pl-10 pr-4 py-2"
            />
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b border-gray-200 p-4">
              <div className="flex justify-between items-start mb-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-5 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </ScrollArea>
      </section>
    );
  }

  return (
    <section className="w-full h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">Inbox</h2>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder="Filter emails..."
            className="w-full pl-10 pr-4 py-2"
            value={filterQuery}
            onChange={handleFilterChange}
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {displayedEmails.length > 0 ? (
          displayedEmails.map((email) => (
            <EmailItem 
              key={email.id} 
              email={email} 
              isActive={email.id === selectedEmailId}
              onSelect={() => onSelectEmail(email)} 
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            No emails found
          </div>
        )}
      </ScrollArea>
    </section>
  );
};

interface EmailItemProps {
  email: Email;
  isActive: boolean;
  onSelect: () => void;
}

const EmailItem: React.FC<EmailItemProps> = ({ email, isActive, onSelect }) => {
  const formattedDate = useFormatDate(email.timestamp);
  
  return (
    <div 
      className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${isActive ? 'bg-blue-50' : ''}`}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium text-gray-900 truncate pr-2">
            {email.sender}
          </h3>
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>
        <h4 className="text-sm font-medium text-gray-800 mb-1 truncate">
          {email.subject}
        </h4>
        <p className="text-sm text-gray-600 line-clamp-2">
          {email.preview}
        </p>
        <div className="flex mt-2 gap-1 flex-wrap">
          {email.labels.map((label, index) => (
            <Badge
              key={index}
              variant="outline"
              className={`text-xs font-medium 
                ${label === 'Work' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : ''}
                ${label === 'Meeting' ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100' : ''} 
                ${label === 'Important' ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' : ''}
                ${label === 'Urgent' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
                ${label === 'Client' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                ${label === 'System' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
              `}
            >
              {label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmailList;
