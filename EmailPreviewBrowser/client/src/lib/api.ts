import { apiRequest } from "./queryClient";
import type { Email, Document, Highlight, Reply } from "@/types";

// Email API functions
export async function getEmails(): Promise<Email[]> {
  const res = await apiRequest("GET", "/api/emails");
  return res.json();
}

export async function getEmail(id: number): Promise<Email> {
  const res = await apiRequest("GET", `/api/emails/${id}`);
  return res.json();
}

export async function getEmailThread(threadId: string): Promise<Email[]> {
  const res = await apiRequest("GET", `/api/threads/${threadId}`);
  return res.json();
}

// Document API functions
export async function getDocuments(): Promise<Document[]> {
  const res = await apiRequest("GET", "/api/documents");
  return res.json();
}

export async function getDocument(id: number): Promise<Document> {
  const res = await apiRequest("GET", `/api/documents/${id}`);
  return res.json();
}

// Highlight API functions
export async function getHighlights(documentId: number): Promise<Highlight[]> {
  const res = await apiRequest("GET", `/api/documents/${documentId}/highlights`);
  return res.json();
}

// Reply API functions
export async function getReply(emailId: number): Promise<Reply> {
  const res = await apiRequest("GET", `/api/emails/${emailId}/reply`);
  return res.json();
}

export async function saveReply(emailId: number, replyData: { content: string; subject: string; isDraft?: boolean }): Promise<Reply> {
  const res = await apiRequest("POST", `/api/emails/${emailId}/reply`, replyData);
  return res.json();
}

export async function sendEmail(emailId: number): Promise<{ message: string; reply: Reply }> {
  const res = await apiRequest("POST", `/api/emails/${emailId}/send`);
  return res.json();
}
