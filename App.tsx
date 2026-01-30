import React, { useState, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/MainMenu';
import GameOver from './components/GameOver';
import { GameStatus } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [lastScore, setLastScore] = useState(0);
  const [lastDuration, setLastDuration] = useState(0);

  const startGame = useCallback(() => {
    setStatus(GameStatus.PLAYING);
  }, []);

  const handleGameOver = useCallback((score: number, duration: number) => {
    setLastScore(score);
    setLastDuration(duration);
    setStatus(GameStatus.GAME_OVER);
  }, []);

  const restartGame = useCallback(() => {
    setStatus(GameStatus.PLAYING);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Game Container */}
      <div 
        className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-slate-700 rounded-xl overflow-hidden bg-black"
        style={{
          width: '100%',
          maxWidth: `${CANVAS_WIDTH}px`,
          aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}`
        }}
      >
        <GameCanvas 
          status={status} 
          onGameOver={handleGameOver} 
        />

        {status === GameStatus.MENU && (
          <MainMenu onStart={startGame} />
        )}

        {status === GameStatus.GAME_OVER && (
          <GameOver 
            score={lastScore} 
            duration={lastDuration} 
            onRestart={restartGame} 
          />
        )}
      </div>

      <div className="mt-4 text-slate-500 text-sm font-arcade text-center">
        <p>Use Mouse to Move • Auto Fire Enabled</p>
      </div>
    </div>
  );
};

export default App;
