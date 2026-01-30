import React, { useEffect, useState } from 'react';
import { RefreshCw, Trophy } from 'lucide-react';
import { getPilotEvaluation } from '../services/geminiService';
import { AIAnalysis } from '../types';

interface GameOverProps {
  score: number;
  duration: number;
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, duration, onRestart }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalysis = async () => {
      const result = await getPilotEvaluation(score, duration);
      if (isMounted) {
        setAnalysis(result);
        setLoading(false);
      }
    };
    fetchAnalysis();
    return () => { isMounted = false; };
  }, [score, duration]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md z-20 text-center p-6 animate-in fade-in duration-500">
      <h2 className="text-4xl font-arcade text-red-500 mb-6">MISSION FAILED</h2>
      
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 w-full max-w-md mb-8">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
          <span className="text-gray-400">Final Score</span>
          <span className="text-2xl font-bold text-yellow-400">{score}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400">Survival Time</span>
          <span className="text-xl text-white">{duration}s</span>
        </div>
      </div>

      <div className="w-full max-w-md mb-8 min-h-[160px]">
        <div className="relative overflow-hidden p-[1px] rounded-xl bg-gradient-to-r from-purple-500 to-blue-500">
           <div className="bg-gray-900 rounded-xl p-6 h-full flex flex-col items-center justify-center">
             {loading ? (
               <div className="flex flex-col items-center space-y-3">
                 <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-blue-300 text-sm animate-pulse">HQ Analyzing Flight Data...</span>
               </div>
             ) : (
               <>
                 <div className="flex items-center gap-2 mb-2">
                   <Trophy className="text-yellow-500" size={20} />
                   <span className="text-xs uppercase tracking-widest text-gray-400">Rank Assigned</span>
                 </div>
                 <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 mb-3">
                   {analysis?.rank}
                 </h3>
                 <p className="text-gray-300 italic">"{analysis?.message}"</p>
               </>
             )}
           </div>
        </div>
      </div>

      <button 
        onClick={onRestart}
        className="flex items-center gap-2 px-8 py-3 bg-white text-black hover:bg-gray-200 font-bold rounded-full transition-colors font-arcade text-sm"
      >
        <RefreshCw size={18} />
        RETRY MISSION
      </button>
    </div>
  );
};

export default GameOver;
