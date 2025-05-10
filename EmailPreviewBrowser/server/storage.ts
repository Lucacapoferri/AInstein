import { 
  users, type User, type InsertUser,
  emails, type Email, type InsertEmail,
  documents, type Document, type InsertDocument,
  highlights, type Highlight, type InsertHighlight,
  replies, type Reply, type InsertReply
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Email methods
  getEmails(userId: number): Promise<Email[]>;
  getEmail(id: number): Promise<Email | undefined>;
  getEmailThread(threadId: string): Promise<Email[]>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmail(id: number, updates: Partial<Email>): Promise<Email | undefined>;
  deleteEmail(id: number): Promise<boolean>;
  
  // Document methods
  getDocuments(userId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Highlight methods
  getHighlights(documentId: number): Promise<Highlight[]>;
  getHighlight(id: number): Promise<Highlight | undefined>;
  createHighlight(highlight: InsertHighlight): Promise<Highlight>;
  updateHighlight(id: number, updates: Partial<Highlight>): Promise<Highlight | undefined>;
  deleteHighlight(id: number): Promise<boolean>;
  
  // Reply methods
  getReply(emailId: number): Promise<Reply | undefined>;
  createReply(reply: InsertReply): Promise<Reply>;
  updateReply(id: number, updates: Partial<Reply>): Promise<Reply | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private emails: Map<number, Email>;
  private documents: Map<number, Document>;
  private highlights: Map<number, Highlight>;
  private replies: Map<number, Reply>;
  
  private userId: number;
  private emailId: number;
  private documentId: number;
  private highlightId: number;
  private replyId: number;

  constructor() {
    this.users = new Map();
    this.emails = new Map();
    this.documents = new Map();
    this.highlights = new Map();
    this.replies = new Map();
    
    this.userId = 1;
    this.emailId = 1;
    this.documentId = 1;
    this.highlightId = 1;
    this.replyId = 1;
    
    // Add sample user
    this.createUser({
      username: "demo",
      password: "password123",
      email: "demo@example.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample emails - including a thread of emails for Jane Smith
    const sampleEmails: InsertEmail[] = [
      // Thread #1 - Project Timeline updates (Jane Smith)
      {
        userId: 1,
        sender: "Jane Smith",
        senderEmail: "jane.smith@example.com",
        recipients: ["demo@example.com"],
        subject: "Update on Project Timeline",
        body: "Hi there,\n\nI wanted to provide a quick update on the project timeline. We've made significant progress on the first milestone and we're on track to deliver by the end of the week.\n\nThe team has been working diligently, and I'm pleased with the progress so far. The client feedback has been positive as well.\n\nLet's schedule a meeting next week to discuss the details in more depth.\n\nBest regards,\nJane",
        preview: "Hi there, I wanted to provide a quick update on the project timeline. We've made significant progress on the first milestone and...",
        timestamp: new Date(new Date().getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        isRead: true,
        labels: ["Work"],
        threadId: "thread-project-timeline"
      },
      {
        userId: 1,
        sender: "Demo User",
        senderEmail: "demo@example.com",
        recipients: ["jane.smith@example.com"],
        subject: "Re: Update on Project Timeline",
        body: "Hi Jane,\n\nThanks for the update. Great to hear about our progress! I'd like to get some specific details about the completed tasks and any challenges you're anticipating for the next phase.\n\nRegarding the meeting, I'm available next Tuesday afternoon or Wednesday morning. What works for you?\n\nBest,\nDemo",
        preview: "Hi Jane, Thanks for the update. Great to hear about our progress! I'd like to get some specific details about...",
        timestamp: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        isRead: true,
        labels: ["Work"],
        threadId: "thread-project-timeline"
      },
      {
        userId: 1,
        sender: "Jane Smith",
        senderEmail: "jane.smith@example.com",
        recipients: ["demo@example.com"],
        subject: "Re: Update on Project Timeline",
        body: "Hello,\n\nWednesday morning works for me. How about 10:30 AM? Here are the key completed tasks:\n\n1. Backend API integration\n2. User authentication flow\n3. Initial database schema optimization\n\nFor the next phase, I'm concerned about the timeline for the reporting feature. We may need additional resources to complete it on schedule.\n\nI'll prepare a detailed analysis for our meeting.\n\nRegards,\nJane",
        preview: "Hello, Wednesday morning works for me. How about 10:30 AM? Here are the key completed tasks: 1. Backend API integration...",
        timestamp: new Date(new Date().getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        isRead: true,
        labels: ["Work", "Meeting"],
        threadId: "thread-project-timeline"
      },
      {
        userId: 1,
        sender: "Demo User",
        senderEmail: "demo@example.com",
        recipients: ["jane.smith@example.com"],
        subject: "Re: Update on Project Timeline",
        body: "Jane,\n\n10:30 AM on Wednesday is perfect. Thanks for the task breakdown.\n\nI understand your concern about the reporting feature. Let's discuss resource allocation during our meeting. I might be able to bring in someone from Team B to assist.\n\nAlso, could you share the latest project dashboard before our meeting?\n\nBest,\nDemo",
        preview: "Jane, 10:30 AM on Wednesday is perfect. Thanks for the task breakdown. I understand your concern about the reporting feature...",
        timestamp: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isRead: true,
        labels: ["Work", "Meeting"],
        threadId: "thread-project-timeline"
      },
      {
        userId: 1,
        sender: "Jane Smith",
        senderEmail: "jane.smith@example.com",
        recipients: ["demo@example.com"],
        subject: "Re: Update on Project Timeline",
        body: "Hi Demo,\n\nI've just sent you access to the latest project dashboard. You should receive an email with the login credentials shortly.\n\nThe data shows we're making good progress, but there's a bottleneck in the testing phase that we should address.\n\nGreat idea about Team B - I've already had an informal chat with Sarah, and she's potentially available to help.\n\nLooking forward to our meeting,\nJane",
        preview: "Hi Demo, I've just sent you access to the latest project dashboard. You should receive an email with the login credentials shortly...",
        timestamp: new Date(new Date().getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        isRead: true,
        labels: ["Work"],
        threadId: "thread-project-timeline"
      },
      {
        userId: 1,
        sender: "Jane Smith",
        senderEmail: "jane.smith@example.com",
        recipients: ["demo@example.com", "team@example.com"],
        subject: "Re: Update on Project Timeline - Meeting Summary",
        body: "Hello everyone,\n\nThank you for joining our meeting this morning. Here's a summary of what we discussed and the action items:\n\n1. Current progress: On track for Milestone 1\n2. Additional resources: Sarah from Team B will join us at 25% capacity starting next week\n3. Testing bottleneck: We're implementing a new automated testing framework to address this\n4. Next deliverable: Updated timeline will be shared by Friday\n\nPlease let me know if I missed anything important.\n\nBest regards,\nJane",
        preview: "Hello everyone, Thank you for joining our meeting this morning. Here's a summary of what we discussed and the action items...",
        timestamp: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isRead: false,
        labels: ["Work", "Important"],
        threadId: "thread-project-timeline"
      },
      
      // Other sample emails
      {
        userId: 1,
        sender: "Alex Johnson",
        senderEmail: "alex.johnson@example.com",
        recipients: ["demo@example.com"],
        subject: "Meeting notes from yesterday's call",
        body: "Hello team, I've attached the meeting notes from our call yesterday. We discussed the following key points:\n1. Project timeline adjustments\n2. Resource allocation for the next phase\n3. New stakeholder requirements\n\nPlease review and let me know if I missed anything important. We'll need to follow up on these items in our next meeting.",
        preview: "Hello team, I've attached the meeting notes from our call yesterday. We discussed the following key points: 1. Project timeline adjustments...",
        timestamp: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isRead: true,
        labels: ["Meeting", "Important"],
        threadId: "thread-meeting-notes"
      },
      {
        userId: 1,
        sender: "Michael Chen",
        senderEmail: "michael.chen@example.com",
        recipients: ["demo@example.com"],
        subject: "Quarterly report review request",
        body: "Hi team, Could you please review the attached quarterly report before our presentation next week? I'd appreciate your feedback on the data analysis section in particular. Let's make sure we're all aligned on the key findings before presenting to the stakeholders.",
        preview: "Hi team, Could you please review the attached quarterly report before our presentation next week? I'd appreciate your feedback on...",
        timestamp: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        isRead: false,
        labels: ["Urgent"],
        threadId: "thread-quarterly-report"
      },
      {
        userId: 1,
        sender: "Sarah Parker",
        senderEmail: "sarah.parker@example.com",
        recipients: ["demo@example.com"],
        subject: "In-Person Meeting Next Week",
        body: "Hello,\n\nI'd like to schedule an in-person meeting next Wednesday at 2:00 PM to discuss the upcoming product launch.\n\nMeeting Details:\nDate: Wednesday, May 17, 2025\nTime: 2:00 PM - 3:30 PM\nLocation: Skyline Conference Center, 123 Business Avenue, San Francisco, CA 94103\n\nPlease let me know if you can attend. I've also attached the preliminary agenda for the meeting.\n\nBest regards,\nSarah Parker\nProduct Marketing Manager",
        preview: "Hello, I'd like to schedule an in-person meeting next Wednesday at 2:00 PM to discuss the upcoming product launch. Meeting Details: Date...",
        timestamp: new Date(new Date().getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
        isRead: false,
        labels: ["Meeting", "Important", "Calendar"],
        threadId: "thread-product-launch"
      }
    ];
    
    // Add sample emails
    sampleEmails.forEach(email => this.createEmail(email));
    
    // Sample documents
    const sampleDocuments: InsertDocument[] = [
      {
        userId: 1,
        name: "Meeting Notes.docx",
        type: "docx",
        description: "Team meeting notes discussing project timeline and resource allocation.",
        date: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        content: "Full content of the meeting notes document",
        tags: ["Document", "Team"]
      },
      {
        userId: 1,
        name: "Project Timeline.xlsx",
        type: "xlsx",
        description: "Updated project timeline with milestones and deadlines.",
        date: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        content: "Full content of the project timeline document",
        tags: ["Document", "Project"]
      },
      {
        userId: 1,
        name: "Requirements Doc.pdf",
        type: "pdf",
        description: "Detailed requirements document for the current project phase.",
        date: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        content: "Full content of the requirements document",
        tags: ["Document", "Requirements"]
      }
    ];
    
    // Add sample documents
    sampleDocuments.forEach(doc => this.createDocument(doc));
    
    // Sample highlights
    const sampleHighlights: InsertHighlight[] = [
      {
        documentId: 1,
        title: "Key Decision Point",
        content: "The team has agreed to push back the delivery date for Phase 2 from June 15 to June 30 to accommodate additional requirements from the client.",
        page: 1,
        priority: "High Priority",
        category: "Decision"
      },
      {
        documentId: 1,
        title: "Resource Allocation",
        content: "Two additional developers will be assigned to the project starting next week to help meet the new deadlines. The budget has been approved for these additional resources.",
        page: 2,
        priority: "Medium Priority",
        category: "Resources"
      },
      {
        documentId: 1,
        title: "Action Item",
        content: "All team members need to update their sections of the project management tool with current status and blockers by end of day Friday.",
        page: 3,
        priority: "Assigned to You",
        category: "Action"
      },
      {
        documentId: 1,
        title: "Client Requirement",
        content: "The client has requested additional analytics features in the dashboard to track user engagement metrics. This should be included in the next sprint planning session.",
        page: 4,
        priority: "New Requirement",
        category: "Requirement"
      }
    ];
    
    // Add sample highlights
    sampleHighlights.forEach(highlight => this.createHighlight(highlight));
    
    // Sample reply for the meeting notes email
    this.createReply({
      emailId: 2, // Alex Johnson's email
      content: "Hello Alex,\n\nThank you for sharing the meeting notes. I've reviewed them and agree with the proposed timeline adjustments.\n\nRegarding the key points you mentioned:\n1. I can commit to completing the first milestone by next Wednesday.\n2. The resource allocation looks appropriate for our current phase.\n3. I've noted the new stakeholder requirements and will incorporate them into our next sprint planning.\n\nI've also taken note of the action items assigned to me and will update our project management tool accordingly.\n\nIs there anything specific you'd like me to prioritize before our next check-in?\n\nBest regards,\nDemo User",
      subject: "Re: Meeting notes from yesterday's call",
      tone: "Formal",
      length: "Concise",
      isDraft: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Email methods
  async getEmails(userId: number): Promise<Email[]> {
    return Array.from(this.emails.values())
      .filter(email => email.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  async getEmail(id: number): Promise<Email | undefined> {
    return this.emails.get(id);
  }
  
  async getEmailThread(threadId: string): Promise<Email[]> {
    if (!threadId) return [];
    
    const threadEmails: Email[] = [];
    for (const email of this.emails.values()) {
      if (email.threadId === threadId) {
        threadEmails.push(email);
      }
    }
    
    // Sort emails by timestamp (oldest first)
    return threadEmails.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
  
  async createEmail(insertEmail: InsertEmail): Promise<Email> {
    const id = this.emailId++;
    const email: Email = { ...insertEmail, id };
    this.emails.set(id, email);
    return email;
  }
  
  async updateEmail(id: number, updates: Partial<Email>): Promise<Email | undefined> {
    const email = this.emails.get(id);
    if (!email) return undefined;
    
    const updatedEmail = { ...email, ...updates };
    this.emails.set(id, updatedEmail);
    return updatedEmail;
  }
  
  async deleteEmail(id: number): Promise<boolean> {
    return this.emails.delete(id);
  }
  
  // Document methods
  async getDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentId++;
    const document: Document = { ...insertDocument, id };
    this.documents.set(id, document);
    return document;
  }
  
  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { ...document, ...updates };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
  
  // Highlight methods
  async getHighlights(documentId: number): Promise<Highlight[]> {
    return Array.from(this.highlights.values())
      .filter(highlight => highlight.documentId === documentId);
  }
  
  async getHighlight(id: number): Promise<Highlight | undefined> {
    return this.highlights.get(id);
  }
  
  async createHighlight(insertHighlight: InsertHighlight): Promise<Highlight> {
    const id = this.highlightId++;
    const highlight: Highlight = { ...insertHighlight, id };
    this.highlights.set(id, highlight);
    return highlight;
  }
  
  async updateHighlight(id: number, updates: Partial<Highlight>): Promise<Highlight | undefined> {
    const highlight = this.highlights.get(id);
    if (!highlight) return undefined;
    
    const updatedHighlight = { ...highlight, ...updates };
    this.highlights.set(id, updatedHighlight);
    return updatedHighlight;
  }
  
  async deleteHighlight(id: number): Promise<boolean> {
    return this.highlights.delete(id);
  }
  
  // Reply methods
  async getReply(emailId: number): Promise<Reply | undefined> {
    return Array.from(this.replies.values())
      .find(reply => reply.emailId === emailId);
  }
  
  async createReply(insertReply: InsertReply): Promise<Reply> {
    const id = this.replyId++;
    const reply: Reply = { ...insertReply, id };
    this.replies.set(id, reply);
    return reply;
  }
  
  async updateReply(id: number, updates: Partial<Reply>): Promise<Reply | undefined> {
    const reply = this.replies.get(id);
    if (!reply) return undefined;
    
    const updatedReply = { ...reply, ...updates };
    this.replies.set(id, updatedReply);
    return updatedReply;
  }
}

export const storage = new MemStorage();
