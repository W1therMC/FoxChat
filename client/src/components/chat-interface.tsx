import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, LogOut, Crown, Circle, Ban, Users, Hash, Info } from "lucide-react";
import { getTranslation } from "@/lib/translations";
import type { Room, User, Message } from "@shared/schema";

interface ChatInterfaceProps {
  roomData: Room | null;
  messages: Message[];
  users: User[];
  isConnected: boolean;
  onSendMessage: (message: string) => void;
  onSendCommand: (command: string) => void;
  onLeaveRoom: () => void;
  error?: string;
}

export default function ChatInterface({
  roomData,
  messages,
  users,
  isConnected,
  onSendMessage,
  onSendCommand,
  onLeaveRoom,
  error
}: ChatInterfaceProps) {
  const [messageText, setMessageText] = useState("");
  const [currentUserIp, setCurrentUserIp] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Get current user IP from roomData when available
  useEffect(() => {
    if (roomData && !currentUserIp) {
      // This would typically come from the WebSocket connection
      setCurrentUserIp(roomData.leaderIp);
    }
  }, [roomData, currentUserIp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text) return;

    if (text.startsWith("/")) {
      onSendCommand(text);
    } else {
      onSendMessage(text);
    }
    setMessageText("");
  };

  const handleKickUser = (userIp: string) => {
    const user = users.find(u => u.ip === userIp);
    if (user) {
      onSendCommand(`/kick ${user.name}`);
    }
  };

  const currentUser = users.find(u => u.ip === currentUserIp);
  const isAdmin = currentUser?.isLeader || false;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  if (!roomData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fox-primary mx-auto mb-4"></div>
          <p className="text-fox-text/70">Connecting to room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="lg:w-80 bg-fox-card/90 backdrop-blur-sm border-r border-fox-border p-4 lg:p-6">
        {/* Room Info */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-fox-accent">{getTranslation("chatRoom")}</h2>
            <Button 
              onClick={onLeaveRoom}
              variant="ghost" 
              size="sm"
              className="lg:hidden text-red-400 hover:text-red-300"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
          <div className="text-sm text-fox-text/60 space-y-1">
            <div className="flex items-center">
              <Hash className="mr-1 h-3 w-3" />
              Seed: <span className="font-mono text-fox-accent ml-1">{roomData.seed}</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-1 h-3 w-3" />
              <span>{users.length}</span> users online
            </div>
          </div>
        </div>

        {/* Admin Panel */}
        {isAdmin && (
          <div className="admin-panel mb-6 p-4 text-sm">
            <div className="flex items-center mb-3">
              <Crown className="text-fox-accent mr-2 h-4 w-4" />
              <span className="text-fox-accent font-medium">{getTranslation("roomAdmin")}</span>
            </div>
            <div className="space-y-2 text-fox-text/80">
              <div><strong>{getTranslation("commands")}:</strong></div>
              <div className="font-mono text-xs space-y-1">
                <div>/kick username</div>
                <div>/password newpass</div>
                <div>/maxuser number</div>
                <div>/exit</div>
              </div>
            </div>
          </div>
        )}

        {/* Online Users */}
        <div className="mb-6">
          <h3 className="font-semibold text-fox-accent mb-3 flex items-center">
            <Circle className="text-green-400 mr-2 h-3 w-3 animate-pulse fill-current" />
            {getTranslation("onlineUsers")}
          </h3>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.ip} className="user-list-item flex items-center justify-between p-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="username-text text-sm">{user.name}</span>
                  {user.isLeader && <Crown className="text-fox-accent h-3 w-3" />}
                </div>
                {isAdmin && user.ip !== currentUserIp && (
                  <Button
                    onClick={() => handleKickUser(user.ip)}
                    variant="ghost"
                    size="sm"
                    className="kick-button text-xs px-2 py-1 h-auto"
                  >
                    <Ban className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status Messages */}
        <div className="text-xs text-fox-text/60 space-y-1">
          <div className="flex items-center space-x-2">
            <Info className="text-blue-400 h-3 w-3" />
            <span>
              {getTranslation("status")}: {isConnected ? getTranslation("connected") : getTranslation("disconnected")}
            </span>
          </div>
        </div>

        {/* Leave Button (Desktop) */}
        <div className="hidden lg:block mt-6">
          <Button 
            onClick={onLeaveRoom}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {getTranslation("leaveBtn")}
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages Container */}
        <ScrollArea className="flex-1 p-4 lg:p-6" ref={messagesContainerRef}>
          <div className="space-y-3 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id}>
                {message.type === 'system' ? (
                  <div className="flex justify-center">
                    <div className="bg-fox-sys-msg/10 text-fox-sys-msg px-4 py-2 rounded-full text-sm italic">
                      <Info className="inline mr-2 h-3 w-3" />
                      {message.text}
                    </div>
                  </div>
                ) : (
                  <div className={`flex items-start space-x-3 ${
                    message.ip === currentUserIp ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.ip === currentUserIp ? 'bg-green-500' : 'bg-fox-primary'
                    }`}>
                      <Users className="text-white h-3 w-3" />
                    </div>
                    <div className={`flex-1 min-w-0 ${message.ip === currentUserIp ? 'text-right' : ''}`}>
                      <div className={`flex items-center space-x-2 mb-1 ${
                        message.ip === currentUserIp ? 'justify-end' : ''
                      }`}>
                        {message.ip === currentUserIp && (
                          <span className="text-fox-text/40 text-xs">{formatTime(message.timestamp)}</span>
                        )}
                        <span className={`font-semibold text-sm ${
                          message.ip === currentUserIp ? 'text-green-400' : 'username-text'
                        }`}>
                          {message.ip === currentUserIp ? getTranslation("you") : message.user}
                        </span>
                        {message.ip !== currentUserIp && (
                          <span className="text-fox-text/40 text-xs">{formatTime(message.timestamp)}</span>
                        )}
                      </div>
                      <div className={`break-words ${
                        message.ip === currentUserIp 
                          ? 'my-message bg-green-500/10 rounded-lg px-3 py-2 inline-block' 
                          : 'user-message'
                      }`}>
                        {message.text}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Error Display */}
        {error && (
          <div className="px-4 lg:px-6">
            <div className="block-notice p-3 rounded-lg text-sm text-center max-w-4xl mx-auto">
              {error}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 lg:p-6 bg-fox-card/50 border-t border-fox-border">
          <form onSubmit={handleSubmit} className="flex space-x-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={getTranslation("msgPlaceholder")}
                maxLength={150}
                className="foxchat-input pr-12"
                autoComplete="off"
                spellCheck="false"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-fox-text/40 text-xs">
                {messageText.length}/150
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={!isConnected || !messageText.trim()}
              className="foxchat-button px-6 py-3 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              onClick={onLeaveRoom}
              className="lg:hidden px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
