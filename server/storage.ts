import { 
  type User, type InsertUser, 
  type Event, type InsertEvent,
  type ChatGroup, type InsertChatGroup,
  type ChatMessage, type InsertChatMessage,
  type Ticket, type InsertTicket,
  type Announcement, type InsertAnnouncement,
  type AdminCreateUser
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent & { createdBy: string }): Promise<Event>;

  getChatGroups(): Promise<ChatGroup[]>;
  getChatGroup(id: string): Promise<ChatGroup | undefined>;
  createChatGroup(group: InsertChatGroup & { createdBy: string }): Promise<ChatGroup>;

  getChatMessages(groupId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage & { userId: string }): Promise<ChatMessage>;
  deleteChatMessage(id: string): Promise<boolean>;
  deleteGroupMessages(groupId: string): Promise<number>;
  deleteChatGroup(id: string): Promise<boolean>;

  getTickets(userId?: string): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket & { userId: string }): Promise<Ticket>;
  updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | undefined>;

  getStats(): Promise<{
    totalUsers: number;
    totalEvents: number;
    totalMessages: number;
    totalTickets: number;
  }>;

  getAnnouncements(): Promise<Announcement[]>;
  getActiveAnnouncement(): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement & { createdBy: string }): Promise<Announcement>;
  updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: string): Promise<boolean>;

  createUserByAdmin(user: AdminCreateUser): Promise<User>;
  deleteUser(id: string): Promise<boolean>;

  getSetting(key: string): Promise<string | undefined>;
  setSetting(key: string, value: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private events: Map<string, Event>;
  private chatGroups: Map<string, ChatGroup>;
  private chatMessages: Map<string, ChatMessage>;
  private tickets: Map<string, Ticket>;
  private announcements: Map<string, Announcement>;
  private settings: Map<string, string>;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.chatGroups = new Map();
    this.chatMessages = new Map();
    this.tickets = new Map();
    this.announcements = new Map();
    this.settings = new Map();

    this.seedData();
  }

  private seedData() {
    const adminId = randomUUID();
    const adminUser: User = {
      id: adminId,
      username: "admin",
      password: "admin123",
      displayName: "Platform Admin",
      role: "ADMIN",
      avatar: null,
      level: 50,
      isOnline: true,
      createdAt: new Date(),
    };
    this.users.set(adminId, adminUser);

    const modId = randomUUID();
    const modUser: User = {
      id: modId,
      username: "moderator",
      password: "mod123",
      displayName: "Moderatör",
      role: "MOD",
      avatar: null,
      level: 30,
      isOnline: true,
      createdAt: new Date(),
    };
    this.users.set(modId, modUser);

    const vipId = randomUUID();
    const vipUser: User = {
      id: vipId,
      username: "vipuser",
      password: "vip123",
      displayName: "VIP Üye",
      role: "VIP",
      avatar: null,
      level: 20,
      isOnline: false,
      createdAt: new Date(),
    };
    this.users.set(vipId, vipUser);

    const group1Id = randomUUID();
    this.chatGroups.set(group1Id, {
      id: group1Id,
      name: "Genel Sohbet",
      description: "Herkese açık genel sohbet grubu",
      createdBy: adminId,
      createdAt: new Date(),
    });

    const group2Id = randomUUID();
    this.chatGroups.set(group2Id, {
      id: group2Id,
      name: "VIP Lounge",
      description: "VIP üyelere özel sohbet alanı",
      createdBy: adminId,
      createdAt: new Date(),
    });

    const group3Id = randomUUID();
    this.chatGroups.set(group3Id, {
      id: group3Id,
      name: "Etkinlik Duyuruları",
      description: "Etkinlik ve PK duyuruları",
      createdBy: modId,
      createdAt: new Date(),
    });

    const event1Id = randomUUID();
    this.events.set(event1Id, {
      id: event1Id,
      title: "Haftalık PK Yarışması",
      description: "Her hafta düzenlenen büyük PK etkinliği. Ödüller ve sürprizler sizi bekliyor!",
      agencyName: "Elite Agency",
      agencyLogo: null,
      participant1Name: "StarQueen",
      participant1Avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=StarQueen",
      participant2Name: "GoldenKing",
      participant2Avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GoldenKing",
      participantCount: 24,
      participants: ["Ali", "Veli", "Ayşe", "Fatma", "Mehmet"],
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      isLive: false,
      createdBy: adminId,
      createdAt: new Date(),
    });

    const event2Id = randomUUID();
    this.events.set(event2Id, {
      id: event2Id,
      title: "VIP Özel Yayın",
      description: "VIP üyelere özel canlı yayın etkinliği",
      agencyName: "Premium Productions",
      agencyLogo: null,
      participant1Name: "DiamondStar",
      participant1Avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DiamondStar",
      participant2Name: "RubyQueen",
      participant2Avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=RubyQueen",
      participantCount: 12,
      participants: ["Crown", "Star", "Diamond"],
      scheduledAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
      isLive: true,
      createdBy: modId,
      createdAt: new Date(),
    });

    const event3Id = randomUUID();
    this.events.set(event3Id, {
      id: event3Id,
      title: "Yeni Başlayanlar Rehberi",
      description: "Platform kullanımı hakkında bilgilendirme etkinliği",
      agencyName: "Community Team",
      agencyLogo: null,
      participant1Name: "MentorPro",
      participant1Avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MentorPro",
      participant2Name: "GuideAce",
      participant2Avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GuideAce",
      participantCount: 45,
      participants: ["Helper1", "Helper2", "Guide"],
      scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      isLive: false,
      createdBy: adminId,
      createdAt: new Date(),
    });

    const announcementId = randomUUID();
    this.announcements.set(announcementId, {
      id: announcementId,
      content: "Platforma hos geldiniz! Bu hafta ozel etkinlikler ve surprizler sizi bekliyor. VIP uyelik avantajlarindan yararlanin!",
      isActive: true,
      createdBy: adminId,
      createdAt: new Date(),
    });

    const msg1Id = randomUUID();
    this.chatMessages.set(msg1Id, {
      id: msg1Id,
      groupId: group1Id,
      userId: adminId,
      content: "Herkese merhaba! Platforma hoş geldiniz.",
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
    });

    const msg2Id = randomUUID();
    this.chatMessages.set(msg2Id, {
      id: msg2Id,
      groupId: group1Id,
      userId: modId,
      content: "Merhaba! Herhangi bir sorunuz varsa yardımcı olmaktan mutluluk duyarım.",
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: "USER",
      avatar: null,
      level: 1,
      isOnline: true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(event: InsertEvent & { createdBy: string }): Promise<Event> {
    const id = randomUUID();
    const newEvent: Event = {
      id,
      title: event.title,
      description: event.description ?? null,
      agencyName: event.agencyName,
      agencyLogo: event.agencyLogo ?? null,
      participant1Name: event.participant1Name ?? null,
      participant1Avatar: event.participant1Avatar ?? null,
      participant2Name: event.participant2Name ?? null,
      participant2Avatar: event.participant2Avatar ?? null,
      participantCount: 0,
      participants: [],
      scheduledAt: event.scheduledAt,
      isLive: false,
      createdBy: event.createdBy,
      createdAt: new Date(),
    };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async getChatGroups(): Promise<ChatGroup[]> {
    return Array.from(this.chatGroups.values());
  }

  async getChatGroup(id: string): Promise<ChatGroup | undefined> {
    return this.chatGroups.get(id);
  }

  async createChatGroup(group: InsertChatGroup & { createdBy: string }): Promise<ChatGroup> {
    const id = randomUUID();
    const newGroup: ChatGroup = {
      id,
      name: group.name,
      description: group.description ?? null,
      createdBy: group.createdBy,
      createdAt: new Date(),
    };
    this.chatGroups.set(id, newGroup);
    return newGroup;
  }

  async getChatMessages(groupId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter((msg) => msg.groupId === groupId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createChatMessage(message: InsertChatMessage & { userId: string }): Promise<ChatMessage> {
    const id = randomUUID();
    const newMessage: ChatMessage = {
      ...message,
      id,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }

  async deleteChatMessage(id: string): Promise<boolean> {
    return this.chatMessages.delete(id);
  }

  async deleteGroupMessages(groupId: string): Promise<number> {
    let count = 0;
    const entries = Array.from(this.chatMessages.entries());
    for (const [id, msg] of entries) {
      if (msg.groupId === groupId) {
        this.chatMessages.delete(id);
        count++;
      }
    }
    return count;
  }

  async deleteChatGroup(id: string): Promise<boolean> {
    this.deleteGroupMessages(id);
    return this.chatGroups.delete(id);
  }

  async getTickets(userId?: string): Promise<Ticket[]> {
    let tickets = Array.from(this.tickets.values());
    if (userId) {
      tickets = tickets.filter((t) => t.userId === userId);
    }
    return tickets.sort(
      (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async createTicket(ticket: InsertTicket & { userId: string }): Promise<Ticket> {
    const id = randomUUID();
    const newTicket: Ticket = {
      ...ticket,
      id,
      status: "open",
      createdAt: new Date(),
    };
    this.tickets.set(id, newTicket);
    return newTicket;
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;
    const updatedTicket = { ...ticket, ...updates };
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async getStats(): Promise<{
    totalUsers: number;
    totalEvents: number;
    totalMessages: number;
    totalTickets: number;
  }> {
    return {
      totalUsers: this.users.size,
      totalEvents: this.events.size,
      totalMessages: this.chatMessages.size,
      totalTickets: this.tickets.size,
    };
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getActiveAnnouncement(): Promise<Announcement | undefined> {
    return Array.from(this.announcements.values())
      .find(a => a.isActive);
  }

  async createAnnouncement(announcement: InsertAnnouncement & { createdBy: string }): Promise<Announcement> {
    Array.from(this.announcements.values()).forEach(a => {
      a.isActive = false;
    });
    const id = randomUUID();
    const newAnnouncement: Announcement = {
      id,
      content: announcement.content,
      isActive: true,
      createdBy: announcement.createdBy,
      createdAt: new Date(),
    };
    this.announcements.set(id, newAnnouncement);
    return newAnnouncement;
  }

  async updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement | undefined> {
    const announcement = this.announcements.get(id);
    if (!announcement) return undefined;
    const updated = { ...announcement, ...updates };
    this.announcements.set(id, updated);
    return updated;
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    return this.announcements.delete(id);
  }

  async createUserByAdmin(user: AdminCreateUser): Promise<User> {
    const id = randomUUID();
    const newUser: User = {
      id,
      username: user.username,
      password: user.password,
      displayName: user.displayName,
      role: user.role,
      level: user.level,
      avatar: null,
      isOnline: false,
      createdAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getSetting(key: string): Promise<string | undefined> {
    return this.settings.get(key);
  }

  async setSetting(key: string, value: string): Promise<void> {
    this.settings.set(key, value);
  }
}

export const storage = new MemStorage();
