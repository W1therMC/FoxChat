// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  rooms;
  constructor() {
    this.rooms = /* @__PURE__ */ new Map();
  }
  async getRoom(seed) {
    return this.rooms.get(seed);
  }
  async createRoom(seed, leaderIp, leaderName) {
    const room = {
      id: randomUUID(),
      seed,
      leaderIp,
      leaderName,
      password: void 0,
      maxUsers: 20,
      users: [],
      banList: [],
      lastKick: 0,
      messages: []
    };
    this.rooms.set(seed, room);
    return room;
  }
  async updateRoom(seed, room) {
    this.rooms.set(seed, room);
    return room;
  }
  async deleteRoom(seed) {
    this.rooms.delete(seed);
  }
  async addUserToRoom(seed, user) {
    const room = this.rooms.get(seed);
    if (!room) return void 0;
    room.users = room.users.filter((u) => u.ip !== user.ip);
    room.users.push(user);
    this.rooms.set(seed, room);
    return room;
  }
  async removeUserFromRoom(seed, userIp) {
    const room = this.rooms.get(seed);
    if (!room) return void 0;
    room.users = room.users.filter((u) => u.ip !== userIp);
    this.rooms.set(seed, room);
    return room;
  }
  async addMessageToRoom(seed, message) {
    const room = this.rooms.get(seed);
    if (!room) return void 0;
    room.messages.push(message);
    if (room.messages.length > 50) {
      room.messages = room.messages.slice(-50);
    }
    this.rooms.set(seed, room);
    return room;
  }
  async getAllRooms() {
    return Array.from(this.rooms.values());
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { z } from "zod";
var roomSchema = z.object({
  id: z.string(),
  seed: z.string(),
  leaderIp: z.string(),
  leaderName: z.string(),
  password: z.string().optional(),
  maxUsers: z.number().default(20),
  users: z.array(z.object({
    ip: z.string(),
    name: z.string(),
    isLeader: z.boolean().default(false)
  })),
  banList: z.array(z.string()),
  lastKick: z.number().default(0),
  messages: z.array(z.object({
    id: z.string(),
    user: z.string().optional(),
    text: z.string(),
    timestamp: z.number(),
    type: z.enum(["user", "system"]),
    ip: z.string().optional()
  }))
});
var userSchema = z.object({
  ip: z.string(),
  name: z.string(),
  isLeader: z.boolean().default(false)
});
var messageSchema = z.object({
  id: z.string(),
  user: z.string().optional(),
  text: z.string(),
  timestamp: z.number(),
  type: z.enum(["user", "system"]),
  ip: z.string().optional()
});
var wsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("join"),
    data: z.object({
      username: z.string(),
      seed: z.string(),
      password: z.string().optional()
    })
  }),
  z.object({
    type: z.literal("message"),
    data: z.object({
      text: z.string().max(150)
    })
  }),
  z.object({
    type: z.literal("command"),
    data: z.object({
      command: z.string()
    })
  }),
  z.object({
    type: z.literal("leave"),
    data: z.object({})
  })
]);
var wsResponseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("joined"),
    data: z.object({
      room: roomSchema,
      userIp: z.string()
    })
  }),
  z.object({
    type: z.literal("message"),
    data: messageSchema
  }),
  z.object({
    type: z.literal("userUpdate"),
    data: z.object({
      users: z.array(userSchema)
    })
  }),
  z.object({
    type: z.literal("error"),
    data: z.object({
      message: z.string(),
      code: z.string().optional()
    })
  }),
  z.object({
    type: z.literal("kicked"),
    data: z.object({
      reason: z.string()
    })
  })
]);

