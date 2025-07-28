import { useState, useEffect } from "react";
import { AlertTriangle, Shield } from "lucide-react";
import { getTranslation } from "@/lib/translations";

interface PasswordWarningProps {
  roomSeed: string;
  onComplete: () => void;
}

export default function PasswordWarning({ roomSeed, onComplete }: PasswordWarningProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 300);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
      <div className="password-warning bg-fox-card border-2 border-orange-500 rounded-lg p-8 max-w-md mx-4 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Shield className="h-16 w-16 text-orange-500" />
            <AlertTriangle className="h-8 w-8 text-orange-400 absolute -top-1 -right-1" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-orange-500 mb-2">
          {getTranslation("passwordRequired")}
        </h2>
        
        <p className="text-fox-text/80 mb-4">
          {getTranslation("passwordRequiredDesc")}
        </p>
        
        <div className="bg-fox-bg/50 rounded px-3 py-2 font-mono text-fox-accent border border-fox-border">
          {roomSeed}
        </div>
        
        <div className="mt-4 text-sm text-fox-text/60">
          {getTranslation("preparingPasswordDialog")}...
        </div>
      </div>
    </div>
  );
}