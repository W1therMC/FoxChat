import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { wsMessageSchema, type WSMessage, type WSResponse, type Room, type User, type Message } from "@shared/schema";
import { randomUUID } from "crypto";

interface ClientInfo {
  ip: string;
  roomSeed?: string;
  username?: string;
  lastMessage: number;
}

const clients = new Map<WebSocket, ClientInfo>();

function generatePseudoIp(): string {
  return Math.floor(Math.random() * 1e10).toString(36) + String(Date.now()).slice(-5);
}

function generateRandomSeed(length: number = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function validateUsername(username: string): boolean {
  return /^[A-Za-z0-9_.\-]{2,20}$/.test(username);
}

function getUniqueUsername(room: Room, baseName: string): string {
  let count = 0;
  const existingNames = room.users.map(u => u.name.replace(/^\*/, ""));
  
  for (const name of existingNames) {
    if (name === baseName || name.startsWith(baseName + "(")) {
      count++;
    }
  }
  
  if (count === 0) return "*" + baseName;
  return "*" + baseName + `(${count})`;
}

function sendToClient(ws: WebSocket, response: WSResponse) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(response));
  }
}

function broadcastToRoom(roomSeed: string, response: WSResponse, excludeIp?: string) {
  for (const [ws, clientInfo] of clients.entries()) {
    if (clientInfo.roomSeed === roomSeed && clientInfo.ip !== excludeIp) {
      sendToClient(ws, response);
    }
  }
}

async function handleJoinRoom(ws: WebSocket, clientInfo: ClientInfo, data: any) {
  const { username, seed, password } = data;
  
  if (!validateUsername(username)) {
    sendToClient(ws, {
      type: 'error',
      data: { message: 'Invalid username (2-20 chars letters/numbers/._-)', code: 'INVALID_USERNAME' }
    });
    return;
  }

  const finalSeed = seed.trim() || generateRandomSeed(10);
  let room = await storage.getRoom(finalSeed);

  // Check if user is banned
  if (room && room.banList.includes(clientInfo.ip)) {
    sendToClient(ws, {
      type: 'error',
      data: { message: 'You are banned from this room', code: 'BANNED' }
    });
    return;
  }

  // Create room if it doesn't exist
  if (!room) {
    room = await storage.createRoom(finalSeed, clientInfo.ip, username);
  }

  // Check password if room has one
  if (room.password && room.password !== password) {
    sendToClient(ws, {
      type: 'error',
      data: { message: 'Wrong password', code: 'WRONG_PASSWORD' }
    });
    return;
  }

  // Check room capacity
  if (room.users.length >= room.maxUsers) {
    sendToClient(ws, {
      type: 'error',
      data: { message: 'Room is full', code: 'ROOM_FULL' }
    });
    return;
  }

  const uniqueUsername = getUniqueUsername(room, username);
  const isLeader = room.leaderIp === clientInfo.ip;

  const user: User = {
    ip: clientInfo.ip,
    name: uniqueUsername,
    isLeader
  };

  room = await storage.addUserToRoom(finalSeed, user);
  if (!room) return;

  clientInfo.roomSeed = finalSeed;
  clientInfo.username = uniqueUsername;

  // Add system message
  const joinMessage: Message = {
    id: randomUUID(),
    text: `${uniqueUsername} joined the room`,
    timestamp: Date.now(),
    type: 'system'
  };

  await storage.addMessageToRoom(finalSeed, joinMessage);

  // Send room info to the joining user
  sendToClient(ws, {
    type: 'joined',
    data: { room, userIp: clientInfo.ip }
  });

  // Broadcast join message and user update to others
  broadcastToRoom(finalSeed, {
    type: 'message',
    data: joinMessage
  });

  broadcastToRoom(finalSeed, {
    type: 'userUpdate',
    data: { users: room.users }
  });
}

async function handleMessage(ws: WebSocket, clientInfo: ClientInfo, data: any) {
  if (!clientInfo.roomSeed || !clientInfo.username) return;

  const { text } = data;
  const now = Date.now();

  // Spam protection
  if (now - clientInfo.lastMessage < 5000) {
    sendToClient(ws, {
      type: 'error',
      data: { message: 'You are sending messages too fast', code: 'SPAM' }
    });
    return;
  }

  clientInfo.lastMessage = now;

  const message: Message = {
    id: randomUUID(),
    user: clientInfo.username,
    text: text.trim(),
    timestamp: now,
    type: 'user',
    ip: clientInfo.ip
  };

  await storage.addMessageToRoom(clientInfo.roomSeed, message);

  // Broadcast message to all users in room
  const response: WSResponse = {
    type: 'message',
    data: message
  };

  sendToClient(ws, response);
  broadcastToRoom(clientInfo.roomSeed, response, clientInfo.ip);
}

