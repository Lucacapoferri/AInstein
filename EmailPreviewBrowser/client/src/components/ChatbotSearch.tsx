import React, { useState } from 'react';
import { Bot, Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from "@tanstack/react-query";

interface ChatbotSearchProps {
  onSearch: (query: string) => void;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatbotSearch: React.FC<ChatbotSearchProps> = ({ onSearch }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I can help you search through your emails. What would you like to find?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearch = async (query: string) => {
    console.log("Qui ci passo")
    try {
      const res = await fetch(`http://localhost:8000/api/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      console.log("Search results:", data);
      // Do something with `data` (update state, etc.)
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setChatHistory([...chatHistory, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `I'll search for emails related to "${inputValue}"`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, botResponse]);
      
      // Trigger the search
      onSearch(inputValue);
      handleSearch(inputValue);
    }, 500);

    setInputValue('');
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        size="icon"
        className="rounded-full h-10 w-10 bg-primary/10 hover:bg-primary/20"
        aria-label="Search with AI assistant"
      >
        <Bot className="h-5 w-5 text-primary" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Bot className="mr-2 h-5 w-5" /> Email Search Assistant
            </DialogTitle>
            <DialogDescription>
              Ask me to find specific emails or content in your inbox.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4 max-h-[50vh]">
            <div className="space-y-4 mb-4">
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Type your query..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <DialogFooter className="flex justify-between items-center border-t pt-2 mt-2">
            <span className="text-xs text-muted-foreground">
              Ask natural language questions about your emails
            </span>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 mr-1" /> Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatbotSearch;