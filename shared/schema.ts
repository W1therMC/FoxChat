import { z } from "zod";

// Room schema
export const roomSchema = z.object({
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
    type: z.enum(['user', 'system']),
    ip: z.string().optional()
  }))
});

// User schema
export const userSchema = z.object({
  ip: z.string(),
  name: z.string(),
  isLeader: z.boolean().default(false)
});

// Message schema
export const messageSchema = z.object({
  id: z.string(),
  user: z.string().optional(),
  text: z.string(),
  timestamp: z.number(),
  type: z.enum(['user', 'system']),
  ip: z.string().optional()
});

// WebSocket message types
export const wsMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('join'),
    data: z.object({
      username: z.string(),
      seed: z.string(),
      password: z.string().optional()
    })
  }),
  z.object({
    type: z.literal('message'),
    data: z.object({
      text: z.string().max(150)
    })
  }),
  z.object({
    type: z.literal('command'),
    data: z.object({
      command: z.string()
    })
  }),
  z.object({
    type: z.literal('leave'),
    data: z.object({})
  })
]);

// Response types
export const wsResponseSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('joined'),
    data: z.object({
      room: roomSchema,
      userIp: z.string()
    })
  }),
  z.object({
    type: z.literal('message'),
    data: messageSchema
  }),
  z.object({
    type: z.literal('userUpdate'),
    data: z.object({
      users: z.array(userSchema)
    })
  }),
  z.object({
    type: z.literal('error'),
    data: z.object({
      message: z.string(),
      code: z.string().optional()
    })
  }),
  z.object({
    type: z.literal('kicked'),
    data: z.object({
      reason: z.string()
    })
  })
]);

export type Room = z.infer<typeof roomSchema>;
export type User = z.infer<typeof userSchema>;
export type Message = z.infer<typeof messageSchema>;
export type WSMessage = z.infer<typeof wsMessageSchema>;
export type WSResponse = z.infer<typeof wsResponseSchema>;
