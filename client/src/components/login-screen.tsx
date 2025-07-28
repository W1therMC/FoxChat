import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, User, Key, LogIn, Shield, Clock, Users, AlertTriangle } from "lucide-react";
import { getTranslation, setLanguage, getCurrentLanguage } from "@/lib/translations";

interface LoginScreenProps {
  onJoinRoom: (username: string, seed: string) => void;
  error?: string;
}

export default function LoginScreen({ onJoinRoom, error }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  const handleLanguageChange = (language: string) => {
    setLanguage(language);
    setCurrentLang(language);
    // Set RTL for Arabic
    document.body.setAttribute("dir", language === "ar" ? "rtl" : "ltr");
  };

  const validateUsername = (name: string): string | null => {
    if (!name || name.length < 2 || name.length > 20) {
      return getTranslation("errUsernameLength");
    }
    if (!/^[A-Za-z0-9_.\-]+$/.test(name)) {
      return getTranslation("errUsernameInvalid");
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const usernameError = validateUsername(username.trim());
    if (usernameError) {
      return;
    }

    onJoinRoom(username.trim(), roomCode.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="text-center mb-8">
        {/* ASCII Fox Logo */}
        <pre className="ascii-fox">
{`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⠙⠻⢶⣄⡀⠀⠀⠀⢀⣤⠶⠛⠛⡇⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣇⠀⠀⣙⣿⣦⣤⣴⣿⣁⠀⠀⣸⠇⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣡⣾⣿⣿⣿⣿⣿⣿⣿⣷⣌⠋⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⣷⣄⡈⢻⣿⡟⢁⣠⣾⣿⣦⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿⣿⣿⣿⠘⣿⠃⣿⣿⣿⣿⡏⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠈⠛⣰⠿⣆⠛⠁⠀⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⣿⣦⠀⠘⠛⠋⠀⣴⣿⠁⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣶⣾⣿⣿⣿⣿⡇⠀⠀⠀⢸⣿⣏⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣠⣶⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠀⠀⠀⠾⢿⣿⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣠⣿⣿⣿⣿⣿⣿⡿⠟⠋⣁⣠⣤⣤⡶⠶⠶⣤⣄⠈⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢰⣿⣿⣮⣉⣉⣉⣤⣴⣶⣿⣿⣋⡥⠄⠀⠀⠀⠀⠉⢻⣄⠀⠀⠀⠀⠀
⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣋⣁⣤⣀⣀⣤⣤⣤⣤⣄⣿⡄⠀⠀⠀⠀
⠀⠀⠀⠀⠙⠿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠛⠋⠉⠁⠀⠀⠀⠀⠈⠛⠃⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`}
        </pre>
        
        <h1 className="foxchat-title">{getTranslation("title")}</h1>
        <p className="text-fox-text/70 text-sm">{getTranslation("subtitle")}</p>
      </div>

      {/* Login Card */}
      <div className="foxchat-card w-full max-w-md shadow-2xl animate-slide-up">
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* Language Selector */}
          <div>
            <Label htmlFor="language" className="flex items-center text-fox-accent font-medium mb-2">
              <Globe className="mr-2 h-4 w-4" />
              {getTranslation("labelLang")}
            </Label>
            <Select value={currentLang} onValueChange={handleLanguageChange}>
              <SelectTrigger className="foxchat-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="tr">Türkçe</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Username Input */}
          <div>
            <Label htmlFor="username" className="flex items-center text-fox-accent font-medium mb-2">
              <User className="mr-2 h-4 w-4" />
              {getTranslation("labelUserName")}
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={getTranslation("usernamePlaceholder")}
              maxLength={20}
              className="foxchat-input"
              autoComplete="off"
              spellCheck="false"
              required
            />
          </div>

          {/* Room Code Input */}
          <div>
            <Label htmlFor="roomCode" className="flex items-center text-fox-accent font-medium mb-2">
              <Key className="mr-2 h-4 w-4" />
              {getTranslation("labelSeed")}
            </Label>
            <Input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder={getTranslation("seedPlaceholder")}
              maxLength={24}
              className="foxchat-input"
              autoComplete="off"
              spellCheck="false"
            />
          </div>



          {/* Join Button */}
          <Button 
            type="submit" 
            className="foxchat-button w-full py-3 px-4 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <LogIn className="mr-2 h-4 w-4" />
            {getTranslation("joinBtn")}
          </Button>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm text-center min-h-[1.25rem] bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}
        </form>

        {/* Disclaimer */}
        <div className="disclaimer mt-6 p-4 text-xs leading-relaxed">
          <div className="flex items-start space-x-2 mb-2">
            <Shield className="text-green-400 mt-0.5 h-3 w-3 flex-shrink-0" />
            <span>{getTranslation("disclaimerNoStore")}</span>
          </div>
          <div className="flex items-start space-x-2 mb-2">
            <Clock className="text-blue-400 mt-0.5 h-3 w-3 flex-shrink-0" />
            <span>{getTranslation("disclaimerRAM")}</span>
          </div>
          <div className="flex items-start space-x-2 mb-2">
            <Users className="text-purple-400 mt-0.5 h-3 w-3 flex-shrink-0" />
            <span>{getTranslation("disclaimerShared")}</span>
          </div>
          <div className="flex items-start space-x-2 text-yellow-400">
            <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <span>{getTranslation("disclaimerWarning")}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-fox-text/50 text-sm">
        <p>by: W1therMC | <Shield className="inline h-3 w-3 mr-1" />Privacy-focused chat</p>
      </div>
    </div>
  );
}