async function handleCommand(ws: WebSocket, clientInfo: ClientInfo, data: any) {
  if (!clientInfo.roomSeed || !clientInfo.username) return;

  const { command } = data;
  const room = await storage.getRoom(clientInfo.roomSeed);
  if (!room) return;

  const args = command.split(' ');
  const cmd = args[0].toLowerCase();

  switch (cmd) {
    case '/exit':
      await handleLeave(ws, clientInfo);
      break;

    case '/kick':
      if (room.leaderIp !== clientInfo.ip) {
        sendToClient(ws, {
          type: 'error',
          data: { message: 'Only the leader can use this command', code: 'NOT_LEADER' }
        });
        return;
      }

      if (args.length < 2) {
        sendToClient(ws, {
          type: 'error',
          data: { message: 'Usage: /kick username', code: 'INVALID_USAGE' }
        });
        return;
      }

      if (Date.now() - room.lastKick < 60000) {
        sendToClient(ws, {
          type: 'error',
          data: { message: 'You can only kick one user per minute', code: 'KICK_COOLDOWN' }
        });
        return;
      }

      const targetName = args.slice(1).join(' ').trim();
      const targetUser = room.users.find(u => u.name === targetName);
      
      if (!targetUser || targetUser.ip === clientInfo.ip) {
        sendToClient(ws, {
          type: 'error',
          data: { message: 'User not found', code: 'USER_NOT_FOUND' }
        });
        return;
      }

      // Ban and remove user
      room.banList.push(targetUser.ip);
      room.lastKick = Date.now();
      await storage.removeUserFromRoom(clientInfo.roomSeed, targetUser.ip);
      await storage.updateRoom(clientInfo.roomSeed, room);

      // Notify kicked user and disconnect them
      for (const [targetWs, targetClientInfo] of clients.entries()) {
        if (targetClientInfo.ip === targetUser.ip) {
          sendToClient(targetWs, {
            type: 'kicked',
            data: { reason: 'You have been kicked from the room' }
          });
          targetWs.close();
          break;
        }
      }

      // System message
      const kickMessage: Message = {
        id: randomUUID(),
        text: `${targetUser.name} was kicked from the room`,
        timestamp: Date.now(),
        type: 'system'
      };

      await storage.addMessageToRoom(clientInfo.roomSeed, kickMessage);
      broadcastToRoom(clientInfo.roomSeed, {
        type: 'message',
        data: kickMessage
      });

      const updatedRoom = await storage.getRoom(clientInfo.roomSeed);
      if (updatedRoom) {
        broadcastToRoom(clientInfo.roomSeed, {
          type: 'userUpdate',
          data: { users: updatedRoom.users }
        });
      }
      break;

    case '/password':
      if (room.leaderIp !== clientInfo.ip) {
        sendToClient(ws, {
          type: 'error',
          data: { message: 'Only the leader can use this command', code: 'NOT_LEADER' }
        });
        return;
      }

      if (args.length < 2) {
        sendToClient(ws, {
          type: 'error',
          data: { message: 'Usage: /password newpassword', code: 'INVALID_USAGE' }
        });
        return;
      }

      const newPassword = args.slice(1).join(' ').trim();
      room.password = newPassword;
      await storage.updateRoom(clientInfo.roomSeed, room);

      sendToClient(ws, {
        type: 'error',
        data: { message: 'Password changed successfully', code: 'SUCCESS' }
      });
      break;

    case '/maxuser':
      if (room.leaderIp !== clientInfo.ip) {
        sendToClient(ws, {
          type: 'error',
          data: { message: 'Only the leader can use this command', code: 'NOT_LEADER' }
        });
        return;
      }

      if (args.length < 2) {
        sendToClient(ws, {
          type: 'error',
          data: { message: 'Usage: /maxuser number', code: 'INVALID_USAGE' }
        });
        return;
      }

      const maxUsers = parseInt(args[1], 10);
      if (isNaN(maxUsers) || maxUsers < 2 || maxUsers > 20) {
        sendToClient(ws, {
          type: 'error',
          data: { message: 'Max users must be between 2 and 20', code: 'INVALID_NUMBER' }
        });
        return;
      }

      room.maxUsers = maxUsers;
      await storage.updateRoom(clientInfo.roomSeed, room);

      sendToClient(ws, {
        type: 'error',
        data: { message: `Max user limit set to ${maxUsers}`, code: 'SUCCESS' }
      });
      break;

    default:
      sendToClient(ws, {
        type: 'error',
        data: { message: 'Unknown command', code: 'UNKNOWN_COMMAND' }
      });
  }
}

async function handleLeave(ws: WebSocket, clientInfo: ClientInfo) {
  if (!clientInfo.roomSeed || !clientInfo.username) return;

  const room = await storage.removeUserFromRoom(clientInfo.roomSeed, clientInfo.ip);
  if (!room) return;

  // System message
  const leaveMessage: Message = {
    id: randomUUID(),
    text: `${clientInfo.username} left the room`,
    timestamp: Date.now(),
    type: 'system'
  };

  await storage.addMessageToRoom(clientInfo.roomSeed, leaveMessage);

  broadcastToRoom(clientInfo.roomSeed, {
    type: 'message',
    data: leaveMessage
  });

  broadcastToRoom(clientInfo.roomSeed, {
    type: 'userUpdate',
    data: { users: room.users }
  });

  clientInfo.roomSeed = undefined;
  clientInfo.username = undefined;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    const clientInfo: ClientInfo = {
      ip: generatePseudoIp(),
      lastMessage: 0
    };
    
    clients.set(ws, clientInfo);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        const parsedMessage = wsMessageSchema.parse(message);

        switch (parsedMessage.type) {
          case 'join':
            await handleJoinRoom(ws, clientInfo, parsedMessage.data);
            break;
          case 'message':
            await handleMessage(ws, clientInfo, parsedMessage.data);
            break;
          case 'command':
            await handleCommand(ws, clientInfo, parsedMessage.data);
            break;
          case 'leave':
            await handleLeave(ws, clientInfo);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        sendToClient(ws, {
          type: 'error',
          data: { message: 'Invalid message format', code: 'INVALID_FORMAT' }
        });
      }
    });

    ws.on('close', async () => {
      if (clientInfo.roomSeed && clientInfo.username) {
        await handleLeave(ws, clientInfo);
      }
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  return httpServer;
}
