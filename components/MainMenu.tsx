import React from 'react';
import { Plane, Keyboard, MousePointer2 } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10 text-center p-6">
      <div className="mb-8 animate-bounce">
        <Plane size={80} className="text-blue-500 rotate-0" />
      </div>
      
      <h1 className="text-5xl md:text-6xl font-arcade text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 tracking-wider">
        SKY DEFENDER
      </h1>
      <p className="text-blue-200 mb-12 text-lg">AI-Powered Flight Simulation</p>

      <button 
        onClick={onStart}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all transform hover:scale-105 active:scale-95 text-xl font-arcade"
      >
        START MISSION
      </button>

      <div className="mt-12 grid grid-cols-2 gap-8 text-gray-400 text-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
            <MousePointer2 size={24} />
          </div>
          <span>Move & Shoot</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
            <Keyboard size={24} />
          </div>
          <span>WASD / Arrows</span>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
