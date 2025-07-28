import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Key, Lock } from "lucide-react";
import { getTranslation } from "@/lib/translations";

interface PasswordDialogProps {
  isOpen: boolean;
  onSubmit: (password: string) => void;
  onCancel: () => void;
  roomSeed: string;
}

export default function PasswordDialog({ isOpen, onSubmit, onCancel, roomSeed }: PasswordDialogProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password.trim());
      setPassword("");
    }
  };

  const handleCancel = () => {
    setPassword("");
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className={`sm:max-w-md bg-fox-card border-fox-border ${isOpen ? 'password-entry-animation' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center text-fox-accent">
            <Lock className="mr-2 h-5 w-5" />
            {getTranslation("passwordRequired")}
          </DialogTitle>
          <DialogDescription className="text-fox-text/70">
            {getTranslation("passwordRequiredDesc")} "<span className="font-mono text-fox-accent">{roomSeed}</span>"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="room-password" className="flex items-center text-fox-accent font-medium mb-2">
              <Key className="mr-2 h-4 w-4" />
              {getTranslation("labelPassword")}
            </Label>
            <Input
              id="room-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={getTranslation("passwordPlaceholder")}
              className="foxchat-input"
              autoComplete="off"
              autoFocus
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleCancel}
              className="text-fox-text/70 hover:text-fox-text"
            >
              {getTranslation("cancel")}
            </Button>
            <Button 
              type="submit" 
              className="foxchat-button"
              disabled={!password.trim()}
            >
              <Key className="mr-2 h-4 w-4" />
              {getTranslation("unlock")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}