import React, { useRef, useEffect } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PLAYER_SPEED, 
  PLAYER_WIDTH, 
  PLAYER_HEIGHT, 
  BULLET_SPEED, 
  BULLET_WIDTH, 
  BULLET_HEIGHT,
  ENEMY_SPAWN_RATE,
  FIRE_RATE
} from '../constants';
import { GameStatus, Player, Bullet, Enemy, Particle } from '../types';

interface GameCanvasProps {
  status: GameStatus;
  onGameOver: (score: number, duration: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ status, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIdRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  
  // Game State Refs (Mutable for performance in loop)
  const playerRef = useRef<Player>({ 
    x: CANVAS_WIDTH / 2, 
    y: CANVAS_HEIGHT - 100, 
    width: PLAYER_WIDTH, 
    height: PLAYER_HEIGHT, 
    color: '#3b82f6', 
    vx: 0, 
    vy: 0, 
    hp: 100,
    score: 0 
  });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const frameCountRef = useRef(0);
  
  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    
    // Mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      if (status !== GameStatus.PLAYING || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const x = (e.clientX - rect.left) * scaleX;
      playerRef.current.x = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_WIDTH, x - PLAYER_WIDTH / 2));
    };

    const handleTouchMove = (e: TouchEvent) => {
       if (status !== GameStatus.PLAYING || !canvasRef.current) return;
       e.preventDefault(); // Prevent scrolling
       const rect = canvasRef.current.getBoundingClientRect();
       const touch = e.touches[0];
       const scaleX = CANVAS_WIDTH / rect.width;
       const x = (touch.clientX - rect.left) * scaleX;
       playerRef.current.x = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_WIDTH, x - PLAYER_WIDTH / 2));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    // Add non-passive event listener for touch
    const canvas = canvasRef.current;
    if(canvas) {
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
       if(canvas) {
        canvas.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [status]);

  // Reset Game
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      playerRef.current = { 
        x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, 
        y: CANVAS_HEIGHT - 100, 
        width: PLAYER_WIDTH, 
        height: PLAYER_HEIGHT, 
        color: '#3b82f6', 
        vx: 0, 
        vy: 0, 
        hp: 100,
        score: 0 
      };
      bulletsRef.current = [];
      enemiesRef.current = [];
      particlesRef.current = [];
      startTimeRef.current = Date.now();
      frameCountRef.current = 0;
    }
  }, [status]);

  // Main Game Loop
  useEffect(() => {
    if (status !== GameStatus.PLAYING) {
      cancelAnimationFrame(frameIdRef.current);
      return;
    }

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const spawnEnemy = () => {
      const typeRoll = Math.random();
      let type: Enemy['type'] = 'basic';
      let width = 40, height = 40, color = '#ef4444', hp = 1, speed = 3;

      if (typeRoll > 0.8) {
        type = 'fast';
        width = 30; height = 30; color = '#eab308'; hp = 1; speed = 6;
      } else if (typeRoll > 0.95) {
        type = 'tank';
        width = 60; height = 60; color = '#a855f7'; hp = 5; speed = 1.5;
      }

      enemiesRef.current.push({
        x: Math.random() * (CANVAS_WIDTH - width),
        y: -height,
        width, height, color, hp,
        vx: 0,
        vy: speed,
        active: true,
        type
      });
    };

    const createExplosion = (x: number, y: number, color: string) => {
      for (let i = 0; i < 8; i++) {
        particlesRef.current.push({
          x, y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 1.0,
          color: color,
          size: Math.random() * 4 + 2
        });
      }
    };

    const render = () => {
      frameCountRef.current++;

      // 1. Update State
      
      // Player Movement (Keyboard fallback)
      if (keysRef.current['ArrowLeft'] || keysRef.current['a']) playerRef.current.x -= PLAYER_SPEED;
      if (keysRef.current['ArrowRight'] || keysRef.current['d']) playerRef.current.x += PLAYER_SPEED;
      
      // Clamp Player
      playerRef.current.x = Math.max(0, Math.min(CANVAS_WIDTH - playerRef.current.width, playerRef.current.x));

      // Auto Fire
      if (frameCountRef.current % FIRE_RATE === 0) {
        bulletsRef.current.push({
          x: playerRef.current.x + playerRef.current.width / 2 - BULLET_WIDTH / 2,
          y: playerRef.current.y,
          width: BULLET_WIDTH,
          height: BULLET_HEIGHT,
          color: '#60a5fa',
          vx: 0,
          vy: -BULLET_SPEED,
          hp: 1,
          active: true
        });
      }

      // Spawn Enemies
      // Ramping difficulty: Spawn faster as score increases
      const dynamicSpawnRate = Math.max(20, ENEMY_SPAWN_RATE - Math.floor(playerRef.current.score / 500) * 5);
      if (frameCountRef.current % dynamicSpawnRate === 0) {
        spawnEnemy();
      }

      // Update Bullets
      bulletsRef.current.forEach(b => {
        b.y += b.vy;
        if (b.y < -50) b.active = false;
      });

      // Update Enemies
      enemiesRef.current.forEach(e => {
        e.y += e.vy;
        if (e.y > CANVAS_HEIGHT) e.active = false;
      });

      // Update Particles
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
      });
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      // Collisions
      // Bullet vs Enemy
      bulletsRef.current.forEach(b => {
        if (!b.active) return;
        enemiesRef.current.forEach(e => {
          if (!e.active) return;
          if (
            b.x < e.x + e.width &&
            b.x + b.width > e.x &&
            b.y < e.y + e.height &&
            b.y + b.height > e.y
          ) {
            b.active = false;
            e.hp--;
            createExplosion(b.x, b.y, '#fff');
            if (e.hp <= 0) {
              e.active = false;
              playerRef.current.score += (e.type === 'tank' ? 50 : e.type === 'fast' ? 20 : 10);
              createExplosion(e.x + e.width/2, e.y + e.height/2, e.color);
            }
          }
        });
      });

      // Enemy vs Player
      enemiesRef.current.forEach(e => {
        if (!e.active) return;
        if (
          playerRef.current.x < e.x + e.width &&
          playerRef.current.x + playerRef.current.width > e.x &&
          playerRef.current.y < e.y + e.height &&
          playerRef.current.y + playerRef.current.height > e.y
        ) {
          e.active = false;
          playerRef.current.hp -= 20;
          createExplosion(e.x + e.width/2, e.y + e.height/2, '#ef4444');
          // Screen shake effect concept (omitted for simplicity, but logically here)
        }
      });

      // Cleanup
      bulletsRef.current = bulletsRef.current.filter(b => b.active);
      enemiesRef.current = enemiesRef.current.filter(e => e.active);

      // Check Game Over
      if (playerRef.current.hp <= 0) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onGameOver(playerRef.current.score, duration);
        return; 
      }

      // 2. Draw
      // Clear Background
      ctx.fillStyle = '#0f172a'; // Slate-900
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw Grid (Stars scrolling effect)
      ctx.fillStyle = '#ffffff';
      for(let i=0; i<50; i++) {
        // Simple starfield based on time
        const x = (Math.sin(i * 132.1) * 43758.5453 + i * 100) % CANVAS_WIDTH;
        const y = ((frameCountRef.current * (i%3 + 1) + i * 50) % CANVAS_HEIGHT);
        ctx.fillRect(Math.abs(x), y, i%2===0?2:1, i%2===0?2:1);
      }

      // Draw Player (Simple Triangle Shape)
      const p = playerRef.current;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(p.x + p.width / 2, p.y);
      ctx.lineTo(p.x + p.width, p.y + p.height);
      ctx.lineTo(p.x + p.width / 2, p.y + p.height - 10);
      ctx.lineTo(p.x, p.y + p.height);
      ctx.closePath();
      ctx.fill();
      // Engine Glow
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(p.x + p.width / 2, p.y + p.height - 5, (Math.random() * 5 + 5), 0, Math.PI * 2);
      ctx.fill();


      // Draw Enemies
      enemiesRef.current.forEach(e => {
        ctx.fillStyle = e.color;
        if (e.type === 'basic') {
          // Inverted triangle
          ctx.beginPath();
          ctx.moveTo(e.x, e.y);
          ctx.lineTo(e.x + e.width, e.y);
          ctx.lineTo(e.x + e.width / 2, e.y + e.height);
          ctx.closePath();
          ctx.fill();
        } else if (e.type === 'tank') {
          // Blocky
          ctx.fillRect(e.x, e.y, e.width, e.height);
          ctx.fillStyle = '#000'; // cockpit
          ctx.fillRect(e.x + 15, e.y + 15, e.width - 30, e.height - 30);
        } else {
          // Fast dart
          ctx.beginPath();
          ctx.moveTo(e.x + e.width/2, e.y + e.height);
          ctx.lineTo(e.x, e.y);
          ctx.lineTo(e.x + e.width, e.y);
          ctx.closePath();
          ctx.fill();
        }
      });

      // Draw Bullets
      ctx.fillStyle = '#60a5fa';
      bulletsRef.current.forEach(b => {
        ctx.fillRect(b.x, b.y, b.width, b.height);
      });

      // Draw Particles
      particlesRef.current.forEach(pt => {
        ctx.globalAlpha = pt.life;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Draw HUD on Canvas
      ctx.font = '20px "Press Start 2P"';
      ctx.fillStyle = '#fff';
      ctx.fillText(`SCORE: ${playerRef.current.score}`, 20, 40);

      // HP Bar
      ctx.fillStyle = '#333';
      ctx.fillRect(20, CANVAS_HEIGHT - 30, 200, 20);
      ctx.fillStyle = playerRef.current.hp > 30 ? '#22c55e' : '#ef4444';
      ctx.fillRect(20, CANVAS_HEIGHT - 30, playerRef.current.hp * 2, 20);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(20, CANVAS_HEIGHT - 30, 200, 20);

      frameIdRef.current = requestAnimationFrame(render);
    };

    frameIdRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [status, onGameOver]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="w-full h-full object-contain bg-slate-900 shadow-2xl rounded-lg cursor-none touch-none"
    />
  );
};

export default GameCanvas;
