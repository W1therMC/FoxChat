import { useState, useEffect } from "react";
import { Terminal } from "lucide-react";
import { getTranslation } from "@/lib/translations";

interface TerminalIntroProps {
  onComplete: () => void;
}

export default function TerminalIntro({ onComplete }: TerminalIntroProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  const steps = [
    getTranslation("terminalInit"),
    getTranslation("terminalConnect"),
    getTranslation("terminalEncrypt"),
    getTranslation("terminalWebsocket"),
    getTranslation("terminalReady"),
    ""
  ];

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    // Allow skipping intro with any key press
    const handleKeyPress = () => {
      onComplete();
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleKeyPress);

    return () => {
      clearInterval(cursorInterval);
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleKeyPress);
    };
  }, [onComplete]);

  useEffect(() => {
    if (currentStep < steps.length) {
      const text = steps[currentStep];
      let index = 0;
      
      const typeInterval = setInterval(() => {
        if (index <= text.length) {
          setDisplayText(text.slice(0, index));
          index++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => {
            if (currentStep === steps.length - 1) {
              setTimeout(onComplete, 1000);
            } else {
              setCurrentStep(prev => prev + 1);
              setDisplayText("");
            }
          }, currentStep === steps.length - 1 ? 500 : 800);
        }
      }, currentStep === 0 ? 50 : 30);

      return () => clearInterval(typeInterval);
    }
  }, [currentStep, onComplete]);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl">
        {/* Terminal Header */}
        <div className="bg-gray-800 rounded-t-lg p-3 flex items-center space-x-2 border-b border-gray-700">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="ml-4 flex items-center space-x-2 text-gray-300 text-sm">
            <Terminal className="w-4 h-4" />
            <span>FoxChat Terminal</span>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="bg-black rounded-b-lg p-6 min-h-[400px] border border-gray-800">
          <div className="space-y-2">
            {steps.slice(0, currentStep).map((step, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-green-400">$</span>
                <span className="text-white">{step}</span>
              </div>
            ))}
            
            {currentStep < steps.length && (
              <div className="flex items-center space-x-2">
                <span className="text-green-400">$</span>
                <span className="text-white">
                  {displayText}
                  {showCursor && <span className="bg-green-400 text-black px-1">|</span>}
                </span>
              </div>
            )}
          </div>

          {/* ASCII Fox - appears after step 3 */}
          {currentStep > 3 && (
            <div className="mt-8 text-center">
              <pre className="text-purple-400 text-xs leading-tight animate-fade-in">
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
⠀⠀⠀⠀⣠⣿⣿⣿⣿⹳⣿⡿⠟⠋⣁⣠⣤⣤⡶⠶⠶⣤⣄⠈⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢰⣿⣿⣮⣉⣉⣉⣤⣴⣶⣿⣿⣋⡥⠄⠀⠀⠀⠀⠉⢻⣄⠀⠀⠀⠀⠀
⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣋⣁⣤⣀⣀⣤⣤⣤⣤⣄⣿⡄⠀⠀⠀⠀
⠀⠀⠀⠀⠙⠿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠛⠋⠉⠁⠀⠀⠀⠀⠈⠛⠃⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`}
              </pre>
              
              {currentStep > 4 && (
                <div className="mt-4 text-yellow-400 text-lg font-bold animate-pulse">
                  FoxChat
                </div>
              )}
            </div>
          )}

          {/* Loading animation */}
          {currentStep === steps.length - 1 && (
            <div className="mt-6 text-center">
              <div className="text-green-400 text-sm animate-pulse">
                {getTranslation("terminalSkip")}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}