// server/routes.ts
import { randomUUID as randomUUID2 } from "crypto";
var clients = /* @__PURE__ */ new Map();
function generatePseudoIp() {
  return Math.floor(Math.random() * 1e10).toString(36) + String(Date.now()).slice(-5);
}
function generateRandomSeed(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function validateUsername(username) {
  return /^[A-Za-z0-9_.\-]{2,20}$/.test(username);
}
function getUniqueUsername(room, baseName) {
  let count = 0;
  const existingNames = room.users.map((u) => u.name.replace(/^\*/, ""));
  for (const name of existingNames) {
    if (name === baseName || name.startsWith(baseName + "(")) {
      count++;
    }
  }
  if (count === 0) return "*" + baseName;
  return "*" + baseName + `(${count})`;
}
function sendToClient(ws, response) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(response));
  }
}
function broadcastToRoom(roomSeed, response, excludeIp) {
  for (const [ws, clientInfo] of clients.entries()) {
    if (clientInfo.roomSeed === roomSeed && clientInfo.ip !== excludeIp) {
      sendToClient(ws, response);
    }
  }
}
async function handleJoinRoom(ws, clientInfo, data) {
  const { username, seed, password } = data;
  if (!validateUsername(username)) {
    sendToClient(ws, {
      type: "error",
      data: { message: "Invalid username (2-20 chars letters/numbers/._-)", code: "INVALID_USERNAME" }
    });
    return;
  }
  const finalSeed = seed.trim() || generateRandomSeed(10);
  let room = await storage.getRoom(finalSeed);
  if (room && room.banList.includes(clientInfo.ip)) {
    sendToClient(ws, {
      type: "error",
      data: { message: "You are banned from this room", code: "BANNED" }
    });
    return;
  }
  if (!room) {
    room = await storage.createRoom(finalSeed, clientInfo.ip, username);
  }
  if (room.password && room.password !== password) {
    sendToClient(ws, {
      type: "error",
      data: { message: "Wrong password", code: "WRONG_PASSWORD" }
    });
    return;
  }
  if (room.users.length >= room.maxUsers) {
    sendToClient(ws, {
      type: "error",
      data: { message: "Room is full", code: "ROOM_FULL" }
    });
    return;
  }
  const uniqueUsername = getUniqueUsername(room, username);
  const isLeader = room.leaderIp === clientInfo.ip;
  const user = {
    ip: clientInfo.ip,
    name: uniqueUsername,
    isLeader
  };
  room = await storage.addUserToRoom(finalSeed, user);
  if (!room) return;
  clientInfo.roomSeed = finalSeed;
  clientInfo.username = uniqueUsername;
  const joinMessage = {
    id: randomUUID2(),
    text: `${uniqueUsername} joined the room`,
    timestamp: Date.now(),
    type: "system"
  };
  await storage.addMessageToRoom(finalSeed, joinMessage);
  sendToClient(ws, {
    type: "joined",
    data: { room, userIp: clientInfo.ip }
  });
  broadcastToRoom(finalSeed, {
    type: "message",
    data: joinMessage
  });
  broadcastToRoom(finalSeed, {
    type: "userUpdate",
    data: { users: room.users }
  });
}
async function handleMessage(ws, clientInfo, data) {
  if (!clientInfo.roomSeed || !clientInfo.username) return;
  const { text } = data;
  const now = Date.now();
  if (now - clientInfo.lastMessage < 5e3) {
    sendToClient(ws, {
      type: "error",
      data: { message: "You are sending messages too fast", code: "SPAM" }
    });
    return;
  }
  clientInfo.lastMessage = now;
  const message = {
    id: randomUUID2(),
    user: clientInfo.username,
    text: text.trim(),
    timestamp: now,
    type: "user",
    ip: clientInfo.ip
  };
  await storage.addMessageToRoom(clientInfo.roomSeed, message);
  const response = {
    type: "message",
    data: message
  };
  sendToClient(ws, response);
  broadcastToRoom(clientInfo.roomSeed, response, clientInfo.ip);
}
async function handleCommand(ws, clientInfo, data) {
  if (!clientInfo.roomSeed || !clientInfo.username) return;
  const { command } = data;
  const room = await storage.getRoom(clientInfo.roomSeed);
  if (!room) return;
  const args = command.split(" ");
  const cmd = args[0].toLowerCase();
  switch (cmd) {
    case "/exit":
      await handleLeave(ws, clientInfo);
      break;
    case "/kick":
      if (room.leaderIp !== clientInfo.ip) {
        sendToClient(ws, {
          type: "error",
          data: { message: "Only the leader can use this command", code: "NOT_LEADER" }
        });
        return;
      }
      if (args.length < 2) {
        sendToClient(ws, {
          type: "error",
          data: { message: "Usage: /kick username", code: "INVALID_USAGE" }
        });
        return;
      }
      if (Date.now() - room.lastKick < 6e4) {
        sendToClient(ws, {
          type: "error",
          data: { message: "You can only kick one user per minute", code: "KICK_COOLDOWN" }
        });
        return;
      }
      const targetName = args.slice(1).join(" ").trim();
      const targetUser = room.users.find((u) => u.name === targetName);
      if (!targetUser || targetUser.ip === clientInfo.ip) {
        sendToClient(ws, {
          type: "error",
          data: { message: "User not found", code: "USER_NOT_FOUND" }
        });
        return;
      }
      room.banList.push(targetUser.ip);
      room.lastKick = Date.now();
      await storage.removeUserFromRoom(clientInfo.roomSeed, targetUser.ip);
      await storage.updateRoom(clientInfo.roomSeed, room);
      for (const [targetWs, targetClientInfo] of clients.entries()) {
        if (targetClientInfo.ip === targetUser.ip) {
          sendToClient(targetWs, {
            type: "kicked",
            data: { reason: "You have been kicked from the room" }
          });
          targetWs.close();
          break;
        }
      }
      const kickMessage = {
        id: randomUUID2(),
        text: `${targetUser.name} was kicked from the room`,
        timestamp: Date.now(),
        type: "system"
      };
      await storage.addMessageToRoom(clientInfo.roomSeed, kickMessage);
      broadcastToRoom(clientInfo.roomSeed, {
        type: "message",
        data: kickMessage
      });
      const updatedRoom = await storage.getRoom(clientInfo.roomSeed);
      if (updatedRoom) {
        broadcastToRoom(clientInfo.roomSeed, {
          type: "userUpdate",
          data: { users: updatedRoom.users }
        });
      }
      break;
    case "/password":
      if (room.leaderIp !== clientInfo.ip) {
        sendToClient(ws, {
          type: "error",
          data: { message: "Only the leader can use this command", code: "NOT_LEADER" }
        });
        return;
      }
      if (args.length < 2) {
        sendToClient(ws, {
          type: "error",
          data: { message: "Usage: /password newpassword", code: "INVALID_USAGE" }
        });
        return;
      }
      const newPassword = args.slice(1).join(" ").trim();
      room.password = newPassword;
      await storage.updateRoom(clientInfo.roomSeed, room);
      sendToClient(ws, {
        type: "error",
        data: { message: "Password changed successfully", code: "SUCCESS" }
      });
      break;
    case "/maxuser":
      if (room.leaderIp !== clientInfo.ip) {
        sendToClient(ws, {
          type: "error",
          data: { message: "Only the leader can use this command", code: "NOT_LEADER" }
        });
        return;
      }
      if (args.length < 2) {
        sendToClient(ws, {
          type: "error",
          data: { message: "Usage: /maxuser number", code: "INVALID_USAGE" }
        });
        return;
      }
      const maxUsers = parseInt(args[1], 10);
      if (isNaN(maxUsers) || maxUsers < 2 || maxUsers > 20) {
        sendToClient(ws, {
          type: "error",
          data: { message: "Max users must be between 2 and 20", code: "INVALID_NUMBER" }
        });
        return;
      }
      room.maxUsers = maxUsers;
      await storage.updateRoom(clientInfo.roomSeed, room);
      sendToClient(ws, {
        type: "error",
        data: { message: `Max user limit set to ${maxUsers}`, code: "SUCCESS" }
      });
      break;
    default:
      sendToClient(ws, {
        type: "error",
        data: { message: "Unknown command", code: "UNKNOWN_COMMAND" }
      });
  }
}
async function handleLeave(ws, clientInfo) {
  if (!clientInfo.roomSeed || !clientInfo.username) return;
  const room = await storage.removeUserFromRoom(clientInfo.roomSeed, clientInfo.ip);
  if (!room) return;
  const leaveMessage = {
    id: randomUUID2(),
    text: `${clientInfo.username} left the room`,
    timestamp: Date.now(),
    type: "system"
  };
  await storage.addMessageToRoom(clientInfo.roomSeed, leaveMessage);
  broadcastToRoom(clientInfo.roomSeed, {
    type: "message",
    data: leaveMessage
  });
  broadcastToRoom(clientInfo.roomSeed, {
    type: "userUpdate",
    data: { users: room.users }
  });
  clientInfo.roomSeed = void 0;
  clientInfo.username = void 0;
}
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws) => {
    const clientInfo = {
      ip: generatePseudoIp(),
      lastMessage: 0
    };
    clients.set(ws, clientInfo);
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        const parsedMessage = wsMessageSchema.parse(message);
        switch (parsedMessage.type) {
          case "join":
            await handleJoinRoom(ws, clientInfo, parsedMessage.data);
            break;
          case "message":
            await handleMessage(ws, clientInfo, parsedMessage.data);
            break;
          case "command":
            await handleCommand(ws, clientInfo, parsedMessage.data);
            break;
          case "leave":
            await handleLeave(ws, clientInfo);
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        sendToClient(ws, {
          type: "error",
          data: { message: "Invalid message format", code: "INVALID_FORMAT" }
        });
      }
    });
    ws.on("close", async () => {
      if (clientInfo.roomSeed && clientInfo.username) {
        await handleLeave(ws, clientInfo);
      }
      clients.delete(ws);
    });
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws);
    });
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
