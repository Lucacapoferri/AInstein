import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for emails
  app.get("/api/emails", async (req, res) => {
    try {
      // In a real app, we'd get userId from the session
      const userId = 1; // Using demo user
      const emails = await storage.getEmails(userId);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emails" });
    }
  });

  app.get("/api/emails/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid email ID" });
      }
      
      const email = await storage.getEmail(id);
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      
      // Mark as read if it wasn't already
      if (!email.isRead) {
        await storage.updateEmail(id, { isRead: true });
      }
      
      res.json(email);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email" });
    }
  });

  // API route for email threads
  app.get("/api/threads/:threadId", async (req, res) => {
    try {
      const threadId = req.params.threadId;
      if (!threadId) {
        return res.status(400).json({ message: "Invalid thread ID" });
      }
      
      const emails = await storage.getEmailThread(threadId);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch email thread" });
    }
  });

  // API routes for documents
  app.get("/api/documents", async (req, res) => {
    try {
      // In a real app, we'd get userId from the session
      const userId = 1; // Using demo user
      const documents = await storage.getDocuments(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // API routes for highlights
  app.get("/api/documents/:documentId/highlights", async (req, res) => {
    try {
      const documentId = parseInt(req.params.documentId);
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const highlights = await storage.getHighlights(documentId);
      res.json(highlights);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch highlights" });
    }
  });

  // API routes for replies
  app.get("/api/emails/:emailId/reply", async (req, res) => {
    try {
      const emailId = parseInt(req.params.emailId);
      if (isNaN(emailId)) {
        return res.status(400).json({ message: "Invalid email ID" });
      }
      
      // Check if we already have a reply for this email
      let reply = await storage.getReply(emailId);
      
      if (!reply) {
        // In a real application, we would call an external AI service to generate a reply
        // For demo purposes, we're generating a simple reply
        const email = await storage.getEmail(emailId);
        if (!email) {
          return res.status(404).json({ message: "Email not found" });
        }
        
        // Create a simple reply
        reply = await storage.createReply({
          emailId,
          subject: `Re: ${email.subject}`,
          content: `Hello ${email.sender.split(' ')[0]},\n\nThank you for your email. This is an AI-generated reply to your message about "${email.subject}".\n\nBest regards,\nDemo User`,
          tone: "Formal",
          length: "Concise",
          isDraft: true
        });
      }
      
      res.json(reply);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate reply" });
    }
  });

  app.post("/api/emails/:emailId/reply", async (req, res) => {
    try {
      const emailId = parseInt(req.params.emailId);
      if (isNaN(emailId)) {
        return res.status(400).json({ message: "Invalid email ID" });
      }
      
      const { content, subject, isDraft } = req.body;
      
      if (!content || !subject) {
        return res.status(400).json({ message: "Content and subject are required" });
      }
      
      // Check if we already have a reply
      const existingReply = await storage.getReply(emailId);
      
      if (existingReply) {
        // Update existing reply
        const updatedReply = await storage.updateReply(existingReply.id, {
          content,
          subject,
          isDraft: isDraft !== undefined ? isDraft : existingReply.isDraft
        });
        
        return res.json(updatedReply);
      }
      
      // Create a new reply
      const reply = await storage.createReply({
        emailId,
        content,
        subject,
        isDraft: isDraft !== undefined ? isDraft : true
      });
      
      res.status(201).json(reply);
    } catch (error) {
      res.status(500).json({ message: "Failed to save reply" });
    }
  });

  // Mock endpoint to simulate sending an email
  app.post("/api/emails/:emailId/send", async (req, res) => {
    try {
      const emailId = parseInt(req.params.emailId);
      if (isNaN(emailId)) {
        return res.status(400).json({ message: "Invalid email ID" });
      }
      
      const reply = await storage.getReply(emailId);
      if (!reply) {
        return res.status(404).json({ message: "Reply not found" });
      }
      
      // Mark as sent (not a draft anymore)
      const updatedReply = await storage.updateReply(reply.id, { isDraft: false });
      
      // In a real app, we would call an email service to send the email
      
      res.json({ message: "Email sent successfully", reply: updatedReply });
    } catch (error) {
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
