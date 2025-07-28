import { type Room, type User, type Message } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getRoom(seed: string): Promise<Room | undefined>;
  createRoom(seed: string, leaderIp: string, leaderName: string): Promise<Room>;
  updateRoom(seed: string, room: Room): Promise<Room>;
  deleteRoom(seed: string): Promise<void>;
  addUserToRoom(seed: string, user: User): Promise<Room | undefined>;
  removeUserFromRoom(seed: string, userIp: string): Promise<Room | undefined>;
  addMessageToRoom(seed: string, message: Message): Promise<Room | undefined>;
  getAllRooms(): Promise<Room[]>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  async getRoom(seed: string): Promise<Room | undefined> {
    return this.rooms.get(seed);
  }

  async createRoom(seed: string, leaderIp: string, leaderName: string): Promise<Room> {
    const room: Room = {
      id: randomUUID(),
      seed,
      leaderIp,
      leaderName,
      password: undefined,
      maxUsers: 20,
      users: [],
      banList: [],
      lastKick: 0,
      messages: []
    };
    this.rooms.set(seed, room);
    return room;
  }

  async updateRoom(seed: string, room: Room): Promise<Room> {
    this.rooms.set(seed, room);
    return room;
  }

  async deleteRoom(seed: string): Promise<void> {
    this.rooms.delete(seed);
  }

  async addUserToRoom(seed: string, user: User): Promise<Room | undefined> {
    const room = this.rooms.get(seed);
    if (!room) return undefined;

    // Remove existing user with same IP if exists
    room.users = room.users.filter(u => u.ip !== user.ip);
    room.users.push(user);
    
    this.rooms.set(seed, room);
    return room;
  }

  async removeUserFromRoom(seed: string, userIp: string): Promise<Room | undefined> {
    const room = this.rooms.get(seed);
    if (!room) return undefined;

    room.users = room.users.filter(u => u.ip !== userIp);
    this.rooms.set(seed, room);
    return room;
  }

  async addMessageToRoom(seed: string, message: Message): Promise<Room | undefined> {
    const room = this.rooms.get(seed);
    if (!room) return undefined;

    const now = Date.now();
    // 1 dakikadan eski mesajları temizle
    room.messages = room.messages.filter((msg) => now - msg.timestamp < 60000);
    room.messages.push(message);

    // Maksimum 50 mesajı koru
    if (room.messages.length > 50) {
      room.messages = room.messages.slice(-50);
    }

    this.rooms.set(seed, room);
    return room;
  }

  async getAllRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }
}

// Eski mesajları temizleyen bir fonksiyon
setInterval(async () => {
    const now = Date.now();
    const rooms = await storage.getAllRooms(); // Tüm odaları al

    for (const room of rooms) {
        // 1 dakikadan eski mesajları temizle
        room.messages = room.messages.filter((msg) => now - msg.timestamp < 60000);
        await storage.updateRoom(room.seed, room); // Güncellenmiş odayı kaydet
    }
}, 60000);

export const storage = new MemStorage();
