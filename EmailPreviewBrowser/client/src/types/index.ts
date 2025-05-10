export interface Email {
  id: number;
  userId: number;
  sender: string;
  senderEmail: string;
  recipients: string[];
  subject: string;
  body: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  labels: string[];
  threadId?: string;
}

export interface Document {
  id: number;
  userId: number;
  name: string;
  type: string;
  description: string;
  date: string;
  content: string;
  tags: string[];
}

export interface Highlight {
  id: number;
  documentId: number;
  title: string;
  content: string;
  page: number;
  priority: string;
  category: string;
}

export interface Reply {
  id: number;
  emailId: number;
  content: string;
  subject: string;
  tone?: string;
  length?: string;
  isDraft: boolean;
}
