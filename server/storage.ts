import { 
  users, 
  User, 
  InsertUser, 
  snapchatData, 
  SnapchatData,
  aiInsights,
  AiInsight,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSnapchatCredentials(userId: number, clientId: string, apiKey: string): Promise<User>;
  updateUserSubscription(userId: number, subscription: string, expiresAt: Date | null): Promise<User>;
  saveSnapchatData(userId: number, data: any): Promise<SnapchatData>;
  getLatestSnapchatData(userId: number): Promise<SnapchatData | undefined>;
  saveAiInsight(userId: number, insight: string): Promise<AiInsight>;
  getLatestAiInsight(userId: number): Promise<AiInsight | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private snapchatData: Map<number, SnapchatData[]>;
  private aiInsights: Map<number, AiInsight[]>;
  private currentUserId: number;
  private currentSnapchatDataId: number;
  private currentAiInsightId: number;

  constructor() {
    this.users = new Map();
    this.snapchatData = new Map();
    this.aiInsights = new Map();
    this.currentUserId = 1;
    this.currentSnapchatDataId = 1;
    this.currentAiInsightId = 1;
    
    // Add a demo user
    this.createUser({
      username: "demo",
      password: "demo123",
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      snapchatClientId: null,
      snapchatApiKey: null,
      subscription: "free",
      subscriptionExpiresAt: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserSnapchatCredentials(userId: number, clientId: string, apiKey: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { 
      ...user, 
      snapchatClientId: clientId, 
      snapchatApiKey: apiKey 
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserSubscription(userId: number, subscription: string, expiresAt: Date | null): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { 
      ...user, 
      subscription,
      subscriptionExpiresAt: expiresAt 
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async saveSnapchatData(userId: number, data: any): Promise<SnapchatData> {
    const id = this.currentSnapchatDataId++;
    const now = new Date();
    
    const snapchatDataEntry: SnapchatData = {
      id,
      userId,
      data,
      fetchedAt: now,
    };
    
    if (!this.snapchatData.has(userId)) {
      this.snapchatData.set(userId, []);
    }
    
    const userDataEntries = this.snapchatData.get(userId)!;
    userDataEntries.push(snapchatDataEntry);
    this.snapchatData.set(userId, userDataEntries);
    
    return snapchatDataEntry;
  }

  async getLatestSnapchatData(userId: number): Promise<SnapchatData | undefined> {
    const userDataEntries = this.snapchatData.get(userId);
    if (!userDataEntries || userDataEntries.length === 0) {
      return undefined;
    }
    
    // Sort by fetchedAt in descending order and return the most recent
    return userDataEntries.sort((a, b) => 
      b.fetchedAt.getTime() - a.fetchedAt.getTime()
    )[0];
  }

  async saveAiInsight(userId: number, insight: string): Promise<AiInsight> {
    const id = this.currentAiInsightId++;
    const now = new Date();
    
    const aiInsight: AiInsight = {
      id,
      userId,
      insight,
      createdAt: now,
    };
    
    if (!this.aiInsights.has(userId)) {
      this.aiInsights.set(userId, []);
    }
    
    const userInsights = this.aiInsights.get(userId)!;
    userInsights.push(aiInsight);
    this.aiInsights.set(userId, userInsights);
    
    return aiInsight;
  }

  async getLatestAiInsight(userId: number): Promise<AiInsight | undefined> {
    const userInsights = this.aiInsights.get(userId);
    if (!userInsights || userInsights.length === 0) {
      return undefined;
    }
    
    // Sort by createdAt in descending order and return the most recent
    return userInsights.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    )[0];
  }
}

export const storage = new MemStorage();
