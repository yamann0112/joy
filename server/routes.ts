import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertChatMessageSchema, insertTicketSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const MemoryStoreSession = MemoryStore(session);

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Yetkisiz erişim" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "platform-secret-key-2024",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000,
      }),
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      const user = await storage.createUser(validatedData);
      req.session.userId = user.id;
      
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Kayıt başarısız" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user || user.password !== validatedData.password) {
        return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı" });
      }

      await storage.updateUser(user.id, { isOnline: true });
      req.session.userId = user.id;
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Giriş başarısız" });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    if (req.session.userId) {
      await storage.updateUser(req.session.userId, { isOnline: false });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Çıkış yapılamadı" });
      }
      res.json({ message: "Çıkış başarılı" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Oturum bulunamadı" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.get("/api/stats", requireAuth, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  app.get("/api/users", requireAuth, async (req, res) => {
    const users = await storage.getAllUsers();
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  });

  app.get("/api/admin/users", requireAuth, async (req, res) => {
    const currentUser = await storage.getUser(req.session.userId!);
    if (currentUser?.role !== "ADMIN") {
      return res.status(403).json({ message: "Yetkisiz erişim" });
    }
    
    const users = await storage.getAllUsers();
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  });

  app.get("/api/events", requireAuth, async (req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.get("/api/events/:id", requireAuth, async (req, res) => {
    const event = await storage.getEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Etkinlik bulunamadı" });
    }
    res.json(event);
  });

  app.get("/api/chat/groups", requireAuth, async (req, res) => {
    const groups = await storage.getChatGroups();
    res.json(groups);
  });

  app.get("/api/chat/messages", requireAuth, async (req, res) => {
    const groupId = req.query.groupId as string;
    if (!groupId) {
      return res.status(400).json({ message: "Group ID gerekli" });
    }

    const messages = await storage.getChatMessages(groupId);
    
    const messagesWithUsers = await Promise.all(
      messages.map(async (msg) => {
        const user = await storage.getUser(msg.userId);
        if (!user) {
          return { ...msg, user: null };
        }
        const { password, ...userWithoutPassword } = user;
        return { ...msg, user: userWithoutPassword };
      })
    );
    
    res.json(messagesWithUsers);
  });

  app.post("/api/chat/messages", requireAuth, async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      
      const message = await storage.createChatMessage({
        ...validatedData,
        userId: req.session.userId!,
      });
      
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        res.status(201).json({ ...message, user: null });
        return;
      }
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({ ...message, user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Mesaj gönderilemedi" });
    }
  });

  app.get("/api/tickets", requireAuth, async (req, res) => {
    const currentUser = await storage.getUser(req.session.userId!);
    
    let tickets;
    if (currentUser?.role === "ADMIN" || currentUser?.role === "MOD") {
      tickets = await storage.getTickets();
    } else {
      tickets = await storage.getTickets(req.session.userId);
    }
    
    res.json(tickets);
  });

  app.get("/api/admin/tickets/recent", requireAuth, async (req, res) => {
    const currentUser = await storage.getUser(req.session.userId!);
    if (currentUser?.role !== "ADMIN") {
      return res.status(403).json({ message: "Yetkisiz erişim" });
    }
    
    const tickets = await storage.getTickets();
    res.json(tickets.slice(0, 10));
  });

  app.post("/api/tickets", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTicketSchema.parse(req.body);
      
      const ticket = await storage.createTicket({
        ...validatedData,
        userId: req.session.userId!,
      });
      
      res.status(201).json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Talep oluşturulamadı" });
    }
  });

  app.patch("/api/tickets/:id", requireAuth, async (req, res) => {
    const currentUser = await storage.getUser(req.session.userId!);
    if (currentUser?.role !== "ADMIN" && currentUser?.role !== "MOD") {
      return res.status(403).json({ message: "Yetkisiz erişim" });
    }
    
    const ticket = await storage.updateTicket(req.params.id, req.body);
    if (!ticket) {
      return res.status(404).json({ message: "Talep bulunamadı" });
    }
    
    res.json(ticket);
  });

  return httpServer;
}
