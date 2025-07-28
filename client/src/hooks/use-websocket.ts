import { useState, useEffect, useCallback, useRef } from "react";
import { WebSocketManager } from "@/lib/websocket";
import { getTranslation } from "@/lib/translations";
import type { Room, User, Message, WSResponse } from "@shared/schema";

interface UseWebSocketReturn {
  socket: WebSocketManager | null;
  isConnected: boolean;
  roomData: Room | null;
  messages: Message[];
  users: User[];
  error: string | null;
  needsPassword: boolean;
  showPasswordWarning: boolean;
  pendingRoomData: { username: string; seed: string } | null;
  joinRoom: (username: string, seed: string, password?: string) => void;
  sendMessage: (text: string) => void;
  sendCommand: (command: string) => void;
  leaveRoom: () => void;
  clearPasswordPrompt: () => void;
  handlePasswordWarningComplete: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [socket, setSocket] = useState<WebSocketManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [showPasswordWarning, setShowPasswordWarning] = useState(false);
  const [pendingRoomData, setPendingRoomData] = useState<{ username: string; seed: string } | null>(null);
  const currentUserIp = useRef<string>("");

  useEffect(() => {
    const ws = new WebSocketManager();
    setSocket(ws);

    const handleMessage = (data: WSResponse) => {
      switch (data.type) {
        case 'joined':
          setRoomData(data.data.room);
          setMessages(data.data.room.messages);
          setUsers(data.data.room.users);
          currentUserIp.current = data.data.userIp;
          setError(null);
          break;

        case 'message':
          setMessages(prev => [...prev, data.data]);
          break;

        case 'userUpdate':
          setUsers(data.data.users);
          break;

        case 'error':
          let errorMessage = data.data.message;
          
          // Handle password requirement specially
          if (data.data.code === 'WRONG_PASSWORD') {
            setNeedsPassword(true);
            return;
          }
          
          if (data.data.code === 'PASSWORD_REQUIRED') {
            setShowPasswordWarning(true);
            // Extract username and seed from message or use defaults
            const username = (data.data as any).username || 'user';
            const seed = (data.data as any).seed || 'room';
            setPendingRoomData({ username, seed });
            return;
          }
          
          // Translate common error codes
          switch (data.data.code) {
            case 'INVALID_USERNAME':
              errorMessage = getTranslation("errUsernameInvalid");
              break;
            case 'BANNED':
              errorMessage = getTranslation("errBanRoom");
              break;
            case 'ROOM_FULL':
              errorMessage = getTranslation("errRoomFull");
              break;
            case 'SPAM':
              errorMessage = getTranslation("errorSpamMsg");
              break;
            case 'NOT_LEADER':
              errorMessage = getTranslation("cmdNotLeader");
              break;
            case 'KICK_COOLDOWN':
              errorMessage = getTranslation("errKickCooldown");
              break;
            default:
              errorMessage = data.data.message;
          }
          
          setError(errorMessage);
          // Clear error after 5 seconds
          setTimeout(() => setError(null), 5000);
          break;

        case 'kicked':
          setError(data.data.reason);
          setRoomData(null);
          setMessages([]);
          setUsers([]);
          break;
      }
    };

    ws.addMessageHandler(handleMessage);

    // Check connection status periodically
    const connectionCheckInterval = setInterval(() => {
      setIsConnected(ws.isConnected());
    }, 1000);

    return () => {
      clearInterval(connectionCheckInterval);
      ws.removeMessageHandler(handleMessage);
      ws.close();
    };
  }, []);

  const joinRoom = useCallback((username: string, seed: string, password?: string) => {
    if (!socket) return;
    
    setError(null);
    setNeedsPassword(false);
    setPendingRoomData({ username, seed });
    
    socket.send({
      type: 'join',
      data: { username, seed, password }
    });
  }, [socket]);

  const clearPasswordPrompt = useCallback(() => {
    setNeedsPassword(false);
    setShowPasswordWarning(false);
    setPendingRoomData(null);
  }, []);

  const handlePasswordWarningComplete = useCallback(() => {
    setShowPasswordWarning(false);
    setNeedsPassword(true);
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!socket || !roomData) return;
    
    socket.send({
      type: 'message',
      data: { text }
    });
  }, [socket, roomData]);

  const sendCommand = useCallback((command: string) => {
    if (!socket || !roomData) return;
    
    socket.send({
      type: 'command',
      data: { command }
    });
  }, [socket, roomData]);

  const leaveRoom = useCallback(() => {
    if (!socket) return;
    
    socket.send({
      type: 'leave',
      data: {}
    });
    
    setRoomData(null);
    setMessages([]);
    setUsers([]);
    setError(null);
  }, [socket]);

  return {
    socket,
    isConnected,
    roomData,
    messages,
    users,
    error,
    needsPassword,
    showPasswordWarning,
    pendingRoomData,
    joinRoom,
    sendMessage,
    sendCommand,
    leaveRoom,
    clearPasswordPrompt,
    handlePasswordWarningComplete
  };
}
