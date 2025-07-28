import { useState, useCallback } from "react";
import LoginScreen from "@/components/login-screen";
import ChatInterface from "@/components/chat-interface";
import TerminalIntro from "@/components/terminal-intro";
import PasswordDialog from "@/components/password-dialog";
import PasswordWarning from "@/components/password-warning";
import VhsToggle from "@/components/vhs-toggle";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [isInChat, setIsInChat] = useState(false);
  const [vhsEnabled, setVhsEnabled] = useState(true);
  const { 
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
  } = useWebSocket();

  const handleJoinRoom = (username: string, seed: string) => {
    joinRoom(username, seed);
  };

  const handlePasswordSubmit = (password: string) => {
    if (pendingRoomData) {
      joinRoom(pendingRoomData.username, pendingRoomData.seed, password);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setIsInChat(false);
  };

  const handleVhsToggle = useCallback((enabled: boolean) => {
    setVhsEnabled(enabled);
  }, []);

  // Set isInChat to true when successfully joined
  if (roomData && !isInChat) {
    setIsInChat(true);
  }

  return (
    <div className={`min-h-screen bg-fox-bg text-fox-text ${vhsEnabled ? 'vhs-filter vhs-distortion' : 'vhs-disabled'}`}>
      {/* VHS Noise Effect */}
      {vhsEnabled && <div className="vhs-noise" />}
      
      {/* VHS Toggle Button */}
      <VhsToggle onToggle={handleVhsToggle} />

      {/* Main Content */}
      {showIntro ? (
        <TerminalIntro onComplete={() => setShowIntro(false)} />
      ) : !isInChat ? (
        <LoginScreen onJoinRoom={handleJoinRoom} error={error || undefined} />
      ) : (
        <ChatInterface
          roomData={roomData}
          messages={messages}
          users={users}
          isConnected={isConnected}
          onSendMessage={sendMessage}
          onSendCommand={sendCommand}
          onLeaveRoom={handleLeaveRoom}
          error={error || undefined}
        />
      )}

      {/* Password Warning Animation */}
      {showPasswordWarning && pendingRoomData && (
        <PasswordWarning
          roomSeed={pendingRoomData.seed}
          onComplete={handlePasswordWarningComplete}
        />
      )}

      {/* Password Dialog */}
      <PasswordDialog
        isOpen={needsPassword}
        onSubmit={handlePasswordSubmit}
        onCancel={clearPasswordPrompt}
        roomSeed={pendingRoomData?.seed || ""}
      />
    </div>
  );
}
