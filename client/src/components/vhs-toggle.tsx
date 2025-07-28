import { useState, useEffect } from "react";
import { Monitor, MonitorX } from "lucide-react";
import { getTranslation } from "@/lib/translations";

interface VhsToggleProps {
  onToggle: (enabled: boolean) => void;
}

export default function VhsToggle({ onToggle }: VhsToggleProps) {
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem("vhs-mode");
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("vhs-mode", isEnabled.toString());
    onToggle(isEnabled);
  }, [isEnabled, onToggle]);

  const handleToggle = () => {
    setIsEnabled(!isEnabled);
  };

  return (
    <button
      onClick={handleToggle}
      className="vhs-toggle"
      title={getTranslation("toggleVhs")}
    >
      {isEnabled ? (
        <Monitor className="w-4 h-4 mr-2" />
      ) : (
        <MonitorX className="w-4 h-4 mr-2" />
      )}
      {getTranslation("vhsMode")}
    </button>
  );
}